import { parseInboundStatuses } from "./field-updates";

const gateway = "https://connector-gateway.lovable.dev/whatsapp";
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

/** A reservation is not a successful send. Unknown outcomes are never blindly resent. */
export async function sendAcknowledgment(inboundId: string) {
  const lovable = process.env["LOVABLE_API_KEY"];
  const wa = process.env["WHATSAPP_API_KEY"];
  if (!lovable || !wa) throw new Error("WhatsApp connection is not configured");
  const db = await admin();
  const claim = await db.from("whatsapp_replies").update({ state: "sending" })
    .eq("inbound_message_id", inboundId).in("state", ["pending", "failed"])
    .is("provider_message_id", null).lte("retry_after", new Date().toISOString())
    .gt("expires_at", new Date().toISOString()).select("*").maybeSingle();
  if (claim.error) throw claim.error;
  const row = claim.data;
  if (!row) return;
  let response: Response;
  try {
    response = await fetch(`${gateway}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": wa, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: row.recipient, type: "text", text: { body: "Recibido, ¡gracias! 🙌 Received, thank you!" } }),
    });
  } catch (error) {
    const save = await db.from("whatsapp_replies").update({ state: "unresolved", request_error: String(error), attempt_count: row.attempt_count + 1 }).eq("inbound_message_id", inboundId);
    if (save.error) throw save.error;
    return;
  }
  const body = await response.text();
  if (!response.ok) {
    console.error(`WhatsApp reply failed [${response.status}]: ${body}`);
    const save = await db.from("whatsapp_replies").update({ state: "failed", request_error: `[${response.status}] ${body}`, attempt_count: row.attempt_count + 1, retry_after: new Date(Date.now() + 60 * 60_000).toISOString() }).eq("inbound_message_id", inboundId);
    if (save.error) throw save.error;
    return;
  }
  let id: string | undefined;
  try {
    const parsed: { messages?: { id?: string }[] } = JSON.parse(body);
    id = parsed.messages?.[0]?.id;
  } catch { /* Accepted but unreadable responses require review, not replay. */ }
  const save = await db.from("whatsapp_replies").update({ state: id ? "accepted" : "unresolved", provider_message_id: id ?? null, request_error: id ? null : "Accepted response contained no message identifier", attempt_count: row.attempt_count + 1 }).eq("inbound_message_id", inboundId);
  if (save.error) throw save.error;
  if (id) {
    const reconciled = await db.rpc("reconcile_whatsapp_reply", { p_message_id: id });
    if (reconciled.error) throw reconciled.error;
  }
}

export async function queueAcknowledgment(id: string, recipient: string, sentAt: string) {
  const db = await admin();
  const save = await db.from("whatsapp_replies").upsert({ inbound_message_id: id, recipient, expires_at: new Date(new Date(sentAt).getTime() + 24 * 60 * 60_000).toISOString() }, { onConflict: "inbound_message_id", ignoreDuplicates: true });
  if (save.error) throw save.error;
  await sendAcknowledgment(id);
}

export async function reconcileStatuses(payload: unknown) {
  const db = await admin();
  for (const status of parseInboundStatuses(payload)) {
    const result = await db.rpc("reconcile_whatsapp_reply", { p_message_id: status.id });
    if (result.error) throw result.error;
    // Unmatched callbacks remain in the inbox; saving the outbound ID invokes reconciliation again.
  }
}

/** Called by subsequent webhook traffic: quiet periods delay known-failed request recovery. */
export async function recoverReplies() {
  const db = await admin();
  const now = new Date().toISOString();
  const rows = await db.from("whatsapp_replies").select("inbound_message_id").in("state", ["pending", "failed"]).is("provider_message_id", null).lt("attempt_count", 3).lte("retry_after", now).gt("expires_at", now).order("retry_after").limit(2);
  if (rows.error) throw rows.error;
  for (const row of rows.data ?? []) await sendAcknowledgment(row.inbound_message_id);
}