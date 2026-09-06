import { describe, expect, it } from 'vitest';
import { getBuddyMessage, getBuddyPalette } from './SiteEnhancements';

describe('BlueHaven desktop buddy', () => {
  it('keeps the companion in the corner-safe visual system', () => {
    const palette = getBuddyPalette(0);
    expect(palette).toEqual({ body: '#7f56d6', accent: '#ffde59', eye: '#111111' });
  });

  it('cycles through friendly companion messages without requiring an AI backend', () => {
    expect(getBuddyMessage(0)).toBe('Need a little creative chaos? 👀');
    expect(getBuddyMessage(3)).toBe('Need a little creative chaos? 👀');
  });
});
