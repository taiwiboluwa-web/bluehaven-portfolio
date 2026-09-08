import { beforeEach, describe, expect, it, vi } from 'vitest';

const putMock = vi.fn();
vi.mock('@vercel/blob', () => ({ put: putMock }));

describe('blobStorage', () => {
  beforeEach(() => {
    vi.resetModules();
    putMock.mockReset();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  it('rejects missing Blob credentials', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const { requireBlobToken } = await import('./blobStorage');
    expect(() => requireBlobToken()).toThrow('BLOB_READ_WRITE_TOKEN is not configured');
  });

  it('uploads optimized bytes as a public Blob', async () => {
    putMock.mockResolvedValue({ url: 'https://blob.vercel-storage.com/portfolio/example.webp', pathname: 'portfolio/example.webp' });
    const { putOptimizedBlob } = await import('./blobStorage');
    const result = await putOptimizedBlob('portfolio/example.webp', Buffer.from('optimized'), 'image/webp');
    expect(putMock).toHaveBeenCalledWith('portfolio/example.webp', expect.any(Buffer), {
      access: 'public',
      contentType: 'image/webp',
      token: 'test-token',
      addRandomSuffix: false,
    });
    expect(result.url).toContain('example.webp');
  });
});
