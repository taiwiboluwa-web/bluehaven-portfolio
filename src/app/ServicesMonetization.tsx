import { ArrowRight, BookOpen, CalendarDays, Check, Download, ExternalLink, GraduationCap, LayoutTemplate, Megaphone, MonitorPlay, Users, Video, Wrench } from 'lucide-react';

const resourceUrl=(key:string)=>`/resources/checkout?resource=${encodeURIComponent(key)}`;
const whatsappUrl="https://api.whatsapp.com/send/?phone=2348068483718&text=I+would+love+to+make+enquiries+about+your+service&type=phone_number&app_absent=0";

const resources=[
  {title:'Church Livestream Starter Pack',description:'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.',price:'₦2,500',tag:'Livestreaming',icon:Video,key:'livestream'},
  {title:'Creator Content Planner',description:'A simple planning system for turning ideas into consistent posts, stories and short-form content.',price:'₦2,000',tag:'Content',icon:BookOpen,key:'content'},
  {title:'Livestream Troubleshooting Guide',description:'A field guide for fixing the problems that show up when the stream is already supposed to be live.',price:'₦3,500',tag:'Troubleshooting',icon:Wrench,key:'troubleshooting'},
];

const offers=[
  {title:'Digital Products',price:'₦2k–₦15k',description:'Streamlabs/OBS templates, overlays, LUTs, design packs and production checklists.',icon:Download,cta:'Browse resources',href:'#bluehaven-resources-heading'},
  {title:'Mini Courses',price:'₦5k–₦25k',description:'Focused training such as Start Livestreaming in 60 Minutes and practical creator classes.',icon:GraduationCap,cta:'Ask about a course',href:whatsappUrl},
  {title:'Paid Resources',price:'₦1k–₦10k',description:'Handbooks, setup guides, church media playbooks and creator planning systems.',icon:BookOpen,cta:'View resources',href:'#bluehaven-resources-heading'},
  {title:'Website Services',price:'₦50k+',description:'Portfolio sites, business websites and focused digital builds that are made to work.',icon:MonitorPlay,cta:'Start a website project',href:whatsappUrl},
  {title:'Creative Consultations',price:'₦10k–₦30k',description:'30–60 minute troubleshooting, strategy and creative direction sessions.',icon:Wrench,cta:'Book a consultation',href:whatsappUrl},
  {title:'Paid Workshops',price:'₦3k–₦10k/person',description:'Monthly livestream, design, content and digital-media sessions for creators and teams.',icon:CalendarDays,cta:'Join a workshop',href:whatsappUrl},
  {title:'Templates',price:'₦1k–₦10k',description:'Canva social packs, presentations, event graphics and reusable production assets.',icon:LayoutTemplate,cta:'Get a template',href:'#bluehaven-resources-heading'},
  {title:'Affiliate Picks',price:'Commission',description:'Recommended software and equipment BlueHaven genuinely uses in real workflows.',icon:ExternalLink,cta:'See recommended tools',href:whatsappUrl},
  {title:'Sponsored Stories',price:'₦10k+',description:'A clearly labelled place for relevant creative, tech and business brands to reach BlueHaven readers.',icon:Megaphone,cta:'Ask about sponsorship',href:whatsappUrl},
  {title:'Job & Service Leads',price:'Project-based',description:'Turn visitors who need help into qualified enquiries for BlueHaven services.',icon:ArrowRight,cta:'Hire BlueHaven',href:whatsappUrl},
  {title:'Membership',price:'₦2k–₦10k/month',description:'A private creator space with resources, office hours, community and practical support.',icon:Users,cta:'Join the waitlist',href:whatsappUrl},
  {title:'Subscriptions',price:'Monthly',description:'Recurring access to a growing library of resources, templates and training.',icon:Check,cta:'Join the waitlist',href:whatsappUrl},
];

function ResourcesSection(){
  return <section className="relative mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24" aria-labelledby="bluehaven-resources-heading">
    <div className="border-t border-white/10 pt-10 md:pt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">BlueHaven Resources</p><h2 id="bluehaven-resources-heading" className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Learn it. Build it. Use it.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/50 md:text-base">Practical creator resources built from the same workflows we use on real projects. Start small, buy only what you need, and keep building.</p></div>
        <a href="/stories" className="inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-white/55 hover:text-white">Read the free guides <ArrowRight size={14}/></a>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
        {resources.map(r=>{const Icon=r.icon;return <article key={r.key} className="group bg-[#0f0f0f] p-6 transition-colors hover:bg-[#141414] md:p-7"><div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center border border-white/10 bg-white/[.035] text-[#ffde59]"><Icon size={18}/></div><span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">{r.tag}</span></div><h3 className="mt-8 text-xl font-bold leading-tight text-white">{r.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">{r.description}</p><div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5"><span className="text-sm font-bold text-[#ffde59]">{r.price}</span><a href={resourceUrl(r.key)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-white hover:text-[#ffde59]">Get access <Download size={13}/></a></div></article>})}
      </div>
    </div>
  </section>;
}

function OffersSection(){
  return <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-24" aria-labelledby="bluehaven-income-heading">
    <div className="border-y border-white/10 py-10 md:py-14">
      <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">Ways to work with BlueHaven</p><h2 id="bluehaven-income-heading" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">What can we build together?</h2><p className="mt-4 text-sm leading-7 text-white/50 md:text-base">Pick a service, resource, or project and let’s get to work.</p></div>
      <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
        {offers.map(o=>{const Icon=o.icon;return <article key={o.title} className="bg-[#0f0f0f] p-6"><div className="flex items-start justify-between gap-4"><div className="grid h-10 w-10 place-items-center border border-white/10 text-[#ffde59]"><Icon size={17}/></div><span className="text-[10px] font-black text-[#ffde59]">{o.price}</span></div><h3 className="mt-6 text-lg font-bold text-white">{o.title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{o.description}</p><a href={o.href} className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-white/65 hover:text-white">{o.cta}<ArrowRight size={13}/></a></article>})}
      </div>
    </div>
  </section>;
}

function HireFunnel(){
  return <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-24" aria-labelledby="hire-bluehaven-heading"><div className="relative overflow-hidden border-y border-white/10 py-10 md:flex md:items-center md:justify-between md:gap-12 md:py-14"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">Hire BlueHaven</p><h2 id="hire-bluehaven-heading" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Need the result, not the tutorial?</h2><p className="mt-4 text-sm leading-7 text-white/50 md:text-base">Tell us what you are trying to build, fix or launch. We can handle the creative direction, livestreaming, content, branding or digital work for you.</p></div><div className="mt-7 flex shrink-0 flex-wrap gap-3 md:mt-0"><a href={whatsappUrl} className="inline-flex items-center gap-2 rounded-full bg-[#ffde59] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-black hover:brightness-105">Start a project <ArrowRight size={14}/></a><a href="/work" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/65 hover:border-white/30 hover:text-white">See the work</a></div></div></section>;
}

export default function ServicesMonetization(){return <><ResourcesSection/><OffersSection/><HireFunnel/></>;}