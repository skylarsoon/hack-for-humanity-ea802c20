import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedPost } from "@/lib/blog.functions";
import { BlogPostBody } from "@/components/nido/BlogPost";
import { useNido } from "@/lib/nido-store";

export const Route = createFileRoute("/blog/$id")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { id: params.id } }).catch(() => null);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title_en ?? "Field journal"} · Nido Abierto` },
    { name: "description", content: loaderData?.body_en.slice(0, 155) ?? "Field update from Pijao." },
    { property: "og:title", content: loaderData?.title_en ?? "Field journal · Nido Abierto" },
    { property: "og:description", content: loaderData?.body_en.slice(0, 155) ?? "Field update from Pijao." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  notFoundComponent: () => <p className="py-10 text-center">Post not found. <Link to="/blog" className="underline">Back to the journal</Link></p>,
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();
  const { lang } = useNido();
  return (
    <article className="mx-auto max-w-3xl space-y-6 py-6">
      <Link to="/blog" className="text-sm text-primary underline">← {lang === "es" ? "Diario de campo" : "Field journal"}</Link>
      <h2 className="font-display text-4xl font-semibold text-primary">{lang === "es" ? post.title_es : post.title_en}</h2>
      <BlogPostBody post={post} lang={lang} full />
    </article>
  );
}
