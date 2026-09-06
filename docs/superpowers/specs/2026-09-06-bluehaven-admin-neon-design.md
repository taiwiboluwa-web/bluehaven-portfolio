# BlueHaven Admin + Neon CMS Design

## Goal
Connect the existing BlueHaven portfolio CMS to Neon `cold-block-41265546` / `neondb`, add a protected admin backend for portfolio content, and remove stale media references while preserving the public site.

## Current state
- The repository is a Vite + React + TypeScript application.
- The existing public site already calls `/api/portfolio` with `cache: no-store`.
- The existing API reads `portfolio_projects`, `portfolio_media`, `site_sections`, and `site_settings` from Neon.
- `portfolio_media` stores image metadata and storage URLs/keys; the actual object-storage provider is not assumed to be Neon until confirmed from repository configuration.

## Design
1. **Neon data layer**
   - Keep the existing four CMS tables as the source of truth.
   - Use the existing server-side `@neondatabase/serverless` integration.
   - Never expose `DATABASE_URL` or any privileged Neon credential to browser code.
   - Add only the minimum schema needed for admin authentication/session state if the existing schema does not already provide a safe mechanism.

2. **Admin backend**
   - Add a dedicated `/admin` route/view with a server-side protected API.
   - Provide CRUD for projects, media metadata, sections, and settings.
   - Provide media upload/delete plumbing only after identifying the configured object-storage mechanism from the repo/deployment configuration.
   - Use HTTP-only, secure, same-site session cookies; no admin secret in client-side JavaScript.
   - Do not hard-code a password or credential in Git.

3. **Media cleanup**
   - First inventory `portfolio_media` and identify every referenced storage key/URL.
   - Delete existing media records and corresponding objects only after the storage backend is positively identified.
   - The requested "Neon bucket" is treated as an unknown storage abstraction rather than assuming Neon Postgres itself is object storage.

4. **Cache invalidation**
   - Preserve `no-store` for live CMS reads.
   - Add explicit cache-busting/revalidation where the admin mutates content.
   - Remove stale media references from the database during cleanup.
   - Browser caches cannot be remotely wiped; the application will use versioned/no-store responses so stale browser/CDN content naturally expires.

5. **GitHub delivery**
   - Implement on `main` in focused commits.
   - Add tests for admin authorization and CMS mutation behavior.
   - Run the project build and tests before claiming completion.

## Success criteria
- Public `/api/portfolio` reads successfully from `neondb`.
- Unauthorized users cannot mutate CMS data.
- Authorized admin can manage projects and media metadata.
- Existing media cleanup leaves zero stale `portfolio_media` rows after the approved destructive cleanup and zero dangling storage references.
- No privileged database credential is shipped to the client.
- Build/tests pass and changes are pushed to GitHub `main`.
