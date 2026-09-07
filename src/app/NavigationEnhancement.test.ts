import { describe, expect, it } from 'vitest';
import { getNavigationHref } from './NavigationEnhancement';

describe('getNavigationHref', () => {
  it('maps every primary navigation label to its real route', () => {
    expect(getNavigationHref('Home')).toBe('/');
    expect(getNavigationHref('Stories')).toBe('/stories');
    expect(getNavigationHref('Services')).toBe('/services');
    expect(getNavigationHref('Portfolio')).toBe('/portfolio');
    expect(getNavigationHref('Process')).toBe('/process');
    expect(getNavigationHref('Inquire')).toBe('/inquire');
  });
});
