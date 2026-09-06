import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

type Project={id:string;name:string;category?:string|null;description?:string|null;media:Array<{id:string;storage_url:string;alt_text?:string|null}>};
const palettes=[['#7f56d9','#ffde59','#fff'],['#ff5c8a','#ffde59','#7f56d9'],['#00d4ff','#7f56d9','#fff'],['#ff7a18','#ffde59','#7f56d9']];

function Skales(){
 const [disabled,setDisabled]=useState(()=>localStorage.getItem('bluehaven-skales-disabled')==='1');
 const [reduced,setReduced]=useState(false),[pos,setPos]=useState({x:8,y:24}),[palette,setPalette]=useState(palettes[0]);
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(m.matches);sync();m.addEventListener?.('change',sync);return()=>m.removeEventListener?.('change',sync)},[]);
 useEffect(()=>{if(disabled||reduced)return;const t=setInterval(()=>{setPos({x:4+Math.random()*88,y:12+Math.random()*72});setPalette(palettes[Math.floor(Math.random()*palettes.length)])},8500);return()=>clearInterval(t)},[disabled,reduced]);
 if(disabled)return null;
 const style={'--a':palette[0],'--b':palette[1],'--c':palette[2]} as CSSProperties;
 return <><motion.div aria-hidden="true" className="pointer-events-none fixed z-[70]" animate={{left:`${pos.x}%`,top:`${pos.y}%`,rotate:pos.x>50?-4:4}} transition={{duration:reduced?0:2.2,ease:'easeInOut'}} style={style}><div className="relative h-11 w-16 rounded-[55%_45%_48%_52%] border border-white/20 bg-[var(--a)] shadow-[0_10px_30px_rgba(0,0,0,.28)]"><i className="absolute -left-4 top-3 h-5 w-7 rounded-full bg-[var(--b)]"/><i className="absolute -right-4 bottom-0 h-8 w-8 rounded-[100%_0_100%_0] border-b-4 border-[var(--b)] rotate-[-35deg]"/><i className="absolute -top-3 left-2 h-5 w-3 rounded-full bg-[var(--c)]"/><i className="absolute -top-3 left-7 h-5 w-3 rounded-full bg-[var(--c)]"/><i className="absolute left-1.5 top-0.5 h-2.5 w-2.5 rounded-full bg-black"/><i className="absolute left-7 top-0.5 h-2.5 w-2.5 rounded-full bg-black"/><i className="absolute left-4 top-5 h-1 w-5 rounded-full bg-black/40"/></div></motion.div><button onClick={()=>{localStorage.setItem('bluehaven-skales-disabled','1');setDisabled(true)}} className="fixed bottom-4 right-4 z-[71] rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-white/65 backdrop-blur-md hover:text-white" aria-label="Disable Skales">Hide Skales</button></>;
}

function RecentWork(){
 const [projects,setProjects]=useState<Project[]>([]),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{const footer=document.querySelector('footer');const node=document.createElement('section');node.id='bluehaven-managed-work';node.className='relative z-10';(footer?.parentElement||document.body).insertBefore(node,footer||null);setHost(node);fetch('/api/portfolio?mode=public').then(r=>r.json()).then(d=>setProjects(d.projects||[])).catch(()=>{});return()=>node.remove()},[]);
 if(!host||!projects.length)return null;
 return createPortal(<section className="mx-auto max-w-7xl px-5 py-24 md:px-10"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[.25em] text-white/45">Latest</p><h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">Recent Work</h2></div><span className="hidden text-xs uppercase tracking-[.2em] text-white/35 md:block">Live from BlueHaven CMS</span></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map(p=>{const image=p.media?.[0];return <article key={p.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-white/20"><div className="aspect-[4/3] overflow-hidden bg-white/5">{image?<img src={image.storage_url} alt={image.alt_text||p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"/>:<div className="grid h-full place-items-center text-white/20">BlueHaven Studios</div>}</div><div className="p-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/40">{p.category||'Creative Work'}</p><h3 className="text-xl font-bold text-white">{p.name}</h3>{p.description&&<p className="mt-2 text-sm leading-6 text-white/55">{p.description}</p>}</div></article>})}</div></section>,host);
}

function AdminFooterLink(){
 const [host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{const t=setInterval(()=>{const footer=document.querySelector('footer');if(!footer)return;const a=Array.from(footer.querySelectorAll('a')).find(x=>/privacy|terms|status/i.test(x.textContent||''));const parent=a?.parentElement||footer;const node=document.createElement('span');node.className='ml-3 inline-flex';parent.appendChild(node);setHost(node);clearInterval(t)},250);return()=>clearInterval(t)},[]);
 return host?createPortal(<a href="/admin" className="text-inherit opacity-70 transition hover:opacity-100 hover:text-white" title="BlueHaven Admin">Admin</a>,host):null;
}

export default function SiteEnhancements(){return <><RecentWork/><AdminFooterLink/><Skales/></>}
