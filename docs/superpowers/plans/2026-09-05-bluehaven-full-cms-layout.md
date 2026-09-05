# BlueHaven Full CMS + Layout Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the BlueHaven admin a complete website control room for portfolio content and supported dashboard sections, with persistent layout settings in Neon and public-site rendering driven by those settings.

**Architecture:** Keep the existing React visual system and portfolio components intact. Add a Neon-backed CMS API for site settings, sections, projects, and media; make the public app consume CMS configuration without requiring deployments for normal content/layout changes. Use a constrained layout model rather than arbitrary CSS so the site remains visually coherent.

**Tech Stack:** React 18, TypeScript, Vite, Motion, Tailwind CSS, Neon PostgreSQL, Vercel serverless functions, static admin UI.

**Spec:** Approved chat design: full dashboard coverage, editable content/media, section ordering/visibility, and a visual/constrained layout editor.

## Global Constraints

- Preserve the existing BlueHaven visual identity and custom portfolio components.
- Do not replace the site with a generic CMS/WordPress-style frontend.
- Neon is the content/layout source of truth.
- Normal content/layout edits must not require GitHub/Vercel deployment.
- GitHub/Vercel deployments remain for code/design-system changes.
- Admin authentication remains server-side and uses `BLUEHAVEN_ADMIN_PASSWORD` / `ADMIN_PASSWORD`.
- Do not expose database credentials or admin secrets in client code.

---

### Task 1: Establish CMS schema and settings model
- [ ] Inspect current Neon tables and existing project/media data.
- [ ] Add only missing tables/columns using a migration-safe schema.
- [ ] Seed section definitions matching the main dashboard.
- [ ] Verify rows and ordering with read-only queries.

### Task 2: Add CMS API for site settings and sections
- [ ] Add authenticated CRUD for settings and sections.
- [ ] Return published configuration from `/api/portfolio`.
- [ ] Verify unauthorized requests fail and authorized requests persist.
- [ ] Add safe caching behavior.

### Task 3: Expand the admin dashboard
- [ ] Add Overview, Sections/Layout, Portfolio, Media, and Site Settings areas.
- [ ] Add section reorder and visibility controls.
- [ ] Add constrained layout controls: width, alignment, spacing, columns, media position, motion preset.
- [ ] Add editable content controls for dashboard sections.
- [ ] Add live preview where practical.

### Task 4: Connect public dashboard to CMS configuration
- [ ] Fetch CMS configuration from `/api/portfolio`.
- [ ] Apply visibility/order/layout settings without breaking existing animations.
- [ ] Route portfolio metadata/media through Neon while retaining legacy visual components as fallback.
- [ ] Keep the site resilient if the CMS API is temporarily unavailable.

### Task 5: Media management and Neon Object Storage integration
- [ ] Support media create/update/delete/reorder.
- [ ] Keep URL-based media support.
- [ ] Wire direct Neon Object Storage uploads when its scoped storage credential is configured in Vercel.
- [ ] Add alt text, featured, type, and ordering controls.

### Task 6: Deployment and performance cleanup
- [ ] Run build/tests.
- [ ] Reduce avoidable build work without changing the visual app.
- [ ] Verify Vercel API routes.
- [ ] Push GitHub changes.
- [ ] Deploy to Vercel and inspect build/runtime logs.

### Task 7: Production verification
- [ ] Verify all seeded legacy projects appear in admin.
- [ ] Verify edit/add/delete/reorder media operations.
- [ ] Verify section visibility/order changes on the public site.
- [ ] Verify mobile admin and public site.
- [ ] Confirm latest Vercel deployment is READY and no new runtime errors exist.
