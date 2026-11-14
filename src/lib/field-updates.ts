// Browser-safe rules shared by the WhatsApp receiver, the blog writer and tests.

/** WhatsApp numbers are stored as digits only (E.164 without "+"). */
export function normalizePhone(input: string) {
  return input.replace(/\D/g, "");
}

export type FieldKind = "text" | "image" | "audio" | "video" | "document" | "other";
export interface InboundMessage {
  id: string;
  from: string;
  kind: FieldKind;
  text: string;
  mediaId: string | null;
  mime: string | null;
  sentAt: string;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Pull messages out of Meta's webhook payload (one change per delivery). */
export function parseInboundMessages(payload: unknown): InboundMessage[] {
  const entry = (obj(payload)["entry"] as unknown[] | undefined)?.[0];
  const change = (obj(entry)["changes"] as unknown[] | undefined)?.[0];
  const msgs = obj(obj(change)["value"])["messages"];
  if (!Array.isArray(msgs)) return [];
  return msgs.flatMap((m): InboundMessage[] => {
    const r = obj(m);
    const id = str(r["id"]);
    const from = normalizePhone(str(r["from"]));
    if (!id || !from) return [];
    const type = str(r["type"]);
    const kind: FieldKind = (["text", "image", "audio", "video", "document"] as const).find((k) => k === type) ?? "other";
    const media = kind !== "text" && kind !== "other" ? obj(r[type]) : {};
    const ts = Number(str(r["timestamp"]));
    return [{
      id, from, kind,
      text: kind === "text" ? str(obj(r["text"])["body"]) : str(media["caption"]),
      mediaId: str(media["id"]) || null,
      mime: str(media["mime_type"]) || null,
      sentAt: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
    }];
  });
}

export interface DigestCandidate { hidden: boolean; exclude_from_blog: boolean; used_in_post_id: string | null; sender_id: string | null }
/** Delivery callbacks are separate from inbound updates; keep the whole callback in the inbox. */
export function parseInboundStatuses(payload: unknown): { id: string }[] {
  const entry = (obj(payload)["entry"] as unknown[] | undefined)?.[0];
  const change = (obj(entry)["changes"] as unknown[] | undefined)?.[0];
  const statuses = obj(obj(change)["value"])["statuses"];
  return Array.isArray(statuses) ? statuses.flatMap((value) => {
    const id = str(obj(value)["id"]);
    return id ? [{ id }] : [];
  }) : [];
}
/** Only visible, unused updates from verified senders go into the next blog draft. */
export function eligibleForDigest<T extends DigestCandidate>(rows: T[]): T[] {
  return rows.filter((r) => !r.hidden && !r.exclude_from_blog && !r.used_in_post_id && r.sender_id);
}

export interface DraftPost { title_es: string; title_en: string; body_es: string; body_en: string; photos: { update_id: string; caption_es: string; caption_en: string }[] }
/** Validate the AI's JSON; photos may only reference updates that were in the digest. */
export function parseDraft(text: string, allowedIds: Set<string>): DraftPost {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const raw = obj(JSON.parse(text.slice(start, end + 1)));
  const need = (k: string) => { const v = str(raw[k]).trim(); if (!v) throw new Error(`Draft missing ${k}`); return v; };
  const photos = (Array.isArray(raw["photos"]) ? raw["photos"] : []).map(obj)
    .filter((p) => allowedIds.has(str(p["update_id"])))
    .slice(0, 6)
    .map((p) => ({ update_id: str(p["update_id"]), caption_es: str(p["caption_es"]), caption_en: str(p["caption_en"]) }));
  return { title_es: need("title_es"), title_en: need("title_en"), body_es: need("body_es"), body_en: need("body_en"), photos };
}
