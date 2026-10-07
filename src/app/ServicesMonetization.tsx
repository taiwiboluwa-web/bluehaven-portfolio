import { ArrowRight, BookOpen, CalendarDays, Check, Download, ExternalLink, GraduationCap, LayoutTemplate, Megaphone, MonitorPlay, Users, Video, Wrench } from 'lucide-react';

const resourceUrl=(key:string)=>`/resources?select=${encodeURIComponent(key)}`;
const whatsappUrl="https://api.whatsapp.com/send/?phone=2348068483718&text=I+would+love+to+make+enquiries+about+your+service&type=phone_number&app_absent=0";

const resources=[
  {title:'Church Livestream Starter Pack',description:'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.',price:'₦2,500',tag:'Livestreaming',icon:Video,key:'livestream'},
  {title:'Creator Content Planner',description:'A simple planning system for turning ideas into consistent posts, stories and short-form content.',price:'₦2,000',tag:'Content',icon:BookOpen,key:'content'},
  {title:'Livestream Troubleshooting Guide',description:'A field guide for fixing the problems that show up when the stream is already supposed to be live.',price:'₦3,500',tag:'Troubleshooting',icon:Wrench,key:'troubleshooting'},
];

const offers=[
  {title:'Digital Products',price:'₦2k–₦15k',description:'Streamlabs/OBS templates, overlays, LUTs, design packs and production checklists.',icon:Download,cta:'Browse resources',href:'#bluehaven-resources-heading',folder:'#3f7cff'},
  {title:'Mini Courses',price:'₦5k–₦25k',description:'Focused training such as Start Livestreaming in 60 Minutes and practical creator classes.',icon:GraduationCap,cta:'Ask about a course',href:whatsappUrl,folder:'#ff7657'},
  {title:'Paid Resources',price:'₦1k–₦10k',description:'Handbooks, setup guides, church media playbooks and creator planning systems.',icon:BookOpen,cta:'View resources',href:'#bluehaven-resources-heading',folder:'#a66cff'},
  {title:'Website Services',price:'₦50k+',description:'Portfolio sites, business websites and focused digital builds that are made to work.',icon:MonitorPlay,cta:'Start a website project',href:whatsappUrl,folder:'#21bfa3'},
  {title:'Creative Consultations',price:'₦10k–₦30k',description:'30–60 minute troubleshooting, strategy and creative direction sessions.',icon:Wrench,cta:'Book a consultation',href:whatsappUrl,folder:'#ef5e9c'},
  {title:'Paid Workshops',price:'₦3k–₦10k/person',description:'Monthly livestream, design, content and digital-media sessions for creators and teams.',icon:CalendarDays,cta:'Join a workshop',href:whatsappUrl,folder:'#e4b52f'},
  {title:'Templates',price:'₦1k–₦10k',description:'Canva social packs, presentations, event graphics and reusable production assets.',icon:LayoutTemplate,cta:'Get a template',href:'#bluehaven-resources-heading',folder:'#79bd45'},
  {title:'Affiliate Picks',price:'Commission',description:'Recommended software and equipment BlueHaven genuinely uses in real workflows.',icon:ExternalLink,cta:'See recommended tools',href:whatsappUrl,folder:'#6976e8'},
  {title:'Sponsored Stories',price:'₦10k+',description:'A clearly labelled place for relevant creative, tech and business brands to reach BlueHaven readers.',icon:Megaphone,cta:'Ask about sponsorship',href:whatsappUrl,folder:'#e86b3f'},
  {title:'Job & Service Leads',price:'Project-based',description:'Turn visitors who need help into qualified enquiries for BlueHaven services.',icon:ArrowRight,cta:'Hire BlueHaven',href:whatsappUrl,folder:'#20a8b0'},
  {title:'Membership',price:'₦2k–₦10k/month',description:'A private creator space with resources, office hours, community and practical support.',icon:Users,cta:'Join the waitlist',href:whatsappUrl,folder:'#c35bd4'},
  {title:'Subscriptions',price:'Monthly',description:'Recurring access to a growing library of resources, templates and training.',icon:Check,cta:'Join the waitlist',href:whatsappUrl,folder:'#8aa63f'},
];

function FolderCard({o}:{o:(typeof offers)[number]}) {
  const Icon=o.icon;
  return <article className="group relative min-h-[300px] pt-8 transition-transform duration-500 hover:-translate-y-2">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-0 top-0 h-14 w-40 border border-white/25 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.28)]" style={{backgroundColor:o.folder+'99',borderRadius:'18px 18px 0 0',clipPath:'polygon(0 0, 70% 0, 82% 34%, 100% 34%, 100% 100%, 0 100%)'}} />
      <div className="absolute inset-x-0 bottom-0 top-7 border border-white/25 bg-white/[.055] shadow-[0_24px_55px_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.2)] backdrop-blur-2xl" style={{borderRadius:'0 24px 24px 24px',clipPath:'polygon(0 0, 18% 0, 22% 5%, 100% 5%, 100% 100%, 0 100%)'}} />
      <div className="absolute -right-12 top-14 h-36 w-36 rounded-full blur-3xl opacity-35" style={{backgroundColor:o.folder}} />
      <div className="absolute left-5 right-5 top-[34px] h-px bg-white/20" />
      <div className="absolute bottom-5 left-5 right-5 h-px bg-white/10" />
    </div>
    <div className="relative z-10 flex h-full min-h-[292px] flex-col p-6 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-black/10 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,.2)] backdrop-blur-md"><Icon size={18}/></div>
        <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1 text-[10px] font-black tracking-tight text-white/80 backdrop-blur-md">{o.price}</span>
      </div>
      <div className="mt-7">
        <p className="text-[8px] font-black uppercase tracking-[.2em] text-white/38">BLUEHAVEN FILE</p>
        <h3 className="mt-2 text-lg font-black leading-tight text-white">{o.title}</h3>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-white/58">{o.description}</p>
      <a href={o.href} className="mt-5 inline-flex w-fit items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-[.15em] text-white/70 transition-colors hover:text-white">{o.cta}<ArrowRight size={13}/></a>
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