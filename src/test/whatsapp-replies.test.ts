import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { parseInboundStatuses } from "../lib/field-updates";

describe("WhatsApp acknowledgment tracking", () => {
  it("reads status IDs separately from field messages", () => {
    expect(parseInboundStatuses({ entry: [{ changes: [{ value: { statuses: [{ id: "reply-1" }, {}] } }] }] })).toEqual([{ id: "reply-1" }]);
  });
  it("retains early callbacks, original times and failures without regressing delivery", async () => {
    const db = new PGlite();
    try {
      await db.exec("CREATE ROLE authenticated; CREATE ROLE service_role; CREATE ROLE anon; CREATE TABLE whatsapp_webhook_events(event text,payload jsonb,received_at timestamptz DEFAULT now());");
      await db.exec(readFileSync("drizzle/migrations/0007_whatsapp_reply_tracking.sql", "utf8"));
      const callback = async (state: string, timestamp: string, errors?: unknown[]) => {
        await db.query("INSERT INTO whatsapp_webhook_events(event,payload) VALUES('whatsapp.status',$1)", [JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: "wa-1", status: state, timestamp, errors }] } }] }] })]);
      };
      await callback("read", "1700000030");
      expect((await db.query<{ ok: boolean }>("SELECT reconcile_whatsapp_reply('wa-1') AS ok")).rows[0]?.ok).toBe(false);
      await db.exec("INSERT INTO whatsapp_replies(inbound_message_id,recipient,provider_message_id,state,expires_at) VALUES('in-1','19717135890','wa-1','accepted',now()+interval '1 day')");
      await callback("sent", "1700000010");
      await callback("failed", "1700000020", [{ code: 131031, title: "Business Account locked" }]);
      await db.exec("SELECT reconcile_whatsapp_reply('wa-1'); SELECT reconcile_whatsapp_reply('wa-1');");
      const row = (await db.query<{ state: string; sent_time: number; read_time: number; status_errors: { code: number }[] }>("SELECT state,extract(epoch from sent_at)::integer AS sent_time,extract(epoch from read_at)::integer AS read_time,status_errors FROM whatsapp_replies")).rows[0];
      expect(row?.state).toBe("read");
      expect(row?.sent_time).toBe(1700000010);
      expect(row?.read_time).toBe(1700000030);
      expect(row?.status_errors).toEqual([{ code: 131031, title: "Business Account locked" }]);
    } finally { await db.close(); }
  });
});