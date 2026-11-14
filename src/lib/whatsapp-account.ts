import type { Json } from "@/integrations/supabase/types";

type Event = { event: string; payload: Json; received_at: string };
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};

/** Connection installation and green number quality do not clear a delivery restriction. */
export function whatsappSendingRestriction(events: Event[]): string | null {
  for (const event of [...events].sort((a, b) => b.received_at.localeCompare(a.received_at))) {
    const entry = object(event.payload)["entry"];
    const changes = object(Array.isArray(entry) ? entry[0] : null)["changes"];
    const value = object(object(Array.isArray(changes) ? changes[0] : null)["value"]);
    if (event.event === "whatsapp.account_update") {
      if (value["event"] === "ACCOUNT_RECONNECTED") return null;
      if (["PARTNER_REMOVED", "PARTNER_APP_UNINSTALLED", "ACCOUNT_OFFBOARDED"].includes(String(value["event"]))) return "WhatsApp sending is paused. Reconnect this number under Connectors → WhatsApp.";
      if (value["event"] === "DISABLED_UPDATE" && object(value["ban_info"])["waba_ban_state"] === "DISABLE") return "Meta disabled WhatsApp sending. Check WhatsApp Manager for the account restriction.";
    }
    if (event.event === "whatsapp.status" && Array.isArray(value["statuses"])) {
      for (const raw of value["statuses"]) {
        const status = object(raw);
        if (["sent", "delivered", "read"].includes(String(status["status"]))) return null;
        if (Array.isArray(status["errors"]) && status["errors"].some((error) => object(error)["code"] === 131031)) return "Meta has locked this WhatsApp Business account (131031). Check Account Quality in WhatsApp Manager and request review if offered. Incoming updates and blog drafting can continue; automatic replies are paused.";
      }
    }
  }
  return null;
}