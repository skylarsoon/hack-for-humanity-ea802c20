import type { PublicPost } from "@/lib/blog.functions";

export function BlogPostBody({ post, lang, full }: { post: PublicPost; lang: "es" | "en"; full?: boolean }) {
  const body = lang === "es" ? post.body_es : post.body_en;
  const paras = body.split(/\n\s*\n/).filter(Boolean);
  const photos = full ? post.photos : post.photos.slice(0, 1);
  return (
    <div className="space-y-4">
      {post.published_at && <p className="text-xs uppercase tracking-wide text-muted-foreground">{new Date(post.published_at).toLocaleDateString(lang === "es" ? "es-CO" : "en-US", { dateStyle: "long" })}</p>}
      <div className={full ? "grid gap-3 sm:grid-cols-2" : ""}>
        {photos.map((p) => (
          <figure key={p.url} className="space-y-1">
            <img src={p.url} alt={lang === "es" ? p.caption_es : p.caption_en} className="max-h-96 w-full rounded-lg object-cover" loading="lazy" />
            {full && <figcaption className="text-xs text-muted-foreground">{lang === "es" ? p.caption_es : p.caption_en}</figcaption>}
          </figure>
        ))}
      </div>
      {(full ? paras : paras.slice(0, 1)).map((t, i) => <p key={i} className="leading-relaxed">{t}</p>)}
    </div>
  );
}
