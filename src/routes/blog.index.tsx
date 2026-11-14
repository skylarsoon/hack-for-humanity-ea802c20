import { createFileRoute, Link } from "@tanstack/react-router";
import { listPublishedPosts } from "@/lib/blog.functions";
import { BlogPostBody } from "@/components/nido/BlogPost";
import { useNido } from "@/lib/nido-store";

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [
    { title: "Field journal · Nido Abierto" },
    { name: "description", content: "Updates from Pijao: what volunteers and donations changed in the community, written from the field." },
    { property: "og:title", content: "Field journal · Nido Abierto" },
    { property: "og:description", content: "Diario de campo: cómo las donaciones y la minga están cambiando Pijao." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: () => listPublishedPosts(),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();
  const { lang } = useNido();
  const es = lang === "es";
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h2 className="font-display text-4xl font-semibold text-primary">{es ? "Diario de campo" : "Field journal"}</h2>
        <p className="mt-2 text-muted-foreground">{es ? "Lo que está pasando en Pijao, contado por quienes están allí." : "What's happening in Pijao, told by the people on the ground."}</p>
      </header>
      {posts.map((p) => (
        <article key={p.id} className="space-y-3 rounded-xl bg-card p-6 shadow-card">
          <h3 className="font-display text-2xl font-semibold"><Link to="/blog/$id" params={{ id: p.id }} className="hover:underline">{es ? p.title_es : p.title_en}</Link></h3>
          <BlogPostBody post={p} lang={lang} />
          <Link to="/blog/$id" params={{ id: p.id }} className="text-sm font-semibold text-primary underline">{es ? "Leer más" : "Read more"}</Link>
        </article>
      ))}
      {!posts.length && <p className="text-muted-foreground">{es ? "Pronto publicaremos la primera actualización." : "The first update is coming soon."}</p>}
    </div>
  );
}
