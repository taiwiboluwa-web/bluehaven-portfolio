import { useEffect } from 'react';

const SELECTORS = [
  'main section',
  'section',
  '[data-bluehaven-world-section]',
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function setupWorld(root: HTMLElement) {
  const sections = Array.from(root.querySelectorAll<HTMLElement>(SELECTORS.join(',')))
    .filter((el, index, all) => all.indexOf(el) === index)
    .filter((el) => !el.closest('[data-bluehaven-world-ignore]'));

  sections.forEach((section, index) => {
    section.dataset.bluehavenWorldSection = '1';
    section.style.setProperty('--bh-world-index', String(index));
    section.style.setProperty('--bh-scroll-y', '0px');
    section.style.setProperty('--bh-scroll-scale', '1');
    section.style.setProperty('--bh-scroll-opacity', '1');

    section.querySelectorAll<HTMLElement>('img, video, [data-bluehaven-float]').forEach((media, mediaIndex) => {
      if (media.closest('header, footer')) return;
      media.dataset.bluehavenWorldMedia = '1';
      media.style.setProperty('--bh-media-y', '0px');
      media.style.setProperty('--bh-media-rotate', '0deg');
      media.style.setProperty('--bh-media-depth', String((mediaIndex % 3) + 1));
    });
  });

  const update = () => {
    const viewport = window.innerHeight || 1;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = center - viewport / 2;
      const normalized = clamp(distance / (viewport * 1.15), -1, 1);
      const y = normalized * -18;
      const scale = 1 - Math.min(Math.abs(normalized) * 0.018, 0.018);

      section.style.setProperty('--bh-scroll-y', `${y.toFixed(2)}px`);
      section.style.setProperty('--bh-scroll-scale', scale.toFixed(4));

      section.querySelectorAll<HTMLElement>('[data-bluehaven-world-media]').forEach((media) => {
        const mediaRect = media.getBoundingClientRect();
        const mediaCenter = mediaRect.top + mediaRect.height / 2;
        const mediaNormalized = clamp((mediaCenter - viewport / 2) / viewport, -1, 1);
        const depth = Number(media.style.getPropertyValue('--bh-media-depth')) || 1;
        const mediaY = mediaNormalized * -10 * depth;
        const rotate = mediaNormalized * 0.35 * depth;
        media.style.setProperty('--bh-media-y', `${mediaY.toFixed(2)}px`);
        media.style.setProperty('--bh-media-rotate', `${rotate.toFixed(2)}deg`);
      });
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  const observer = new MutationObserver(() => {
    const known = new Set(sections);
    root.querySelectorAll<HTMLElement>(SELECTORS.join(',')).forEach((el) => {
      if (!known.has(el)) {
        el.dataset.bluehavenWorldSection = '1';
        el.style.setProperty('--bh-scroll-y', '0px');
        el.style.setProperty('--bh-scroll-scale', '1');
        el.querySelectorAll<HTMLElement>('img, video, [data-bluehaven-float]').forEach((media) => {
          media.dataset.bluehavenWorldMedia = '1';
        });
      }
    });
    update();
  });
  observer.observe(root, { childList: true, subtree: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    observer.disconnect();
  };
}

export default function ScrollWorld() {
  useEffect(() => {
    const root = document.querySelector('[data-bluehaven-world-root]') as HTMLElement | null;
    if (!root) return;

    root.classList.add('bluehaven-scroll-world');
    return setupWorld(root);
  }, []);

  return (
    <div className="bluehaven-world-atmosphere" aria-hidden="true">
      <div className="bluehaven-world-orbit bluehaven-world-orbit-a" />
      <div className="bluehaven-world-orbit bluehaven-world-orbit-b" />
      <div className="bluehaven-world-grid" />
    </div>
  );
}
