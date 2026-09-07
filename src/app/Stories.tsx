import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, List, Menu, Moon, Sun, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getStoryGridClass, storiesClasses } from './storiesLayout';
import { LiquidBackground } from './components/LiquidBackground';
import { DepthLayer } from './components/DepthLayer';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { chapterizeStory, getReadingProgress, getResumeChapter, minutes, words, type ReaderChapter } from './storiesReader';

type Story = { id:string; title:string; slug:string; excerpt:string; content:string; category:string; cover_url:string|null; featured:boolean; published_at:string|null; created_at:string };
type SavedProgress = { scrollY:number; progress:number; chapter:number; updatedAt:number };

const nav = [['Home','/'],['Stories','/stories'],['Services','/services'],['Portfolio','/portfolio'],['Process','/process'],['Inquire','/inquire']] as const;
const date = (value:string|null) => value ? new Intl.DateTimeFormat('en-NG',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value)) : '';
const progressKey = (slug:string) => `bluehaven-reader:${slug}`;
const themeKey = 'bluehaven-reader-theme';

async function loadStory(slug:string):Promise<Story|null>{
  const direct=await fetch(`/api/stories?slug=${encodeURIComponent(slug)}`,{cache:'no-store'});
  if(direct.ok){const data=await direct.json();if(data?.story?.slug===slug)return data.story as Story;}
  const list=await fetch('/api/stories',{cache:'no-store'});
  if(!list.ok)return null;
  const data=await list.json();
  const match=Array.isArray(data?.stories)?data.stories.find((item:Story)=>item.slug===slug):null;
  return match||null;
}

function Header(){
  const [open,setOpen]=useState(false);
  return <header className="relative z-50 sticky top-0 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl md:px-[10%] md:py-5">
    <div className="flex items-center justify-between gap-5">
      <a href="/" className="text-lg font-bold uppercase tracking-wide text-white md:text-2xl">BLUEHAVEN STUDIOS</a>
      <nav className="hidden md:block"><ul className="flex gap-1">{nav.map(([label,href])=><li key={href}><a href={href} className={`block rounded-lg px-3 py-2 text-sm uppercase tracking-wide transition hover:bg-white/10 ${label==='Stories'?'text-white':'text-white/65'}`}>{label}</a></li>)}</ul></nav>
      <button type="button" onClick={()=>setOpen(v=>!v)} className="rounded-lg p-2 text-white md:hidden" aria-label="Toggle menu">{open?<X size={22}/>:<Menu size={22}/>}</button>
    </div>
    {open&&<nav className="absolute left-0 right-0 top-full border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden"><div className="flex flex-col">{nav.map(([label,href])=><a key={href} href={href} onClick={()=>setOpen(false)} className="border-b border-white/10 px-6 py-4 text-sm uppercase tracking-wide text-white">{label}</a>)}</div></nav>}
  </header>;
}

function Footer(){return <footer className="border-t border-white/10 bg-black px-5 py-14 text-white md:px-[10%] md:py-16"><div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]"><div><p className="text-xl font-black uppercase tracking-tight">Bluehaven Studios</p><p className="mt-3 max-w-sm text-sm leading-6 text-white/40">Creative direction, digital experiences and media built to make brands impossible to ignore.</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/30">Explore</p><div className="mt-4 flex flex-col gap-2 text-sm text-white/55">{nav.slice(0,5).map(([label,href])=><a key={href} href={href} className="transition hover:text-white">{label}</a>)}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/30">Connect</p><div className="mt-4 flex flex-col gap-2 text-sm text-white/55"><a href="/inquire">Start a project</a><a href="/admin">Admin</a></div></div></div><div className="mt-12 border-t border-white/10 pt-5 text-xs text-white/25">© {new Date().getFullYear()} BlueHaven Studios. All rights reserved.</div></footer>}

