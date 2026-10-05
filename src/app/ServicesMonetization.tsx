import { ArrowRight, BookOpen, Download, Video, Wrench } from 'lucide-react';

const resourceUrl=(key:string)=>{
  const envKey=`VITE_RESOURCE_${key.toUpperCase()}_URL`;
  const configured=String((import.meta.env as Record<string,string|undefined>)[envKey]||'').trim();
  return `/resources/checkout?resource=${encodeURIComponent(key)}`;
};
const resources=[
  {title:'Church Livestream Starter Pack',description:'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.',price:'From ₦2,500',tag:'Livestreaming',icon:Video,key:'livestream'},
  {title:'Creator Content Planner',description:'A simple planning system for turning ideas into consistent posts, stories and short-form content.',price:'From ₦2,000',tag:'Content',icon:BookOpen,key:'content'},
  {title:'Livestream Troubleshooting Guide',description:'A field guide for fixing the problems that show up when the stream is already supposed to be live.',price:'From ₦3,500',tag:'Troubleshooting',icon:Wrench,key:'troubleshooting'},
];

function ResourcesSection(){
  return <section className="relative mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24" aria-labelledby="bluehaven-resources-heading">
    <div className="border-t border-white/10 pt-10 md:pt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">BlueHaven Resources</p>
          <h2 id="bluehaven-resources-heading" className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Learn it. Build it. Use it.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 md:text-base">Practical creator resources built from the same workflows we use on real projects. Buy a focused resource instead of paying for a full service when you only need the playbook.</p>
        </div>
        <a href="/stories" className="inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-white/55 hover:text-white">Read the free guides <ArrowRight size={14}/></a>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
        {resources.map(r=>{const Icon=r.icon;return <article key={r.key} className="group bg-[#0f0f0f] p-6 transition-colors hover:bg-[#141414] md:p-7">
          <div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center border border-white/10 bg-white/[.035] text-[#ffde59]"><Icon size={18}/></div><span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">{r.tag}</span></div>
          <h3 className="mt-8 text-xl font-bold leading-tight text-white">{r.title}</h3>
          <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">{r.description}</p>
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5"><span className="text-sm font-bold text-[#ffde59]">{r.price}</span><a href={resourceUrl(r.key)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-white hover:text-[#ffde59]">Get access <Download size={13}/></a></div>
        </article>})}
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[.16em] text-white/25">Digital resources • connect each product to its own checkout link without changing the design.</p>
    </div>
  </section>;
}

function HireFunnel(){
  return <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-24" aria-labelledby="hire-bluehaven-heading">
    <div className="relative overflow-hidden border-y border-white/10 py-10 md:flex md:items-center md:justify-between md:gap-12 md:py-14">
      <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">Hire BlueHaven</p><h2 id="hire-bluehaven-heading" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Need the result, not the tutorial?</h2><p className="mt-4 text-sm leading-7 text-white/50 md:text-base">Tell us what you are trying to build, fix or launch. We can handle the creative direction, livestreaming, content, branding or digital work for you.</p></div>
      <div className="mt-7 flex shrink-0 flex-wrap gap-3 md:mt-0"><a href="/inquire?intent=hire" className="inline-flex items-center gap-2 rounded-full bg-[#ffde59] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-black hover:brightness-105">Start a project <ArrowRight size={14}/></a><a href="/work" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/65 hover:border-white/30 hover:text-white">See the work</a></div>
    </div>
  </section>;
}
export default function ServicesMonetization(){return <><ResourcesSection/><HireFunnel/></>;}