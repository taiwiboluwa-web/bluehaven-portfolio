import { describe, expect, it } from 'vitest';
import { shouldPollAdmin } from './adminSync';

describe('shouldPollAdmin', () => {
  it('allows background sync when the admin is idle', () => {
    expect(shouldPollAdmin({ busy: false, expanded: null })).toBe(true);
  });

  it('does not overwrite active admin work while saving or editing', () => {
    expect(shouldPollAdmin({ busy: true, expanded: null })).toBe(false);
    expect(shouldPollAdmin({ busy: false, expanded: 'project-1' })).toBe(false);
  });
});
