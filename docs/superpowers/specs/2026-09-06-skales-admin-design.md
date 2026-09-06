# BlueHaven Portfolio — Skales Companion + Admin CMS Design

**Date:** 2026-09-06  
**Status:** Draft for review

## Goal

Add two connected capabilities to the existing React/Vite BlueHaven portfolio without replacing the current site:

1. **Skales**, a lightweight animated chameleon companion/easter egg that reacts to the active site palette and performs harmless randomized movements.
2. **`/admin`**, an authenticated content-management area for portfolio media and project metadata so new work can be published, reordered, hidden, replaced, or deleted without code changes.

The public site must continue to work if the content backend is unavailable, and Skales must never block normal navigation or interaction.

## Current repository constraints

The repository is a Vite + React + TypeScript application. `package.json` currently includes React, Motion, Lucide, Tailwind/Vite tooling, and Helmet, but does **not** currently declare a Supabase client dependency. The implementation must therefore verify the existing backend/configuration before assuming a working Supabase client or Edge Function exists in the checked-in tree.

The main application is currently concentrated in `src/app/App.tsx`, with reusable components under `src/app/components`. Existing visual work and local assets must remain intact.

## Recommended architecture

### 1. Public content layer

Create a small typed content service that reads published portfolio items from Supabase when configuration is present. Existing hardcoded/local projects remain as a fallback during migration, so a backend outage does not blank the portfolio.

Portfolio item shape:

- `id`
- `title`
- `description`
- `category`
- `image_url`
- `storage_path`
- `published`
- `sort_order`
- `created_at`
- `updated_at`

The public query returns only published items ordered by `sort_order`, then newest creation date.

### 2. Supabase data/storage layer

Use Supabase Postgres for metadata and Supabase Storage for uploaded media. Use Supabase Auth for admin authentication. Storage paths should be generated rather than trusting arbitrary client paths.

Recommended table: `portfolio_items`.

Recommended storage bucket: `portfolio-media`.

RLS rules should make public reads possible only for published records, while writes are restricted to authenticated admin users. Storage upload/update/delete must likewise require an authenticated admin identity.

If the existing project has a server-side Edge Function or API layer not visible in the current source index, reuse it for privileged operations rather than duplicating it. Otherwise, keep admin mutations on authenticated Supabase client operations with strict RLS/storage policies; do not expose service-role credentials in the browser.

### 3. Admin route

Add an `/admin` route without introducing a heavyweight routing framework solely for this feature if the current app does not already use one. A small pathname-based route boundary is acceptable for the existing Vite architecture.

Admin states:

- signed out → login form
- authenticating → loading state
- authenticated → dashboard
- session expired/unauthorized → return to login

Dashboard capabilities:

- list all portfolio items, including hidden items
- add/upload a work item
- edit title, description, category and date
- replace media
- drag/reorder or move items up/down
- toggle published/hidden
- delete an item with confirmation
- sign out

Upload flow should show progress/disabled submit state and cleanly surface storage or database errors.

### 4. Skales companion

Skales is a presentation-only client component. It has no backend dependency and does not use an AI model.

Behavior model:

- idle roaming along safe viewport boundaries
- occasional edge peek
- occasional hide/show
- cursor-aware head/body direction or small reaction
- occasional landing/hover near a project/image without intercepting clicks
- palette changes derived from CSS custom properties / active theme tokens
- randomized behavior intervals with bounded durations so it never becomes distracting
- `prefers-reduced-motion` disables roaming and leaves a minimal/static state
- persistent local preference allows the visitor to disable Skales

Implementation should use CSS transforms plus Motion where useful. The companion should be `pointer-events: none` during roaming/decoration; the disable control is separate and accessible.

The visual treatment should follow the supplied Skales references as direction, while remaining an original implementation rather than copying proprietary artwork or code.

## Public-site integration

Add a `Latest Work`/`Recent Work` data section that can consume managed portfolio records. Existing projects should not disappear merely because the CMS is empty. The migration should support a mixed state: current local projects plus newly managed records until all content is intentionally migrated.

Hidden CMS items must never render publicly.

Images should use resilient loading behavior and meaningful alt text. Broken media should fall back gracefully rather than collapsing the layout.

## Security

- Never put a Supabase service-role key in client code.
- Admin access is controlled by Supabase Auth plus database/storage RLS.
- Client-side route protection is UX only; database/storage policies are the real security boundary.
- Validate file type and size before upload.
- Sanitize/limit metadata fields and reject empty required values.
- Deleting a portfolio item should remove its database record and, when safe, its associated storage object.

## Error handling

Backend read failure: show the existing/local portfolio content and a non-blocking status only where appropriate.

Upload failure: preserve the form state and report a useful error; do not create a database record pointing at a failed upload.

Delete failure: leave the item visible in the dashboard and report the failure.

Expired auth: clear stale admin state and return to `/admin` login.

## Testing and verification

Before completion:

1. TypeScript/build succeeds with `pnpm build` (or the repository's available package manager command).
2. Public site renders with backend data available.
3. Public site still renders with backend unavailable/empty.
4. Hidden item is absent publicly and visible in admin.
5. Upload creates storage object + metadata record and renders publicly when published.
6. Edit/reorder/hide/delete operations persist after refresh.
7. Unauthorized users cannot perform admin mutations.
8. Skales does not intercept page clicks, respects reduced-motion, and can be disabled.
9. Mobile viewport remains usable.

## Scope exclusions

This first implementation does not include:

- a general-purpose page builder
- multi-admin role management
- image editing/retouching inside the browser
- analytics dashboards
- AI chat functionality for Skales
- real-time collaborative editing

Those can be added later without changing the core content model.

## Acceptance criteria

The feature is ready when the owner can visit `/admin`, authenticate, upload a new graphic, enter its metadata, publish it, see it appear in the public Recent Work area, hide it again without deleting it, reorder it, and delete it. The public site must retain its existing work and remain functional if the content service fails. Skales must add personality without turning the portfolio into a distracting game or blocking accessibility.
