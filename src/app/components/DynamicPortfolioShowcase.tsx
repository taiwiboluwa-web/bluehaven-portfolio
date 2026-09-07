import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildPortfolioItems, type DbProject, type FallbackProject } from '@/lib/portfolioData';
import primaxLogo from 'figma:asset/af5a8fc9c64c0440dad680de29cbde577ff765c9.png';
import adeayoLogo from 'figma:asset/6cc1ad7b7df17ad8b72f927373f24a2653494634.png';
import fetesLight from 'figma:asset/02727bfe17ced13dc5028d6f270d3eec43ea5c13.png';
import lordsBlack from 'figma:asset/d998f756ade35de3fb24f728515fbff45bad6fc4.png';
import anchorBlue from 'figma:asset/c55bcfa0faed5c2bccc9caa1617a5f49b358b142.png';
import lamaysBlack from 'figma:asset/c327827d1376e3582ffaebb8c81398f851840dbc.png';
import fefesCard from 'figma:asset/017a226ee4f731f8ed5e8b9634438d7070ea1bbb.png';
import elejaLogoDark from 'figma:asset/da2fbe02536606e39395841fa852863673516fe2.png';
import wendeesBlue from 'figma:asset/89543834dc9fac8d6c3c7e5d1fd7e565785a5dad.png';
import onaNotebook from 'figma:asset/a870db28d502ad17b4b4974a4ccf93949d4dd468.png';
import souvenirsWhite from 'figma:asset/d8985e21a43878d8dcaba7ff78421dc080247cd2.png';
import lamaysScentsLogo from 'figma:asset/eca5d1b1aae735acb6bdea0539176c17f20e3de2.png';
import dazzledFlat from 'figma:asset/df042d4e65ba2df64c7d343976873ac3b4d5c6ef.png';
import emmaxLogo from 'figma:asset/13a97c85692fc63be5b64f1d6a49de7f7573056c.png';
import kefasLogo from 'figma:asset/2bc2d0872bc004e56fb14516b9f2d99ed2497f0e.png';

const legacyFallbacks:FallbackProject[]=[
 {title:'Kefas Foods',image:kefasLogo,subtitle:'Authentic Taste, Premium Quality'},
 {title:'Emmax Gaming',image:emmaxLogo,subtitle:'High-Performance Gaming Gear'},
 {title:'Primax Bar & Grill',image:primaxLogo,subtitle:'Restaurant Branding & Menu Design'},
 {title:"Wendee's Bakery",image:wendeesBlue,subtitle:'Bakery Brand Identity'},
 {title:'Clothings by Adeayo',image:adeayoLogo,subtitle:'Fashion Brand Identity'},
 {title:'FeFes',image:fetesLight,subtitle:'Modern Playful Logo Design'},
 {title:'FeFes Kitchen',image:fefesCard,subtitle:'Restaurant Business Cards'},
 {title:"Lord's Heritage Care",image:lordsBlack,subtitle:'Childcare Services Merchandise'},
 {title:'Anchor Freight Solutions',image:anchorBlue,subtitle:'Logistics Brand Identity'},
 {title:"LaMay's Fashion Hub",image:lamaysBlack,subtitle:'Luxury Fashion Branding'},
 {title:'Eleja Exchange',image:elejaLogoDark,subtitle:'Digital Asset Exchange Branding'},
 {title:'Dazzled in Essence',image:dazzledFlat,subtitle:'Beauty & Wellness Brand'},
 {title:'LaMay Scents',image:lamaysScentsLogo,subtitle:'Fragrance Branding'},
 {title:'Souvenirs',image:souvenirsWhite,subtitle:'Custom Branding'},
 {title:'OnaKanOwoja',image:onaNotebook,subtitle:'Brand Merchandise'},
];

export function DynamicPortfolioShowcase(){
 const [projects,setProjects]=useState<DbProject[]>([]);
 const [current,setCurrent]=useState(0);
 const [loading,setLoading]=useState(true);
 const [failed,setFailed]=useState(false);
 const items=useMemo(()=>buildPortfolioItems(projects,legacyFallbacks),[projects]);

 const load=async()=>{
  setLoading(true);setFailed(false);
  try{
   const response=await fetch('/api/portfolio?mode=public',{cache:'no-store'});
   if(!response.ok)throw new Error('Portfolio request failed');
   const data=await response.json();
   setProjects(Array.isArray(data.projects)?data.projects:[]);
  }catch{setFailed(true)}finally{setLoading(false)}
 };

 useEffect(()=>{void load()},[]);
 useEffect(()=>{if(current>=items.length)setCurrent(0)},[current,items.length]);
 useEffect(()=>{if(items.length<2)return;const timer=window.setInterval(()=>setCurrent(v=>(v+1)%items.length),5000);return()=>window.clearInterval(timer)},[items.length]);

 const item=items[current];
 if(loading&&!item)return <div className="grid h-full place-items-center text-white/40"><RefreshCw className="animate-spin" size={24}/></div>;
 if(!item)return <div className="grid h-full place-items-center text-center text-white/45">Portfolio is temporarily unavailable.</div>;

 return <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 md:px-8">
  <motion.div className="absolute h-80 w-80 rounded-full opacity-20" style={{background:'radial-gradient(circle, rgba(127,86,214,.45) 0%, transparent 70%)',filter:'blur(70px)'}} animate={{x:[0,80,0],y:[0,-40,0],scale:[1,1.25,1]}} transition={{duration:14,repeat:Infinity,ease:'easeInOut'}}/>
  <motion.article key={item.id} initial={{opacity:0,scale:.86,rotateY:-18}} animate={{opacity:1,scale:1,rotateY:0}} transition={{duration:.7,ease:[.22,1,.36,1]}} className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.055] p-5 shadow-[0_25px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-8">
   <div className="absolute inset-0 bg-gradient-to-br from-white/[.08] via-transparent to-[#7f56d6]/10 pointer-events-none"/>
   <div className="relative z-10 grid gap-7 md:grid-cols-[1.05fr_.95fr] md:items-center">
    <div className="flex min-h-[250px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-6 md:min-h-[310px]">
     {item.image?<ImageWithFallback src={item.image} alt={item.title} className="max-h-[280px] w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,.35)]"/>:<div className="text-center"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#ffde59]">New portfolio work</p><h3 className="mt-4 text-3xl font-black text-white md:text-4xl">{item.title}</h3><p className="mt-3 text-sm text-white/40">Image coming soon</p></div>}
    </div>
    <div>
     <p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffde59]">Recent work · live from admin</p>
     <h3 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">{item.title}</h3>
     <p className="mt-4 text-sm leading-7 text-white/50 md:text-base">{item.subtitle}</p>
     <div className="mt-7 flex items-center gap-2 text-xs text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-[#ffde59]"/> Published from BlueHaven Admin</div>
    </div>
   </div>
  </motion.article>
  {items.length>1&&<><button type="button" aria-label="Previous portfolio project" onClick={()=>setCurrent(v=>(v-1+items.length)%items.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:left-6"><ChevronLeft size={18}/></button><button type="button" aria-label="Next portfolio project" onClick={()=>setCurrent(v=>(v+1)%items.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:right-6"><ChevronRight size={18}/></button></>}
  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">{items.slice(0,12).map((_,i)=><button key={i} type="button" aria-label={`Go to portfolio project ${i+1}`} onClick={()=>setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i===current?'w-7 bg-[#ffde59]':'w-1.5 bg-white/20'}`}/>)}</div>
  {failed&&<button type="button" onClick={()=>void load()} className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50 backdrop-blur-md hover:text-white">Retry</button>}
 </div>;
}
