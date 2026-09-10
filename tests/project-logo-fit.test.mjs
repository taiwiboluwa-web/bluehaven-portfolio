import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const smartMedia = fs.readFileSync(new URL('../public/cms-smart-media.js', import.meta.url), 'utf8');
const uploader = fs.readFileSync(new URL('../public/admin-upload.js', import.meta.url), 'utf8');

test('project logo slot preserves uploaded logo aspect ratio', () => {
  assert.match(smartMedia, /bluehaven-cms-project-logo/);
  assert.match(smartMedia, /object-fit:\s*contain/);
  assert.match(smartMedia, /max-width:\s*132px/);
  assert.match(smartMedia, /max-height:\s*132px/);
  assert.match(smartMedia, /aspect-ratio:\s*1\s*\/\s*1/);
});

test('project logo upload preserves transparency instead of forcing JPEG', () => {
  assert.match(uploader, /preserveAlpha/);
  assert.match(uploader, /optimize\(file, 900, true\)/);
});
