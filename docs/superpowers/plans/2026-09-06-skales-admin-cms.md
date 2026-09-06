# Skales + Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Skales animated chameleon companion and a secure `/admin` portfolio CMS while preserving the existing BlueHaven portfolio and its backend-independent fallback content.

**Architecture:** Keep the existing Vite + React + TypeScript application intact and add focused services/components around it. Supabase will provide Auth, Postgres metadata, and Storage when configured; the public site will merge published managed work with the existing local projects and fall back completely to local content if Supabase is unavailable. `/admin` will be a lightweight pathname route rather than introducing a routing framework solely for this feature, and Skales will remain a client-only presentation component with no backend dependency.

**Tech Stack:** React 18, TypeScript 5.6, Vite 6, Motion 12, Lucide React, Supabase JS, Supabase Postgres/Auth/Storage, existing Tailwind/Vite styling.

**Spec:** `docs/superpowers/specs/2026-09-06-skales-admin-design.md`

## Global Constraints

- Preserve the current public portfolio and local assets; do not replace the existing site.
- Public CMS reads return only `published = true`, ordered by `sort_order`, then newest creation date.
- Admin mutations require Supabase Auth plus database/storage RLS; never expose a service-role key in browser code.
- Storage bucket name is `portfolio-media` and metadata table name is `portfolio_items`.
- Validate upload type/size and required metadata before mutation.
- Hidden CMS items remain visible in admin but never render publicly.
- Skales is presentation-only, uses no AI/backend, never intercepts normal page clicks, respects `prefers-reduced-motion`, and can be disabled persistently.
- Backend failure must not blank the public portfolio.
- Verify with the repository's available package-manager build command before claiming completion.

---

### Task 1: Establish Supabase client and typed portfolio service

**Files:**
- Modify: `package.json` — add `@supabase/supabase-js`.
- Create: `src/lib/supabase.ts` — browser client/config detection.
- Create: `src/lib/portfolio.ts` — portfolio types, public query, admin CRUD helpers, upload validation.
- Create: `supabase/migrations/20260906_portfolio_items.sql` — table, indexes, RLS policies, storage policies.

**Interfaces:**
- Produces `PortfolioItem` with `id`, `title`, `description`, `category`, `image_url`, `storage_path`, `published`, `sort_order`, `created_at`, and `updated_at`.
- Produces `getPublishedPortfolioItems(): Promise<PortfolioItem[]>`, which returns an empty array on unavailable/unconfigured backend so callers can preserve local fallback content.
- Produces authenticated admin helpers for list/create/update/reorder/publish/delete and media upload/delete.

- [ ] **Step 1: Add the Supabase dependency**

Update `package.json` dependencies with:

```json
"@supabase/supabase-js": "^2.57.0"
```

Do not add a service-role package or server-only secret to client code.

- [ ] **Step 2: Write the failing service contract checks**

Create `src/lib/portfolio.test.ts` only if the repository's test runner is available; otherwise create a small type-level contract fixture and make the build the first executable test. The required behaviors are:

```ts
const item: PortfolioItem = {
  id: "1",
  title: "Poster",
  description: "Campaign artwork",
  category: "Graphics",
  image_url: "https://example.com/poster.jpg",
  storage_path: "portfolio/1/poster.jpg",
  published: true,
  sort_order: 0,
  created_at: "2026-09-06T00:00:00.000Z",
  updated_at: "2026-09-06T00:00:00.000Z",
};
```

The contract must reject empty titles/categories and files outside the allowed image MIME types or maximum size.

