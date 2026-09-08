# Vercel Blob + Neon Monthly Media Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move production portfolio media delivery to Vercel Blob while archiving optimized media into Neon Storage on the first day of each month.

**Architecture:** Uploads up to 100 MB are optimized server-side with Sharp, then only the optimized bytes are written to Vercel Blob. Neon stores metadata and archive state; a protected Vercel Cron job copies optimized Blob objects to the existing Neon Storage bucket monthly without ever storing production image bytes in PostgreSQL.

**Tech Stack:** Vite/React, TypeScript, Vercel serverless functions, Vercel Blob (`@vercel/blob`), Sharp, Neon Postgres, Neon Storage, Vercel Cron, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-08-vercel-blob-neon-archive-design.md`

## Global Constraints

- Preserve the existing BlueHaven website and `/work` grid/list UI.
- Maximum incoming upload size remains 100 MB.
- Only optimized image bytes may be permanently stored for new uploads.
- Never fall back to PostgreSQL `file_data` for new production media.
- Vercel Blob is the primary production delivery store.
- Neon Storage is the monthly archive destination.
- Never commit storage credentials or secrets.
- Do not destructively delete legacy media during this migration.

---

### Task 1: Add Blob dependency and storage helpers

**Files:**
- Modify: `package.json`
- Modify: lockfile used by the repository
- Create: `src/lib/blobStorage.ts`
- Test: `src/lib/blobStorage.test.ts`

**Interfaces:**
- `putOptimizedBlob(path, bytes, contentType)` returns Blob URL/path metadata.
- `requireBlobToken()` throws a clear configuration error when Blob credentials are absent.

- [ ] Write failing tests for missing configuration, deterministic object paths, and successful Blob upload with a mocked SDK.
- [ ] Run the targeted test and confirm the expected failure.
- [ ] Add `@vercel/blob` and the helper implementation.
- [ ] Run the targeted tests until green.
- [ ] Commit the dependency/helper change.

### Task 2: Change portfolio uploads to Blob-only optimized storage

**Files:**
- Modify: `api/portfolio.ts`
- Modify: `api/media.ts`
- Test: relevant API/image optimizer tests

**Interfaces:**
- Existing `upload`, `upload_chunk`, `finalize_upload`, and `optimize_existing` actions continue to work.
- Successful upload returns the public Blob URL.

- [ ] Add failing tests proving new uploads do not persist `file_data` and return a Blob URL.
- [ ] Run tests and verify they fail for the current Neon-byte-storage behavior.
- [ ] Refactor upload finalization to optimize first, upload only optimized bytes to Blob, and update `storage_url`/`storage_key`.
- [ ] Ensure temporary upload bytes are released after the Blob write.
- [ ] Remove production reliance on `file_data` for new media.
- [ ] Make `/api/media` redirect to `storage_url` when present, and only retain byte-serving compatibility for legacy records if necessary.
- [ ] Run API/unit tests and the production build.
- [ ] Commit.

### Task 3: Add additive archive-state migration

**Files:**
- Create: `db/migrations/<timestamp>_media_archive.sql` (following the repository's existing migration convention)
- Modify: any schema/type helper required by the app
- Test: migration/query behavior where test infrastructure exists

**Interfaces:**
- `portfolio_media.archive_storage_key`
- `portfolio_media.archived_at`
- `portfolio_media.archive_status`

- [ ] Inspect the current schema/migration convention and choose the exact migration filename.
- [ ] Write a failing schema/query test if the repository has DB tests.
- [ ] Add only additive nullable columns.
- [ ] Verify the migration is safe for existing rows.
- [ ] Commit.

### Task 4: Build the monthly archive worker

**Files:**
- Create: `api/cron/archive-media.ts`
- Create: `src/lib/mediaArchive.ts`
- Test: `src/lib/mediaArchive.test.ts`

**Interfaces:**
- `archiveUnarchivedMedia()` selects eligible Blob-backed media, downloads each optimized Blob object server-side, uploads it to Neon Storage under a stable archive key, and marks the record archived.
- Cron handler requires `CRON_SECRET` and returns a concise job summary.

- [ ] Write failing tests for idempotency, stable archive keys, success marking, and failure retention.
- [ ] Verify RED.
- [ ] Implement the archive worker using bounded batches.
- [ ] Authenticate the cron request.
- [ ] Ensure a failed archive never deletes the Blob or falsely marks the row complete.
- [ ] Run tests until green.
- [ ] Commit.

### Task 5: Schedule the first-of-month cron

**Files:**
- Modify: `vercel.json`

- [ ] Add a Vercel Cron schedule that runs once on day 1 of every month.
- [ ] Keep all existing rewrites and cache headers unchanged.
- [ ] Validate `vercel.json` syntax.
- [ ] Commit.

### Task 6: Configure deployment and verify

**Files:**
- No secrets committed.
- Vercel project configuration: `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`.

- [ ] Create/connect the Vercel Blob store named for BlueHaven production media using the Vercel project.
- [ ] Ensure `BLOB_READ_WRITE_TOKEN` is available to Production and the relevant deployment environments.
- [ ] Add a strong `CRON_SECRET` to Production.
- [ ] Confirm Neon Storage bucket `bluehaven-portfolio-media` remains present and public-read.
- [ ] Deploy from `main`.
- [ ] Run unit tests and build verification.
- [ ] Test an optimized upload through the admin flow.
- [ ] Verify the public `/work` page loads media directly from Blob and does not request `/api/media` for newly uploaded items.
- [ ] Verify the cron endpoint rejects requests without the secret.
- [ ] Verify the production deployment reaches READY.
- [ ] Commit any final fixes.

### Task 7: Legacy-media follow-up

**Files:**
- No destructive changes in this task.

- [ ] Inspect legacy `file_data` rows only after Neon quota access is restored.
- [ ] Backfill them to Blob/Neon Storage through a separately verified process.
- [ ] Only after successful verification, consider removing legacy PostgreSQL bytes in a separately approved destructive migration.
