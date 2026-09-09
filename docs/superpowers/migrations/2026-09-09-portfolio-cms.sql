-- Additive portfolio CMS metadata migration.
-- Existing project/media rows and legacy file_data are preserved.
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS file_size bigint NOT NULL DEFAULT 0;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS height integer;
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_media_storage_key_uidx ON portfolio_media(storage_key) WHERE storage_key IS NOT NULL;
