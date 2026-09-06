export type BuddyId = 'bubbles' | 'skales';

export type BuddyAnimation =
  | 'idle'
  | 'running-right'
  | 'running-left'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'running'
  | 'review';

export type BuddyAnimationDefinition = {
  row: number;
  frames: number;
  duration: number;
};

export const BUDDY_FRAME_WIDTH = 192;
export const BUDDY_FRAME_HEIGHT = 208;
export const BUDDY_COLUMNS = 8;
export const BUDDY_ROWS = 9;

export const BUDDY_ANIMATIONS: Record<BuddyAnimation, BuddyAnimationDefinition> = {
  idle: { row: 0, frames: 6, duration: 1100 },
  'running-right': { row: 1, frames: 8, duration: 1060 },
  'running-left': { row: 2, frames: 8, duration: 1060 },
  waving: { row: 3, frames: 4, duration: 700 },
  jumping: { row: 4, frames: 5, duration: 840 },
  failed: { row: 5, frames: 8, duration: 1220 },
  waiting: { row: 6, frames: 6, duration: 1010 },
  running: { row: 7, frames: 6, duration: 820 },
  review: { row: 8, frames: 6, duration: 1030 },
};

export const BUDDIES: Record<BuddyId, { name: string; folder: string }> = {
  bubbles: { name: 'Bubbles', folder: 'bubbles-pixel' },
  skales: { name: 'Skales', folder: 'skales-pixel' },
};

export function normalizeBuddyId(value: unknown): BuddyId {
  return value === 'skales' ? 'skales' : 'bubbles';
}
