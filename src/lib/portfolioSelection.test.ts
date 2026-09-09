import { describe, expect, it } from 'vitest';
import { selectProjectById } from './portfolioSelection';

describe('selectProjectById', () => {
  it('returns the refreshed project with its current media instead of a stale object snapshot', () => {
    const projects = [
      { id: 'graphic', name: 'Graphic Design', media: [{ id: 'img-1' }] },
      { id: 'design', name: 'Design', media: [] },
    ];

    const selected = selectProjectById(projects, 'graphic');

    expect(selected).toEqual(projects[0]);
    expect(selected?.media).toHaveLength(1);
  });

  it('returns null when the selected project no longer exists', () => {
    expect(selectProjectById([{ id: 'graphic' }], 'missing')).toBeNull();
  });
});