- [ ] **Step 3: Implement `src/lib/supabase.ts`**

Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Export `supabase = null` when either value is absent; otherwise create the browser client with `createClient(url, anonKey)`. Never read or bundle `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 4: Implement `src/lib/portfolio.ts`**

Use a typed row shape and a `portfolio_items` query equivalent to:

```ts
.from("portfolio_items")
.select("*")
.eq("published", true)
.order("sort_order", { ascending: true })
.order("created_at", { ascending: false });
```

For admin reads, omit the published filter. Generate storage paths from a UUID/item id plus sanitized file extension; do not accept arbitrary storage paths from form input. Validate images as `image/jpeg`, `image/png`, `image/webp`, `image/gif`, or `image/svg+xml`, with a 10 MB maximum. Reject blank title/category and cap metadata lengths before writes.

- [ ] **Step 5: Add the Supabase migration**

Create `portfolio_items` with UUID id, required title/category, optional description/image URL/storage path, published boolean defaulting false, integer sort order defaulting zero, and created/updated timestamps. Add an index supporting published ordering. Enable RLS. Add policies so anonymous/authenticated users can select only published rows, while authenticated users can perform admin writes; storage policies must restrict upload/update/delete to authenticated users in the `portfolio-media` bucket.

- [ ] **Step 6: Run the build/type check**

Run the repository build command (`pnpm build` when pnpm is available; otherwise the package manager lockfile's equivalent). Expected result: the existing public site still compiles with the new service unused.

- [ ] **Step 7: Commit**

```bash
git add package.json src/lib/supabase.ts src/lib/portfolio.ts supabase/migrations/20260906_portfolio_items.sql
git commit -m "feat: add portfolio CMS data layer"
```

---

### Task 2: Add Skales companion

**Files:**
- Create: `src/app/components/Skales.tsx` — state machine, reduced-motion handling, disable preference, roaming behavior.
- Create: `src/app/components/Skales.css` — bounded positioning, chameleon body/eye styling, palette-variable integration, mobile sizing.
- Modify: `src/app/App.tsx` — mount Skales once at the public-site root and expose an accessible disable control.

**Interfaces:**
- `Skales` accepts no required props and persists its disabled state under `bluehaven-skales-disabled`.
- The component reads `--primary`, `--secondary`, `--accent`, or existing BlueHaven theme variables when available and falls back to the site's current purple/yellow palette.

- [ ] **Step 1: Write the behavior test checklist**

The component must be testable by browser verification with these assertions: roaming element has `pointer-events: none`; the disable control is keyboard reachable; `prefers-reduced-motion: reduce` removes animation; reload preserves disabled state; changing the active palette updates Skales colors.

- [ ] **Step 2: Implement the visual component**

Create an original compact chameleon using semantic HTML/CSS shapes rather than external copyrighted artwork. Keep the decorative body `aria-hidden="true"`. Keep the control separate from the decorative element so roaming never blocks navigation.

- [ ] **Step 3: Implement bounded motion**

Use Motion transforms for short randomized transitions. Keep x/y positions inside a safe viewport margin, wait a bounded 5–14 seconds between behaviors, and cap each movement at a few seconds. Behaviors should include idle roaming, edge peeking, hiding/showing, cursor direction, and occasional proximity to a portfolio image. Do not attach click handlers to the roaming body.

- [ ] **Step 4: Implement accessibility and persistence**

Use `window.matchMedia('(prefers-reduced-motion: reduce)')`. In reduced-motion mode render Skales static and do not start timers. Store the disabled state in localStorage and provide an accessible `button` labelled `Hide Skales`/`Show Skales`.

- [ ] **Step 5: Mount in `App.tsx`**

Mount the component near the application root so it can roam over all public sections. Do not place it inside buttons, links, or image click targets.

- [ ] **Step 6: Build**

Run the repository build. Expected: no TypeScript or CSS errors and no regression in the existing portfolio.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/Skales.tsx src/app/components/Skales.css src/app/App.tsx
git commit -m "feat: add Skales site companion"
```

---

### Task 3: Build `/admin` authentication and dashboard shell

**Files:**
- Create: `src/app/admin/AdminApp.tsx` — pathname-routed admin boundary and auth state.
- Create: `src/app/admin/AdminLogin.tsx` — email/password login form.
- Create: `src/app/admin/AdminDashboard.tsx` — authenticated portfolio management UI.
- Create: `src/app/admin/admin.css` — responsive admin styling.
- Modify: `src/app/App.tsx` — route `/admin` before rendering the public site.

**Interfaces:**
- `AdminApp` uses `supabase.auth.getSession()` and `onAuthStateChange()`.
- Signed-out users see login; authenticated users see dashboard; expired sessions return to `/admin` login.
- Dashboard consumes the service functions from Task 1 and exposes list/add/edit/replace/reorder/publish/delete/sign-out actions.

