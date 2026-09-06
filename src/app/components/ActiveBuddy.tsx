import { useEffect, useMemo, useState } from 'react';
import {
  BUDDY_ANIMATIONS,
  BUDDY_FRAME_HEIGHT,
  BUDDY_FRAME_WIDTH,
  BUDDIES,
  BuddyAnimation,
  BuddyId,
  normalizeBuddyId,
} from './buddyConfig';
import './ActiveBuddy.css';

type Props = {
  className?: string;
  size?: number;
  visible?: boolean;
};

const ACTIONS: BuddyAnimation[] = ['waving', 'jumping', 'running', 'review', 'waiting'];

export function ActiveBuddy({ className = '', size = 150, visible = true }: Props) {
  const [active, setActive] = useState<BuddyId>('bubbles');
  const [animation, setAnimation] = useState<BuddyAnimation>('idle');
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/buddy', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setActive(normalizeBuddyId(data.active_buddy));
      } catch {
        // Bubbles remains the safe local default when the settings API is unavailable.
      }
    };
    load();
    const refresh = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    setFrame(0);
    setAnimation('idle');
  }, [active]);

  useEffect(() => {
    const definition = BUDDY_ANIMATIONS[animation];
    const frameDuration = Math.max(45, Math.round(definition.duration / definition.frames));
    const timer = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1;
        if (next < definition.frames) return next;
        if (animation !== 'idle') window.setTimeout(() => setAnimation('idle'), 0);
        return 0;
      });
    }, frameDuration);
    return () => window.clearInterval(timer);
  }, [animation]);

  useEffect(() => {
    if (animation !== 'idle') return;
    const delay = 7000 + Math.random() * 9000;
    const timer = window.setTimeout(() => {
      const next = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      setFrame(0);
      setAnimation(next);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [animation]);

  const backgroundPosition = useMemo(() => {
    const row = BUDDY_ANIMATIONS[animation].row;
    return `-${frame * BUDDY_FRAME_WIDTH}px -${row * BUDDY_FRAME_HEIGHT}px`;
  }, [animation, frame]);

  if (!visible) return null;

  const folder = BUDDIES[active].folder;
  const scale = size / BUDDY_FRAME_WIDTH;
  const sheetWidth = BUDDY_FRAME_WIDTH * 8;
  const sheetHeight = BUDDY_FRAME_HEIGHT * 9;

  return (
    <div
      className={`active-buddy ${className}`}
      aria-hidden="true"
      data-buddy={active}
      data-animation={animation}
      style={{ width: size, height: BUDDY_FRAME_HEIGHT * scale }}
    >
      <div
        className="active-buddy__sprite"
        style={{
          width: BUDDY_FRAME_WIDTH,
          height: BUDDY_FRAME_HEIGHT,
          backgroundImage: `url(/buddy/${folder}/spritesheet.png)`,
          backgroundPosition,
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

export default ActiveBuddy;
