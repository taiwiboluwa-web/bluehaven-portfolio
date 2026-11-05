import { Activity, BookOpen, BrainCircuit, FolderKanban, LayoutDashboard, MessageSquareText, Sparkles } from 'lucide-react';

type Props={active?:'overview'|'portfolio'|'stories'|'ai'|'sbcs'|'blog'|'staff'};
const items=[
  {id:'overview',label:'Overview',short:'Home',href:'/admin#overview',Icon:LayoutDashboard},
  {id:'portfolio',label:'Portfolio',short:'Work',href:'/admin#portfolio',Icon:FolderKanban},
  {id:'stories',label:'Stories',short:'Stories',href:'/admin#stories',Icon:BookOpen},
  {id:'ai',label:'AI Control Room',short:'AI',href:'/admin#ai-control',Icon:BrainCircuit},
  {id:'sbcs',label:'SBCS Control Room',short:'SBCS',href:'/admin/sbcs',Icon:Activity},
  {id:'blog',label:'Review queue',short:'Review',href:'/admin/blog',Icon:MessageSquareText},
] as const;

export default function StudioAdminNav({active='overview'}:Props){
  return <>
    <nav aria-label="Studio workspace navigation" className="studio-glass-nav mx-auto my-5 hidden w-full max-w-[1120px] items-center gap-1.5 rounded-full border border-white/[.13] bg-[#141923]/75 p-2 shadow-[0_18px_55px_rgba(0,0,0,.32)] backdrop-blur-2xl md:flex">
      <span className="mr-2 flex shrink-0 items-center gap-2 border-r border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[.2em] text-white/35"><Sparkles size={13} className="text-[#ffde59]"/> Studio</span>
      {items.map(({id,label,href,Icon})=><a key={id} href={href} aria-current={active===id?'page':undefined} className={'studio-glass-nav-item group relative inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-3 text-[11px] font-semibold transition-all duration-300 '+(active===id?'is-active bg-[#ffde59]/[.13] text-[#ffde59] shadow-[inset_0_1px_0_rgba(255,255,255,.09),0_0_24px_rgba(255,222,89,.08)]':'text-white/48 hover:bg-white/[.07] hover:text-white')}><Icon size={15} className={active===id?'drop-shadow-[0_0_8px_rgba(255,222,89,.6)]':'transition-transform group-hover:-translate-y-0.5'}/><span className="truncate">{label}</span>{active===id&&<span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#ffde59] shadow-[0_0_10px_#ffde59]"/>}</a>)}
    </nav>
    <nav aria-label="Mobile studio navigation" className="studio-mobile-dock fixed inset-x-3 bottom-3 z-[70] flex items-center justify-around gap-1 rounded-[24px] border border-white/[.16] bg-[#151a23]/90 px-2 py-2 shadow-[0_18px_60px_rgba(0,0,0,.58)] backdrop-blur-2xl md:hidden">
      {items.map(({id,short,href,Icon})=><a key={id} href={href} aria-label={id} aria-current={active===id?'page':undefined} className={'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[17px] px-1 py-2 text-[9px] font-semibold transition-all '+(active===id?'bg-[#ffde59]/[.13] text-[#ffde59] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]':'text-white/48 hover:bg-white/10 hover:text-white')}><Icon size={17}/><span>{short}</span></a>)}
    </nav>
  </>;
}
