import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useNido } from "@/lib/nido-store";
import { CommunityHome } from "@/components/nido/CommunityHome";
import { DirectionSwitcher } from "@/components/ideas/shared";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/ideas/a")({
  head: () => ({
    meta: [
      { title: "A · Comunidad primero · Nido Abierto" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: () => listPublishedPosts().catch(() => []),
  component: DirectionA,
});

// Design A is now the live homepage; this preview stays so it can be compared with B–D.
function DirectionA() {
  const { lang } = useNido();
  const navigate = useNavigate();
  const posts = Route.useLoaderData();
  return (
    <>
      <CommunityHome posts={posts} onSeeBooks={() => navigate({ to: "/" })} />
      <DirectionSwitcher lang={lang} current="a" />
    </>
  );
}
