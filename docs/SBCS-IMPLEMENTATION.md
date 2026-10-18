# Student Birthday Celebration System (SBCS)

SBCS is a BlueHaven Studios school communications product. The public landing page lives at `/services/sbcs` in the existing Vite/React portfolio application.

## Current public-facing scope

- Explain the product and intended workflow.
- Collect a school-level demo enquiry without collecting student records.
- Send the enquiry to WhatsApp only after the visitor submits the form and confirms the send in WhatsApp.
- Show an illustrative dashboard concept clearly labelled as a preview, not live data.
- Keep the existing BlueHaven Services page and other routes intact.

## Production system architecture (next implementation phase)

- **Web app:** existing Vercel project and GitHub `main` branch.
- **Operational database:** Neon PostgreSQL, with strict school-level tenant isolation.
- **Scheduled scan:** Vercel Cron to identify eligible upcoming birthdays using each school's configured timezone.
- **Queue and idempotency:** durable delivery jobs, unique birthday-event keys, bounded retries, provider reconciliation, and an audit trail.
- **Card generation:** reusable school-branded templates, with private object storage and expiring access links where appropriate.
- **Messaging:** approved WhatsApp Business provider and transactional email provider; neither channel is live until credentials, templates, consent, and webhook validation are configured.
- **Data sources:** optional controlled import from school-approved spreadsheets or Google Forms/Drive.
- **Pilot default:** staff approval required before a message is sent.

## Data model draft

- `schools`: tenant identity, timezone, branding, lifecycle status.
- `school_members`: user identity, role and school membership.
- `students`: school-scoped source ID, display name, class and birthday date; store only necessary fields.
- `guardians`: school-scoped guardian contact details and preferred channels.
- `contact_permissions`: channel-specific permission/notice status, source, timestamps and revocation.
- `message_templates`: school-specific greeting copy and card design configuration.
- `birthday_events`: one logical event per student, school and birthday year.
- `delivery_jobs`: channel, recipient, approval status, idempotency key, retry count and provider reference.
- `delivery_events`: provider webhook status, timestamps and safe diagnostic details.
- `audit_logs`: staff review and configuration changes without unnecessary personal data.

## Essential release gates

1. Verify school authority and guardian contact permission for each channel.
2. Enforce tenant isolation in every database query and API endpoint.
3. Keep provider credentials server-side; verify inbound webhook signatures.
4. Prevent duplicate event and delivery creation using database uniqueness constraints.
5. Require staff approval in the pilot; never send automatically just because a birthday was found.
6. Apply retention/deletion rules, access logging and a guardian suppression mechanism.
7. Test with synthetic data and provider sandbox accounts before sending real messages.
8. Confirm applicable Nigerian data-protection obligations with the school before launch.

## Environment variables (future backend)

- `DATABASE_URL` — Neon connection string.
- `SBCS_CRON_SECRET` — protects scheduled scan endpoint if invoked via an HTTP route.
- Provider-specific WhatsApp and email credentials — add only after provider selection; never commit secrets.
- Object storage credentials — only if private birthday-card assets are enabled.

No real student data or provider credentials belong in this repository. The landing page is not itself a live delivery system.
