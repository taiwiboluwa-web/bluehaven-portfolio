import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const admin = fs.readFileSync(new URL('../public/admin.js', import.meta.url), 'utf8');
const layout = fs.readFileSync(new URL('../public/admin-layout.js', import.meta.url), 'utf8');


test('sections and layout admin view is explicitly locked read-only', () => {
  assert.match(admin, /Sections & layout/);
  assert.match(admin, /section-card--locked/);
  assert.match(admin, /disabled[^>]*class=\\?"section-visible/);
  assert.match(admin, /data-section-locked/);
  assert.match(layout, /data-section-locked/);
});

test('admin media form supports adding a public image URL', () => {
  assert.match(admin, /Image URL/);
  assert.match(admin, /type=\\?"url\\?"/);
  assert.match(admin, /saveMedia/);
});

test('backend rejects section mutations while sections are locked', () => {
  const api = fs.readFileSync(new URL('../api/admin.js', import.meta.url), 'utf8');
  assert.match(api, /Sections & Layout is locked/);
  assert.match(api, /data\.action==='saveSection'/);
  assert.match(api, /data\.action==='reorderSections'/);
});
