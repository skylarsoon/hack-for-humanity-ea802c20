import { describe, expect, it } from "vitest";
import { eligibleForDigest, normalizePhone, parseDraft, parseInboundMessages } from "../lib/field-updates";

const payload = (messages: unknown[]) => ({ entry: [{ changes: [{ value: { messages } }] }] });

describe("field updates rules", () => {
  it("stores numbers as digits only", () => expect(normalizePhone("+57 300-123 4567")).toBe("573001234567"));
  it("parses text, photo caption and voice note", () => {
    const r = parseInboundMessages(payload([
      { id: "a", from: "573001", timestamp: "1700000000", type: "text", text: { body: "Techo listo" } },
      { id: "b", from: "573001", type: "image", image: { id: "m1", mime_type: "image/jpeg", caption: "HH_03" } },
      { id: "c", from: "573001", type: "audio", audio: { id: "m2", mime_type: "audio/ogg" } },
    ]));
    expect(r.map((m) => [m.kind, m.text, m.mediaId])).toEqual([["text", "Techo listo", null], ["image", "HH_03", "m1"], ["audio", "", "m2"]]);
  });
  it("ignores status-only payloads", () => expect(parseInboundMessages({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] })).toEqual([]));
  it("digest skips hidden, excluded, already used and unverified updates", () => {
    const base = { hidden: false, exclude_from_blog: false, used_in_post_id: null, sender_id: "s" };
    const rows = [base, { ...base, hidden: true }, { ...base, exclude_from_blog: true }, { ...base, used_in_post_id: "p" }, { ...base, sender_id: null }];
    expect(eligibleForDigest(rows)).toHaveLength(1);
  });
  it("draft photos may only reference digest updates", () => {
    const d = parseDraft('```json\n{"title_es":"a","title_en":"b","body_es":"c","body_en":"d","photos":[{"update_id":"x"},{"update_id":"evil"}]}\n```', new Set(["x"]));
    expect(d.photos.map((p) => p.update_id)).toEqual(["x"]);
  });
  it("rejects drafts missing a language", () => expect(() => parseDraft('{"title_es":"a","title_en":"b","body_es":"c"}', new Set())).toThrow(/body_en/));
});
