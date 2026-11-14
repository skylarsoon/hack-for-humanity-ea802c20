import { whatsappSendingRestriction } from "./whatsapp-account";

/** Reads evidence without modifying historical messages, credentials or connection settings. */
export async function sendingRestriction() {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const result = await db.from("whatsapp_webhook_events").select("event,payload,received_at")
    .in("event", ["whatsapp.status", "whatsapp.account_update"]).order("received_at", { ascending: false }).limit(1000);
  if (result.error) throw result.error;
  const reason = whatsappSendingRestriction(result.data ?? []);
  return reason ?? (result.data?.length === 1000 ? "WhatsApp sending requires review of older account events before resuming." : null);
}