function StoryCard({story,index,progress}:{story:Story;index:number;progress?:SavedProgress}){
  const featured=index===0||story.featured;
  return <motion.a href={`/stories/${encodeURIComponent(story.slug)}`} className={`${getStoryGridClass(index)} group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.035] text-left`} whileHover={{y:-4}} transition={{duration:.25}}>
    <div className={`${featured?'aspect-[16/8]':'aspect-[4/3]'} overflow-hidden bg-white/5`}>{story.cover_url?<img src={story.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>:<div className="grid h-full place-items-center bg-white/[.03] text-xs font-bold uppercase tracking-[.25em] text-white/20">BlueHaven Studios</div>}</div>
    <div className={featured?'p-7 md:p-9':'p-6'}><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffde59]">{story.category||'Journal'}</p><h2 className={`${featured?'text-3xl md:text-5xl':'text-xl md:text-2xl'} mt-3 font-bold leading-tight text-white`}>{story.title}</h2><p className="mt-3 text-sm leading-6 text-white/45">{story.excerpt}</p><div className="mt-6 flex flex-wrap gap-4 text-[10px] uppercase tracking-[.16em] text-white/30"><span>{date(story.published_at||story.created_at)}</span><span>{minutes(story.content)} min read</span></div>{progress&&progress.progress>0&&<div className="mt-5"><div className="mb-2 flex justify-between text-[10px] uppercase tracking-[.15em] text-white/30"><span>Continue reading</span><span>{progress.progress}%</span></div><div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffde59]" style={{width:`${progress.progress}%`}}/></div></div>}</div>
  </motion.a>;
}

function ChapterText({body}:{body:string}){
  const paragraphs=body.split(/\n\s*\n/).map((p)=>p.trim()).filter(Boolean);
  return <>{paragraphs.map((paragraph,index)=><p key={`${index}-${paragraph.slice(0,16)}`} className="mb-7 whitespace-pre-wrap text-[1.08rem] leading-[1.95] tracking-[.005em] text-[#332e27] md:text-[1.18rem] md:leading-[2.02]">{paragraph}</p>)}</>;
}

