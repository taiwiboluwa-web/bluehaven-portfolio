import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProject, projectIsVisible } from '../public/cms-visibility.mjs';

test('normalizes visible projects and hides false visibility', () => {
  assert.equal(projectIsVisible({ visible: true }), true);
  assert.equal(projectIsVisible({ visible: false }), false);
  assert.equal(normalizeProject({ name: ' Test ', visible: 1 }).name, 'Test');
});

test('treats only explicit published values as visible', () => {
  assert.equal(projectIsVisible({ visible: 'true' }), true);
  assert.equal(projectIsVisible({ visible: 1 }), true);
  assert.equal(projectIsVisible({ visible: 0 }), false);
  assert.equal(projectIsVisible({ visible: undefined }), false);
});
