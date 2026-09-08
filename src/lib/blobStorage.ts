import { put } from '@vercel/blob';

export async function putOptimizedBlob(pathname: string, bytes: Uint8Array, contentType: string) {
  return put(pathname, Buffer.from(bytes), {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  });
}
