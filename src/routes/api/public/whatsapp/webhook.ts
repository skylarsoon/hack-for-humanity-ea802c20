import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WHATSAPP_API_KEY"];
        if (!secret) return new Response("Not configured", { status: 500 });
        let payload: unknown;
        try {
          ({ payload } = await verifyWebhookRequest({ req: request, secret, maxBodyBytes: 4 * 1024 * 1024 }));
        } catch {
          return new Response("Unauthorized", { status: 401 });
        }
        const deliveryId = request.headers.get("x-lovable-delivery");
        const event = request.headers.get("x-lovable-event");
        if (!deliveryId || !event) return new Response("Missing headers", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const ins = await supabaseAdmin.from("whatsapp_webhook_events")
          .upsert({ delivery_id: deliveryId, event, payload: payload as never }, { onConflict: "delivery_id", ignoreDuplicates: true });
        if (ins.error) return new Response("Store failed", { status: 500 });
        const { data: row, error } = await supabaseAdmin.from("whatsapp_webhook_events").select("id").eq("delivery_id", deliveryId).single();
        if (error) return new Response("Store failed", { status: 500 });

        const { processEvent, recoverPending } = await import("@/lib/whatsapp.server");
        try {
          await processEvent(row.id);
        } catch (e) {
          console.error("WhatsApp processing failed", e);
          return new Response("Processing failed", { status: 500 });
        }
        await recoverPending(row.id).catch(() => {});
        return Response.json({ ok: true });
      },
    },
  },
});
