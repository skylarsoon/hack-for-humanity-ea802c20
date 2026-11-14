CREATE TABLE public.field_senders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'volunteer',
  vereda text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_senders TO authenticated;
GRANT ALL ON public.field_senders TO service_role;
ALTER TABLE public.field_senders ENABLE ROW LEVEL SECURITY;
CREATE POLICY senders_staff_all ON public.field_senders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  attempts integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.whatsapp_webhook_events TO authenticated;
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY wa_events_staff_read ON public.whatsapp_webhook_events FOR SELECT TO authenticated USING (true);
CREATE INDEX wa_events_pending ON public.whatsapp_webhook_events (received_at) WHERE processed_at IS NULL;

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es text NOT NULL,
  title_en text NOT NULL,
  body_es text NOT NULL,
  body_en text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','discarded')),
  period_start timestamptz,
  period_end timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_public_read ON public.blog_posts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY posts_staff_all ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.field_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_message_id text NOT NULL UNIQUE,
  sender_id uuid REFERENCES public.field_senders(id) ON DELETE SET NULL,
  sender_phone text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('text','image','audio','video','document','other')),
  text text NOT NULL DEFAULT '',
  transcript text,
  media_id text,
  media_path text,
  media_mime text,
  media_status text NOT NULL DEFAULT 'none' CHECK (media_status IN ('none','pending','stored','failed')),
  household_id text REFERENCES public.households(id),
  category impact_category,
  hidden boolean NOT NULL DEFAULT false,
  exclude_from_blog boolean NOT NULL DEFAULT false,
  used_in_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.field_updates TO authenticated;
GRANT ALL ON public.field_updates TO service_role;
ALTER TABLE public.field_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY updates_staff_read ON public.field_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY updates_staff_update ON public.field_updates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.blog_post_media (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  update_id uuid NOT NULL REFERENCES public.field_updates(id) ON DELETE CASCADE,
  caption_es text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, update_id)
);
GRANT SELECT ON public.blog_post_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_media TO authenticated;
GRANT ALL ON public.blog_post_media TO service_role;
ALTER TABLE public.blog_post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY post_media_public_read ON public.blog_post_media FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published'));
CREATE POLICY post_media_staff_all ON public.blog_post_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.job_state (
  name text PRIMARY KEY,
  locked_until timestamptz,
  paused_reason text,
  last_run_at timestamptz
);
GRANT SELECT ON public.job_state TO authenticated;
GRANT ALL ON public.job_state TO service_role;
ALTER TABLE public.job_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_state_staff_read ON public.job_state FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.acquire_job_lock(p_name text, p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  INSERT INTO job_state(name) VALUES (p_name) ON CONFLICT DO NOTHING;
  UPDATE job_state SET locked_until = now() + make_interval(secs => p_seconds)
   WHERE name = p_name AND (locked_until IS NULL OR locked_until < now()) AND paused_reason IS NULL
   RETURNING true INTO ok;
  RETURN coalesce(ok, false);
END $$;
REVOKE EXECUTE ON FUNCTION public.acquire_job_lock(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_job_lock(text, integer) TO service_role;