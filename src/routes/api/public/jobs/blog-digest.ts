import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/blog-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { runBlogDigest } = await import("@/lib/blog-digest.server");
        try {
          return Response.json(await runBlogDigest());
        } catch (e) {
          console.error("Blog digest failed", e);
          return Response.json({ status: "failed" }, { status: 500 });
        }
      },
    },
  },
});
