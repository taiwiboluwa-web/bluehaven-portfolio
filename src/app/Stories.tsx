import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { getStoryGridClass, storiesClasses } from './storiesLayout';

type Story = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
};

function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
    : '';
}

function reading(value: string) {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/).filter(Boolean).length / 220));
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md md:px-[10%] md:py-5">
      <div className="flex items-center justify-between gap-6">
        <a href="/" className="text-lg font-bold uppercase tracking-wide text-white md:text-2xl">BLUEHAVEN STUDIOS</a>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ['Home', '/'],
            ['Stories', '/stories'],
            ['Services', '/services'],
            ['Portfolio', '/portfolio'],
            ['Process', '/process'],
            ['Inquire', '/inquire'],
          ].map(([label, href]) => (
            <a key={href} href={href} className={`rounded-lg px-3 py-2 text-sm uppercase tracking-wide transition-colors hover:bg-white/10 hover:text-white ${label === 'Stories' ? 'text-white' : 'text-white/60'}`}>
              {label}
            </a>
          ))}
        </nav>
        <a href="/inquire" className="hidden rounded-full border border-[#ffde59]/35 bg-[#ffde59]/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#ffde59] transition hover:bg-[#ffde59]/20 md:block">
          Start a project
        </a>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/25 px-5 py-12 md:px-[10%] md:py-16">
      <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-xl font-black uppercase tracking-tight">Bluehaven Studios</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">Creative direction, digital experiences and media built to make brands impossible to ignore.</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/35">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/60">
            <a href="/">Home</a><a href="/services">Services</a><a href="/portfolio">Portfolio</a><a href="/process">Process</a><a href="/stories" className="text-white">Stories</a>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/35">Connect</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/60">
            <a href="/inquire">Start a project</a><a href="/admin">Admin</a>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-white/10 pt-5 text-xs text-white/30">© {new Date().getFullYear()} BlueHaven Studios. All rights reserved.</div>
    </footer>
  );
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const featured = index === 0 || story.featured;
  return (
    <motion.a
      href={`/stories/${encodeURIComponent(story.slug)}`}
      className={`${getStoryGridClass(index)} group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[.035] transition-colors hover:border-white/20`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className={`${featured ? 'aspect-[16/8]' : 'aspect-[4/3]'} overflow-hidden bg-white/[.04]`}>
        {story.cover_url ? (
          <img src={story.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
        ) : (
          <div className="relative grid h-full place-items-center overflow-hidden text-white/15">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7f56d6]/20 blur-3xl" />
            <span className="text-xs font-bold uppercase tracking-[.35em]">Bluehaven</span>
          </div>
        )}
      </div>
      <div className={`${featured ? 'p-7 md:p-9' : 'p-6'}`}>
        <div className="flex items-center justify-between gap-4">
          <span className={storiesClasses.eyebrow}>{story.category || 'Journal'}</span>
          <ArrowUpRight size={17} className="text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ffde59]" />
        </div>
        <h2 className={`${featured ? 'text-3xl md:text-5xl' : 'text-2xl'} mt-4 font-black leading-[1.02] tracking-tight text-white`}>{story.title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{story.excerpt}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-[.16em] text-white/30">
          <span>{date(story.published_at || story.created_at)}</span><span>{reading(story.content)} min read</span>
        </div>
      </div>
    </motion.a>
  );
}

function Article({ story }: { story: Story }) {
  return (
    <>
      <main className={`${storiesClasses.container} py-14 md:py-24`}>
        <a href="/stories" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-white/45 transition hover:text-white"><ArrowLeft size={15} /> All stories</a>
        <article className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div>
            <p className={storiesClasses.eyebrow}>{story.category || 'Journal'}</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[.95] tracking-[-.045em] md:text-7xl">{story.title}</h1>
            <div className="mt-7 flex flex-wrap gap-5 text-xs text-white/40"><span className="inline-flex items-center gap-2"><Calendar size={14} />{date(story.published_at || story.created_at)}</span><span className="inline-flex items-center gap-2"><Clock size={14} />{reading(story.content)} min read</span></div>
            {story.cover_url && <img src={story.cover_url} alt="" className="mt-10 max-h-[680px] w-full rounded-[1.5rem] object-cover" />}
            <p className="mt-10 max-w-3xl text-xl leading-9 text-white/65 md:text-2xl">{story.excerpt}</p>
            <div className="mt-10 max-w-3xl whitespace-pre-wrap text-[16px] leading-8 text-white/75 md:text-[17px]">{story.content}</div>
          </div>
          <aside className="lg:pt-16">
            <div className="sticky top-28 border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/35">BlueHaven Stories</p>
              <p className="mt-3 text-sm leading-6 text-white/45">Notes from the people, projects and ideas behind the work.</p>
              <a href="/inquire" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#ffde59]">Work with us <ArrowUpRight size={14} /></a>
            </div>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export default function Stories() {
  const path = window.location.pathname;
  const slug = path.startsWith('/stories/') ? decodeURIComponent(path.split('/').filter(Boolean)[1] || '') : '';
  const [stories, setStories] = useState<Story[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(slug ? `/api/stories?slug=${encodeURIComponent(slug)}` : '/api/stories')
      .then((response) => response.json())
      .then((data) => {
        if (slug) setStory(data.story || null);
        else setStories(Array.isArray(data.stories) ? data.stories : []);
      })
      .catch(() => { if (slug) setStory(null); else setStories([]); })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className={storiesClasses.page} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <SiteHeader />
      {slug ? (
        loading ? <main className={`${storiesClasses.container} py-24`}><p className="text-white/40">Loading story…</p></main>
          : story ? <Article story={story} />
            : <main className={`${storiesClasses.container} py-24`}><h1 className="text-5xl font-black tracking-tight">Story not found.</h1><a className="mt-6 inline-flex items-center gap-2 text-[#ffde59]" href="/stories"><ArrowLeft size={16} /> All stories</a></main>
      ) : (
        <>
          <main className={`${storiesClasses.container} py-16 md:py-24`}>
            <div className="grid gap-10 border-b border-white/10 pb-16 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:pb-20">
              <div>
                <p className={storiesClasses.eyebrow}>BlueHaven Journal</p>
                <h1 className="mt-5 max-w-4xl text-6xl font-black leading-[.88] tracking-[-.055em] md:text-8xl">Stories from<br /><span className="text-white/30">behind the work.</span></h1>
              </div>
              <p className="max-w-xl text-base leading-7 text-white/50 lg:justify-self-end lg:text-lg">Ideas, lessons, behind-the-scenes notes and stories from the people creating what comes next at BlueHaven Studios.</p>
            </div>
            <div className="mt-12 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/35">The Journal</p><h2 className="mt-2 text-2xl font-black md:text-3xl">Latest stories</h2></div><span className="hidden text-xs uppercase tracking-[.18em] text-white/25 md:block">{stories.length ? `${stories.length} published` : 'Editorial archive'}</span></div>
            {loading ? <p className="mt-12 text-white/40">Loading stories…</p> : !stories.length ? <div className="mt-10 border-y border-white/10 py-16 text-white/45">No stories have been published yet. Check back soon.</div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{stories.map((item, index) => <StoryCard key={item.id} story={item} index={index} />)}</div>}
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}
