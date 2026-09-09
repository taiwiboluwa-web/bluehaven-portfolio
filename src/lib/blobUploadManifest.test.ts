import { describe, expect, it } from 'vitest';
import { appendUploadedMedia, attachManifestMedia } from './blobUploadManifest';

describe('appendUploadedMedia', () => {
  it('registers a newly uploaded public Blob against the target project', () => {
    const result = appendUploadedMedia(
      { version: 1, projects: [{ id: 'p1' } as any], media: [] },
      { id: 'm1', project_id: 'p1', url: 'https://blob.vercel-storage.com/p1/m1.webp', pathname: 'p1/m1.webp', fileName: 'design.webp', mimeType: 'image/webp', altText: 'Design' },
    );

    expect(result.media).toEqual([expect.objectContaining({
      id: 'm1', project_id: 'p1', storage_url: 'https://blob.vercel-storage.com/p1/m1.webp',
      storage_key: 'p1/m1.webp', file_name: 'design.webp', mime_type: 'image/webp', sort_order: 0, featured: true,
    })]);
  });

  it('preserves existing media order and does not duplicate the media id', () => {
    const base = { version: 1 as const, projects: [], media: [{ id: 'm1', project_id: 'p1', sort_order: 0, featured: true } as any] };
    const result = appendUploadedMedia(base, { id: 'm1', project_id: 'p1', url: 'https://blob.vercel-storage.com/p1/m1-replaced.webp', pathname: 'p1/m1-replaced.webp', fileName: 'replacement.webp', mimeType: 'image/webp', altText: 'Replacement' });
    expect(result.media).toHaveLength(1);
    expect(result.media[0].storage_url).toBe('https://blob.vercel-storage.com/p1/m1-replaced.webp');
    expect(result.media[0].sort_order).toBe(0);
  });

  it('assigns the next media order within the same project while ignoring other projects', () => {
    const base = {
      version: 1 as const, projects: [],
      media: [
        { id: 'other', project_id: 'p2', sort_order: 0, featured: true } as any,
        { id: 'p1-a', project_id: 'p1', sort_order: 0, featured: true } as any,
        { id: 'p1-b', project_id: 'p1', sort_order: 1, featured: false } as any,
      ],
    };
    const result = appendUploadedMedia(base, { id: 'p1-c', project_id: 'p1', url: 'https://blob.vercel-storage.com/p1/p1-c.webp', pathname: 'p1/p1-c.webp', fileName: 'third.webp', mimeType: 'image/webp', altText: 'Third' });
    expect(result.media.find((item) => item.id === 'p1-c')).toMatchObject({ project_id: 'p1', sort_order: 2, featured: false });
  });

  it('builds each public project media array from the manifest media list', () => {
    const manifest = {
      version: 1 as const,
      projects: [{ id: 'p1', name: 'Graphic Design', visible: true } as any, { id: 'p2', name: 'Other', visible: true } as any],
      media: [
        { id: 'm2', project_id: 'p2', sort_order: 0 } as any,
        { id: 'm1', project_id: 'p1', sort_order: 1 } as any,
        { id: 'm0', project_id: 'p1', sort_order: 0 } as any,
      ],
    };

    expect(attachManifestMedia(manifest).projects).toEqual([
      expect.objectContaining({ id: 'p1', media: [expect.objectContaining({ id: 'm0' }), expect.objectContaining({ id: 'm1' })] }),
      expect.objectContaining({ id: 'p2', media: [expect.objectContaining({ id: 'm2' })] }),
    ]);
  });
});
