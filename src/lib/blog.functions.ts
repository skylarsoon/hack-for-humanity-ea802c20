import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface PublicPost {
  id: string; title_es: string; title_en: string; body_es: string; body_en: string; published_at: string | null;
  photos: { url: string; caption_es: string; caption_en: string }[];
}

/** Published posts only; photos are short-lived signed links to the private field media. */
async function loadPosts(id?: string): Promise<PublicPost[]> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  let q = db.from("blog_posts").select("id,title_es,title_en,body_es,body_en,published_at,blog_post_media(caption_es,caption_en,position,field_updates(media_path,kind,hidden))")
    .eq("status", "published").order("published_at", { ascending: false }).limit(id ? 1 : 30);
  if (id) q = q.eq("id", id);
  const { data, error } = await q;
  if (error) throw error;
  return Promise.all((data ?? []).map(async (p) => {
    const media = [...(p.blog_post_media ?? [])].sort((a, b) => a.position - b.position)
      .filter((m) => m.field_updates?.kind === "image" && m.field_updates.media_path && !m.field_updates.hidden);
    const photos = (await Promise.all(media.map(async (m) => {
      const s = await db.storage.from("field-media").createSignedUrl(m.field_updates!.media_path!, 3600);
      return s.data ? { url: s.data.signedUrl, caption_es: m.caption_es, caption_en: m.caption_en } : null;
    }))).filter((x): x is NonNullable<typeof x> => !!x);
    return { id: p.id, title_es: p.title_es, title_en: p.title_en, body_es: p.body_es, body_en: p.body_en, published_at: p.published_at, photos };
  }));
}

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(() => loadPosts());
export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => (await loadPosts(data.id))[0] ?? null);
