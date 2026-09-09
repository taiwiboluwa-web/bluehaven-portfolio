# BlueHaven Admin + Neon Portfolio CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the BlueHaven admin so every published project/media item is stored in Neon PostgreSQL + Neon Object Storage and is reliably rendered by `/work` without a separate content source.

**Architecture:** Neon PostgreSQL is the source of truth for project/media metadata; Neon Object Storage is the only binary asset store. Admin optimizes images before upload, uploads directly through the Neon storage function, verifies the object, then registers metadata. Public `/work` reads Neon metadata and uses a stable same-origin media endpoint that streams bytes from Neon Object Storage.

**Tech Stack:** React + TypeScript + Vite, Vercel serverless APIs, Neon PostgreSQL, Neon Object Storage, Neon Function (`portfoliostorage`), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-09-admin-neon-work-cms-design.md`

## Global Constraints

- Preserve the existing public BlueHaven visual design and `/work` presentation.
- Do not reintroduce Vercel Blob.
- Keep image optimization before upload.
- Never delete existing portfolio objects/projects solely for the rebuild.
- Admin and `/work` must use the same Neon data source.
- A file is only shown as published after storage and database verification succeed.
- Public media delivery must not expose Neon storage credentials.

---

### Task 1: Lock the Neon data contract

**Files:**
- Create: `docs/superpowers/migrations/2026-09-09-portfolio-cms.sql`
- Test: `tests/portfolioSchemaContract.test.ts`

**Interfaces:**
- Produces the canonical metadata contract for `portfolio_projects` and `portfolio_media`.

- [ ] **Step 1: Write the failing schema-contract test**

```ts
import { describe, expect, it } from 'vitest';

