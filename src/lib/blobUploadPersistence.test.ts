import { describe, expect, it } from 'vitest';
import { persistBlobMetadataSafely } from './blobUploadPersistence';

describe('persistBlobMetadataSafely', () => {
  it('keeps a successful Blob upload successful when Neon metadata persistence fails', async () => {
    const result = await persistBlobMetadataSafely(async () => {
      throw new Error('Neon quota exceeded');
    });

    expect(result).toEqual({ persisted: false });
  });
});
