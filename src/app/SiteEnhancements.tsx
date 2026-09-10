import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Grid2X2, List } from 'lucide-react';
import { selectProjectById } from '../lib/portfolioSelection';
import './SiteEnhancements.css';

type Layout = 'portrait' | 'landscape' | 'square';
type ViewMode = 'grid' | 'list';
type Media = {
  id: string;
  storage_url: string;
  alt_text?: string | null;
  file_name?: string | null;
  sort_order?: number;
  featured?: boolean | null;
};
type Project = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  gallery_layout?: Layout;
  media: Media[];
  featured?: boolean | null;
};

function layoutClass(layout?: Layout) {
  if (layout === 'portrait') return 'aspect-[3/4]';
  if (layout === 'square') return 'aspect-square';
  return 'aspect-video';
}

function orderedMedia(project: Project) {
  return [...(project.media || [])].sort(
    (a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
  );
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'BH'
  );
}

function ProjectGallery({ project, onClose }: { project: Project; onClose: () => void }) {
  const images = orderedMedia(project);
  const [index, setIndex] = useState(0);
  const current = images[index];

  useEffect(() => {
    setIndex(0);
  }, [project.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) {
        setIndex((value) => (value - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight' && images.length > 1) {
        setIndex((value) => (value + 1) % images.length);
      }
    };

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [images.length, onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} gallery`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-white/45">
              {project.category || 'Creative Work'}
            </p>
            <h3 className="truncate text-lg font-bold text-white md:text-2xl">{project.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close gallery"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-5 md:px-16">
          {current ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id}
                  src={current.storage_url}
                  alt={current.alt_text || project.name}
                  className="max-h-full max-w-full object-contain"
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
                    className="absolute left-3 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-white/10 md:left-7"
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex((value) => (value + 1) % images.length)}
                    className="absolute right-3 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-white/10 md:right-7"
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/35 px-4 py-3 backdrop-blur md:px-8">
                <div className="mb-3 flex items-center justify-between text-xs text-white/45">
                  <span>{index + 1} / {images.length}</span>
                  <span className="hidden md:inline">Use ← → to browse · Esc to close</span>
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((image, imageIndex) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setIndex(imageIndex)}
                        className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition md:h-16 md:w-24 ${
                          imageIndex === index
                            ? 'border-white'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`Open image ${imageIndex + 1}`}
                      >
                        <img
                          src={image.storage_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl px-6 text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-[2rem] border border-white/10 bg-white/[.04] text-4xl font-black text-[#ffde59]">
                {initials(project.name)}
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[.25em] text-[#ffde59]">
                {project.category || 'Creative Work'}
              </p>
              <h3 className="mt-3 text-3xl font-black text-white md:text-5xl">{project.name}</h3>
              <p className="mt-4 text-sm leading-7 text-white/55">
                {project.description || 'This project has been published, but no media has been added yet.'}
              </p>
              <p className="mt-7 text-xs uppercase tracking-[.18em] text-white/30">No project images yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function WorkCard({
  project,
  onOpen,
  list = false,
}: {
  project: Project;
  onOpen: () => void;
  list?: boolean;
}) {
  const image = orderedMedia(project)[0];
  const fallback = (
    <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(127,86,214,.38),transparent_58%),linear-gradient(135deg,#17131f,#0d0d10)]">
      <div className="text-center">
        <div className="text-4xl font-black tracking-tight text-[#ffde59]">{initials(project.name)}</div>
        <div className="mt-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/30">BlueHaven Studios</div>
      </div>
    </div>
  );

  if (list) {
    return (
      <motion.button
        key={project.id}
        type="button"
        onClick={onOpen}
        className="work-list-item group w-full text-left"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="work-list-image">
          {image ? (
            <img src={image.storage_url} alt={image.alt_text || project.name} loading="lazy" decoding="async" />
          ) : fallback}
        </div>
        <div className="work-list-copy">
          <div className="work-list-meta">
            <span>{project.category || 'Creative Work'}</span>
            {project.featured && <b>Featured</b>}
          </div>
          <h3>{project.name}</h3>
          {project.description && <p>{project.description}</p>}
          <span className="work-list-action">{image ? 'Open project gallery →' : 'Open project →'}</span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      key={project.id}
      type="button"
      onClick={onOpen}
      className="work-grid-card group overflow-hidden text-left"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className={`${layoutClass(project.gallery_layout)} work-grid-image`}>
        {image ? (
          <img src={image.storage_url} alt={image.alt_text || project.name} loading="lazy" decoding="async" />
        ) : fallback}
      </div>
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/40">{project.category || 'Creative Work'}</p>
          {project.featured && <span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#ffde59]">Featured</span>}
        </div>
        <h3 className="text-xl font-bold text-white">{project.name}</h3>
        {project.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">{project.description}</p>}
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.2em] text-white/45 transition group-hover:text-white">
          {image ? 'Open project gallery →' : 'Open project →'}
        </p>
      </div>
    </motion.button>
  );
}

function RecentWork() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('bluehaven-work-view');
    return saved === 'list' ? 'list' : 'grid';
  });
  const isFullWork = window.location.pathname === '/work' || window.location.pathname === '/work/';
  const selectedProject = useMemo(
    () => selectProjectById(projects, selectedProjectId),
    [projects, selectedProjectId],
  );

  useEffect(() => {
    const process = document.getElementById('process');
    const processLayer = process?.parentElement;
    const footer = document.querySelector('footer');
    const node = document.createElement('section');
    node.id = 'bluehaven-managed-work';
    node.className = 'relative z-10';

    if (processLayer?.parentElement) {
      processLayer.parentElement.insertBefore(node, processLayer.nextSibling);
    } else {
      (footer?.parentElement || document.body).insertBefore(node, footer || null);
    }
    setHost(node);

    const load = () =>
      fetch('/api/portfolio?mode=public', { cache: 'no-store' })
        .then((response) =>
          response.ok ? response.json() : Promise.reject(new Error('Portfolio request failed')),
        )
        .then((data) => setProjects(Array.isArray(data.projects) ? data.projects : []))
        .catch(() => {});

    load();
    const timer = window.setInterval(load, 10000);
    window.addEventListener('focus', load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
      node.remove();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bluehaven-work-view', view);
  }, [view]);

  useEffect(() => {
    if (selectedProjectId && !selectedProject) setSelectedProjectId(null);
  }, [selectedProject, selectedProjectId]);

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(projects.map((project) => project.category?.trim()).filter(Boolean) as string[]),
      ),
    ],
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const ordered = [...projects].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
    const filtered =
      filter === 'All'
        ? ordered
        : ordered.filter((project) => (project.category || 'Creative Work') === filter);
    return isFullWork ? filtered : filtered.slice(0, 9);
  }, [filter, isFullWork, projects]);

  if (!host || !projects.length) return null;

  return (
    <>
      {createPortal(
        <section data-bluehaven-work-grid aria-labelledby="bluehaven-work-heading" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24">
          <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.25em] text-[#ffde59]">
                {isFullWork ? 'BlueHaven portfolio' : 'Selected work'}
              </p>
              <h2 id="bluehaven-work-heading" className="text-4xl font-black tracking-tight text-white md:text-6xl">
                {isFullWork ? 'All Work' : 'Selected Work'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 md:text-base">
                {isFullWork
                  ? 'Browse the complete collection of work currently published through the BlueHaven portfolio.'
                  : 'A focused selection of work from the BlueHaven portfolio.'}
              </p>
            </div>
            {!isFullWork && (
              <a href="/work" className="inline-flex w-fit items-center rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[.16em] text-white transition hover:border-white/40 hover:bg-white/5">
                View All Work
              </a>
            )}
          </div>

          {isFullWork && (
            <div className="work-toolbar">
              <div className="work-filters" aria-label="Portfolio categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilter(category)}
                    aria-pressed={filter === category}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] transition ${
                      filter === category
                        ? 'border-[#ffde59] bg-[#ffde59] text-black'
                        : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="work-view-toggle" role="group" aria-label="Work view">
                <button type="button" className={view === 'grid' ? 'active' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                  <Grid2X2 size={16} /> Grid
                </button>
                <button type="button" className={view === 'list' ? 'active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                  <List size={16} /> List
                </button>
              </div>
            </div>
          )}

          <div className={view === 'grid' ? 'work-grid' : 'work-list'}>
            {visibleProjects.map((project) => (
              <WorkCard
                key={project.id}
                project={project}
                onOpen={() => setSelectedProjectId(project.id)}
                list={view === 'list'}
              />
            ))}
          </div>

          {isFullWork && !visibleProjects.length && (
            <p className="py-12 text-center text-sm text-white/40">No published work matches this category.</p>
          )}
        </section>,
        host,
      )}

      {selectedProject && (
        <ProjectGallery
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </>
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
    </>
  );
}