- [ ] **Step 1: Write the auth/UI test checklist**

Browser verification must confirm `/admin` does not expose dashboard controls while signed out, successful login reveals all items including hidden ones, and sign-out immediately returns to the login state.

- [ ] **Step 2: Implement `AdminApp`**

On mount, load the current session. Subscribe to auth state changes and unsubscribe on cleanup. Render explicit loading, signed-out, and authenticated states. If Supabase is unconfigured, render a clear setup state rather than a broken form.

- [ ] **Step 3: Implement login**

Submit `supabase.auth.signInWithPassword({ email, password })`. Disable the submit button while authenticating. Display the returned error without clearing the entered email. Do not log credentials.

- [ ] **Step 4: Implement dashboard list**

Load all portfolio rows. Show title, category, thumbnail, published/hidden status, creation date, and order controls. Hidden items remain in this list.

- [ ] **Step 5: Implement responsive admin styling**

Use a dense desktop workspace and a single-column mobile layout. Avoid nested card-on-card styling; prioritize clear sections, large upload target, obvious publish state, and destructive-action confirmation.

- [ ] **Step 6: Build**

Run the build and verify `/admin` is included without changing the public route behavior.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin src/app/App.tsx
git commit -m "feat: add admin authentication dashboard"
```

---

### Task 4: Implement media upload, edit, reorder, hide/show, and delete

**Files:**
- Modify: `src/app/admin/AdminDashboard.tsx` — forms and mutation flows.
- Modify: `src/lib/portfolio.ts` — concrete upload/update/delete/reorder operations if not completed in Task 1.
- Modify: `src/app/admin/admin.css` — progress, error, confirmation, and empty-state styles.

**Interfaces:**
- Add form accepts image file, title, description, category, optional date, and published state.
- Replace-media flow uploads the new object before changing metadata; failed uploads do not create or corrupt a record.
- Reorder persists `sort_order`; hide/show changes only `published`.

- [ ] **Step 1: Add upload validation tests/checks**

Verify that a valid image under 10 MB is accepted and an invalid MIME type or oversized file is rejected before network mutation.

- [ ] **Step 2: Implement create flow**

Generate a safe storage path, upload to `portfolio-media`, obtain its public URL, then insert the metadata row. If metadata insertion fails, attempt to remove the just-uploaded object and show the database error while preserving the form.

- [ ] **Step 3: Implement edit and replace flow**

Update metadata independently. When replacing media, upload the new object first; after successful metadata update, remove the previous storage object when it is known to belong to `portfolio-media`.

- [ ] **Step 4: Implement publish/hide**

Persist `published` immediately and refresh the row state. The public query remains protected by `.eq('published', true)` and RLS.

- [ ] **Step 5: Implement reorder**

Use explicit up/down controls so the feature remains keyboard accessible and mobile friendly. Swap adjacent `sort_order` values and persist both rows in sequence.

- [ ] **Step 6: Implement delete**

Require confirmation. Delete the database record first only when storage cleanup is safe; otherwise preserve the item and surface the failure. Remove the associated storage object when `storage_path` is present and belongs to the configured bucket.

- [ ] **Step 7: Build and manually exercise dashboard flows**

Verify add, edit, replace, publish/hide, reorder, and delete states with a configured Supabase project. Confirm failures leave usable form/list state.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/AdminDashboard.tsx src/app/admin/admin.css src/lib/portfolio.ts
git commit -m "feat: add portfolio media management"
```

---

### Task 5: Integrate managed content into the public Recent Work section

**Files:**
- Modify: `src/app/App.tsx` — load published managed items and merge them with existing project content.
- Create: `src/app/components/ManagedPortfolioGrid.tsx` — present CMS records with existing visual language.
- Create: `src/app/components/ManagedPortfolioGrid.css` — responsive image/layout treatment.

**Interfaces:**
- Public content loader calls `getPublishedPortfolioItems()` once on mount.
- The component accepts `items: PortfolioItem[]` and renders only managed records supplied by the public service.

- [ ] **Step 1: Add the public fallback test**

