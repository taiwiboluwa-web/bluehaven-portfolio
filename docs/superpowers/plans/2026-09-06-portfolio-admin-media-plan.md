# BlueHaven Portfolio Admin Media & Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Admin the source of truth for project order, visibility, presentation orientation, metadata, and multi-image management, with all changes reflected publicly.

**Architecture:** Neon stores project/media metadata and canonical ordering; Vercel Blob stores new image objects; legacy Neon binary media remains supported. Extend the existing authenticated portfolio API, then make Admin and the public renderer consume the same persisted fields.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind, Neon Postgres, Vercel Blob, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-06-portfolio-admin-media-design.md`

## Global Constraints

- Keep mutations behind the existing HMAC admin cookie.
- `gallery_layout` is `portrait | landscape | square`; default is `landscape`.
- `sort_order` is canonical for both project and media ordering.
- New uploads use Vercel Blob; legacy `file_data` media continues to render.
- Per-file upload limit remains 3 MB.
- Do not trust arbitrary browser-supplied Blob URLs.
- Do not reintroduce Buddy/Skales.

### Task 1: Storage and schema

**Files:** `package.json`; `db/migrations/2026-09-06-portfolio-media-admin.sql`

- [ ] Add `@vercel/blob`.
- [ ] Add guarded SQL migration converting `portfolio_projects.gallery_layout` from JSONB to text if needed, mapping only valid values and defaulting invalid/missing values to `landscape`.
- [ ] Run migration against Neon and verify existing projects still query.
- [ ] Commit: `feat: prepare blob-backed portfolio media`.

### Task 2: API

**Files:** `api/portfolio.ts`; `api/media.ts`; validation tests.

- [ ] Validate orientation strictly.
- [ ] Add authenticated multipart multi-file upload operation; validate every file, upload to server-generated project-scoped Blob pathname, then create one metadata row per file.
- [ ] Extend project create/update to persist `gallery_layout`.
- [ ] Add media delete, media reorder, and featured-image persistence.
- [ ] Make project reorder persist the full ordered ID list safely.
- [ ] Public GET returns layout, projects in `sort_order`, media in `sort_order`, using Blob URLs for new media and `/api/media?id=` for legacy rows.
- [ ] Keep all mutation paths unauthorized without the existing admin cookie.
- [ ] Test invalid orientation, unauthorized mutation, upload validation, media deletion/order, and legacy fallback.
- [ ] Commit: `feat: add blob media management API`.

### Task 3: Admin control center

**Files:** `src/app/Admin.tsx` and focused admin styles only if needed.

- [ ] Replace single-file state with `File[]` and per-file status/errors.
- [ ] Add visible Portrait / Landscape / Square selector.
- [ ] Add visible Move Up / Move Down controls to every project, disabled at boundaries, persisting the complete order immediately.
- [ ] Add an existing-project editor for name, category, description, URL, visibility, orientation, with explicit `Save Changes`.
- [ ] Add thumbnails with featured state, image up/down, delete, and `Add more images` multi-select.
- [ ] Allow multiple files during project creation.
- [ ] Refresh state after mutations and surface failures.
- [ ] Commit: `feat: build portfolio project editor`.

### Task 4: Public rendering

**Files:** existing component(s) consuming `/api/portfolio?mode=public`.

- [ ] Locate the current dynamic portfolio consumer and use it as the integration point.
- [ ] Apply `portrait -> 3/4`, `landscape -> 16/9`, `square -> 1/1` presentation frames with `object-cover`.
- [ ] Remove conflicting hardcoded dynamic-project ordering so API `sort_order` is authoritative.
- [ ] Confirm hidden projects are never rendered.
- [ ] Commit: `feat: apply admin portfolio ordering and layouts publicly`.

### Task 5: Verification and deployment

- [ ] Run `pnpm test` and require PASS.
- [ ] Run `pnpm build` and require success.
- [ ] Search source for Buddy/Skales and require no removed-feature references.
- [ ] Inspect Vercel environment. If `BLOB_READ_WRITE_TOKEN` is absent, stop and request it rather than inventing a token.
- [ ] Deploy to Vercel and inspect status/logs.
- [ ] Browser-verify `/admin`: edit, save, move project, hide/show, choose orientation, add multiple images, reorder/delete images.
- [ ] Browser-verify public site reflects order/layout/visibility.
- [ ] Fix any verification failures, commit, and only then report completion.
