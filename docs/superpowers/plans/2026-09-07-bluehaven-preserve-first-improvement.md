# BlueHaven Preserve-First Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the existing BlueHaven Vite/React website in place for speed, clarity, conversion, mobile usability, accessibility, SEO, and portfolio presentation without deleting or replacing existing functionality.

**Architecture:** Keep the current Vite + React application, path-based `RouteView`, separate admin/stories entry points, existing database/API/auth flows, and existing content. Make focused changes to existing components/styles and add only small, isolated helpers/tests where needed. Treat media optimization and UI improvements as incremental workstreams with independent commits.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS via Vite plugin, Motion, Lucide React, React Helmet Async, Vitest, Neon serverless/Postgres where already used, Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-09-07-bluehaven-preserve-first-design.md`

## Global Constraints

- No destructive git operations, force pushes, resets, or repository wipes.
- No schema changes unless inspection proves one is unavoidable.
- No secrets in source, logs, commits, or responses.
- Existing projects and content remain intact.
- Existing admin capabilities for adding/editing/uploading/hiding/unhiding remain intact.
- Changes are incremental and grouped into focused commits.
- Keep the current Vite + React architecture and existing path-based `RouteView` behavior.
- Preserve separate admin and stories entry points.
- Keep BlueHaven's established purple/yellow identity and existing creative character.
- Do not invent metrics, clients, awards, services, or business claims.
- Avoid generic AI-agency patterns: purple gradients, glassmorphism, excessive rounded cards/card-within-card layouts, arbitrary 3D objects, giant empty hero text, or decorative motion that obscures content.
- Test mobile widths 320, 375, 390, 414, and 768 CSS px with no horizontal overflow.

---

### Task 1: Establish implementation baseline and repository map

**Files:**
- Read only initially: `package.json`, `vite.config.ts`, `vercel.json`, `src/main.tsx`, `src/app/RouteView.tsx`, `src/app/App.tsx`, relevant components/styles, admin/stories files, public assets, and existing tests.

**Interfaces:**
- Consumes: current main branch at design commit `efd43648f5e5e30de256715875385fa17bae843f`.
- Produces: an exact file map and baseline test/build results before production changes.

- [ ] Confirm current branch/head and inspect recent commits.
- [ ] Inspect the full source tree relevant to public routes, admin, stories, contact/inquiry, portfolio, and styling.
- [ ] Identify current hero/above-the-fold media and all large media assets.
- [ ] Identify existing SEO metadata and route behavior.
- [ ] Identify existing contact/inquiry fields and backend endpoint/data flow.
- [ ] Identify existing admin visibility and upload/edit behavior.
- [ ] Run the existing test and build commands before modification when the execution environment permits them.
- [ ] Record any pre-existing failures instead of attributing them to later changes.
- [ ] Commit only if a baseline/documentation update is necessary; do not modify application behavior in this task.

---

### Task 2: Add regression tests for routing, performance helpers, and critical UI behavior

**Files:**
- Create or modify focused tests under `src/**/*.test.ts` / `src/**/*.test.tsx` following existing conventions.
- Modify only the smallest helper/component necessary after tests fail.

**Interfaces:**
- Produces: tests that protect path visibility, image-loading behavior, and mobile-safe/navigation behavior where practical.

- [ ] Write failing tests for any newly required helper behavior before production implementation.
- [ ] Run the targeted tests and confirm the expected failures.
- [ ] Implement the minimal helper/component behavior.
- [ ] Re-run targeted tests and confirm they pass.
- [ ] Run the existing test suite.
- [ ] Commit the test foundation as a focused commit.

---

### Task 3: Improve media loading without changing visible content

**Files:**
- Modify the existing image wrapper/helper(s), especially `src/app/components/figma/ImageWithFallback.tsx`, only where required.
- Modify components that render the actual above-the-fold/hero media.
- Add small performance utilities only if an existing utility cannot support the requirement.

**Interfaces:**
- Consumes: existing asset URLs/components.
- Produces: non-critical images lazy/async; only genuine critical media eager/high priority; stable dimensions/aspect ratios.

- [ ] Identify the actual hero image rather than guessing.
- [ ] Add/extend tests for critical vs non-critical loading behavior.
- [ ] Confirm the tests fail for the missing critical-media behavior.
- [ ] Implement minimal eager/high-priority handling for genuine critical media.
- [ ] Keep non-critical media lazy and asynchronously decoded.
- [ ] Add responsive image sizing/source selection only where it can be done without altering existing content or breaking URLs.
- [ ] Preserve aspect ratios to reduce CLS.
- [ ] Audit video elements for unnecessary preload/autoplay/network work and adjust only when behavior remains equivalent.
- [ ] Prefer WebP/AVIF/resized derivatives only where the existing asset pipeline permits safe generation and fallback.
- [ ] Do not delete original assets unless verified unused and explicitly safe; prefer additive optimized assets.
- [ ] Run targeted tests, full tests, and build.
- [ ] Review git diff for accidental asset/content deletion.
- [ ] Commit as `perf: optimize BlueHaven media loading`.

---

### Task 4: Refine navigation and route presentation

**Files:**
- Modify the existing header/navigation component(s).
- Modify `src/app/RouteView.tsx` only if required to make existing route presentation more coherent.
- Modify relevant CSS files.

**Interfaces:**
- Consumes: current path-based route behavior.
- Produces: clear Work, Services, Process, About, and Inquire navigation; mobile prioritizes Work/Services/Process/Inquire while retaining About and existing functionality.

- [ ] Write failing tests for navigation labels/route targets or pure route mapping helpers where practical.
- [ ] Verify failures.
- [ ] Implement navigation changes without introducing a new router.
- [ ] Preserve existing active states and route behavior.
- [ ] Ensure mobile navigation has usable tap targets and no horizontal overflow.
- [ ] Preserve existing admin/stories access paths.
- [ ] Run tests and build.
- [ ] Commit as `feat: clarify BlueHaven navigation`.

---

### Task 5: Improve portfolio hierarchy while preserving every project

**Files:**
- Modify existing portfolio/work components and their styles only.
- Modify portfolio data mapping only if needed for presentation, never to remove records.
- Add focused presentation tests if logic is introduced.

**Interfaces:**
- Consumes: existing portfolio data and visibility state.
- Produces: stronger selected-work hierarchy and clearer project scanning while preserving all projects and admin-controlled visibility.

- [ ] Inspect how public portfolio records are selected and hidden/unhidden.
- [ ] Write failing tests for any presentation-selection/helper behavior introduced.
- [ ] Implement hierarchy using existing project metadata only.
- [ ] Ensure hidden projects remain hidden and visible projects remain available.
- [ ] Preserve existing project detail links/content.
- [ ] Improve image aspect ratios/loading and hover/focus states without decorative overload.
- [ ] Run tests/build and inspect the diff for project deletions.
- [ ] Commit as `feat: strengthen portfolio presentation`.

---

### Task 6: Clarify services, process, about, and inquiry conversion flow

**Files:**
- Modify existing services/process/about/contact components and styles.
- Modify existing inquiry form/API integration only where compatible with its current contract.

**Interfaces:**
- Consumes: existing service list, process content, contact/inquiry backend.
- Produces: clearer hierarchy and stronger inquiry CTA while preserving existing service offerings and contact/WhatsApp behavior.

- [ ] Inspect the current inquiry form fields and backend payload contract before changing anything.
- [ ] Write failing tests for any new client-side validation/helper behavior.
- [ ] Confirm failures.
- [ ] Implement only compatible fields: Name, Email/contact, Company, Service, Budget, Project description where supported.
- [ ] Preserve existing backend field names and behavior unless an additive mapping is required.
- [ ] Improve CTA placement and error/success states without adding a competing backend.
- [ ] Keep WhatsApp/contact links unchanged except for presentation/accessibility fixes.
- [ ] Run tests/build.
- [ ] Commit as `feat: improve BlueHaven inquiry flow`.

---

### Task 7: Accessibility, responsive layout, and purposeful motion

**Files:**
- Modify existing global/component CSS and motion-enabled components.
- Add focused accessibility helpers/tests only where needed.

**Interfaces:**
- Consumes: existing UI components.
- Produces: keyboard-accessible controls, visible focus states, semantic headings/labels, useful alt text, reduced-motion behavior, and responsive layouts at required widths.

- [ ] Write failing tests for pure accessibility/utility behavior where practical.
- [ ] Implement focus-visible states and keyboard behavior without changing interaction semantics.
- [ ] Audit heading hierarchy and form labels.
- [ ] Audit image alt text using existing factual context only.
- [ ] Add reduced-motion handling for non-essential motion.
- [ ] Remove layout overflow sources at 320/375/390/414/768 widths.
- [ ] Keep motion purposeful and avoid adding decorative 3D/card/glass effects.
- [ ] Run tests/build.
- [ ] Commit as `fix: improve BlueHaven accessibility and responsive UX`.

---

### Task 8: SEO and crawlability improvements

**Files:**
- Modify existing HTML/metadata component(s), likely `index.html` and/or metadata helpers.
- Add or update `public/robots.txt` and `public/sitemap.xml` only if they are missing/incomplete.
- Add structured data only when existing content supports it.

**Interfaces:**
- Produces: accurate title, description, canonical, Open Graph metadata, heading structure, robots/sitemap behavior, and safe structured data.

- [ ] Inspect current metadata and deployed route behavior.
- [ ] Write tests for pure metadata/URL helpers if any are introduced.
- [ ] Implement metadata using factual BlueHaven information already present in the site/repository.
- [ ] Ensure canonical URLs use the real production domain without inventing alternate domains.
- [ ] Ensure social metadata has safe image URLs.
- [ ] Add/update robots and sitemap without exposing admin routes to crawlers.
- [ ] Run build and inspect generated HTML/assets.
- [ ] Commit as `feat: improve BlueHaven SEO foundations`.

---

### Task 9: Admin/database regression verification

**Files:**
- Read and test existing admin/API/database-related files.
- Modify only if a regression introduced by public UI changes is found.

**Interfaces:**
- Consumes: existing Neon/database/API/auth contracts.
- Produces: verified preservation of add/edit/upload/hide/unhide and public visibility behavior.

- [ ] Inspect admin routes and data flow.
- [ ] Confirm no schema migration is required.
- [ ] Verify existing admin controls remain reachable.
- [ ] Verify public portfolio visibility follows existing admin state.
- [ ] Verify upload URLs and existing storage behavior are untouched unless a real regression is found.
- [ ] If a regression exists, write a failing regression test first, then fix minimally.
- [ ] Run tests/build and commit only if code changes are actually necessary.

---

### Task 10: Production verification and deployment

**Files:**
- No planned source changes; deployment configuration only if verification proves one is required.

**Interfaces:**
- Consumes: all focused commits above.
- Produces: verified production deployment and documented evidence.

- [ ] Run full test suite.
- [ ] Run production build.
- [ ] Inspect final git diff/compare for unintended deletions, resets, or broad rewrites.
- [ ] Verify routes `/`, `/services`, `/portfolio`, `/process`, `/inquire`, `/stories`, `/admin`.
- [ ] Verify browser console/hydration errors and important network failures with available browser/deployment tooling.
- [ ] Verify mobile widths 320, 375, 390, 414, and 768 and check horizontal overflow.
- [ ] Verify inquiry/contact behavior without exposing secrets.
- [ ] Verify admin access without exposing credentials.
- [ ] Deploy through the existing Vercel project without replacing the project or changing secrets.
- [ ] Verify deployment state and production aliases.
- [ ] Inspect the live site after deployment.
- [ ] Only after fresh verification, report completion and any remaining limitations.

---

## Commit/rollback strategy

Each major task ends with a focused commit. Never force-push. Never reset or wipe the branch. If a task introduces a regression, revert that focused commit rather than reconstructing the repository. Keep the design commit `efd43648f5e5e30de256715875385fa17bae843f` as the documented baseline.