function Reader({story}:{story:Story}){
  const chapters=useMemo(()=>chapterizeStory(story.content),[story.content]);
  const totalWords=words(story.content);
  const totalMinutes=minutes(story.content);
  const totalPages=Math.max(1,Math.ceil(totalWords/250));
  const [progress,setProgress]=useState<SavedProgress>({scrollY:0,progress:0,chapter:chapters[0]?.number||1,updatedAt:0});
  const [currentChapter,setCurrentChapter]=useState(chapters[0]?.number||1);
  const [tocOpen,setTocOpen]=useState(false);
  const [theme,setTheme]=useState<'paper'|'night'>('paper');
  const [resumeReady,setResumeReady]=useState(false);
  const restored=useRef(false);
  const chapterRefs=useRef<Record<number,HTMLElement|null>>({});
  const bookRef=useRef<HTMLElement|null>(null);

  useEffect(()=>{
    try{const saved=JSON.parse(localStorage.getItem(progressKey(story.slug))||'null') as SavedProgress|null;if(saved){setProgress(saved);setCurrentChapter(saved.chapter);setResumeReady(saved.progress>2);}}
    catch{}
    try{const savedTheme=localStorage.getItem(themeKey) as 'paper'|'night'|null;if(savedTheme)setTheme(savedTheme);}catch{}
  },[story.slug]);

  useEffect(()=>{
    if(!resumeReady||restored.current)return;
    restored.current=true;
    const timer=window.setTimeout(()=>window.scrollTo({top:progress.scrollY,behavior:'smooth'}),500);
    return()=>window.clearTimeout(timer);
  },[resumeReady,progress.scrollY]);

  useEffect(()=>{
    let ticking=false;
    const save=()=>{
      if(ticking)return;
      ticking=true;
      window.requestAnimationFrame(()=>{
        ticking=false;
        const element=bookRef.current;
        if(!element)return;
        const rect=element.getBoundingClientRect();
        const start=Math.max(0,window.scrollY-(window.innerHeight*0.35));
        const end=Math.max(start+1,document.documentElement.scrollHeight-window.innerHeight);
        const percent=getReadingProgress(start,end);
        const next={scrollY:window.scrollY,progress:percent,chapter:currentChapter,updatedAt:Date.now()};
        setProgress(next);
        try{localStorage.setItem(progressKey(story.slug),JSON.stringify(next));}catch{}
      });
    };
    window.addEventListener('scroll',save,{passive:true});
    return()=>window.removeEventListener('scroll',save);
  },[story.slug,currentChapter]);

  useEffect(()=>{
    const observer=new IntersectionObserver((entries)=>{
      const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible){const number=Number((visible.target as HTMLElement).dataset.chapter||1);setCurrentChapter(number);}
    },{rootMargin:'-18% 0px -55% 0px',threshold:[0,.25,.5,1]});
    Object.values(chapterRefs.current).forEach((node)=>node&&observer.observe(node));
    return()=>observer.disconnect();
  },[chapters]);

  const jump=(number:number)=>{chapterRefs.current[number]?.scrollIntoView({behavior:'smooth',block:'start'});setTocOpen(false)};
  const currentIndex=Math.max(0,chapters.findIndex((chapter)=>chapter.number===currentChapter));
  const remainingMinutes=Math.max(0,Math.ceil(totalMinutes*(1-(progress.progress/100))));
  const page=Math.max(1,Math.min(totalPages,Math.round((progress.progress/100)*totalPages)||1));
  const chapter=getResumeChapter(chapters,Math.max(0,progress.progress/100*story.content.length));
  const readingClass=theme==='night'?'bg-[#181613] text-[#eee8dc]':'bg-[#eee9df] text-[#332e27]';

  const setReaderTheme=(next:'paper'|'night')=>{setTheme(next);try{localStorage.setItem(themeKey,next);}catch{}};

  return <div className="relative min-h-screen bg-[#0d0c0b] text-white">
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-white/10"><div className="h-full bg-[#ffde59] transition-[width] duration-150" style={{width:`${progress.progress}%`}}/></div>
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0c0b]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <a href="/stories" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/45 transition hover:text-white"><ArrowLeft size={14}/>Stories</a>
        <div className="hidden min-w-0 items-center gap-3 md:flex"><BookOpen size={15} className="shrink-0 text-[#ffde59]"/><span className="truncate text-xs font-semibold text-white/75">{story.title}</span><span className="text-[10px] uppercase tracking-[.14em] text-white/30">Chapter {currentIndex+1} of {chapters.length}</span></div>
        <div className="flex items-center gap-1"><button type="button" onClick={()=>setReaderTheme(theme==='paper'?'night':'paper')} className="rounded-xl p-2.5 text-white/55 transition hover:bg-white/10 hover:text-white" aria-label="Toggle reading theme">{theme==='paper'?<Moon size={16}/>:<Sun size={16}/>}</button><button type="button" onClick={()=>setTocOpen(v=>!v)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.14em] text-white/60 transition hover:bg-white/10 hover:text-white"><List size={16}/><span className="hidden sm:inline">Chapters</span></button></div>
      </div>
    </div>

    {tocOpen&&<div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm" onClick={()=>setTocOpen(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#11100f] p-6 shadow-2xl" onClick={(event)=>event.stopPropagation()}><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ffde59]">Table of contents</p><h2 className="mt-2 text-2xl font-black">{story.title}</h2></div><button type="button" onClick={()=>setTocOpen(false)} className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close chapters"><X size={20}/></button></div><div className="mt-8 space-y-1">{chapters.map((item,index)=><button key={`${item.number}-${item.title}`} type="button" onClick={()=>jump(item.number)} className={`w-full rounded-2xl px-4 py-4 text-left transition ${item.number===currentChapter?'bg-[#7f56d6]/20 text-white':'text-white/50 hover:bg-white/5 hover:text-white'}`}><span className="mr-3 text-[10px] font-bold text-[#ffde59]">{String(index+1).padStart(2,'0')}</span><span className="font-semibold">{item.title}</span></button>)}</div></aside></div>}

    <main ref={bookRef}>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(240px,360px)_1fr] md:gap-16">
          <div className="mx-auto w-full max-w-sm [perspective:1200px]">
            <motion.div initial={{rotateY:-8,opacity:0,y:20}} animate={{rotateY:0,opacity:1,y:0}} transition={{duration:.7,ease:'easeOut'}} className="relative overflow-hidden rounded-r-[1.5rem] rounded-l-md border border-white/15 bg-[#191715] shadow-[24px_30px_70px_rgba(0,0,0,.55)]">
              {story.cover_url?<img src={story.cover_url} alt={`${story.title} cover`} className="aspect-[2/3] w-full object-cover"/>:<div className="flex aspect-[2/3] flex-col justify-between p-8"><span className="text-[10px] font-bold uppercase tracking-[.3em] text-[#ffde59]">BlueHaven Stories</span><h1 className="text-4xl font-black leading-none">{story.title}</h1><span className="text-xs text-white/35">{story.category}</span></div>}
            </motion.div>
          </div>
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">{story.category||'BlueHaven Story'}</p>
            <h1 className="mt-5 text-5xl font-black leading-[.92] tracking-[-.045em] md:text-7xl">{story.title}</h1>
            <p className="mt-6 text-base leading-7 text-white/45 md:text-lg">{story.excerpt}</p>
            <div className="mt-7 flex flex-wrap gap-5 text-[10px] uppercase tracking-[.16em] text-white/35"><span className="inline-flex items-center gap-2"><Calendar size={14}/>{date(story.published_at||story.created_at)}</span><span className="inline-flex items-center gap-2"><Clock size={14}/>{totalMinutes} min read</span><span>{chapters.length} chapters</span></div>
            {progress.progress>2&&<div className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex items-center justify-between text-[10px] uppercase tracking-[.15em] text-white/35"><span>Continue reading</span><span>{progress.progress}% complete</span></div><p className="mt-2 text-sm text-white/70">Chapter {currentIndex+1} · page {page} of {totalPages}</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#ffde59]" style={{width:`${progress.progress}%`}}/></div><button type="button" onClick={()=>window.scrollTo({top:progress.scrollY,behavior:'smooth'})} className="mt-4 text-xs font-bold uppercase tracking-[.15em] text-[#ffde59]">Continue reading →</button></div>}
            {progress.progress<=2&&<button type="button" onClick={()=>jump(chapters[0]?.number||1)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#ffde59] px-6 py-3 text-sm font-black text-black">Begin reading <ArrowRight size={16}/></button>}
          </div>
        </div>
      </section>

      <div className="border-y border-white/10 bg-[#0b0a09]">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-white/10 px-4 py-4 text-center md:px-8">
          <div><p className="text-[9px] uppercase tracking-[.18em] text-white/25">Progress</p><p className="mt-1 text-sm font-bold">{progress.progress}%</p></div>
          <div><p className="text-[9px] uppercase tracking-[.18em] text-white/25">Chapter</p><p className="mt-1 text-sm font-bold">{currentIndex+1} / {chapters.length}</p></div>
          <div><p className="text-[9px] uppercase tracking-[.18em] text-white/25">Time left</p><p className="mt-1 text-sm font-bold">{remainingMinutes} min</p></div>
        </div>
      </div>

      <section className={`mx-auto max-w-5xl px-3 py-10 md:px-8 md:py-20`}>
        <div className={`${readingClass} mx-auto max-w-4xl overflow-hidden rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,.3)] md:rounded-[2rem]`}>
          <div className="mx-auto max-w-3xl px-7 py-14 md:px-20 md:py-24">
            {chapters.map((item,index)=><section key={`${item.number}-${item.title}`} ref={(node)=>{chapterRefs.current[item.number]=node}} data-chapter={item.number} className="scroll-mt-24 border-b border-black/10 pb-20 pt-8 last:border-0 md:pb-28 md:pt-14">
              <div className="mb-12 text-center md:mb-16"><p className="text-[10px] font-bold uppercase tracking-[.32em] opacity-45">Chapter {String(index+1).padStart(2,'0')}</p><h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-[-.025em] md:text-6xl">{item.title}</h2><div className="mx-auto mt-7 h-px w-12 bg-current opacity-20"/></div>
              <ChapterText body={item.body}/>
            </section>)}
            <div className="py-16 text-center md:py-24"><p className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40">The End</p><div className="mx-auto mt-6 h-px w-16 bg-current opacity-20"/><p className="mx-auto mt-6 max-w-md font-serif text-lg italic opacity-55">Thank you for reading {story.title}.</p><a href="/stories" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#6f4dd1]">Return to stories <ArrowRight size={14}/></a></div>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-[#0d0c0b]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-3 md:px-8"><div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[.16em] text-white/30"><span>Chapter {currentIndex+1} of {chapters.length} · {page}/{totalPages} pages</span><span>{progress.progress}%</span></div><div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#ffde59]" style={{width:`${progress.progress}%`}}/></div><div className="mt-3 flex items-center justify-between"><button type="button" disabled={currentIndex<=0} onClick={()=>jump(chapters[currentIndex-1]?.number)} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/55 disabled:opacity-20"><ArrowLeft size={15}/>Previous</button><button type="button" onClick={()=>setTocOpen(true)} className="text-[10px] font-bold uppercase tracking-[.15em] text-white/45 hover:text-white">Contents</button><button type="button" disabled={currentIndex>=chapters.length-1} onClick={()=>jump(chapters[currentIndex+1]?.number)} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/55 disabled:opacity-20">Next<ArrowRight size={15}/></button></div></div>
      </div>
    </main>
  </div>;
}

function ArticleFallback({story}:{story:Story}){return <Reader story={story}/>}

export default function Stories(){
  const path=window.location.pathname; const slug=path.startsWith('/stories/')?decodeURIComponent(path.split('/').filter(Boolean)[1]||''):'';
  const [stories,setStories]=useState<Story[]>([]); const [story,setStory]=useState<Story|null>(null); const [loading,setLoading]=useState(true); const [saved,setSaved]=useState<Record<string,SavedProgress>>({});
  useEffect(()=>{let cancelled=false;const run=async()=>{try{if(slug){const result=await loadStory(slug);if(!cancelled)setStory(result);}else{const r=await fetch('/api/stories',{cache:'no-store'});const data=await r.json();if(!cancelled)setStories(Array.isArray(data.stories)?data.stories:[]);}}catch{if(!cancelled){if(slug)setStory(null);else setStories([])}}finally{if(!cancelled)setLoading(false)}};void run();return()=>{cancelled=true}},[slug]);
  useEffect(()=>{if(slug)return;const next:Record<string,SavedProgress>={};stories.forEach((item)=>{try{const value=JSON.parse(localStorage.getItem(progressKey(item.slug))||'null');if(value?.progress>0)next[item.slug]=value;}catch{}});setSaved(next)},[slug,stories]);
  return <div className={storiesClasses.page} style={{fontFamily:'Montserrat, sans-serif'}}><ScrollProgressBar/><DepthLayer depth={0}><LiquidBackground/></DepthLayer><Header/>{slug?(loading?<main className={storiesClasses.section}><p className="text-white/40">Opening your book…</p></main>:story?<ArticleFallback story={story}/>:<main className={storiesClasses.section}><h1 className="text-4xl font-black">Story not found.</h1><a href="/stories" className="mt-6 inline-flex items-center gap-2 text-[#ffde59]"><ArrowLeft size={16}/>All stories</a></main>):<><main className={storiesClasses.section}><div className="mb-12 max-w-3xl"><p className={storiesClasses.eyebrow}>Stories</p><h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">Ideas behind the work.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/50 md:text-lg">Long-form stories, essays and ideas from BlueHaven Studios.</p></div>{Object.keys(saved).length>0&&<div className="mb-12 border-y border-white/10 py-6"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffde59]">Your reading</p><div className="mt-4 grid gap-3 md:grid-cols-2">{stories.filter((item)=>saved[item.slug]).slice(0,2).map((item)=><a key={item.slug} href={`/stories/${item.slug}`} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-white/20"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-white">Continue {item.title}</p><p className="mt-1 text-xs text-white/35">Chapter {saved[item.slug].chapter} · {saved[item.slug].progress}% complete</p></div><ArrowRight size={17} className="text-[#ffde59]"/></div><div className="mt-4 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffde59]" style={{width:`${saved[item.slug].progress}%`}}/></div></a>)}</div></div>}<div className="mb-8 flex items-end justify-between gap-6 border-b border-white/10 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/35">Library</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Recent stories</h2></div><span className="hidden text-xs uppercase tracking-[.18em] text-white/30 md:block">{stories.length?`${stories.length} published`:'Editorial archive'}</span></div>{loading?<p className="py-10 text-white/40">Loading stories…</p>:!stories.length?<div className="border-y border-white/10 py-16 text-white/45">No stories have been published yet. Check back soon.</div>:<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{stories.map((item,index)=><StoryCard key={item.id} story={item} index={index} progress={saved[item.slug]}/>)}</div>}</main><Footer/></>}</div>;
}
