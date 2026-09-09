export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export function safeStorageFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^\.+/, '').slice(-120) || 'upload';
}

export function buildPortfolioStorageKey(projectId: string, mediaId: string, fileName: string) {
  return `portfolio/${projectId}/${mediaId}-${safeStorageFileName(fileName)}`;
}

export function isPortfolioStorageKey(key: string) {
  return /^portfolio\/[^/]+\/[^/]+-[^/]+$/.test(key);
}

export function assertAllowedImage(mimeType: string) {
  if (!ALLOWED_IMAGE_MIME.has(mimeType)) throw new Error('Unsupported image type');
}

export function assertUploadSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_UPLOAD_BYTES) {
    throw new Error('Image must be between 1 byte and 100MB');
  }
}

export function publicMediaUrl(mediaId: string) {
  return `/api/media?id=${encodeURIComponent(mediaId)}`;
}
