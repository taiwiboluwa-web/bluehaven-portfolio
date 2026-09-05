import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

 test('project logo slot preserves the uploaded logo aspect ratio', () => {
  const rule = html.match(/\.bluehaven-cms-project-logo\{([^}]*)\}/)?.[1] || '';
  assert.match(rule, /object-fit:contain/);
  assert.match(rule, /max-width:/);
  assert.match(rule, /max-height:/);
  assert.match(rule, /aspect-ratio:1/);
});
