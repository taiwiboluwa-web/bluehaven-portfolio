# BlueHaven Portfolio Admin Media & Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Admin the source of truth for project order, visibility, presentation orientation, metadata, and multi-image management, with all changes reflected publicly.

**Architecture:** Neon stores project/media metadata and canonical ordering; Vercel Blob stores new image objects; legacy Neon binary media remains supported. The existing `gallery_layout` JSONB column is retained for compatibility and normalized through the API as `portrait|landscape|square`.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind, Neon Postgres, Vercel Blob, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-06-portfolio-admin-media-design.md`

## Global Constraints

- Keep mutations behind the existing HMAC admin cookie.
- `gallery_layout` is normalized to `portrait | landscape | square`; existing JSONB storage remains compatible.
- `sort_order` is canonical for both project and media ordering.
- New uploads use Vercel Blob; legacy `file_data` media continues to render.
- Per-file upload limit remains 3 MB.
- Do not trust arbitrary browser-supplied Blob URLs; the server generates project-scoped Blob paths.
- Preserve the existing Skales/Buddy experience already present on the public site.

### Task 1: Storage and dependency foundation

**Files:** `package.json`

- [x] Add `@vercel/blob`.
- [x] Inspect Neon schema. `portfolio_projects.gallery_layout` is already JSONB with a landscape default, so no destructive type migration is required.
- [x] Keep existing rows intact and normalize the JSONB layout at the API boundary.

### Task 2: API

**Files:** `api/portfolio.ts`; `api/media.ts` compatibility path.

- [x] Validate orientation strictly on project updates.
- [x] Accept validated image payloads and write new objects to Vercel Blob under server-generated `portfolio/<project>/<uuid>-<filename>` paths.
- [x] Extend project create/update to persist `gallery_layout` inside the existing JSONB column.
- [x] Add media delete, media reorder, and featured-image persistence.
- [x] Persist the complete project ordered ID list with a temporary offset before final order values.
- [x] Public GET returns layout, projects in `sort_order`, media in `sort_order`, using Blob URLs for new media and `/api/media?id=` for legacy rows.
- [x] Keep mutations behind the existing admin cookie.

### Task 3: Admin control center

**Files:** `src/app/Admin.tsx`

- [x] Replace single-file state with `File[]` and per-file upload state.
- [x] Add visible Portrait / Landscape / Square selector.
- [x] Add visible Move Up / Move Down controls to every project, disabled at boundaries, persisting the full order.
- [x] Add an existing-project editor for metadata, visibility and orientation with explicit `Save Changes`.
- [x] Add thumbnails with featured state, image up/down, delete, and `Add more images` multi-select.
- [x] Allow multiple files during project creation.
- [x] Refresh state after mutations and surface failures.

### Task 4: Public rendering

**Files:** `src/app/SiteEnhancements.tsx`

- [x] Use the existing `/api/portfolio?mode=public` integration point.
- [x] Apply `portrait -> 3/4`, `landscape -> 16/9`, `square -> 1/1` presentation frames with `object-cover`.
- [x] Keep API `sort_order` authoritative.
- [x] Keep the public API's `visible=true` filter authoritative for hidden projects.

### Task 5: Verification and deployment

- [ ] Run `pnpm test` and require PASS.
- [ ] Run `pnpm build` and require success.
- [ ] Verify the existing Skales/Buddy source is unchanged by this feature work.
- [ ] Inspect Vercel Blob configuration. If the deployment has no Blob store/OIDC access or `BLOB_READ_WRITE_TOKEN`, uploads need that storage configuration before they can succeed.
- [ ] Deploy to Vercel and inspect status/logs.
- [ ] Browser-verify `/admin`: edit, save, move project, hide/show, choose orientation, add multiple images, reorder/delete images.
- [ ] Browser-verify public site reflects order/layout/visibility.
- [ ] Fix any verification failures, commit, and only then report completion.
