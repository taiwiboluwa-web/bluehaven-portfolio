# BlueHaven Admin + Neon Portfolio CMS Design

## Goal
Rebuild the BlueHaven admin backend so that every portfolio project and uploaded asset is managed from one Neon-backed content system and every published asset is reliably rendered by `https://www.bluehavens.name.ng/work`.

## Scope

This change replaces the current fragile admin/upload coordination with a single content-management contract spanning:
- Admin UI and upload status
- Portfolio API
- Neon Postgres portfolio metadata
- Neon Object Storage binary assets
- Public media delivery
- `/work` synchronization

The existing public visual design remains the source of truth and is not rebuilt.

## Source of Truth

Neon Postgres is the canonical source for project and media metadata. Neon Object Storage is the canonical source for binary media. Vercel Blob is not used.

A portfolio media record is considered publishable only when its Object Storage object exists and the metadata row is valid and references that object through a deterministic `storage_key`.

## Data Model

### `portfolio_projects`

Required fields:
- `id text primary key`
- `slug text unique not null`
- `name text not null`
- `category text not null default ''`
- `description text not null default ''`
- `website_url text null`
- `visible boolean not null default true`
- `sort_order integer not null default 0`
- `gallery_layout jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:
- primary key on `id`
- unique index on `slug`
- `(visible, sort_order)` for public ordering

### `portfolio_media`

Required fields:
- `id text primary key`
- `project_id text not null references portfolio_projects(id) on delete cascade`
- `storage_key text not null`
- `storage_url text not null as the stable application media URL, not a raw storage dependency`
- `file_name text not null`
- `mime_type text not null`
- `file_size bigint not null`
- `width integer null`
- `height integer null`
- `alt_text text not null default ''`
- `media_type text not null default 'image'`
- `sort_order integer not null default 0`
- `featured boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Index:
- `(project_id, sort_order)`

The legacy `file_data bytea` column is not used for active uploads. Existing data is preserved during the rebuild and any removal of legacy columns is a later cleanup step only after successful end-to-end verification.

## Object Storage

Bucket:
- `bluehaven-portfolio-media`

Canonical key:
- `portfolio/{projectId}/{mediaId}-{safeFileName}`

Allowed active media types:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `image/svg+xml`

Maximum source/upload size:
- 100 MB

The browser uploads only the optimized asset. The original source image is not sent to Object Storage when optimization produces the supported optimized asset.

## Upload Lifecycle

1. Admin selects one or more files.
2. Client validates source size/type.
3. Client optimizes image before upload.
4. API issues a short-lived scoped Neon storage token.
5. Browser uploads optimized bytes to `portfoliostorage`.
6. Storage function verifies token and writes the object to Neon Object Storage.
7. API registers the media metadata in Neon Postgres.
8. API verifies the media record and storage key belong to the intended project.
9. Public media delivery is verified before the admin marks the asset published.
10. Admin immediately updates its in-memory project/media state from Neon.
11. `/work` reads the same public Neon-backed API data.

Upload states shown in the admin:
- `preparing`
- `optimizing`
- `uploading`
- `verifying`
- `published`
- `failed`
- `cancelled`

Each file receives its own progress and error state.

## Replacement Lifecycle

Replacing an image follows the same optimized-byte path as upload:
- locate existing media record
- issue scoped replacement token
- upload optimized replacement object under a deterministic new key
- verify object
- update the media metadata atomically
- keep the media ID stable so the public project relationship does not change

## Deletion Lifecycle

Deleting a media item:
- validates the media record
- deletes the corresponding Object Storage object
- deletes the Postgres media record
- refreshes the admin state

Deleting a project:
- removes child media through the existing foreign-key cascade
- attempts cleanup of associated Object Storage objects
- removes the project record
- refreshes admin and public data

No destructive migration is performed as part of the rebuild without first preserving existing records.

## Public Media Delivery

Public portfolio responses return stable application-owned media URLs. The browser does not depend on a raw `.storage.neon.tech` URL.

The public read path is:

`/work → public portfolio API → media record → public media route → Neon Object Storage`

The media route must:
- validate the media ID
- resolve the canonical `storage_key`
- retrieve the object through the Neon storage function using server-side credentials
- return the stored bytes with the stored MIME type
- send immutable cache headers
- reject invalid/non-portfolio keys

## Admin API Contract

The portfolio API keeps the existing project-management actions and standardizes these media actions:
- `create`
- `update`
- `toggle`
- `reorder`
- `reorder_media`
- `prepare_upload`
- `register_upload`
- `prepare_replace`
- `complete_replace`
- `delete_media`
- `delete`

The retired legacy raw-upload actions stay unavailable.

The storage function supports:
- `OPTIONS`
- authenticated `POST` upload/replace
- authenticated `DELETE`
- public `GET` for `portfolio/` keys only

## Failure Handling

A successful HTTP upload response is not sufficient to display an image as published. The admin must confirm:
- optimized upload completed
- Object Storage object exists
- Postgres row exists
- the row has the correct project ID
- the storage key follows the expected project/media prefix
- the media read route returns bytes successfully

When any verification fails:
- the file is shown as failed
- the error is visible beside the specific file
- retry is available without selecting every other file again
- unrelated successful files remain published

## Synchronization

Admin state refreshes immediately after mutations. The admin also performs a lightweight no-store synchronization while idle and on window focus.

`/work` uses no-store public portfolio reads and updates immediately when the application state receives a fresh response. Existing visual presentation, project cards, gallery layouts, and animations remain unchanged.

## Security

- Admin mutations require the existing admin authentication.
- Storage upload/delete actions require short-lived scoped tokens.
- Public GET only permits keys under `portfolio/`.
- Credentials remain server-side/function-side.
- No storage secret is sent to the browser.
- MIME types and file-size limits are enforced server-side in addition to client-side checks.

## Testing Requirements

Automated coverage must include:
1. media URL generation
2. storage key validation
3. upload registration contract
4. replacement contract
5. public portfolio response contains media
6. public media route returns a successful image response for a known stored object
7. invalid media IDs return 404
8. wrong project/storage prefixes are rejected

End-to-end production acceptance:

`Admin upload → Neon Object Storage object → Neon portfolio_media row → public media endpoint → /work image`

The acceptance test must be repeated for:
- multiple images
- replacing an image
- deleting an image
- reordering media
- hiding/unhiding a project

## Non-Goals

- Redesigning the public `/work` interface
- Reintroducing Vercel Blob
- Storing active image bytes in Postgres `bytea`
- Rebuilding unrelated BlueHaven site sections
- Deleting existing portfolio data merely to simplify the migration
