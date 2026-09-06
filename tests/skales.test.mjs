import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const skales = fs.readFileSync(new URL('../src/bluehaven-ai.ts', import.meta.url), 'utf8');

test('Skales is a visible chameleon palette widget', () => {
  assert.match(skales, /Skales the Chameleon AI/);
  assert.match(skales, /skales-orb/);
  assert.match(skales, /skales-palette/);
  assert.match(skales, /Remix the site/);
});

test('Skales applies palette changes to the website', () => {
  assert.match(skales, /--skales-a/);
  assert.match(skales, /--bluehaven-accent/);
  assert.match(skales, /skales-remixed/);
  assert.match(skales, /burstSparks/);
});

test('Skales supports reduced-motion users', () => {
  assert.match(skales, /prefers-reduced-motion/);
});
