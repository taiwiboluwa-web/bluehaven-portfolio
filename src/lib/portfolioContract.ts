export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
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

export function assertAllowedMedia(mimeType: string) {
  if (!ALLOWED_MEDIA_MIME.has(mimeType)) throw new Error('Unsupported media type. Use JPG, PNG, WebP, GIF, SVG, MP4, WebM or MOV.');
}

/** @deprecated Kept for image-only callers outside the portfolio workflow. */
export function assertAllowedImage(mimeType: string) {
  if (!mimeType.startsWith('image/') || !ALLOWED_MEDIA_MIME.has(mimeType)) throw new Error('Unsupported image type');
}

export function assertUploadSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_UPLOAD_BYTES) {
    throw new Error('Image must be between 1 byte and 100MB');
  }
}

/**
 * Include the storage key as a cache-busting version because optimization
 * replaces the object behind the same media ID.
 */
export function publicMediaUrl(mediaId: string, storageKey = '') {
  const version = storageKey ? `&v=${encodeURIComponent(storageKey)}` : '';
  return `/api/media?id=${encodeURIComponent(mediaId)}${version}`;
}
