import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { safeSlug } from '../src/lib/adminValidation.js';
import { readPortfolioManifest, updatePortfolioManifest } from '../src/lib/blobPortfolioManifest.js';

type Req={method?:string;url?:string;headers?:Record<string,string|undefined>;body?:unknown};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;json:(d:unknown)=>void;end:(d?:unknown)=>void};
type Layout='portrait'|'landscape'|'square';
const secret=()=>process.env.BLUEHAVEN_ADMIN_PASSWORD||process.env.ADMIN_PASSWORD||'';
const cookie=(r:Req)=>r.headers?.cookie||r.headers?.Cookie||'';
const auth=(r:Req)=>{const raw=cookie(r).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];if(!raw||!secret())return false;const p=raw.split('.');if(p.length!==3)return false;const e=Buffer.from(createHmac('sha256',secret()).update(`${p[0]}.${p[1]}`).digest('base64url')),a=Buffer.from(p[2]);return a.length===e.length&&timingSafeEqual(a,e)};
const body=(r:Req)=>{if(r.body&&typeof r.body==='object')return r.body as Record<string,unknown>;if(typeof r.body==='string'){try{return JSON.parse(r.body)}catch{}}return {}};
const send=(res:Res,d:unknown,s=200)=>{res.status(s).setHeader('content-type','application/json');res.setHeader('cache-control','no-store');res.json(d)};
const params=(r:Req)=>new URL(r.url||'/','https://bluehaven.local').searchParams;
const layoutOf=(v:unknown):Layout=>{const x=typeof v==='object'&&v!==null?String((v as any).aspectRatio||''):String(v||'');return x==='portrait'||x==='square'||x==='landscape'?x:'landscape'};
const isBlobUrl=(v:unknown)=>/^https:\/\/[^\s]+\.blob\.vercel-storage\.com\//.test(String(v||''));
const publicManifest=async()=>{const m=await readPortfolioManifest();return m.projects.filter(p=>p.visible).sort((a,b)=>a.sort_order-b.sort_order||a.created_at.localeCompare(b.created_at)).map(p=>({...p,media:m.media.filter(x=>x.project_id===p.id).sort((a,b)=>a.sort_order-b.sort_order)}));};
const adminManifest=async()=>{const m=await readPortfolioManifest();return {projects:m.projects.sort((a,b)=>a.sort_order-b.sort_order),media:m.media.sort((a,b)=>a.project_id.localeCompare(b.project_id)||a.sort_order-b.sort_order)};};

export default async function handler(req:Req,res:Res){
 const q=params(req);
 if(req.method==='GET'&&q.get('mode')==='public')return send(res,{projects:await publicManifest(),storage:'vercel-blob',neonAvailable:false});
 if(!auth(req))return send(res,{error:'Unauthorized'},401);
 if(req.method==='GET')return send(res,{...(await adminManifest()),storage:'vercel-blob',neonAvailable:false,notice:'Portfolio data is stored in Vercel Blob. Neon is not used by the live portfolio.'});
 if(req.method!=='POST')return send(res,{error:'Method not allowed'},405);
 const b=body(req);
 try{
  if(b.action==='create'){const name=String(b.name||'').trim().slice(0,120);if(!name)return send(res,{error:'Project name is required'},400);const id=randomUUID(),now=new Date().toISOString(),layout=layoutOf(b.gallery_layout);await updatePortfolioManifest(m=>({version:1,projects:[...m.projects,{id,slug:safeSlug(String(b.slug||name)),name,category:String(b.category||'Graphic Design').slice(0,80),description:String(b.description||'').slice(0,500),website_url:b.website_url?String(b.website_url).slice(0,500):null,visible:b.visible===undefined?true:Boolean(b.visible),sort_order:m.projects.length,gallery_layout:layout,created_at:now,updated_at:now}],media:m.media}));return send(res,{ok:true,id,storage:'vercel-blob'});}
  if(b.action==='update'){const id=String(b.id),layout=layoutOf(b.gallery_layout),now=new Date().toISOString();await updatePortfolioManifest(m=>({...m,projects:m.projects.map(p=>p.id===id?{...p,name:String(b.name||'').trim().slice(0,120),category:String(b.category||'').slice(0,80),description:String(b.description||'').slice(0,500),website_url:b.website_url?String(b.website_url).slice(0,500):null,visible:Boolean(b.visible),gallery_layout:layout,updated_at:now}:p)}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='toggle'){const id=String(b.id);await updatePortfolioManifest(m=>({...m,projects:m.projects.map(p=>p.id===id?{...p,visible:!p.visible,updated_at:new Date().toISOString()}:p)}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='reorder'){const ids=Array.isArray(b.ids)?b.ids.map(String):[];await updatePortfolioManifest(m=>({...m,projects:m.projects.map(p=>{const i=ids.indexOf(p.id);return i<0?p:{...p,sort_order:i,updated_at:new Date().toISOString()}})}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='reorder_media'){const ids=Array.isArray(b.ids)?b.ids.map(String):[],projectId=String(b.project_id||'');await updatePortfolioManifest(m=>({...m,media:m.media.map(x=>{const i=ids.indexOf(x.id);return x.project_id===projectId&&i>=0?{...x,sort_order:i,featured:i===0}:x})}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='delete_media'){const id=String(b.id);await updatePortfolioManifest(m=>({...m,media:m.media.filter(x=>x.id!==id)}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='delete'){const id=String(b.id);await updatePortfolioManifest(m=>({...m,projects:m.projects.filter(x=>x.id!==id),media:m.media.filter(x=>x.project_id!==id)}));return send(res,{ok:true,storage:'vercel-blob'});}
  if(b.action==='upload'||b.action==='optimize_existing'||b.action==='upload_chunk'||b.action==='finalize_upload')return send(res,{error:'Use the Vercel Blob upload flow. Live image bytes are never stored in Neon.',storage:'vercel-blob'},410);
  return send(res,{error:'Unknown action'},400);
 }catch(e){console.error('BlueHaven portfolio API error:',e);return send(res,{error:e instanceof Error?e.message:'Server error'},500)}
}
