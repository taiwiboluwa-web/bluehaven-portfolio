# Neon + Blob Storage Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the BlueHaven production app use the new Neon database for database-backed features while keeping Vercel Blob authoritative for live portfolio media.

**Architecture:** Portfolio CRUD and image uploads remain fully Blob-backed and must not query Neon. Stories remain Neon-backed, while portfolio metadata/media can be copied to Neon through the existing manual offload and scheduled archive paths without deleting Blob originals.

**Tech Stack:** Vite/TypeScript, Vercel serverless API routes, Vercel Blob, Neon PostgreSQL via `@neondatabase/serverless`, Neon Object Storage via S3-compatible AWS SDK, Sharp, Vercel cron.

**Spec:** `docs/superpowers/specs/2026-09-08-neon-blob-storage-integration-design.md`

## Global Constraints

- Do not rebuild, replace, or remove existing BlueHaven functionality.
- Vercel Blob is the live source for portfolio images.
- Neon is required for stories and optional for portfolio backup/offload.
- Never commit database URLs, Blob tokens, admin passwords, or other secrets.
- Do not store live portfolio image bytes in PostgreSQL `BYTEA`.
- Do not delete Blob media after Neon sync/archive.
- Production must be redeployed after environment-variable changes.

---

### Task 1: Audit repository storage boundaries

**Files:**
- Inspect: `api/portfolio.ts`
- Inspect: `api/blob-upload.ts`
- Inspect: `src/admin.tsx`
- Inspect: `src/lib/blobPortfolioManifest.ts`
- Inspect: `api/stories.ts`
- Inspect: `api/story-media.ts`
- Inspect: `api/portfolio-sync.ts`
- Inspect: `api/cron/archive-media.ts`
- Inspect: `vercel.json`
- Inspect: database/migration files discovered in the repository

**Interfaces:**
- Consumes: current main-branch code and the new Neon schema.
- Produces: a concrete list of code/schema mismatches to fix; no behavior changes in this task.

- [ ] **Step 1: Read the current storage-related files and migrations.**
- [ ] **Step 2: Search for every `neon(`, `DATABASE_URL`, `portfolio_media`, `bluehaven_stories`, Blob upload, and Blob manifest reference.**
- [ ] **Step 3: Identify any portfolio path that still calls Neon and any story/archive path that assumes columns absent from the new database.**
- [ ] **Step 4: Record the exact changes required before implementation.**
- [ ] **Step 5: Commit the audit/spec changes already created as a documentation checkpoint.**

---

### Task 2: Reconcile Neon schema

**Files:**
- Modify/Create: the repository's existing database schema/migration file(s) discovered in Task 1
- Modify: `api/stories.ts` only if its safe bootstrap schema needs alignment
- Modify: `api/portfolio-sync.ts` only if its upsert schema differs
- Modify: `api/cron/archive-media.ts` only if archive schema differs

**Interfaces:**
- Consumes: Neon database `neondb` and the four required tables.
- Produces: compatible schema for stories, portfolio metadata, and archive markers.

- [ ] **Step 1: Compare the repository schema definitions with the new Neon tables.**
- [ ] **Step 2: Add only missing columns/indexes/constraints required by the application, using additive/idempotent SQL.**
- [ ] **Step 3: Ensure `bluehaven_stories` contains `id`, `title`, `slug`, `excerpt`, `content`, `category`, `cover_data`, `cover_mime`, `published`, `featured`, `published_at`, `created_at`, and `updated_at`, plus the public index.**
- [ ] **Step 4: Ensure `portfolio_projects`, `portfolio_media`, and `portfolio_media_archive` match the fields used by sync/archive code.**
- [ ] **Step 5: Run the schema SQL against the new Neon production branch and verify all four tables and required columns.**
- [ ] **Step 6: Commit the schema reconciliation.**

---

### Task 3: Harden the live Blob portfolio path

**Files:**
- Modify: `api/portfolio.ts`
- Modify: `api/blob-upload.ts`
- Modify: `src/admin.tsx`
- Modify: `src/lib/blobPortfolioManifest.ts`

**Interfaces:**
- Consumes: authenticated admin requests and Vercel Blob.
- Produces: Blob-backed portfolio CRUD and finalized upload responses containing real Blob URLs.

- [ ] **Step 1: Add or update tests for public portfolio reads succeeding without a database connection.**
- [ ] **Step 2: Add or update tests for authenticated CRUD mutating the Blob manifest only.**
- [ ] **Step 3: Add or update tests for upload finalization rejecting incomplete uploads rather than returning false success.**
- [ ] **Step 4: Ensure `api/portfolio.ts` has no Neon import or database invocation.**
- [ ] **Step 5: Ensure `api/blob-upload.ts` enforces the 100MB limit, supported image MIME types, optimization, and manifest finalization.**
- [ ] **Step 6: Ensure `src/admin.tsx` uses the native fetch for Blob finalization and surfaces finalization errors.**
- [ ] **Step 7: Run the relevant tests/typecheck/build.**
- [ ] **Step 8: Commit the Blob boundary hardening.**

---

