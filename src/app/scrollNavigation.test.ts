import { describe, expect, it, vi } from 'vitest';
import { scrollToSection } from './scrollNavigation';

describe('scrollToSection', () => {
  it('scrolls to the target section with the sticky header offset', () => {
    const target = document.createElement('section');
    target.id = 'process';
    target.getBoundingClientRect = () => ({
      top: 900,
      left: 0,
      right: 0,
      bottom: 1000,
      width: 100,
      height: 100,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    });
    document.body.appendChild(target);

    const header = document.createElement('header');
    header.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      right: 100,
      bottom: 80,
      width: 100,
      height: 80,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(header);

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    expect(scrollToSection('process')).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 924,
      behavior: 'smooth',
    });
  });

  it('returns false when the section does not exist', () => {
    expect(scrollToSection('missing-section')).toBe(false);
  });
});
