import { describe, expect, it } from 'vitest';
import { buildPortfolioItems } from './portfolioData';

describe('buildPortfolioItems', () => {
  it('keeps an admin-created project visible even when it has no uploaded media yet', () => {
    const items = buildPortfolioItems([
      { id: 'new-project', name: 'New Project', category: 'Graphic Design', description: 'Fresh work', media: [] },
    ], []);

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('New Project');
    expect(items[0].image).toBeNull();
  });

  it('uses an uploaded project image before a legacy fallback image', () => {
    const items = buildPortfolioItems([
      {
        id: 'kefas',
        name: 'Kefas Food',
        media: [{ id: 'media-1', storage_url: '/api/media?id=media-1', sort_order: 0, featured: true }],
      },
    ], [
      { title: 'Kefas Food', image: '/legacy-kefas.png', subtitle: 'Legacy' },
    ]);

    expect(items[0].image).toBe('/api/media?id=media-1');
  });
});
