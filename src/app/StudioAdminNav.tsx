import { Activity, BookOpen, BrainCircuit, FolderKanban, LayoutDashboard, MessageSquareText, Sparkles, Users } from 'lucide-react';

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
  const links=active==='staff'?[...items,{id:'staff' as const,label:'Staff workbench',short:'Staff',href:'/admin/sbcs/work',Icon:Users}]:items;
  return <>
    <nav aria-label="Studio workspace navigation" className="studio-glass-nav mx-auto my-5 hidden w-full max-w-[1120px] items-center gap-1 rounded-full border border-white/[.14] bg-[linear-gradient(135deg,rgba(31,38,51,.88),rgba(13,16,23,.82))] p-2 shadow-[0_20px_65px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl md:flex">
      <span className="mr-1 flex shrink-0 items-center gap-2 border-r border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[.2em] text-white/40"><Sparkles size={13} className="text-[#ffde59]"/> Studio</span>
      {links.map(({id,label,href,Icon})=><a key={id} href={href} aria-current={active===id?'page':undefined} className={'group relative inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-3 py-3 text-[11px] font-bold transition-all duration-300 '+(active===id?'border-[#ffde59]/70 bg-[#ffde59] text-[#17130a] shadow-[0_0_24px_rgba(255,222,89,.2),inset_0_1px_0_rgba(255,255,255,.55)]':'border-transparent text-white/55 hover:border-white/10 hover:bg-white/[.09] hover:text-white')}><Icon size={15} className={active===id?'':'transition-transform group-hover:-translate-y-0.5'}/><span className="truncate">{label}</span></a>)}
    </nav>
    <nav aria-label="Mobile studio navigation" className="studio-mobile-dock fixed inset-x-3 bottom-3 z-[70] flex items-center justify-around gap-1 rounded-[24px] border border-white/[.18] bg-[linear-gradient(135deg,rgba(31,38,51,.96),rgba(13,16,23,.94))] px-2 py-2 shadow-[0_18px_60px_rgba(0,0,0,.62),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl md:hidden">
      {links.map(({id,short,href,Icon})=><a key={id} href={href} aria-label={id} aria-current={active===id?'page':undefined} className={'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border px-1 py-2 text-[9px] font-bold transition-all '+(active===id?'border-[#ffde59]/60 bg-[#ffde59] text-[#17130a] shadow-[0_0_18px_rgba(255,222,89,.16)]':'border-transparent text-white/55 hover:bg-white/10 hover:text-white')}><Icon size={17}/><span>{short}</span></a>)}
    </nav>
  </>;
}
