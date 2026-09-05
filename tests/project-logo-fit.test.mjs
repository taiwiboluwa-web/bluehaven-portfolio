import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync(new URL('../public/cms-smart-media.js', import.meta.url), 'utf8');

test('project logo slot preserves uploaded logo aspect ratio', () => {
  assert.match(script, /bluehaven-cms-project-logo/);
  assert.match(script, /object-fit:\s*contain/);
  assert.match(script, /max-width:\s*132px/);
  assert.match(script, /max-height:\s*132px/);
  assert.match(script, /aspect-ratio:\s*1\s*\/\s*1/);
});
