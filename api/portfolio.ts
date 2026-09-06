import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { safeSlug, validateUpload } from '../src/lib/adminValidation.js';

type Req={method?:string;url?:string;headers?:Record<string,string|undefined>;body?:unknown};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;json:(d:unknown)=>void;end:(d?:unknown)=>void};
type Layout='portrait'|'landscape'|'square';
const MAX_UPLOAD_BYTES=20*1024*1024;

const sql=()=>{if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');return neon(process.env.DATABASE_URL)};
const secret=()=>process.env.BLUEHAVEN_ADMIN_PASSWORD||process.env.ADMIN_PASSWORD||'';
const cookie=(r:Req)=>r.headers?.cookie||r.headers?.Cookie||'';
const auth=(r:Req)=>{const raw=cookie(r).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];if(!raw||!secret())return false;const p=raw.split('.');if(p.length!==3)return false;const e=Buffer.from(createHmac('sha256',secret()).update(`${p[0]}.${p[1]}`).digest('base64url')),a=Buffer.from(p[2]);return a.length===e.length&&timingSafeEqual(a,e)};
const body=(r:Req)=>{if(r.body&&typeof r.body==='object')return r.body as Record<string,unknown>;if(typeof r.body==='string'){try{return JSON.parse(r.body)}catch{}}return {}};
const send=(res:Res,d:unknown,s=200)=>{res.status(s).setHeader('content-type','application/json');res.setHeader('cache-control','no-store');res.json(d)};
const params=(r:Req)=>new URL(r.url||'/','https://bluehaven.local').searchParams;
const layoutOf=(value:unknown):Layout=>{const v=typeof value==='object'&&value!==null?String((value as Record<string,unknown>).aspectRatio||''):String(value||'');return v==='portrait'||v==='square'||v==='landscape'?v:'landscape'};
const safeFile=(name:string)=>name.replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-120)||'upload';
const decodeDataUrl=(value:unknown)=>{const m=String(value||'').match(/^data:([^;]+);base64,(.+)$/s);if(!m)throw new Error('Invalid image data');return {mime:m[1],bytes:Buffer.from(m[2],'base64')}};

async function visible(db:any){
 const projects=await db`SELECT id,slug,name,category,description,website_url,visible,sort_order,gallery_layout,created_at,updated_at FROM portfolio_projects WHERE visible=true ORDER BY sort_order,created_at DESC`;
 const ids=(projects as any[]).map(p=>p.id);
 const media=ids.length?await db`SELECT id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,file_name,mime_type FROM portfolio_media WHERE project_id=ANY(${ids}) AND file_name IS NOT NULL ORDER BY sort_order,created_at`:[];
 return (projects as any[]).map(p=>({...p,gallery_layout:layoutOf(p.gallery_layout),media:(media as any[]).filter(m=>m.project_id===p.id).map(m=>({...m,storage_url:m.file_name?`/api/media?id=${m.id}`:m.storage_url}))})).filter(p=>p.media.length);
}

