import { describe, expect, it } from 'vitest';
import { initialUploadState, uploadTrackerReducer } from './uploadTracker';

describe('uploadTrackerReducer', () => {
  it('moves an upload through progress and completion states', () => {
    let state = uploadTrackerReducer(initialUploadState, {
      type: 'start',
      item: { id: 'u1', fileName: 'poster.jpg', projectName: 'Poster', status: 'optimizing', progress: 0 },
    });

    state = uploadTrackerReducer(state, { type: 'progress', id: 'u1', progress: 42 });
    expect(state.items[0]).toMatchObject({ status: 'uploading', progress: 42 });

    state = uploadTrackerReducer(state, { type: 'complete', id: 'u1' });
    expect(state.items[0]).toMatchObject({ status: 'complete', progress: 100 });
  });

  it('keeps failed uploads available for retry', () => {
    let state = uploadTrackerReducer(initialUploadState, {
      type: 'start',
      item: { id: 'u2', fileName: 'cover.png', projectName: 'Cover', status: 'uploading', progress: 10 },
    });

    state = uploadTrackerReducer(state, { type: 'failed', id: 'u2', error: 'Network error' });
    expect(state.items[0]).toMatchObject({ status: 'failed', error: 'Network error' });

    state = uploadTrackerReducer(state, { type: 'retry', id: 'u2' });
    expect(state.items[0]).toMatchObject({ status: 'retrying', progress: 0, error: undefined });
  });
});
