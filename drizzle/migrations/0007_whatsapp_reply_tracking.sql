CREATE TABLE public.whatsapp_replies (
 inbound_message_id text PRIMARY KEY,
 recipient text NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','accepted','sent','delivered','read','failed','unresolved','expired')),
 provider_message_id text UNIQUE,
 attempt_count integer NOT NULL DEFAULT 0,
 request_error text,
 status_errors jsonb,
 sent_at timestamptz,
 delivered_at timestamptz,
 read_at timestamptz,
 failed_at timestamptz,
 retry_after timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_replies TO authenticated;
GRANT ALL ON public.whatsapp_replies TO service_role;
ALTER TABLE public.whatsapp_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY replies_staff_read ON public.whatsapp_replies FOR SELECT TO authenticated USING (true);
CREATE INDEX replies_pending ON public.whatsapp_replies(retry_after) WHERE state IN ('pending','failed');
CREATE OR REPLACE FUNCTION public.reconcile_whatsapp_reply(p_message_id text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r whatsapp_replies; ev record; s jsonb; st text; ts timestamptz;
BEGIN
 SELECT * INTO r FROM whatsapp_replies WHERE provider_message_id=p_message_id FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 FOR ev IN SELECT payload FROM whatsapp_webhook_events WHERE event='whatsapp.status' AND payload->'entry'->0->'changes'->0->'value'->'statuses' @> jsonb_build_array(jsonb_build_object('id',p_message_id)) ORDER BY received_at LOOP
 FOR s IN SELECT value FROM jsonb_array_elements(ev.payload->'entry'->0->'changes'->0->'value'->'statuses') LOOP
 IF s->>'id'<>p_message_id THEN CONTINUE; END IF;
 st:=s->>'status';
 IF st NOT IN ('sent','delivered','read','failed') OR coalesce(s->>'timestamp','') !~ '^[0-9]{1,12}$' THEN CONTINUE; END IF;
 ts:=to_timestamp((s->>'timestamp')::double precision);
 IF st='sent' THEN r.sent_at:=coalesce(r.sent_at,ts); END IF;
 IF st='delivered' THEN r.delivered_at:=coalesce(r.delivered_at,ts); END IF;
 IF st='read' THEN r.read_at:=coalesce(r.read_at,ts); END IF;
 IF st='failed' THEN r.failed_at:=coalesce(r.failed_at,ts); r.status_errors:=coalesce(s->'errors',r.status_errors); END IF;
 END LOOP; END LOOP;
 UPDATE whatsapp_replies SET sent_at=r.sent_at,delivered_at=r.delivered_at,read_at=r.read_at,failed_at=r.failed_at,status_errors=r.status_errors,
 state=CASE WHEN r.read_at IS NOT NULL THEN 'read' WHEN r.delivered_at IS NOT NULL THEN 'delivered' WHEN r.failed_at IS NOT NULL THEN 'failed' WHEN r.sent_at IS NOT NULL THEN 'sent' ELSE r.state END
 WHERE inbound_message_id=r.inbound_message_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.reconcile_whatsapp_reply(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_whatsapp_reply(text) TO service_role;