import { ArrowRight, BookOpen, CalendarDays, Check, Download, ExternalLink, GraduationCap, LayoutTemplate, Megaphone, MonitorPlay, Users, Video, Wrench } from 'lucide-react';

const resourceUrl=(key:string)=>`/resources?select=${encodeURIComponent(key)}`;
const whatsappUrl="https://api.whatsapp.com/send/?phone=2348068483718&text=I+would+love+to+make+enquiries+about+your+service&type=phone_number&app_absent=0";

const resources=[
  {title:'Church Livestream Starter Pack',description:'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.',price:'₦2,500',tag:'Livestreaming',icon:Video,key:'livestream'},
  {title:'Creator Content Planner',description:'A simple planning system for turning ideas into consistent posts, stories and short-form content.',price:'₦2,000',tag:'Content',icon:BookOpen,key:'content'},
  {title:'Livestream Troubleshooting Guide',description:'A field guide for fixing the problems that show up when the stream is already supposed to be live.',price:'₦3,500',tag:'Troubleshooting',icon:Wrench,key:'troubleshooting'},
];

const offers=[
  {title:'Digital Products',price:'₦2k–₦15k',description:'Streamlabs/OBS templates, overlays, LUTs, design packs and production checklists.',icon:Download,cta:'Browse resources',href:'#bluehaven-resources-heading',folder:'#5b8cff'},
  {title:'Mini Courses',price:'₦5k–₦25k',description:'Focused training such as Start Livestreaming in 60 Minutes and practical creator classes.',icon:GraduationCap,cta:'Ask about a course',href:whatsappUrl,folder:'#e78b4d'},
  {title:'Paid Resources',price:'₦1k–₦10k',description:'Handbooks, setup guides, church media playbooks and creator planning systems.',icon:BookOpen,cta:'View resources',href:'#bluehaven-resources-heading',folder:'#9b72cf'},
  {title:'Website Services',price:'₦50k+',description:'Portfolio sites, business websites and focused digital builds that are made to work.',icon:MonitorPlay,cta:'Start a website project',href:whatsappUrl,folder:'#42a889'},
  {title:'Creative Consultations',price:'₦10k–₦30k',description:'30–60 minute troubleshooting, strategy and creative direction sessions.',icon:Wrench,cta:'Book a consultation',href:whatsappUrl,folder:'#d9688a'},
  {title:'Paid Workshops',price:'₦3k–₦10k/person',description:'Monthly livestream, design, content and digital-media sessions for creators and teams.',icon:CalendarDays,cta:'Join a workshop',href:whatsappUrl,folder:'#c6a343'},
  {title:'Templates',price:'₦1k–₦10k',description:'Canva social packs, presentations, event graphics and reusable production assets.',icon:LayoutTemplate,cta:'Get a template',href:'#bluehaven-resources-heading',folder:'#6f9d5d'},
  {title:'Affiliate Picks',price:'Commission',description:'Recommended software and equipment BlueHaven genuinely uses in real workflows.',icon:ExternalLink,cta:'See recommended tools',href:whatsappUrl,folder:'#7b82c9'},
  {title:'Sponsored Stories',price:'₦10k+',description:'A clearly labelled place for relevant creative, tech and business brands to reach BlueHaven readers.',icon:Megaphone,cta:'Ask about sponsorship',href:whatsappUrl,folder:'#d77a55'},
  {title:'Job & Service Leads',price:'Project-based',description:'Turn visitors who need help into qualified enquiries for BlueHaven services.',icon:ArrowRight,cta:'Hire BlueHaven',href:whatsappUrl,folder:'#4e9b9b'},
  {title:'Membership',price:'₦2k–₦10k/month',description:'A private creator space with resources, office hours, community and practical support.',icon:Users,cta:'Join the waitlist',href:whatsappUrl,folder:'#aa76a9'},
  {title:'Subscriptions',price:'Monthly',description:'Recurring access to a growing library of resources, templates and training.',icon:Check,cta:'Join the waitlist',href:whatsappUrl,folder:'#788d4f'},
];