describe('portfolio CMS schema contract', () => {
  it('requires object-storage metadata needed to publish media', () => {
    const required = ['storage_key', 'file_name', 'mime_type', 'file_size', 'width', 'height'];
    expect(required).toContain('storage_key');
    expect(required).toContain('file_size');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/portfolioSchemaContract.test.ts`
Expected: FAIL because the schema migration/contract does not yet exist in the repository.

- [ ] **Step 3: Define the migration**

Use additive, non-destructive SQL. Ensure `portfolio_media` has `storage_key`, `file_name`, `mime_type`, `file_size`, `width`, and `height`; preserve existing rows and keep the project foreign key with `ON DELETE CASCADE`. Add an index on `(project_id, sort_order)` and a unique index for `storage_key` when non-null.

- [ ] **Step 4: Run the contract test**

Run: `npx vitest run tests/portfolioSchemaContract.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/migrations/2026-09-09-portfolio-cms.sql tests/portfolioSchemaContract.test.ts
git commit -m "feat: define portfolio CMS storage contract"
```

---

### Task 2: Apply and verify Neon schema/resources

**Files:**
- Modify: Neon PostgreSQL schema via the approved migration SQL

**Interfaces:**
- Consumes: `docs/superpowers/migrations/2026-09-09-portfolio-cms.sql`
- Produces: verified portfolio tables and `bluehaven-portfolio-media` bucket/function resources.

- [ ] **Step 1: Verify current tables and storage bucket**

Confirm `portfolio_projects`, `portfolio_media`, `portfolio_media_archive`, and the `bluehaven-portfolio-media` bucket exist before changes.

- [ ] **Step 2: Apply additive SQL to the production Neon branch**

Add only the missing media metadata columns/indexes needed by the CMS. Do not delete `file_data` or existing records during this task.

- [ ] **Step 3: Verify columns and indexes**

Confirm `portfolio_media` exposes `storage_key`, `file_name`, `mime_type`, `file_size`, `width`, and `height`, and that the storage bucket remains available.

- [ ] **Step 4: Verify existing objects remain present**

List the `portfolio/` object prefix and confirm the existing uploaded WebP objects remain intact.

- [ ] **Step 5: Commit the migration document**

```bash
git add docs/superpowers/migrations/2026-09-09-portfolio-cms.sql
git commit -m "chore: document Neon portfolio schema migration"
```

---

### Task 3: Make Neon Object Storage function the authoritative media gateway

**Files:**
- Modify: `neon/functions/portfoliostorage.mjs`
- Test: `tests/neonStorageGateway.test.ts`

**Interfaces:**
- Consumes: `GET /?key=portfolio/<projectId>/<mediaId>-<safeFileName>`
- Produces: HTTP 200 streamed object bytes with content type/cache headers; rejects non-portfolio keys.

- [ ] **Step 1: Write the failing gateway test**

```ts
import { describe, expect, it } from 'vitest';

describe('Neon storage gateway contract', () => {
  it('only exposes portfolio object keys through GET', () => {
    const allowed = 'portfolio/project/media.webp';
    const blocked = 'private/project/media.webp';
    expect(allowed.startsWith('portfolio/')).toBe(true);
    expect(blocked.startsWith('portfolio/')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run tests/neonStorageGateway.test.ts`
Expected: FAIL until the function source includes the GET gateway contract.

- [ ] **Step 3: Implement GET using signed S3-compatible storage access**

Add a `GET` path that accepts `key`, validates `portfolio/` prefix, signs a GET request with the existing S3 credentials, streams the object body, and returns object headers plus immutable caching. Preserve existing POST/DELETE/token verification and the working 204 preflight behavior.

- [ ] **Step 4: Run the test GREEN**

Run: `npx vitest run tests/neonStorageGateway.test.ts`
Expected: PASS.

- [ ] **Step 5: Deploy `portfoliostorage` to Neon**

Deploy the updated function source to branch `br-young-tooth-axwqa5zd` using runtime `nodejs24`. Verify the deployment reaches `completed`.

- [ ] **Step 6: Exercise GET against a real existing object**

Request the exact key `portfolio/1e902465-93e1-450a-ae11-26b5a5b3a9c6/7c08ee47-fdd9-4057-9288-0dbe1e595e23-1.webp` and verify HTTP 200 with `image/webp` and a non-empty body.

- [ ] **Step 7: Commit**

```bash
git add neon/functions/portfoliostorage.mjs tests/neonStorageGateway.test.ts
git commit -m "feat: serve portfolio media through Neon storage gateway"
```

---

### Task 4: Rebuild the portfolio API contract

**Files:**
- Modify: `api/portfolio.ts`
- Modify: `src/lib/portfolioDb.ts`
- Create: `src/lib/portfolioContract.ts`
- Test: `tests/portfolioApiContract.test.ts`

**Interfaces:**
- `prepare_upload(projectId, mediaId, fileName, mimeType)` returns a Neon function upload URL, token, storage key, and stable public media URL.
- `register_upload(...)` verifies project/media/key ownership and records all metadata.
- `complete_replace(...)` updates the existing media record while retaining its stable id.
- `readPublicPortfolio()` returns visible projects with media sorted by `sort_order`.

- [ ] **Step 1: Write failing tests for publish invariants**

Test that a media record cannot be considered publishable without `storage_key`, supported `mime_type`, project ownership, and verified object metadata.

- [ ] **Step 2: Run tests to verify RED**

Run: `npx vitest run tests/portfolioApiContract.test.ts`
Expected: FAIL on the missing publish contract.

- [ ] **Step 3: Implement the contract**

Centralize safe key generation, supported MIME validation, media metadata shaping, and stable public URL generation. Keep admin authentication unchanged. Ensure public reads return same-origin media URLs only.

- [ ] **Step 4: Run GREEN**

Run: `npx vitest run tests/portfolioApiContract.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/portfolio.ts src/lib/portfolioDb.ts src/lib/portfolioContract.ts tests/portfolioApiContract.test.ts
git commit -m "refactor: make portfolio API the CMS source of truth"
```

---

### Task 5: Rebuild public media delivery as a stable same-origin endpoint

**Files:**
- Modify: `api/media.ts`
- Modify: `src/lib/neonMediaUrl.ts`
- Modify: `tests/neonMediaUrl.test.ts`

**Interfaces:**
- `GET /api/media?id=<mediaId>` queries Neon metadata, then calls the Neon storage function with the stored `storage_key`, and streams bytes to the browser.

- [ ] **Step 1: Write the failing integration-style test**

Test that a media id resolves to `/api/media?id=<id>` and that the server-side gateway uses `storage_key` rather than the raw `.storage.neon.tech` URL.

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/neonMediaUrl.test.ts`
Expected: FAIL on the new gateway contract.

- [ ] **Step 3: Implement the endpoint**

Query `storage_key`, `mime_type`, and file metadata from Neon. Validate the key. Fetch `NEON_STORAGE_FUNCTION_URL?key=...` server-side. Stream successful responses as image bytes; return 404 for missing records/objects without leaking secrets.

- [ ] **Step 4: Run GREEN**

Run: `npx vitest run tests/neonMediaUrl.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/media.ts src/lib/neonMediaUrl.ts tests/neonMediaUrl.test.ts
git commit -m "fix: deliver portfolio media through Neon gateway"
```

---

### Task 6: Rebuild the admin upload/publishing flow

**Files:**
- Modify: `src/admin.tsx`
- Modify: `src/app/Admin.tsx`
- Create: `src/admin/portfolioTypes.ts`
- Create: `src/admin/uploadPipeline.ts`
- Test: `tests/adminUploadPipeline.test.ts`

**Interfaces:**
- `uploadPortfolioFiles(projectId, files, options)` yields progress events `{ phase, fileName, progress }` and resolves only after storage + DB verification.
- Admin project/media actions remain authenticated through `/api/admin` and `/api/portfolio`.

- [ ] **Step 1: Write failing tests for the upload state machine**

Cover `optimizing -> uploading -> verifying -> published`, cancellation, retry, unsupported MIME, and a storage/DB failure that must leave the item unpublished.

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/adminUploadPipeline.test.ts`
Expected: FAIL because the rebuilt pipeline does not exist.

- [ ] **Step 3: Implement the pipeline**

Preserve `optimizeImageFile`. For each file: optimize, request an upload token, upload optimized bytes directly to the Neon function with progress, verify object existence/readability, register metadata, then confirm it appears in `readPortfolio`. Do not report success earlier.

- [ ] **Step 4: Rebuild Admin UI around the pipeline**

Provide project creation/editing, visibility, project/media reorder, cover image selection, alt text, replace, delete, multi-file upload, and per-file progress. Keep the established BlueHaven admin styling rather than changing public-site design.

- [ ] **Step 5: Run GREEN**

Run: `npx vitest run tests/adminUploadPipeline.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/admin.tsx src/app/Admin.tsx src/admin/portfolioTypes.ts src/admin/uploadPipeline.ts tests/adminUploadPipeline.test.ts
git commit -m "feat: rebuild BlueHaven portfolio admin CMS"
```

---

### Task 7: Make `/work` consume the CMS state and refresh without manual reload

**Files:**
- Modify: `src/app/SiteEnhancements.tsx`
- Test: `tests/workPortfolioSync.test.ts`

**Interfaces:**
- Public portfolio fetch returns projects and media from Neon only.
- A successful admin publish is reflected by `/work` without requiring an admin-page refresh.

- [ ] **Step 1: Write failing sync test**

Test that public portfolio loading uses `cache: 'no-store'`, replaces local state after a successful response, and exposes media URLs from the CMS payload.

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/workPortfolioSync.test.ts`
Expected: FAIL until the new synchronization helper exists.

- [ ] **Step 3: Implement the sync behavior**

Keep the existing visual components. Refresh on initial mount, window focus, and a bounded polling interval. Update state immediately after successful uploads from admin instead of relying on a browser refresh.

- [ ] **Step 4: Run GREEN**

Run: `npx vitest run tests/workPortfolioSync.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/SiteEnhancements.tsx tests/workPortfolioSync.test.ts
git commit -m "fix: keep public portfolio synchronized with Neon CMS"
```

---

### Task 8: End-to-end verification and production deployment

**Files:**
- Modify: `README.md` only if operational documentation needs updating

- [ ] **Step 1: Run the complete test suite**

Run: `npx vitest run`
Expected: PASS with no failing tests.

- [ ] **Step 2: Build the production app**

Run: `npm run build`
Expected: successful Vite build with no TypeScript/build errors.

- [ ] **Step 3: Deploy to Vercel production**

Push the completed commits to `main` and confirm the resulting Vercel deployment reaches `READY`.

- [ ] **Step 4: Verify the database**

Confirm project rows and media rows exist, media rows have valid Neon storage keys and metadata, and object storage contains the referenced objects.

- [ ] **Step 5: Verify the public API**

Request `/api/portfolio?mode=public` and confirm every visible project contains its media with same-origin `/api/media?id=...` URLs.

- [ ] **Step 6: Verify actual image bytes**

Request at least two `/api/media?id=...` URLs and confirm HTTP 200, correct image MIME, and a non-empty response body.

- [ ] **Step 7: Verify `/work`**

Open `https://www.bluehavens.name.ng/work` and confirm the newly uploaded work renders actual images rather than placeholders.

- [ ] **Step 8: Verify mutation lifecycle**

Using admin, create/upload, replace, reorder, hide/unhide, and delete one test portfolio asset; after each operation verify `/work` reflects the same Neon state.

- [ ] **Step 9: Commit any final operational documentation changes**

```bash
git add README.md
 git commit -m "docs: document BlueHaven portfolio CMS operations"
```

