# BlueHaven Neon + Vercel Blob Storage Integration Design

**Goal:** Connect the new Neon database to the existing BlueHaven application for database-backed features and backup/offload while keeping Vercel Blob authoritative for live portfolio media.

## Architecture

Vercel Blob remains the live portfolio media layer. Portfolio public/admin reads and uploads must not depend on Neon, so Neon quota or database failures cannot break the portfolio image experience. Neon PostgreSQL is the database for stories and the secondary metadata/archive destination for portfolio data. The existing manual offload and scheduled archive paths remain optional backup mechanisms and never delete the live Blob copy.

## Required database state

The Neon project `shiny-breeze-60424253` / database `neondb` must contain the tables required by the current application:

- `public.bluehaven_stories`
- `public.portfolio_projects`
- `public.portfolio_media`
- `public.portfolio_media_archive`

Schemas must be compatible with the application APIs and archive/offload code. Existing data must not be overwritten or fabricated; if the new database is empty, restore the schema first and only copy data when a valid source is available.

## Runtime rules

1. `DATABASE_URL` is the only runtime database connection secret and must be supplied through Vercel environment variables.
2. Production must be redeployed after the Neon connection is changed so the running server receives the new value.
3. Portfolio media bytes are uploaded to and served from Vercel Blob.
4. Portfolio metadata is stored in the Blob manifest for live portfolio operation.
5. `/api/stories` continues to use Neon.
6. Manual Neon offload copies portfolio metadata and optionally optimized media bytes to Neon Object Storage when the required S3-compatible credentials exist.
7. Scheduled archive is idempotent and never removes the Blob source.
8. No database secret, Blob token, or admin credential may be committed to source control.

## Files in scope

- `api/portfolio.ts`: remain Neon-independent for live portfolio CRUD/read operations.
- `api/blob-upload.ts`: preserve the 100MB Blob upload/finalization flow and manifest persistence.
- `src/admin.tsx`: preserve client Blob uploads and explicit finalization; ensure failure is surfaced instead of reporting false success.
- `src/lib/blobPortfolioManifest.ts`: remain the live portfolio metadata source.
- `api/stories.ts`: use the new Neon connection and ensure the stories schema/index exists safely.
- `api/story-media.ts`: verify compatibility with the restored stories schema and binary response behavior.
- `api/portfolio-sync.ts`: verify manual Blob-to-Neon metadata/media offload against the restored schema.
- `api/cron/archive-media.ts`: verify scheduled archive against `portfolio_media_archive` and Neon Object Storage.
- `vercel.json`: retain the monthly archive schedule if the endpoint is correctly protected by `CRON_SECRET`.
- database/schema/migration files, if present: reconcile them with the four required Neon tables without destructive resets.
- tests and documentation: add/adjust coverage for storage separation and Neon-backed stories.

## Success criteria

- Public `/api/portfolio?mode=public` works when Neon is unavailable.
- Admin portfolio reads/writes use Blob and do not issue Neon queries.
- A portfolio upload larger than normal web image sizes but at or below 100MB follows Blob upload, optimization, manifest finalization, and returns a real Blob URL.
- `/api/stories` can create/read/update/toggle/delete against the new Neon database.
- Story media remains retrievable from `/api/story-media`.
- Manual portfolio offload reports useful success/failure status and never deletes Blob data.
- Monthly archive is idempotent and protected by `CRON_SECRET`.
- Production is running the latest Git commit and no old Neon 402 portfolio error remains.
