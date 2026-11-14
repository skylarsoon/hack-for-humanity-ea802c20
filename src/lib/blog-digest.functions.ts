import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Uses the same authenticated staff access as the dashboard, never a public trigger. */
export const generateBlogDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Check staff access with the caller's permissions before loading privileged job code.
    const access = await context.supabase.from("job_state").select("name").limit(1);
    if (access.error) throw new Error("Staff access required.");
    const { runBlogDigest } = await import("@/lib/blog-digest.server");
    return runBlogDigest();
  });