export default async function handler(req:Req,res:Res){
 try{
  const db=sql();const q=params(req);
  if(req.method==='GET'&&q.get('mode')==='public'){try{return send(res,{projects:await visible(db)})}catch{return send(res,{projects:[],fallback:true})}}
  if(!auth(req))return send(res,{error:'Unauthorized'},401);
  if(req.method==='GET'){
   const projects=await db`SELECT id,slug,name,category,description,website_url,visible,sort_order,gallery_layout,created_at,updated_at FROM portfolio_projects ORDER BY sort_order,created_at DESC`;
   const media=await db`SELECT id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,file_name,mime_type FROM portfolio_media ORDER BY project_id,sort_order,created_at`;
   return send(res,{projects:(projects as any[]).map(p=>({...p,gallery_layout:layoutOf(p.gallery_layout)})),media:(media as any[]).map(m=>({...m,storage_url:m.file_name?`/api/media?id=${m.id}`:m.storage_url}))});
  }
  if(req.method!=='POST')return send(res,{error:'Method not allowed'},405);
  const b=body(req);
  if(b.action==='create'){
   const name=String(b.name||'').trim().slice(0,120);if(!name)return send(res,{error:'Project name is required'},400);
   const layout=layoutOf(b.gallery_layout),id=randomUUID(),slug=safeSlug(String(b.slug||name));
   const max=await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_projects`,order=Number((max as any[])[0].max)+1;
   await db`INSERT INTO portfolio_projects(id,slug,name,category,description,website_url,visible,sort_order,gallery_layout,created_at,updated_at) VALUES(${id},${slug},${name},${String(b.category||'Graphic Design').slice(0,80)},${String(b.description||'').slice(0,500)},${b.website_url?String(b.website_url).slice(0,500):null},${Boolean(b.visible)},${order},${JSON.stringify({aspectRatio:layout})}::jsonb,NOW(),NOW())`;
   return send(res,{ok:true,id});
  }
  if(b.action==='update'){
   const layoutValue=String(b.gallery_layout||'landscape');if(!['portrait','landscape','square'].includes(layoutValue))return send(res,{error:'Invalid gallery layout'},400);
   await db`UPDATE portfolio_projects SET name=${String(b.name||'').trim().slice(0,120)},category=${String(b.category||'').slice(0,80)},description=${String(b.description||'').slice(0,500)},website_url=${b.website_url?String(b.website_url).slice(0,500):null},visible=${Boolean(b.visible)},gallery_layout=${JSON.stringify({aspectRatio:layoutValue})}::jsonb,updated_at=NOW() WHERE id=${String(b.id)}`;
   return send(res,{ok:true});
  }
  if(b.action==='toggle'){await db`UPDATE portfolio_projects SET visible=NOT visible,updated_at=NOW() WHERE id=${String(b.id)}`;return send(res,{ok:true});}
  if(b.action==='reorder'){
   const ids=Array.isArray(b.ids)?b.ids.map(String).filter(Boolean).slice(0,100):[];
   for(let i=0;i<ids.length;i++)await db`UPDATE portfolio_projects SET sort_order=${10000+i},updated_at=NOW() WHERE id=${ids[i]}`;
   for(let i=0;i<ids.length;i++)await db`UPDATE portfolio_projects SET sort_order=${i},updated_at=NOW() WHERE id=${ids[i]}`;
   return send(res,{ok:true});
  }
  if(b.action==='reorder_media'){
   const ids=Array.isArray(b.ids)?b.ids.map(String).filter(Boolean).slice(0,100):[];const projectId=String(b.project_id||'');if(!projectId)return send(res,{error:'Project is required'},400);
   for(let i=0;i<ids.length;i++)await db`UPDATE portfolio_media SET sort_order=${10000+i},featured=${i===0},updated_at=NOW() WHERE id=${ids[i]} AND project_id=${projectId}`;
   for(let i=0;i<ids.length;i++)await db`UPDATE portfolio_media SET sort_order=${i},featured=${i===0},updated_at=NOW() WHERE id=${ids[i]} AND project_id=${projectId}`;
   return send(res,{ok:true});
  }
  if(b.action==='delete_media'){
   await db`DELETE FROM portfolio_media WHERE id=${String(b.id)}`;
   return send(res,{ok:true});
  }
  if(b.action==='delete'){await db`DELETE FROM portfolio_projects WHERE id=${String(b.id)}`;return send(res,{ok:true});}
  if(b.action==='upload_chunk'){
   const uploadId=String(b.upload_id||''),projectId=String(b.project_id||''),chunkIndex=Number(b.chunk_index),totalChunks=Number(b.total_chunks),totalSize=Number(b.total_size),fileName=safeFile(String(b.file_name||'upload'));
   if(!uploadId||!projectId||!Number.isInteger(chunkIndex)||!Number.isInteger(totalChunks)||chunkIndex<0||chunkIndex>=totalChunks||totalChunks<1||totalSize<1||totalSize>MAX_UPLOAD_BYTES)return send(res,{error:'Invalid upload metadata'},400);
   const {mime,bytes}=decodeDataUrl(b.data_url);if(bytes.length===0)return send(res,{error:'Empty upload chunk'},400);if(!['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'].includes(mime))return send(res,{error:'Unsupported image type'},400);
   const exists=await db`SELECT id FROM portfolio_projects WHERE id=${projectId} LIMIT 1`;if(!(exists as any[])[0])return send(res,{error:'Project not found'},404);
   if(chunkIndex===0){
    await db`INSERT INTO portfolio_media(id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,created_at,updated_at,file_data,file_name,mime_type) VALUES(${uploadId},${projectId},NULL,NULL,${String(b.alt_text||'BlueHaven Studio work').slice(0,180)},'image',-1,false,NOW(),NOW(),${bytes},NULL,${mime}) ON CONFLICT (id) DO UPDATE SET file_data=EXCLUDED.file_data,mime_type=EXCLUDED.mime_type,updated_at=NOW()`;
   }else{
    const updated=await db`UPDATE portfolio_media SET file_data=COALESCE(file_data,decode('','hex')) || ${bytes},updated_at=NOW() WHERE id=${uploadId} AND project_id=${projectId} AND file_name IS NULL RETURNING id`;
    if(!(updated as any[])[0])return send(res,{error:'Upload session not found'},409);
   }
   return send(res,{ok:true,chunk_index:chunkIndex,total_chunks:totalChunks});
  }
  if(b.action==='finalize_upload'){
   const uploadId=String(b.upload_id||''),projectId=String(b.project_id||''),fileName=safeFile(String(b.file_name||'upload')),mime=String(b.mime_type||''),totalSize=Number(b.total_size);
   if(!uploadId||!projectId||!fileName||totalSize<1||totalSize>MAX_UPLOAD_BYTES)return send(res,{error:'Invalid upload metadata'},400);
   if(!['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'].includes(mime))return send(res,{error:'Unsupported image type'},400);
   const rows=await db`SELECT octet_length(file_data) AS bytes FROM portfolio_media WHERE id=${uploadId} AND project_id=${projectId} AND file_name IS NULL LIMIT 1` as any[];
   if(!rows[0])return send(res,{error:'Upload session not found'},404);
   if(Number(rows[0].bytes)!==totalSize)return send(res,{error:`Upload incomplete: received ${Number(rows[0].bytes)} of ${totalSize} bytes`},409);
   const next=await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_media WHERE project_id=${projectId} AND file_name IS NOT NULL`,order=Number((next as any[])[0].max)+1;
   await db`UPDATE portfolio_media SET file_name=${fileName},mime_type=${mime},sort_order=${order},featured=${order===0},updated_at=NOW() WHERE id=${uploadId} AND project_id=${projectId}`;
   return send(res,{ok:true,id:uploadId,url:`/api/media?id=${uploadId}`});
  }
  if(b.action==='upload'){
   const {mime,bytes}=decodeDataUrl(b.data_url);const validation=validateUpload(mime,bytes.byteLength);if(validation)return send(res,{error:validation},bytes.byteLength>MAX_UPLOAD_BYTES?413:400);
   const id=randomUUID(),projectId=String(b.project_id);const exists=await db`SELECT id FROM portfolio_projects WHERE id=${projectId} LIMIT 1`;if(!(exists as any[])[0])return send(res,{error:'Project not found'},404);
   const next=await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_media WHERE project_id=${projectId}`,order=Number((next as any[])[0].max)+1;
   const fileName=safeFile(String(b.file_name||`upload-${id}`));
   await db`INSERT INTO portfolio_media(id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,created_at,updated_at,file_data,file_name,mime_type) VALUES(${id},${projectId},NULL,NULL,${String(b.alt_text||'BlueHaven Studio work').slice(0,180)},'image',${order},${order===0},NOW(),NOW(),${bytes},${fileName},${mime})`;
   return send(res,{ok:true,id,url:`/api/media?id=${id}`});
  }
  return send(res,{error:'Unknown action'},400);
 }catch(e){console.error('BlueHaven portfolio API error:',e);return send(res,{error:e instanceof Error?e.message:'Server error'},500)}
}
