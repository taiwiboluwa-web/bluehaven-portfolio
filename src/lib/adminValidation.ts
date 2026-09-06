export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);

export function safeSlug(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || `work-${Date.now()}`;
}

export function validateUpload(mime: string, byteLength: number) {
  if (!ALLOWED_IMAGE_TYPES.has(mime)) return 'Unsupported image type';
  if (byteLength > MAX_UPLOAD_BYTES) return 'Image must be 20MB or smaller';
  return null;
}
