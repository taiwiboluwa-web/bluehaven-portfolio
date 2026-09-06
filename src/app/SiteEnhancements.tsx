import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import './SiteEnhancements.css';

type Project = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  media: Array<{ id: string; storage_url: string; alt_text?: string | null }>;
};

const palettes = [
  { body: '#7f56d6', accent: '#ffde59', eye: '#111111' },
  { body: '#5d7cff', accent: '#ffde59', eye: '#111111' },
  { body: '#ff5c8a', accent: '#7f56d6', eye: '#111111' },
  { body: '#16b88b', accent: '#ffde59', eye: '#111111' },
];

const buddyMessages = [
  'Need a little creative chaos? 👀',
  'I found something interesting on this page.',
  'BlueHaven mode: ON.',
  'Tap me. I promise I’m not judging your design.',
];

export function getBuddyPalette(index: number) {
  return palettes[Math.abs(index) % palettes.length];
}

export function getBuddyMessage(index: number) {
  return buddyMessages[Math.abs(index) % buddyMessages.length];
}

function PixelBuddy({ palette }: { palette: ReturnType<typeof getBuddyPalette> }) {
  const style = {
    '--buddy-body': palette.body,
    '--buddy-accent': palette.accent,
    '--buddy-eye': palette.eye,
  } as CSSProperties;

  return (
    <div className="buddy-sprite" style={style} aria-hidden="true">
      <span className="buddy-shadow" />
      <span className="buddy-tail" />
      <span className="buddy-body" />
      <span className="buddy-head" />
      <span className="buddy-eye buddy-eye-left" />
      <span className="buddy-eye buddy-eye-right" />
      <span className="buddy-eye-glint buddy-glint-left" />
      <span className="buddy-eye-glint buddy-glint-right" />
      <span className="buddy-leg buddy-leg-left" />
      <span className="buddy-leg buddy-leg-right" />
      <span className="buddy-foot buddy-foot-left" />
      <span className="buddy-foot buddy-foot-right" />
      <span className="buddy-cheek buddy-cheek-left" />
      <span className="buddy-cheek buddy-cheek-right" />
    </div>
  );
}

function Skales() {
  const [disabled, setDisabled] = useState(() => localStorage.getItem('bluehaven-skales-disabled') === '1');
  const [reduced, setReduced] = useState(false);
  const [open, setOpen] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (disabled || reduced) return;
    const timer = window.setInterval(() => {
      setMessageIndex((value) => value + 1);
      setPaletteIndex((value) => value + 1);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [disabled, reduced]);

  if (disabled) return null;

  const palette = getBuddyPalette(paletteIndex);
  const message = getBuddyMessage(messageIndex);

  return (
    <div className="bluehaven-buddy-root" aria-label="BlueHaven creative companion">
      <motion.div
        className="buddy-stage"
        initial={reduced ? false : { opacity: 0, y: 18, scale: 0.82 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {open && (
          <motion.div
            className="buddy-bubble"
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28 }}
          >
            <div className="buddy-bubble-top">
              <span className="buddy-status-dot" />
              <strong>Skales</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Minimize Skales">
                ×
              </button>
            </div>
            <p>{message}</p>
            <div className="buddy-actions">
              <button type="button" onClick={() => setMessageIndex((value) => value + 1)}>
                Surprise me
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                Later
              </button>
            </div>
          </motion.div>
        )}

        <motion.button
          type="button"
          className="buddy-button"
          onClick={() => {
            setOpen((value) => !value);
            setMessageIndex((value) => value + 1);
          }}
          aria-label={open ? 'Minimize Skales' : 'Open Skales'}
          animate={reduced ? undefined : { y: [0, -5, 0], rotate: [-1, 1, -1] }}
          transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelBuddy palette={palette} />
        </motion.button>

        <button
          type="button"
          className="buddy-hide"
          onClick={() => {
            localStorage.setItem('bluehaven-skales-disabled', '1');
            setDisabled(true);
          }}
        >
          Hide buddy
        </button>
      </motion.div>
    </div>
  );
}

function RecentWork() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const node = document.createElement('section');
    node.id = 'bluehaven-managed-work';
    node.className = 'relative z-10';
    (footer?.parentElement || document.body).insertBefore(node, footer || null);
    setHost(node);
    fetch('/api/portfolio?mode=public')
      .then((response) => response.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => {});
    return () => node.remove();
  }, []);

  if (!host || !projects.length) return null;

  return createPortal(
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-10">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.25em] text-white/45">Latest</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">Recent Work</h2>
        </div>
        <span className="hidden text-xs uppercase tracking-[.2em] text-white/35 md:block">Live from BlueHaven CMS</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const image = project.media?.[0];
          return (
            <article key={project.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-white/20">
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                {image ? (
                  <img src={image.storage_url} alt={image.alt_text || project.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="grid h-full place-items-center text-white/20">BlueHaven Studios</div>
                )}
              </div>
              <div className="p-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/40">{project.category || 'Creative Work'}</p>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                {project.description && <p className="mt-2 text-sm leading-6 text-white/55">{project.description}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>,
    host,
  );
}

function AdminFooterLink() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      const anchor = Array.from(footer.querySelectorAll('a')).find((item) => /privacy|terms|status/i.test(item.textContent || ''));
      const parent = anchor?.parentElement || footer;
      const node = document.createElement('span');
      node.className = 'ml-3 inline-flex';
      parent.appendChild(node);
      setHost(node);
      window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  return host
    ? createPortal(
        <a href="/admin" className="text-inherit opacity-70 transition hover:opacity-100 hover:text-white" title="BlueHaven Admin">
          Admin
        </a>,
        host,
      )
    : null;
}

export default function SiteEnhancements() {
  return (
    <>
      <RecentWork />
      <AdminFooterLink />
      <Skales />
    </>
  );
}