function FolderCard({o}:{o:(typeof offers)[number]}) {
  const Icon=o.icon;
  return <article className="group relative min-h-[290px] overflow-hidden pt-9 transition-transform duration-500 hover:-translate-y-2">
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/20 bg-white/[.075] shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur-2xl transition-all duration-500 group-hover:border-white/30 group-hover:bg-white/[.105] group-hover:shadow-[0_24px_65px_rgba(0,0,0,.34)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[.11] via-transparent to-black/[.12]" />
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl opacity-30" style={{backgroundColor:o.folder}} />
      <div className="absolute left-0 top-0 h-12 w-40 rounded-tl-[27px] rounded-br-[20px] border-r border-b border-white/20 backdrop-blur-xl" style={{backgroundColor:o.folder+'55'}} />
      <div className="absolute left-3 top-3 h-2 w-20 rounded-full bg-white/25" />
      <div className="absolute inset-x-5 bottom-4 h-px bg-white/10" />
    </div>
    <div className="relative z-10 flex h-full min-h-[280px] flex-col p-6 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white/80 shadow-inner backdrop-blur-md"><Icon size={18}/></div>
        <span className="rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] font-black tracking-tight text-white/75 backdrop-blur-md">{o.price}</span>
      </div>
      <div className="mt-7">
        <p className="text-[8px] font-black uppercase tracking-[.2em] text-white/35">BLUEHAVEN FILE</p>
        <h3 className="mt-2 text-lg font-black leading-tight text-white">{o.title}</h3>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-white/55">{o.description}</p>
      <a href={o.href} className="mt-5 inline-flex w-fit items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-[.15em] text-white/65 transition-colors hover:text-white">{o.cta}<ArrowRight size={13}/></a>
    </div>
  </article>;
}

function ResourcesSection(){
  return <section className="relative mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24" aria-labelledby="bluehaven-resources-heading">
    <div className="border-t border-white/10 pt-10 md:pt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/55">BlueHaven Resources</p><h2 id="bluehaven-resources-heading" className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Learn it. Build it. Use it.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/50 md:text-base">Practical creator resources built from the same workflows we use on real projects. Start small, buy only what you need, and keep building.</p></div>
        <a href="/stories" className="inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-white/55 hover:text-white">Read the free guides <ArrowRight size={14}/></a>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
        {resources.map(r=>{const Icon=r.icon;return <article key={r.key} className="group bg-[#0f0f0f] p-6 transition-colors hover:bg-[#141414] md:p-7"><div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center border border-white/10 bg-white/[.035] text-white/70"><Icon size={18}/></div><span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">{r.tag}</span></div><h3 className="mt-8 text-xl font-bold leading-tight text-white">{r.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">{r.description}</p><div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5"><span className="text-sm font-bold text-white">{r.price}</span><a href={resourceUrl(r.key)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-white/80 hover:text-white">Get access <Download size={13}/></a></div></article>})}
      </div>
    </div>
  </section>;
}

function OffersSection(){
  return <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-24" aria-labelledby="bluehaven-income-heading">
    <div className="border-y border-white/10 py-10 md:py-14">
      <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/55">Ways to work with BlueHaven</p><h2 id="bluehaven-income-heading" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">What can we build together?</h2><p className="mt-4 text-sm leading-7 text-white/50 md:text-base">Pick a service, resource, or project and let’s get to work.</p></div>
      <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {offers.map(o=><FolderCard key={o.title} o={o}/>)}
      </div>
    </div>
  </section>;
}

function HireFunnel(){
  return <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-24" aria-labelledby="hire-bluehaven-heading"><div className="relative overflow-hidden border-y border-white/10 py-10 md:flex md:items-center md:justify-between md:gap-12 md:py-14"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/55">Hire BlueHaven</p><h2 id="hire-bluehaven-heading" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Need the result, not the tutorial?</h2><p className="mt-4 text-sm leading-7 text-white/50 md:text-base">Tell us what you are trying to build, fix or launch. We can handle the creative direction, livestreaming, content, branding or digital work for you.</p></div><div className="mt-7 flex shrink-0 flex-wrap gap-3 md:mt-0"><a href={whatsappUrl} className="inline-flex items-center gap-2 rounded-full bg-[#ffde59] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-black hover:brightness-105">Start a project <ArrowRight size={14}/></a><a href="/work" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/65 hover:border-white/30 hover:text-white">See the work</a></div></div></section>;
}

export default function ServicesMonetization(){return <><ResourcesSection/><OffersSection/><HireFunnel/></>;}