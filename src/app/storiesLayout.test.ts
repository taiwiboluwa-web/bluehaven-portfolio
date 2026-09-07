import { describe, expect, it } from 'vitest';
import { getStoryGridClass, storiesClasses } from './storiesLayout';

describe('native BlueHaven Stories layout', () => {
  it('uses the same editorial shell language as the main site', () => {
    expect(storiesClasses.page).toContain('bg-[#0f0f0f]');
    expect(storiesClasses.container).toContain('md:px-[10%]');
    expect(storiesClasses.eyebrow).toContain('#ffde59');
  });

  it('gives the featured story the wide lead treatment', () => {
    expect(getStoryGridClass(0)).toContain('md:col-span-2');
    expect(getStoryGridClass(1)).not.toContain('md:col-span-2');
  });
});