Given a service rejection or an unconfigured Supabase client, the public render must still contain the existing hardcoded/local projects. Given an empty managed list, the current project sections remain unchanged.

- [ ] **Step 2: Implement loading and fallback**

Initialize managed items to an empty array. Call the public service in an effect. On failure, keep the local projects untouched and optionally expose only a non-blocking development status; do not show an alarming backend error on the portfolio.

- [ ] **Step 3: Add Recent Work rendering**

Render managed records in a dedicated `Recent Work` area when any are available. Use `title` for headings and meaningful alt text derived from title/category. Broken images must use a resilient fallback rather than collapse the grid.

- [ ] **Step 4: Build**

Run the production build and confirm all existing portfolio imports remain intact.

- [ ] **Step 5: Commit**

```bash
git add src/app/App.tsx src/app/components/ManagedPortfolioGrid.tsx src/app/components/ManagedPortfolioGrid.css
git commit -m "feat: render CMS work on public portfolio"
```

---

### Task 6: Configure Supabase and verify end-to-end behavior

**Files:**
- Modify: `.env.example` — document only public browser variables.
- Modify: `README.md` — document Supabase setup, migration, admin access, and media constraints.
- Verify: `supabase/migrations/20260906_portfolio_items.sql` against the connected project.

**Interfaces:**
- Browser config uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Admin account is created in Supabase Auth outside application code; no credentials are committed.

- [ ] **Step 1: Inspect the connected Supabase project**

Use the Supabase integration to identify the target project and verify whether an existing `portfolio_items` table, `portfolio-media` bucket, Auth setup, or Edge Function already exists. Reuse compatible existing resources instead of duplicating them.

- [ ] **Step 2: Apply/adjust migration and RLS**

Ensure the final table and storage policies match the application service. Public users can read published items only. Authenticated admin users can mutate rows and media. Confirm no policy permits anonymous writes.

- [ ] **Step 3: Configure environment documentation**

`.env.example` must contain:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not add service-role credentials.

- [ ] **Step 4: Document deployment**

Explain that the migration must be applied to the connected Supabase project and the two Vite environment variables configured in Vercel before `/admin` can publish content.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md supabase/migrations/20260906_portfolio_items.sql
git commit -m "docs: configure BlueHaven CMS deployment"
```

---

### Task 7: Final verification and deployment readiness

**Files:**
- Verify: all files changed by Tasks 1–6.
- Modify only if needed: `docs/superpowers/specs/2026-09-06-skales-admin-design.md` status from Draft to Implemented after verification.

- [ ] **Step 1: Run production build**

Run `pnpm build` when available. Expected: exit code 0 and a generated Vite production bundle.

- [ ] **Step 2: Verify public site without backend**

Open the public site with Supabase variables absent or unavailable. Expected: current local projects render normally and Skales still works.

- [ ] **Step 3: Verify public site with backend**

With valid Supabase variables, publish one CMS item and refresh the public site. Expected: item appears in Recent Work while unpublished items do not.

- [ ] **Step 4: Verify admin lifecycle**

Authenticate at `/admin`, create an item, edit it, replace its image, reorder it, hide it, show it again, and delete it. Refresh after each mutation to confirm persistence.

- [ ] **Step 5: Verify security boundary**

While signed out, attempt admin mutation requests. Expected: Supabase rejects them through Auth/RLS; client route protection alone is not treated as the security control.

- [ ] **Step 6: Verify Skales accessibility**

Confirm decorative Skales has no click interception, the hide/show control is keyboard reachable, reduced-motion prevents roaming, and disabled state survives reload. Check a narrow mobile viewport.

- [ ] **Step 7: Run browser/deployment verification**

Use the connected deployment/browser verification tooling when a preview/deployment is available. Check console errors, `/`, `/admin`, mobile layout, image loading, and the Recent Work section.

- [ ] **Step 8: Commit final verification changes**

```bash
git add .
git commit -m "chore: verify Skales and BlueHaven CMS"
```

- [ ] **Step 9: Push/deploy only after verification**

Promote the verified commit to the configured Vercel deployment. Do not claim deployment success until the deployment reports success and browser verification confirms the deployed routes.
