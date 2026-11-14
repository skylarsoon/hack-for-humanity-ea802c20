# Nido database setup

- [x] Create requested schema, atomic approval functions, public-safe reads and private document storage; use private data-free household notifications instead of exposing raw household rows.
- [x] Seed eight households, five expenses, eleven links, five items and nineteen needs from existing app data.
- [x] Verify live permissions, category totals, twelve isolated PostgreSQL approval tests and regenerated types.
- [x] Enable email sign-in.
- [ ] Disable public signup: user must turn on Disable sign-up under More → Users → Auth settings because current unrelated hosted settings cannot be safely read.
- [x] Confirm the coordinator account exists and can open the dashboard.

## Workbench document review

- [x] Personalized household surveys using the uploaded bilingual questions.

- [x] Replace the donor portrait photo with the newly uploaded community group photo and verify it displays.

- [x] Add typed sample results, 1.5-second progress, handwriting warnings, and document-specific duplicate review.
- [x] Validate PNG/JPG uploads and clearly distinguish unavailable real analysis from sample fallback data.
- [x] Keep approval updates atomic across households, ledger, and totals; cover rules with tests.
- [x] Verify sample and fallback approval flows without changing dashboard or field-crew presentation.
- [x] Real photo analysis connected to Gemini through Lovable Cloud.
Future scope: connect existing in-memory screens to permanent saving; not part of this schema-only request.
## WhatsApp field updates → blog
- [x] Verified senders, WhatsApp inbox, field updates, bilingual AI drafts every 2 days, coordinator review, public field journal.
- [x] Connect WhatsApp Business and confirm real field updates arrive.
- [x] Diagnose missing acknowledgment: Meta status callback reports Business Account locked (131031).
- [x] Add and verify manual blog draft generation in the staff dashboard; real updates produced a saved bilingual draft and repeat clicks do not reuse them.
