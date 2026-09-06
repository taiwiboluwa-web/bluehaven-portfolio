import { describe, expect, it } from 'vitest';
import { BUDDY_ANIMATIONS, BUDDIES, normalizeBuddyId } from './buddyConfig';

describe('buddy configuration', () => {
  it('allows exactly the two supported skins and defaults unknown values to bubbles', () => {
    expect(Object.keys(BUDDIES)).toEqual(['bubbles', 'skales']);
    expect(normalizeBuddyId('bubbles')).toBe('bubbles');
    expect(normalizeBuddyId('skales')).toBe('skales');
    expect(normalizeBuddyId('anything-else')).toBe('bubbles');
    expect(normalizeBuddyId(null)).toBe('bubbles');
  });

  it('uses the canonical 8x9 Petdex frame grid and animation rows', () => {
    expect(BUDDY_ANIMATIONS.idle).toEqual({ row: 0, frames: 6, duration: 1100 });
    expect(BUDDY_ANIMATIONS.waving).toEqual({ row: 3, frames: 4, duration: 700 });
    expect(BUDDY_ANIMATIONS.jumping).toEqual({ row: 4, frames: 5, duration: 840 });
    expect(BUDDY_ANIMATIONS.review).toEqual({ row: 8, frames: 6, duration: 1030 });
  });
});
