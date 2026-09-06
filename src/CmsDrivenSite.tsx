import { useEffect, useMemo, useState } from 'react';
import './cms-driven-site.css';

type Media = { id: string; url: string; alt?: string; featured?: boolean; sort_order?: number };
type Project = { id: string; name: string; slug?: string; category?: string; description?: string; website_url?: string; media?: Media[]; gallery_layout?: { type?: string; columns?: number; gap?: string; aspectRatio?: string; featured?: string } };
type Cms = { projects?: Project[]; settings?: Record<string, any>; sections?: any[] };

const services = [
  ['01', 'Brand Identity', 'Visual systems, campaigns and identities that make brands instantly recognisable.'],
  ['02', 'Digital Experiences', 'Websites and interfaces built to feel considered, fast and unmistakably yours.'],
  ['03', 'Content & Motion', 'Photography, video, motion graphics and social content engineered for attention.'],
  ['04', 'Creative Strategy', 'Ideas, direction and production that turn business goals into visible creative work.'],
];

export default function CmsDrivenSite() {
  const [cms, setCms] = useState<Cms>({});
  const [active, setActive] = useState<Project | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/portfolio?_cms=${Date.now()}`, { cache: 'no-store' });
        if (r.ok) setCms(await r.json());
      } catch {}
    };
    load();
  }, []);

  const projects = useMemo(() => (cms.projects || []).filter(p => p && p.name), [cms.projects]);
  const visibleProjects = projects.filter(p => p.media?.length);

  return (
    <div className="bh-site">
      <header className="bh-nav">
        <a className="bh-mark" href="#top" aria-label="BlueHaven Studios home"><span>BLUE</span>HAVEN<span className="bh-dot">.</span></a>
        <nav className={menu ? 'bh-nav-links open' : 'bh-nav-links'}>
          <a href="#work" onClick={() => setMenu(false)}>Work</a>
          <a href="#services" onClick={() => setMenu(false)}>Services</a>
          <a href="#about" onClick={() => setMenu(false)}>About</a>
          <a href="#contact" onClick={() => setMenu(false)}>Contact</a>
        </nav>
        <a className="bh-nav-cta" href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service" target="_blank" rel="noreferrer">Start a project <span>↗</span></a>
        <button className="bh-menu" onClick={() => setMenu(!menu)} aria-label="Toggle navigation">{menu ? '×' : '☰'}</button>
      </header>

      <main id="top">
        <section className="bh-hero">
          <div className="bh-hero-orb orb-a" /><div className="bh-hero-orb orb-b" />
          <p className="bh-kicker"><i /> CREATIVE STUDIO · LAGOS, NIGERIA</p>
          <h1>We make brands<br /><em>impossible to ignore.</em></h1>
          <p className="bh-hero-copy">BlueHaven Studios creates bold identities, digital experiences and content for businesses ready to move differently.</p>
          <div className="bh-hero-actions"><a className="bh-primary" href="#work">Explore our work <span>↓</span></a><a className="bh-secondary" href="#contact">Tell us what you're building</a></div>
          <div className="bh-scroll">SCROLL TO EXPLORE <span>↓</span></div>
        </section>

        <section className="bh-intro">
          <p className="bh-kicker">01 / THE STUDIO</p>
          <div><h2>Creative work with<br /><span>commercial intent.</span></h2><p>We sit between strategy and production. That means the work looks good, moves fast and has a reason to exist.</p></div>
        </section>

        <section id="work" className="bh-work">
          <div className="bh-section-head"><div><p className="bh-kicker">02 / SELECTED WORK</p><h2>Built for the<br /><em>real world.</em></h2></div><p>{visibleProjects.length} live projects · managed from the studio CMS</p></div>
          <div className="bh-project-grid">
            {visibleProjects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} onOpen={() => setActive(project)} />)}
          </div>
          {!visibleProjects.length && <div className="bh-empty">Your CMS projects will appear here as soon as media is added.</div>}
        </section>

        <section id="services" className="bh-services">
          <div className="bh-section-head"><div><p className="bh-kicker">03 / WHAT WE DO</p><h2>Small studio.<br /><em>Big output.</em></h2></div></div>
          <div className="bh-service-list">{services.map(([n, title, copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><b>↗</b></article>)}</div>
        </section>

        <section id="about" className="bh-manifesto"><p className="bh-kicker">04 / OUR APPROACH</p><h2>No templates.<br /><em>No filler.</em><br />Just good work.</h2><p>Every project gets its own visual language. We obsess over the details people notice before they know why they noticed them.</p></section>

        <section id="contact" className="bh-contact"><div><p className="bh-kicker">05 / LET'S MAKE SOMETHING</p><h2>Have a good<br /><em>problem?</em></h2></div><div className="bh-contact-side"><p>Tell us what you're trying to build, fix or make impossible to ignore.</p><a href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service" target="_blank" rel="noreferrer">Start the conversation <span>↗</span></a><small>Lagos · Nigeria</small></div></section>
      </main>

      <footer className="bh-footer"><div className="bh-mark"><span>BLUE</span>HAVEN<span className="bh-dot">.</span></div><p>Creating beyond limits.</p><a href="/admin">Admin</a><small>© {new Date().getFullYear()} BlueHaven Studios. All rights reserved.</small></footer>

      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const media = project.media || [];
  const featured = media.find(m => m.featured) || media[0];
  const count = Math.min(media.length, 5);
  return <button className={`bh-project project-${index % 5}`} onClick={onOpen} aria-label={`Open ${project.name}`}>
    <div className="bh-project-image">{featured?.url && <img src={featured.url} alt={featured.alt || project.name} loading={index < 2 ? 'eager' : 'lazy'} />}{media.length > 1 && <span className="bh-count">+{count}</span>}</div>
    <div className="bh-project-meta"><div><span>{project.category || 'Creative project'}</span><h3>{project.name}</h3></div><b>↗</b></div>
  </button>;
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const media = project.media || [];
  return <div className="bh-modal" role="dialog" aria-modal="true" onClick={onClose}><div className="bh-modal-inner" onClick={e => e.stopPropagation()}><button className="bh-close" onClick={onClose}>×</button><div className="bh-modal-head"><p className="bh-kicker">PROJECT</p><h2>{project.name}</h2>{project.description && <p>{project.description}</p>}{project.website_url && <a href={project.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>}</div><div className="bh-modal-grid">{media.map(m => <img key={m.id} src={m.url} alt={m.alt || project.name} loading="lazy" />)}</div></div></div>;
}
