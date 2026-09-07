import { describe, expect, it } from 'vitest';
import { getConversionHref, getNavigationHref } from './NavigationEnhancement';

describe('getNavigationHref', () => {
  it('maps every primary navigation label to its real route', () => {
    expect(getNavigationHref('Home')).toBe('/');
    expect(getNavigationHref('Stories')).toBe('/stories');
    expect(getNavigationHref('Work')).toBe('/work');
    expect(getNavigationHref('Portfolio')).toBe('/work');
    expect(getNavigationHref('Services')).toBe('/services');
    expect(getNavigationHref('Process')).toBe('/process');
    expect(getNavigationHref('About')).toBe('/about');
    expect(getNavigationHref('Inquire')).toBe('/inquire');
  });
});

describe('getConversionHref', () => {
  it('routes View Portfolio and View Work to the full Work page', () => {
    expect(getConversionHref('View Portfolio')).toBe('/work');
    expect(getConversionHref('View Work')).toBe('/work');
  });

  it('routes project-start CTAs to the existing inquiry page', () => {
    expect(getConversionHref("Let's Talk")).toBe('/inquire');
    expect(getConversionHref('Start a Project')).toBe('/inquire');
    expect(getConversionHref('Chat with us')).toBe('/inquire');
  });

  it('ignores unrelated controls', () => {
    expect(getConversionHref('See Services')).toBeNull();
  });
});
