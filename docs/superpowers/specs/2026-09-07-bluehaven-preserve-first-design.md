# BlueHaven Preserve-First Improvement Design

Date: 2026-09-07

## Goal
Improve the existing BlueHaven website in place without deleting, rebuilding, resetting, or replacing the current application. Preserve the current visual identity, routes, content, portfolio projects, admin/database behavior, and integrations while making the site faster, clearer, more conversion-focused, more accessible, and stronger on mobile.

## Guardrails
- No destructive git operations, force pushes, resets, or repository wipes.
- No schema changes unless inspection proves one is unavoidable.
- No secrets in source, logs, commits, or responses.
- Existing projects and content remain intact.
- Existing admin capabilities for adding/editing/uploading/hiding/unhiding remain intact.
- Changes are incremental and grouped into focused commits.

## Architecture approach
Keep the current Vite + React architecture and the existing path-based `RouteView` behavior. Improve the existing components/styles rather than replacing the application with a new framework or router. Preserve the separate admin and stories entry points.

## Workstreams

### 1. Performance
- Identify the actual above-the-fold/hero media and make only critical media eager/high priority.
- Keep non-critical imagery lazy and asynchronously decoded.
- Reduce oversized raster payloads where safe; prefer modern formats/responsive dimensions when the existing asset pipeline permits it.
- Preserve image aspect ratios to reduce layout shift.
- Audit video usage and avoid unnecessary autoplay/network work.
- Reduce avoidable client-side JavaScript/network work without changing behavior.
- Keep immutable caching for versioned static assets.

### 2. Information architecture and navigation
Use the existing page/section model but strengthen the primary navigation around:
- Work
- Services
- Process
- About
- Inquire

On mobile, prioritize Work, Services, Process, and Inquire while retaining access to About and existing functionality.

### 3. Portfolio and project presentation
- Preserve every existing project.
- Preserve existing visibility/hide-unhide behavior and admin data flow.
- Improve hierarchy so selected work is easy to scan and individual projects communicate outcome/context using only data already present.
- Avoid fabricated metrics, clients, awards, or claims.

### 4. Services, process, and conversion
- Keep all existing services.
- Clarify service hierarchy and calls to action.
- Strengthen the existing inquiry path rather than introducing a competing backend.
- Where compatible with the existing form/backend, support Name, Email/contact, Company, Service, Budget, and Project description.
- Preserve existing WhatsApp/contact behavior and links.

### 5. Visual system and motion
- Keep BlueHaven's established purple/yellow identity and existing creative character.
- Improve typography, spacing, rhythm, hierarchy, hover/focus states, and purposeful motion.
- Explicitly avoid generic AI-agency patterns: purple gradients, glassmorphism, excessive rounded cards/card-within-card layouts, arbitrary 3D objects, giant empty hero text, or decorative motion that obscures content.

### 6. Accessibility and mobile
Test at 320, 375, 390, 414, and 768 CSS px widths. Prevent horizontal overflow. Preserve readable type, usable tap targets, keyboard focus, visible focus states, semantic headings, labels, alt text, and reduced-motion behavior where motion exists.

### 7. SEO
Improve existing metadata without inventing business facts: title, description, canonical, Open Graph metadata, H1/heading hierarchy, image alt text, sitemap/robots behavior, and appropriate structured data only where supported by existing content.

### 8. Admin and data integrity
Do not change the Neon/database schema unless required. Verify that existing add/edit/upload/hide/unhide flows remain reachable and that public visibility still reflects admin state.

## Verification plan
- Run existing lint/typecheck/test/build commands when present.
- Inspect production/public routes: `/`, `/services`, `/portfolio`, `/process`, `/inquire`, `/stories`, and `/admin`.
- Check browser console/hydration errors and important network failures where tooling permits.
- Test mobile widths listed above and check for horizontal overflow.
- Verify inquiry/contact behavior and admin access without exposing secrets.
- Verify GitHub diff for unintended deletions or broad rewrites before each major commit.
- Verify the resulting deployment and production aliases before declaring completion.

## Rollback strategy
Every major workstream is committed separately so an individual change can be reverted without reconstructing the application. Existing production remains the baseline until a verified deployment is ready.
