# BlueHaven Portfolio Admin Media & Ordering Design

## Goal
Upgrade the BlueHaven portfolio admin so projects support multi-image Vercel Blob uploads, editable portrait/landscape/square presentation, and persistent up/down ordering that controls the public portfolio.

## Current State
The current admin can create projects, toggle visibility, delete projects, reorder projects, and upload one image at a time. The API currently stores uploaded binary data in Neon and exposes it through `/api/media`. The project insert already initializes a `gallery_layout` JSONB field, but the API/admin/public response does not yet use it. Current GitHub code search contains no Buddy/Skales references.

## Architecture
Use Vercel Blob for actual image objects and Neon for portfolio/project metadata. `portfolio_projects` remains the source of truth for project order, visibility, and presentation mode; `portfolio_media` remains the source of truth for project images and image order. The public API returns projects ordered by `sort_order` and includes their media with Vercel Blob URLs.

### Approaches considered
1. **Vercel Blob + Neon metadata (recommended):** durable object storage, CDN-backed image URLs, small database records, and clean GitHub deployments.
2. **Neon binary storage:** minimal infrastructure change but unnecessarily large database rows and poor fit for an image-heavy portfolio.
3. **GitHub/public assets:** simple technically, but every upload becomes a code/repository deployment concern and is unsuitable for frequent admin uploads.

The recommended approach is option 1.

## Data Model

### `portfolio_projects`
Use a dedicated orientation value rather than encoding the setting in arbitrary JSON:
- `gallery_layout`: `portrait | landscape | square`
- Existing `sort_order` remains the canonical project ordering.
- Existing `visible` remains the publication toggle.

If the existing database uses `gallery_layout` as JSONB, migrate it to a text value with a safe default of `landscape` (or preserve an already meaningful string value). Existing projects must remain valid after migration.

### `portfolio_media`
Keep one row per uploaded image. Store:
- project ID
- Vercel Blob URL
- Vercel Blob pathname/key
- original filename
- MIME type
- alt text
- media sort order
- featured flag
- timestamps

Legacy `file_data` records must not break the site during rollout. The migration should preserve legacy rendering until those assets can be replaced/migrated; newly uploaded images use Blob.

## Admin UX

### Project creation
The creation form will include:
- title
- category
- description
- optional website URL
- orientation selector: Portrait / Landscape / Square
- multiple image file picker
- publish immediately toggle

Selecting several files and submitting uploads all selected images to the new project. Upload progress/errors are shown without silently dropping files.

### Existing project management
Each project row/card exposes an editor for:
- project metadata
- orientation
- adding multiple additional images later
- image thumbnails
- removing an individual image
- changing image order/featured image where supported
- visibility
- project order controls
- deletion

Project reorder uses the existing `sort_order` field and persists the complete ordered ID list. The public API reads that same field, so admin ordering and public ordering cannot drift.

### Orientation behavior
The public renderer receives `gallery_layout` and applies an explicit aspect-ratio presentation class:
- portrait: `3 / 4`
- landscape: `16 / 9`
- square: `1 / 1`

Images retain their source dimensions; the presentation frame controls layout. The renderer uses `object-fit: cover` for portfolio tiles unless the existing design requires containment for a specific media type.

## Upload Flow
1. Admin selects one or more images.
2. Browser sends authenticated upload requests using multipart/form-data or a server-generated Blob upload flow; no base64 image payloads are stored in Neon.
3. Server validates MIME type, extension, and file size before accepting the upload.
4. File is written to Vercel Blob under a deterministic project-scoped pathname with a unique suffix.
5. Server inserts the corresponding `portfolio_media` metadata row with the Blob URL and next media sort order.
6. Admin refreshes the project media list and can continue adding images later.

The implementation must cap per-file size at the existing 3 MB limit unless the current validation rules explicitly support a safer larger limit. Multi-file upload must enforce the same validation for every file.

## API Changes
Extend the authenticated portfolio API with explicit operations rather than overloading the current single-file JSON action:
- create project with `gallery_layout`
- update project metadata and `gallery_layout`
- upload one or more files to a project
- delete media and, when possible, remove the corresponding Blob object
- reorder media within a project
- reorder projects
- toggle project visibility

The public GET path must return `gallery_layout`, ordered projects, and ordered media. Errors must identify failed files where possible and leave successfully uploaded files/rows in a consistent state.

## Security
- Keep all mutation endpoints behind the existing HMAC-backed admin cookie.
- Never accept an arbitrary Blob URL from the browser as a trusted storage URL.
- Validate uploaded content and size server-side.
- Generate Blob paths server-side from authenticated project IDs and safe filenames.
- Do not expose admin credentials or Blob tokens to the client.

## Environment
The deployment will require a Vercel Blob read/write token, expected as `BLOB_READ_WRITE_TOKEN`. Existing Neon and admin environment variables remain unchanged.

## Testing
Add/extend tests for:
- orientation defaults and persistence
- invalid orientation rejection
- project ordering persistence and public ordering
- multi-file validation and upload metadata creation
- adding files to an existing project
- media deletion and ordering
- unauthorized mutation rejection
- public response containing orientation and media in the correct order

Run the existing test suite and a production build. Verify the admin UI and public portfolio with browser testing after deployment.

## Rollout / Compatibility
Existing projects should continue rendering during the migration. Legacy media rows can continue to resolve through the existing `/api/media` fallback while all new uploads use Blob. No Buddy/Skales feature should be reintroduced as part of this work.
