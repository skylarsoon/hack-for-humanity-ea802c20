import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  run: vi.fn(),
  middleware: vi.fn(),
  handler: undefined as undefined | ((args: { context: { supabase: unknown } }) => Promise<unknown>),
}));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ middleware: mocks.middleware }),
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: "authenticated-staff" }));
vi.mock("@/lib/blog-digest.server", () => ({ runBlogDigest: mocks.run }));

describe("manual blog drafting", () => {
  beforeEach(async () => {
    vi.resetModules();
    mocks.run.mockReset();
    mocks.middleware.mockReset().mockImplementation(() => ({
      handler: (handler: typeof mocks.handler) => { mocks.handler = handler; return handler; },
    }));
    await import("../lib/blog-digest.functions");
  });

  const invoke = async (error: unknown = null) => {
    if (!mocks.handler) throw new Error("Handler not registered");
    return mocks.handler({ context: { supabase: {
      from: () => ({ select: () => ({ limit: async () => ({ error }) }) }),
    } } });
  };

  it("requires authentication before manual generation", () => {
    expect(mocks.middleware).toHaveBeenCalledWith(["authenticated-staff"]);
  });
  it("does not run generation when staff access is denied", async () => {
    await expect(invoke({ message: "denied" })).rejects.toThrow("Staff access required");
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it("uses the shared runner and returns a draft rather than publishing", async () => {
    mocks.run.mockResolvedValue({ status: "draft_created", postId: "draft-1" });
    await expect(invoke()).resolves.toEqual({ status: "draft_created", postId: "draft-1" });
    expect(mocks.run).toHaveBeenCalledTimes(1);
  });
  it("honors the existing busy or paused guard", async () => {
    mocks.run.mockResolvedValue({ status: "busy_or_paused" });
    await expect(invoke()).resolves.toEqual({ status: "busy_or_paused" });
    expect(mocks.run).toHaveBeenCalledTimes(1);
  });
});