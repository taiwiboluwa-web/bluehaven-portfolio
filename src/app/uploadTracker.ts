export type UploadStatus = 'optimizing' | 'uploading' | 'verifying' | 'saving' | 'complete' | 'failed' | 'cancelled' | 'retrying';

export type UploadItem = {
  id: string;
  fileName: string;
  projectName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
};

export type UploadTrackerState = { items: UploadItem[] };

export const initialUploadState: UploadTrackerState = { items: [] };

type Action =
  | { type: 'start'; item: UploadItem }
  | { type: 'progress'; id: string; progress: number }
  | { type: 'stage'; id: string; status: Extract<UploadStatus, 'verifying' | 'saving'> }
  | { type: 'complete'; id: string }
  | { type: 'failed'; id: string; error: string }
  | { type: 'cancelled'; id: string }
  | { type: 'retry'; id: string }
  | { type: 'remove'; id: string };

export function uploadTrackerReducer(state: UploadTrackerState, action: Action): UploadTrackerState {
  if (action.type === 'start') {
    return { items: [...state.items.filter((item) => item.id !== action.item.id), action.item] };
  }

  return {
    items: state.items
      .map((item) => {
        if (item.id !== action.id) return item;
        switch (action.type) {
          case 'progress':
            return { ...item, status: 'uploading', progress: Math.max(0, Math.min(100, action.progress)), error: undefined };
          case 'stage':
            return { ...item, status: action.status };
          case 'complete':
            return { ...item, status: 'complete', progress: 100, error: undefined };
          case 'failed':
            return { ...item, status: 'failed', error: action.error };
          case 'cancelled':
            return { ...item, status: 'cancelled', error: 'Upload cancelled' };
          case 'retry':
            return { ...item, status: 'retrying', progress: 0, error: undefined };
          default:
            return item;
        }
      })
      .filter((item) => action.type === 'remove' ? item.id !== action.id : true),
  };
}