### Task 4: Harden Neon-backed stories

**Files:**
- Modify: `api/stories.ts`
- Modify: `api/story-media.ts` if required by the verified schema/response contract

**Interfaces:**
- Consumes: `DATABASE_URL` pointing to the new Neon project.
- Produces: public story reads and authenticated story CRUD backed by `bluehaven_stories`.

- [ ] **Step 1: Add tests for public published-story reads.**
- [ ] **Step 2: Add tests for authenticated create/update/toggle/delete behavior.**
- [ ] **Step 3: Add tests for story cover metadata and `/api/story-media` retrieval.**
- [ ] **Step 4: Keep story uploads within the existing 12MB cover-image limit unless the current UI/API contract explicitly requires another limit.**
- [ ] **Step 5: Make database errors return useful server errors without leaking credentials or connection strings.**
- [ ] **Step 6: Run the story tests and production build.**
- [ ] **Step 7: Commit the story/Neon integration changes.**

---

### Task 5: Verify and harden manual Neon portfolio offload

**Files:**
- Modify: `api/portfolio-sync.ts`
- Modify: admin UI component that invokes the offload action, if discovered in Task 1

**Interfaces:**
- Consumes: Blob manifest and Blob media URLs.
- Produces: idempotent Neon metadata upserts and optional Neon Object Storage copies.

- [ ] **Step 1: Add tests for metadata-only offload when S3 credentials are absent.**
- [ ] **Step 2: Add tests for Object Storage copy when S3 credentials are configured.**
- [ ] **Step 3: Ensure all media upserts explicitly keep PostgreSQL `file_data` null.**
- [ ] **Step 4: Ensure the sync never deletes or rewrites the Blob source URL.**
- [ ] **Step 5: Return explicit counts for projects/media and whether Neon Object Storage is enabled.**
- [ ] **Step 6: Make Neon HTTP 402/quota failures visible as actionable admin errors.**
- [ ] **Step 7: Run tests and build.**
- [ ] **Step 8: Commit the offload hardening.**

---

### Task 6: Verify scheduled Neon archive

**Files:**
- Modify: `api/cron/archive-media.ts`
- Modify: `vercel.json` only if the existing monthly cron configuration is inconsistent

**Interfaces:**
- Consumes: `CRON_SECRET`, Blob media, and Neon Object Storage credentials.
- Produces: idempotent archive markers in `portfolio_media_archive`.

- [ ] **Step 1: Add tests for rejecting requests without the correct cron bearer token.**
- [ ] **Step 2: Add tests for skipping already archived media.**
- [ ] **Step 3: Ensure optimized Blob bytes are streamed to Neon Object Storage and the archive marker is written only after a successful copy.**
- [ ] **Step 4: Ensure retries are safe and Blob originals remain untouched.**
- [ ] **Step 5: Verify the monthly schedule remains `0 0 1 * *` if the route is still intended to run monthly.**
- [ ] **Step 6: Run tests/build and commit the archive hardening.**

---

### Task 7: Production environment and deployment verification

**Files:**
- No source changes unless verification exposes a real defect.
- Vercel project environment: `DATABASE_URL`, `BLUEHAVEN_SESSION_SECRET`, `BLUEHAVEN_ADMIN_PASSWORD`, `CRON_SECRET`, and Blob variables.

**Interfaces:**
- Consumes: Vercel production environment and the new Neon project.
- Produces: a production deployment proven to use the new Neon connection and current Blob code.

- [ ] **Step 1: Confirm production `DATABASE_URL` is configured to the new Neon project without exposing its secret value.**
- [ ] **Step 2: Confirm all required Blob variables are configured for Production.**
- [ ] **Step 3: Confirm `CRON_SECRET` is configured as an environment variable.**
- [ ] **Step 4: Trigger/redeploy production from the final main-branch commit if the running deployment is stale.**
- [ ] **Step 5: Verify the deployed commit SHA matches the final main commit.**
- [ ] **Step 6: Call the public portfolio endpoint and confirm it returns Blob-backed portfolio data without Neon errors.**
- [ ] **Step 7: Call the stories endpoint and confirm the new Neon database responds successfully.**
- [ ] **Step 8: Inspect runtime errors and confirm the previous Neon 402 portfolio error is absent from the new deployment.**
- [ ] **Step 9: Run the production browser smoke test for the portfolio/admin surface and verify no console/runtime failures.**
- [ ] **Step 10: Commit only any final source corrections discovered during verification.**

---

### Task 8: Final verification and handoff

**Files:**
- No new application files.

**Interfaces:**
- Consumes: final GitHub main branch and production deployment.
- Produces: verified implementation status and exact remaining configuration requirements.

- [ ] **Step 1: Run the complete test suite, typecheck, and production build.**
- [ ] **Step 2: Re-check the four Neon tables and relevant indexes.**
- [ ] **Step 3: Re-check production endpoints and deployment status.**
- [ ] **Step 4: Confirm no secrets were added to Git.**
- [ ] **Step 5: Report exact commits, deployment status, verified flows, and any external credentials still required for optional Neon Object Storage archive.**
