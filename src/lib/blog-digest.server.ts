// Server-only: turn unused field updates into one bilingual blog draft for coordinator review.
import { generateResponse, GatewayError, PaymentRequiredError, PermissionDeniedError, RateLimitError } from "@lovable.dev/ai-gateway";
import { eligibleForDigest, parseDraft } from "./field-updates";
import { publicHouseholdId } from "./public-households";

const JOB = "blog-digest";

export async function runBlogDigest(): Promise<{ status: string; postId?: string }> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data: locked, error: lockErr } = await db.rpc("acquire_job_lock", { p_name: JOB, p_seconds: 300 });
  if (lockErr) throw lockErr;
  if (!locked) return { status: "busy_or_paused" };
  const release = (extra: Record<string, unknown> = {}) =>
    db.from("job_state").update({ locked_until: null, last_run_at: new Date().toISOString(), ...extra }).eq("name", JOB);
  try {
    const { data, error } = await db.from("field_updates")
      .select("id,kind,text,transcript,media_path,media_status,household_id,category,sent_at,hidden,exclude_from_blog,used_in_post_id,sender_id,field_senders(role,vereda)")
      .is("used_in_post_id", null).eq("hidden", false).eq("exclude_from_blog", false)
      .order("sent_at").limit(80);
    if (error) throw error;
    const rows = eligibleForDigest(data ?? []);
    if (!rows.length) { await release(); return { status: "no_updates" }; }

    const images = rows.filter((r) => r.kind === "image" && r.media_status === "stored" && r.media_path).slice(0, 6);
    const signed = await Promise.all(images.map(async (r) => {
      const s = await db.storage.from("field-media").createSignedUrl(r.media_path!, 600);
      return s.data ? { id: r.id, url: s.data.signedUrl } : null;
    }));

    const lines = rows.map((r) => {
      const s = r.field_senders as { role?: string; vereda?: string | null } | null;
      return `- [${r.id}] ${r.sent_at.slice(0, 10)} ${r.kind}${s?.role ? ` from a ${s.role}` : ""}${s?.vereda ? ` in ${s.vereda}` : ""}${r.household_id ? `, household ${publicHouseholdId(r.household_id)}` : ""}${r.category ? `, ${r.category}` : ""}: ${[r.text, r.transcript].filter(Boolean).join(" / ") || "(photo)"}`;
    }).join("\n");

    const prompt = `You write the community blog of Nido Abierto, a relief effort rebuilding homes in Pijao, Quindío (Colombia) after an earthquake and wildfires. Donors read it to see real change on the ground.
Write ONE warm, factual post from these field updates sent by verified volunteers and coordinators. Describe what changed for the community, the work done, and how donations and volunteers helped. Only use facts in the updates; never invent numbers. Never include personal names, phone numbers or exact locations; refer to households only by IDs like HH_03. Write it in Spanish and in English (same content). Bodies: 3-6 short paragraphs, plain text with blank lines between paragraphs.
Choose up to 6 of the attached photos (by update id) that show the work, with short captions that do not identify people.
Return ONLY JSON: {"title_es":"","title_en":"","body_es":"","body_en":"","photos":[{"update_id":"","caption_es":"","caption_en":""}]}

Field updates:
${lines}
${signed.filter(Boolean).map((s) => `Photo attached for update ${s!.id}`).join("\n")}`;

    const content: ({ type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "low" })[] = [{ type: "input_text", text: prompt }];
    for (const s of signed) if (s) content.push({ type: "input_image", image_url: s.url, detail: "low" });

    const res = await generateResponse({ model: "openai/gpt-6-astra", input: [{ role: "user", content }] });
    const text = (res.output ?? []).flatMap((o) => (o.type === "message" ? o.content : []))
      .map((c) => (c.type === "output_text" ? c.text : "")).join("");
    const draft = parseDraft(text, new Set(signed.filter(Boolean).map((s) => s!.id)));

    const { data: post, error: pErr } = await db.from("blog_posts").insert({
      title_es: draft.title_es, title_en: draft.title_en, body_es: draft.body_es, body_en: draft.body_en,
      period_start: rows[0]!.sent_at, period_end: rows[rows.length - 1]!.sent_at,
    }).select("id").single();
    if (pErr) throw pErr;
    if (draft.photos.length) {
      const m = await db.from("blog_post_media").insert(draft.photos.map((p, i) => ({ post_id: post.id, update_id: p.update_id, caption_es: p.caption_es, caption_en: p.caption_en, position: i })));
      if (m.error) throw m.error;
    }
    const used = await db.from("field_updates").update({ used_in_post_id: post.id }).in("id", rows.map((r) => r.id)).is("used_in_post_id", null);
    if (used.error) throw used.error;
    await release();
    return { status: "draft_created", postId: post.id };
  } catch (e) {
    if (e instanceof PaymentRequiredError || e instanceof PermissionDeniedError) {
      await release({ paused_reason: `${e.code}: ${e.message}`.slice(0, 300) });
      return { status: "paused" };
    }
    await release();
    if (e instanceof RateLimitError) return { status: "rate_limited" };
    if (e instanceof GatewayError) console.error("Blog digest AI error", e.code, e.ids);
    throw e;
  }
}
