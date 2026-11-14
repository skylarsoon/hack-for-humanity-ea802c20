import { afterEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
const restriction = vi.hoisted(() => vi.fn(async (): Promise<string | null> => null));
vi.mock("../lib/whatsapp-account.server", () => ({ sendingRestriction: restriction }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: db }));
import { sendAcknowledgment } from "../lib/whatsapp-replies.server";

describe("acknowledgment send outcomes", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
  function setup(claimed = true) {
    restriction.mockResolvedValue(null);
    vi.stubEnv("LOVABLE_API_KEY", "test-only");
    vi.stubEnv("WHATSAPP_API_KEY", "test-only");
    const saves: unknown[] = [];
    const row = { recipient: "19717135890", attempt_count: 0 };
    let call = 0;
    db.from.mockImplementation(() => ({ update: (value: unknown) => {
      call += 1;
      if (call > 1) { saves.push(value); return { eq: async () => ({ error: null }) }; }
      const chain = {
        eq: () => chain, in: () => chain, is: () => chain, lte: () => chain,
        gt: () => chain, select: () => chain,
        maybeSingle: async () => ({ error: null, data: claimed ? row : null }),
      };
      return chain;
    } }));
    db.rpc.mockResolvedValue({ error: null });
    return saves;
  }
  it("records accepted provider IDs and reconciles stored callbacks", async () => {
    const saves = setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ messages: [{ id: "wa-reply" }] }))));
    await sendAcknowledgment("inbound-1");
    expect(saves).toEqual([expect.objectContaining({ state: "accepted", provider_message_id: "wa-reply" })]);
    expect(db.rpc).toHaveBeenCalledWith("reconcile_whatsapp_reply", { p_message_id: "wa-reply" });
  });
  it("does not claim or send a reply while Meta has locked the account", async () => {
    setup();
    restriction.mockResolvedValue("Business Account locked (131031)");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await sendAcknowledgment("inbound-1");
    expect(db.from).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("stores request rejection without claiming delivery", async () => {
    const saves = setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('Business Account locked', { status: 403 })));
    await sendAcknowledgment("inbound-1");
    expect(saves).toEqual([expect.objectContaining({ state: "failed", request_error: "[403] Business Account locked" })]);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it("leaves ambiguous sends unresolved rather than retrying", async () => {
    const saves = setup();
    const fetch = vi.fn().mockRejectedValue(new Error("connection lost"));
    vi.stubGlobal("fetch", fetch);
    await sendAcknowledgment("inbound-1");
    expect(saves).toEqual([expect.objectContaining({ state: "unresolved" })]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("never sends when an accepted, ambiguous or concurrent attempt cannot be claimed", async () => {
    setup(false);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await sendAcknowledgment("inbound-1");
    expect(fetch).not.toHaveBeenCalled();
  });
});