import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCmsConfig } from '../app/cms/config.js';

test('normalizes sections into stable visible order and safe layout defaults', () => {
  const result = normalizeCmsConfig({ sections: [
    { section_key: 'portfolio', label: 'Portfolio', visible: true, sort_order: 50, layout: { columns: 4 } },
    { section_key: 'hero', label: 'Hero', visible: false, sort_order: 10, layout: null },
  ] });
  assert.deepEqual(result.sections.map(s => s.sectionKey), ['hero', 'portfolio']);
  assert.equal(result.sections[0].visible, false);
  assert.equal(result.sections[1].layout.columns, 4);
  assert.equal(result.sections[1].layout.width, 'wide');
});
