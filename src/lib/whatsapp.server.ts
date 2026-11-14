// Server-only WhatsApp processing: store verified senders' messages, media and voice-note transcripts.
import { transcribeAudio } from "@lovable.dev/ai-gateway";
import { parseInboundMessages } from "./field-updates";
import { queueAcknowledgment, reconcileStatuses, recoverReplies } from "./whatsapp-replies.server";

const GATEWAY = "https://connector-gateway.lovable.dev/whatsapp";
const MAX_MEDIA = 16 * 1024 * 1024;

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const wa = process.env["WHATSAPP_API_KEY"];
  if (!lovable || !wa) throw new Error("WhatsApp connection is not configured");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": wa };
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

async function downloadMedia(mediaId: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; mime: string }> {
  const meta = await fetch(`${GATEWAY}/media/${encodeURIComponent(mediaId)}`, { headers: headers() });
  if (!meta.ok) throw new Error(`Media lookup failed [${meta.status}]: ${await meta.text()}`);
  const info = (await meta.json()) as { url?: string; file_size?: number; mime_type?: string };
  if (!info.url) throw new Error("Media lookup returned no URL");
  if ((info.file_size ?? 0) > MAX_MEDIA) throw new Error("Media file too large");
  const res = await fetch(`${GATEWAY}/media_download`, { headers: { ...headers(), "X-WhatsApp-Media-URL": info.url } });
  if (!res.ok || !res.body) throw new Error(`Media download failed [${res.status}]`);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_MEDIA) { await reader.cancel(); throw new Error("Media file too large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(new ArrayBuffer(total));
  let off = 0;
  for (const c of chunks) { bytes.set(c, off); off += c.byteLength; }
  return { bytes, mime: res.headers.get("content-type") ?? info.mime_type ?? "application/octet-stream" };
}

const ext = (mime: string) => ((mime.split("/")[1] ?? "bin").split(";")[0] ?? "bin").replace(/[^a-z0-9]/gi, "") || "bin";

/** Store media for one update; idempotent (skips when already stored). */
async function storeMedia(updateId: string) {
  const db = await admin();
  const { data: u, error } = await db.from("field_updates").select("id,kind,media_id,media_status").eq("id", updateId).single();
  if (error) throw error;
  if (u.media_status !== "pending" || !u.media_id) return;
  const { bytes, mime } = await downloadMedia(u.media_id);
  const path = `${u.id}.${ext(mime)}`;
  const up = await db.storage.from("field-media").upload(path, bytes, { contentType: mime, upsert: true });
  if (up.error) throw up.error;
  let transcript: string | null = null;
  if (u.kind === "audio") {
    const r = await transcribeAudio({ model: "openai/gpt-transcribe", file: new Blob([bytes], { type: mime }), response_format: "text" });
    transcript = (typeof r === "string" ? r : (r as { text?: string }).text ?? "").trim() || null;
  }
  const done = await db.from("field_updates").update({ media_path: path, media_mime: mime, media_status: "stored", transcript }).eq("id", u.id);
  if (done.error) throw done.error;
}

/** Process one stored webhook event. Throws to leave it pending for retry. */
export async function processEvent(eventId: string) {
  const db = await admin();
  const { data: ev, error } = await db.from("whatsapp_webhook_events").select("*").eq("id", eventId).single();
  if (error) throw error;
  if (ev.processed_at) return;
  try {
    if (ev.event === "whatsapp.message") {
      for (const m of parseInboundMessages(ev.payload)) {
        const { data: sender, error: senderError } = await db.from("field_senders").select("id").eq("phone", m.from).eq("active", true).maybeSingle();
        if (senderError) throw senderError;
        if (!sender) continue; // unknown numbers: kept in the inbox, never become field updates
        const ins = await db.from("field_updates").upsert({
          wa_message_id: m.id, sender_id: sender.id, sender_phone: m.from, kind: m.kind, text: m.text,
          media_id: m.mediaId, media_mime: m.mime, media_status: m.mediaId ? "pending" : "none", sent_at: m.sentAt,
        }, { onConflict: "wa_message_id", ignoreDuplicates: true }).select("id");
        if (ins.error) throw ins.error;
        const { data: row, error: rErr } = await db.from("field_updates").select("id").eq("wa_message_id", m.id).single();
        if (rErr) throw rErr;
        await queueAcknowledgment(m.id, m.from, m.sentAt);
        await storeMedia(row.id);
      }
    }
    if (ev.event === "whatsapp.status") await reconcileStatuses(ev.payload);
    // Unknown events remain durably stored without creating field updates.
    const fin = await db.from("whatsapp_webhook_events").update({ processed_at: new Date().toISOString(), processing_error: null }).eq("id", ev.id);
    if (fin.error) throw fin.error;
  } catch (e) {
    await db.from("whatsapp_webhook_events").update({ processing_error: String(e instanceof Error ? e.message : e).slice(0, 500), attempts: ev.attempts + 1 }).eq("id", ev.id);
    throw e;
  }
}

/** Retry a few unfinished events (least-attempted first) so one failing row cannot block the rest. */
export async function recoverPending(skipId: string) {
  const db = await admin();
  const { data, error } = await db.from("whatsapp_webhook_events").select("id").is("processed_at", null).neq("id", skipId)
    .lt("attempts", 8).lt("received_at", new Date(Date.now() - 60_000).toISOString())
    .order("attempts").order("received_at").limit(2);
  if (error) throw error;
  for (const r of data ?? []) await processEvent(r.id).catch(() => {});
  await recoverReplies();
}
