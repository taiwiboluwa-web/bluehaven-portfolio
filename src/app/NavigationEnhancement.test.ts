import { describe, expect, it } from 'vitest';
import { getNavigationHref } from './NavigationEnhancement';

describe('getNavigationHref', () => {
  it('maps header labels to their real routes', () => {
    expect(getNavigationHref('Home')).toBe('/');
    expect(getNavigationHref('Portfolio')).toBe('/portfolio');
    expect(getNavigationHref('Process')).toBe('/process');
    expect(getNavigationHref('Inquire')).toBe('/inquire');
    expect(getNavigationHref('Services')).toBe('/services');
  });

  it('keeps Stories as a separately injected navigation link', () => {
    expect(getNavigationHref('Stories')).toBeNull();
  });
});
