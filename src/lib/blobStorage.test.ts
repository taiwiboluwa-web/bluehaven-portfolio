import { describe, expect, it, vi } from 'vitest';

const putMock = vi.fn();
vi.mock('@vercel/blob', () => ({ put: putMock }));

describe('blobStorage', () => {
  it('uploads optimized bytes as a public Blob using project authentication', async () => {
    putMock.mockResolvedValue({ url: 'https://blob.vercel-storage.com/portfolio/example.webp', pathname: 'portfolio/example.webp' });
    const { putOptimizedBlob } = await import('./blobStorage');
    const result = await putOptimizedBlob('portfolio/example.webp', Buffer.from('optimized'), 'image/webp');
    expect(putMock).toHaveBeenCalledWith('portfolio/example.webp', expect.any(Buffer), {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
    });
    expect(result.url).toContain('example.webp');
  });
});
