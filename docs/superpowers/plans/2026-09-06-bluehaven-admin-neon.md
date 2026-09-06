# BlueHaven Admin + Neon Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Vite portfolio APIs to the Neon `neondb` database, provide a protected `/admin` CMS, remove all current portfolio media records, and make cache invalidation explicit.

**Architecture:** Keep the existing Vite + React frontend and Vercel-style `api/` serverless functions. Use Neon Postgres for portfolio/projects/media/sections/settings, HMAC HTTP-only sessions for admin access, and no client-side database credentials. Media cleanup removes all `portfolio_media` records; physical object deletion is not claimed because Neon Postgres is not an object-storage bucket.

**Tech Stack:** React 18, TypeScript, Vite, `@neondatabase/serverless`, Motion, Lucide, Neon Postgres, Vercel serverless functions.

**Spec:** `docs/superpowers/specs/2026-09-06-bluehaven-admin-neon-design.md`

## Global Constraints

- Never expose `DATABASE_URL` or session secrets to browser code.
- Admin endpoints require an authenticated HTTP-only session.
- Public CMS reads remain cache-free (`no-store`).
- Do not delete the Neon project or branch.
- Delete portfolio media records only after confirming the target table is `portfolio_media`.

### Task 1: Neon media cleanup

**Files:**
- No repository files.
- Database: `public.portfolio_media`.

- [x] Confirm `portfolio_media` exists and contains keyed media records.
- [x] Delete all rows from `portfolio_media` after explicit user approval.
- [ ] Verify the table is empty.

### Task 2: Admin API hardening

**Files:**
- Modify: `api/admin-media.ts`
- Keep: `api/_auth.ts`, `api/admin-login.ts`

- [ ] Require authenticated session for all admin media/project operations.
- [ ] Support project create/update/delete.
- [ ] Support media create/update/delete.
- [ ] Support section/settings updates.
- [ ] Return JSON errors without leaking credentials.
- [ ] Disable caching on admin responses.

### Task 3: Admin UI routing and CMS

**Files:**
- Create/modify: `app/components/AdminDashboard.tsx`
- Modify: `src/main.tsx`
- Create: `app/admin.css`

- [ ] Route `/admin` directly to the admin dashboard without loading the public site as the primary page.
- [ ] Provide login, project selection, editing, media deletion/addition, and logout.
- [ ] Make the UI responsive and keyboard usable.

### Task 4: Cache invalidation

**Files:**
- Modify: `api/portfolio.ts`
- Modify: public CMS fetch logic if needed.

- [ ] Ensure public CMS responses are `no-store`.
- [ ] Add cache-busting query on client CMS fetch.
- [ ] Do not claim remote browser-cache deletion; browser caches can only be invalidated through headers/versioning.

### Task 5: Verification and push

- [ ] Validate database media count is zero.
- [ ] Validate modified source files are present on GitHub.
- [ ] Run available repository tests/build through the deployment/CI environment when possible.
- [ ] Push the verified implementation to `main`.
- [ ] Verify the resulting Vercel deployment and `/admin` route.
