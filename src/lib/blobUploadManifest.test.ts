import { describe, expect, it } from 'vitest';
import { appendUploadedMedia } from './blobUploadManifest';

describe('appendUploadedMedia', () => {
  it('registers a newly uploaded public Blob without downloading or rewriting it', () => {
    const result = appendUploadedMedia(
      { version: 1, projects: [{ id: 'p1' } as any], media: [] },
      { id: 'm1', project_id: 'p1', url: 'https://blob.vercel-storage.com/p1/m1.webp', pathname: 'p1/m1.webp', fileName: 'design.webp', mimeType: 'image/webp', altText: 'Design' },
    );

    expect(result.media).toEqual([expect.objectContaining({
      id: 'm1',
      project_id: 'p1',
      storage_url: 'https://blob.vercel-storage.com/p1/m1.webp',
      storage_key: 'p1/m1.webp',
      file_name: 'design.webp',
      mime_type: 'image/webp',
      sort_order: 0,
      featured: true,
    })]);
  });

  it('preserves existing media order and does not duplicate the media id', () => {
    const base = { version: 1 as const, projects: [], media: [{ id: 'm1', project_id: 'p1', sort_order: 0, featured: true } as any] };
    const result = appendUploadedMedia(base, { id: 'm1', project_id: 'p1', url: 'https://blob.vercel-storage.com/p1/m1.webp', pathname: 'p1/m1.webp', fileName: 'replacement.webp', mimeType: 'image/webp', altText: 'Replacement' });
    expect(result.media).toHaveLength(1);
    expect(result.media[0].storage_url).toBe('https://blob.vercel-storage.com/p1/m1.webp');
    expect(result.media[0].sort_order).toBe(0);
  });
});
