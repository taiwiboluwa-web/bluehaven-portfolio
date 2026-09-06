import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const admin = fs.readFileSync(new URL('../public/admin.js', import.meta.url), 'utf8');
const helper = fs.readFileSync(new URL('../public/admin-lock-url.js', import.meta.url), 'utf8');

test('sections and layout admin view is explicitly locked read-only', () => {
  assert.match(admin, /Sections & layout/);
  assert.match(helper, /section-card--locked/);
  assert.match(helper, /data-section-locked/);
  assert.match(helper, /pointer-events/);
});

test('admin media form supports adding a public image URL', () => {
  assert.match(helper, /Add image URL/);
  assert.match(helper, /saveMedia/);
  assert.match(helper, /https\\?:/);
});

test('project logo can also be set from a public URL through the project CMS', () => {
  assert.match(helper, /Use logo URL/);
  assert.match(helper, /saveLogoUrl/);
  assert.match(helper, /action:'saveProject'/);
  assert.match(helper, /logoUrl:url/);
});
