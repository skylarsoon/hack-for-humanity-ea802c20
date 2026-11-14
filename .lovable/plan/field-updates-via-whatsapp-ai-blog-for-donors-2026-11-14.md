# Field updates via WhatsApp -> AI blog for donors

## What you get
1. **Verified senders** – Coordinators add/remove trusted WhatsApp numbers (name, role, vereda) on a new "Field senders" tab in the coordinator dashboard. Messages from unknown numbers are stored but ignored.
2. **WhatsApp inbox** – Verified people send text, photos and voice notes to the project's WhatsApp Business number. Each one is saved, photos and audio go to private storage, and voice notes are transcribed by AI. The sender gets a short "Received, thank you" reply.
3. **Field updates in the dashboard** – New "Field updates" tab: list of everything received (who, when, text/transcript, photo/audio), with edit text, tag household/vereda/category, hide, or exclude from the blog.
4. **Blog drafts every 2 days** – An AI agent reads the not-yet-used updates since the last post and writes one bilingual (Spanish + English) post: what changed in the community, how donations and volunteers helped, with selected photos. It's saved as a draft; nothing is written if there were no new updates.
5. **Coordinator approval** – "Blog" tab: review, edit both languages, pick/remove photos, then Publish or Discard.
6. **Public blog** – New donor-facing "/blog" page and post pages, linked from the donor dashboard. Shows published posts only; no household names, coordinates or phone numbers.

## Setup you'll do
- Connect WhatsApp Business (connect card in chat), and select this project under Incoming messages.
- First messages to the number usually need to come from the senders' side (Meta rule).

## Technical details
- Tables (with grants + RLS, staff-only except published posts): `field_senders`, `whatsapp_webhook_events` (durable inbox, unique delivery_id), `field_updates` (sender, kind, text, transcript, media_path, household_id, category, hidden, used_in_post_id), `blog_posts` (title/body es+en, status draft|published|discarded, period range, cover), `blog_post_media`.
- Public read via `published_blog_posts` view / anon policy on status='published'.
- Private storage bucket `field-media`; published photos served via signed URLs from a server function.
- Webhook `POST /api/public/whatsapp/webhook`: verify with `@lovable.dev/webhooks-js`, store event first, idempotent processing, media download through the gateway with size cap, pending rows retried on later calls.
- Cron route `/api/public/jobs/blog-digest` with `authenticateCronRequest`, managed schedule `0 9 */2 * *`, DB lease lock, bounded batch, pause on 402/403/429.
- AI via Lovable AI Gateway SDK: default text model for the post (structured JSON es/en), default transcription model for voice notes, image understanding for photo captions.
- Coordinator edits via authenticated server functions; tests for: unknown numbers ignored, duplicate deliveries not double-stored, digest skips when no updates, only published posts readable anonymously.
