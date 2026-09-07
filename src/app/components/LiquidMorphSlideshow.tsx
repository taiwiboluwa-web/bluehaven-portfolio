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

export function LiquidMorphSlideshow(){
 const [projects,setProjects]=useState<DbProject[]>([]);
 const [currentSlide,setCurrentSlide]=useState(0);
 const [loading,setLoading]=useState(true);
 const [failed,setFailed]=useState(false);
 const portfolioItems=useMemo(()=>buildPortfolioItems(projects,legacyFallbacks),[projects]);

 const loadPortfolio=async()=>{
  setLoading(true);setFailed(false);
  try{
   const response=await fetch('/api/portfolio?mode=public',{cache:'no-store'});
   if(!response.ok)throw new Error('Portfolio request failed');
   const data=await response.json();
   setProjects(Array.isArray(data.projects)?data.projects:[]);
  }catch{
   setFailed(true);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{void loadPortfolio()},[]);
 useEffect(()=>{if(currentSlide>=portfolioItems.length)setCurrentSlide(0)},[currentSlide,portfolioItems.length]);
 useEffect(()=>{
  if(portfolioItems.length<2)return;
  const timer=window.setInterval(()=>setCurrentSlide(prev=>(prev+1)%portfolioItems.length),5000);
  return()=>window.clearInterval(timer);
 },[portfolioItems.length]);

 if(loading&&!portfolioItems.length)return <div className="grid h-full place-items-center text-white/40"><RefreshCw className="animate-spin" size={28}/></div>;
 if(!portfolioItems.length)return <div className="grid h-full place-items-center text-center text-white/45">Portfolio is temporarily unavailable.</div>;

 const currentItem=portfolioItems[currentSlide];
 return <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
  <motion.div className="absolute h-[400px] w-[400px] rounded-full opacity-20 pointer-events-none" style={{background:'radial-gradient(circle, rgba(127,86,214,.45) 0%, transparent 70%)',filter:'blur(80px)',left:'10%',top:'20%'}} animate={{x:[0,100,0],y:[0,80,0],scale:[1,1.3,1]}} transition={{duration:15,repeat:Infinity,ease:'easeInOut'}}/>
  <motion.div className="absolute h-[350px] w-[350px] rounded-full opacity-15 pointer-events-none" style={{background:'radial-gradient(circle, rgba(255,222,89,.35) 0%, transparent 70%)',filter:'blur(70px)',right:'15%',bottom:'25%'}} animate={{x:[0,-80,0],y:[0,60,0],scale:[1,1.4,1]}} transition={{duration:18,repeat:Infinity,ease:'easeInOut'}}/>

  <motion.div key={currentItem.id} initial={{opacity:0,scale:.72,rotateY:-35,filter:'blur(10px)'}} animate={{opacity:1,scale:1,rotateY:0,filter:'blur(0px)'}} transition={{duration:.9,ease:[.68,-.55,.265,1.55]}} className="relative w-full max-w-lg" style={{transformStyle:'preserve-3d',perspective:'1200px'}}>
   <motion.div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.07] shadow-[0_20px_60px_rgba(0,0,0,.45)] backdrop-blur-2xl" animate={{borderRadius:['40% 60% 65% 35% / 40% 50% 50% 60%','60% 40% 35% 65% / 60% 50% 50% 40%','45% 55% 50% 50% / 55% 45% 55% 45%','40% 60% 65% 35% / 40% 50% 50% 60%']}} transition={{duration:12,repeat:Infinity,ease:'easeInOut'}}>
    <motion.div className="absolute inset-0" style={{background:'radial-gradient(circle at 50% 50%, rgba(127,86,214,.25) 0%, transparent 60%)'}} animate={{scale:[1,1.5,1.2,1],opacity:[.3,.6,.4,.3],x:[0,20,-10,0],y:[0,-15,10,0]}} transition={{duration:8,repeat:Infinity,ease:'easeInOut'}}/>
    <motion.div className="absolute inset-0 opacity-30" style={{background:'linear-gradient(120deg,transparent 0%,rgba(255,255,255,.35) 50%,transparent 100%)',backgroundSize:'200% 200%'}} animate={{backgroundPosition:['0% 0%','200% 200%','0% 0%']}} transition={{duration:4,repeat:Infinity,ease:'linear'}}/>
    <div className="relative z-10 p-7 md:p-10">
     <div className="mb-7 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-6 md:min-h-[300px]">
      {currentItem.image?<ImageWithFallback src={currentItem.image} alt={currentItem.title} className="max-h-[260px] w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,.35)]"/>:<div className="text-center"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#ffde59]">New portfolio work</p><h3 className="mt-4 text-3xl font-black text-white md:text-4xl">{currentItem.title}</h3><p className="mt-3 text-sm text-white/40">Image coming soon</p></div>}
     </div>
     <p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffde59]">Live from BlueHaven Admin</p>
     <h3 className="mt-2 text-3xl font-black leading-tight text-white md:text-4xl">{currentItem.title}</h3>
     <p className="mt-3 text-sm leading-6 text-white/50">{currentItem.subtitle}</p>
     <div className="mt-6 flex items-center justify-between gap-4"><span className="text-xs text-white/30">{currentSlide+1} / {portfolioItems.length}</span>{failed?<button type="button" onClick={()=>void loadPortfolio()} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white">Retry</button>:<span className="text-xs text-white/30">Updates automatically</span>}</div>
    </div>
   </motion.div>
  </motion.div>

  {portfolioItems.length>1&&<><button type="button" aria-label="Previous portfolio project" onClick={()=>setCurrentSlide(v=>(v-1+portfolioItems.length)%portfolioItems.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:left-6"><ChevronLeft size={18}/></button><button type="button" aria-label="Next portfolio project" onClick={()=>setCurrentSlide(v=>(v+1)%portfolioItems.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:right-6"><ChevronRight size={18}/></button></>}
  <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1.5">{portfolioItems.slice(0,12).map((_,i)=><button key={i} type="button" aria-label={`Go to portfolio project ${i+1}`} onClick={()=>setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i===currentSlide?'w-7 bg-[#ffde59]':'w-1.5 bg-white/20'}`}/>)}</div>
 </div>;
}
