import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_BYTES, safeSlug, validateUpload } from '../src/lib/adminValidation';

describe('admin validation', () => {
  it('creates a stable slug from a project title', () => {
    expect(safeSlug('  My New Graphic / 2026  ')).toBe('my-new-graphic-2026');
  });

  it('rejects unsupported image types', () => {
    expect(validateUpload('application/pdf', 100)).toBe('Unsupported image type');
  });

  it('rejects images larger than the upload limit', () => {
    expect(validateUpload('image/png', MAX_UPLOAD_BYTES + 1)).toBe('Image must be 3MB or smaller');
  });
});
