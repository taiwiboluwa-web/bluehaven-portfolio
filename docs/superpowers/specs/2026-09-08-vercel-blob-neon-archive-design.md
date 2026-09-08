# Vercel Blob + Neon Monthly Media Archive

## Goal
Use Vercel Blob as the production image store and CDN, while keeping Neon as the portfolio metadata database and a monthly archive destination for optimized media.

## Architecture
1. Admin uploads may be up to 100 MB.
2. The server temporarily receives the upload and optimizes it with the existing `sharp`-based optimizer. Only the optimized representation is permanently stored.
3. The optimized representation is uploaded to a public Vercel Blob store. The original upload is not persisted after optimization.
4. `portfolio_media` stores the Blob URL/path and metadata, but does not store production image bytes in PostgreSQL.
5. Public portfolio responses use the Blob URL directly. `/api/media` remains a compatibility redirect for records that have a storage URL.
6. A Vercel Cron job runs on the first day of every month. It identifies media not yet archived, copies the optimized Blob object into the existing public Neon Storage bucket `bluehaven-portfolio-media`, and records an archive marker/key in Neon.
7. The archive job is idempotent: already archived media are skipped; failures do not delete or overwrite the production Blob.
8. The monthly archive is a backup/archive path, not the primary delivery path. Production traffic stays on Vercel Blob so normal page views do not stream image bytes from PostgreSQL.

## Data model
Existing `portfolio_media` remains the source of media metadata. Add archive fields only if the current schema does not already have equivalent fields:
- `archive_storage_key` nullable text
- `archived_at` nullable timestamp
- `archive_status` nullable text/status value

The migration must be additive and preserve all existing records.

## Security
- Vercel Blob write access is server-side only via `BLOB_READ_WRITE_TOKEN`.
- Public Blob access is used for portfolio delivery.
- The monthly cron endpoint must require Vercel Cron authentication (`CRON_SECRET`) and reject unauthenticated requests.
- Admin upload endpoints remain protected by the existing BlueHaven admin session.
- No storage credentials are committed to GitHub.

## Failure behavior
- If Blob configuration is missing, uploads fail with a clear configuration error instead of falling back to PostgreSQL byte storage.
- If the monthly archive fails for an item, its Blob remains untouched and the item remains eligible for a later retry.
- The job should process a bounded batch per invocation so it remains within serverless execution limits.

## Compatibility
- Existing project visibility, gallery ordering, grid/list views, admin controls, Skales/Buddy behavior, and existing portfolio metadata remain unchanged.
- Existing Neon-backed image rows are not destructively deleted as part of this change. A separate, verified migration/backfill can archive legacy rows once database quota access is available.
