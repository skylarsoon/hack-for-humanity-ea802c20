import { describe, expect, it } from "vitest";
import { whatsappSendingRestriction } from "../lib/whatsapp-account";
import type { Json } from "../integrations/supabase/types";
const event = (type: string, value: Record<string, Json>, time: string) => ({ event: type, received_at: time, payload: { entry: [{ changes: [{ value }] }] } });
const locked = event("whatsapp.status", { statuses: [{ status: "failed", errors: [{ code: 131031 }] }] }, "2026-11-14T21:23:00Z");
describe("WhatsApp account restrictions", () => {
  it("blocks sending after the exact reported account lock", () => expect(whatsappSendingRestriction([locked])).toContain("131031"));
  it("does not interpret reconnect installation as proof the lock cleared", () => expect(whatsappSendingRestriction([locked, event("whatsapp.account_update", { event: "PARTNER_APP_INSTALLED" }, "2026-11-14T21:24:00Z")])).toContain("131031"));
  it("clears the restriction after a later confirmed delivery", () => expect(whatsappSendingRestriction([locked, event("whatsapp.status", { statuses: [{ status: "delivered" }] }, "2026-11-14T21:25:00Z")])).toBeNull());
  it("pauses offboarded accounts", () => expect(whatsappSendingRestriction([event("whatsapp.account_update", { event: "ACCOUNT_OFFBOARDED" }, "2026-11-14T21:26:00Z")])).toContain("paused"));
});