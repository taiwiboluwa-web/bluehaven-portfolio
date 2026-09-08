import { put } from '@vercel/blob';

export function requireBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  return token;
}

export async function putOptimizedBlob(pathname: string, bytes: Uint8Array, contentType: string) {
  const token = requireBlobToken();
  return put(pathname, Buffer.from(bytes), {
    access: 'public',
    contentType,
    token,
    addRandomSuffix: false,
  });
}
