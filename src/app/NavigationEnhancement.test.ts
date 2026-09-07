import { describe, expect, it } from 'vitest';
import { getNavigationHref } from './NavigationEnhancement';

describe('getNavigationHref', () => {
  it('maps section labels to the real section routes', () => {
    expect(getNavigationHref('Portfolio')).toBe('/portfolio');
    expect(getNavigationHref('Process')).toBe('/process');
    expect(getNavigationHref('Inquire')).toBe('/inquire');
    expect(getNavigationHref('Services')).toBe('/services');
  });

  it('returns null for non-section header controls', () => {
    expect(getNavigationHref('Home')).toBeNull();
    expect(getNavigationHref('Stories')).toBeNull();
  });
});
