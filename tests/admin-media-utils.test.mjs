import test from 'node:test';
import assert from 'node:assert/strict';
import { inferOrientation, chooseGalleryAspect, optimizeGalleryMode } from '../public/admin-media-utils.mjs';

test('infers portrait images from dimensions', () => assert.equal(inferOrientation(800, 1200), 'portrait'));
test('infers landscape images from dimensions', () => assert.equal(inferOrientation(1600, 900), 'landscape'));
test('mixed orientations stay natural instead of being cropped', () => assert.equal(chooseGalleryAspect([{width:800,height:1200},{width:1600,height:900}]), 'natural'));
test('gallery mode preserves natural image orientation', () => assert.deepEqual(optimizeGalleryMode([{width:800,height:1200},{width:1600,height:900}]), {aspectRatio:'natural',preserveNatural:true}));
