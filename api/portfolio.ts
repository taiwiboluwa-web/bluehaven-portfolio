import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { safeSlug, validateUpload } from '../src/lib/adminValidation';

const COOKIE='bluehaven_admin';
const sql=()=>{if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');return neon(process.env.DATABASE_URL)};
const sign=(v:string)=>createHmac('sha256',process.env.ADMIN_PASSWORD||'').update(v).digest('base64url');
function auth(req:Request){const raw=req.headers.get('cookie')?.match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];if(!raw||!process.env.ADMIN_PASSWORD)return false;const p=raw.split('.');if(p.length!==3)return false;try{return timingSafeEqual(Buffer.from(p[2]),Buffer.from(sign(`${p[0]}.${p[1]}`)))}catch{return false}}
const json=(d:unknown,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});

async function visible(db:ReturnType<typeof neon>){
 const projects=await db`SELECT id,slug,name,category,description,website_url,visible,sort_order,created_at,updated_at FROM portfolio_projects WHERE visible=true ORDER BY sort_order,created_at DESC`;
 const ids=(projects as any[]).map(p=>p.id);const media=ids.length?await db`SELECT id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,file_name,mime_type FROM portfolio_media WHERE project_id=ANY(${ids}) ORDER BY sort_order,created_at`:[];
 return (projects as any[]).map(p=>({...p,media:(media as any[]).filter(m=>m.project_id===p.id).map(m=>({...m,storage_url:m.file_name?`/api/media?id=${m.id}`:m.storage_url}))}));
}

export default async function handler(req:Request){
 let db;try{db=sql()}catch(e){return req.method==='GET'&&new URL(req.url).searchParams.get('mode')==='public'?json({projects:[],fallback:true}):json({error:String(e).replace('Error: ','')},503)}
 if(req.method==='GET'&&new URL(req.url).searchParams.get('mode')==='public'){try{return json({projects:await visible(db)})}catch{return json({projects:[],fallback:true})}}
 if(!auth(req))return json({error:'Unauthorized'},401);
 try{
  if(req.method==='GET'){const projects=await db`SELECT id,slug,name,category,description,website_url,visible,sort_order,created_at,updated_at FROM portfolio_projects ORDER BY sort_order,created_at DESC`;const media=await db`SELECT id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,file_name,mime_type FROM portfolio_media ORDER BY sort_order,created_at`;return json({projects,media:(media as any[]).map(m=>({...m,storage_url:m.file_name?`/api/media?id=${m.id}`:m.storage_url}))})}
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const b=await req.json();
  if(b.action==='create'){const name=String(b.name||'').trim().slice(0,120);if(!name)return json({error:'Project name is required'},400);const id=randomUUID();const slug=safeSlug(String(b.slug||name));const max=await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_projects`;const order=Number((max as any[])[0].max)+1;await db`INSERT INTO portfolio_projects(id,slug,name,category,description,website_url,visible,sort_order,gallery_layout,created_at,updated_at) VALUES(${id},${slug},${name},${String(b.category||'Graphic Design').slice(0,80)},${String(b.description||'').slice(0,500)},${b.website_url?String(b.website_url).slice(0,500):null},${Boolean(b.visible)},${order},'{}'::jsonb,NOW(),NOW())`;return json({ok:true,id})}
  if(b.action==='update'){await db`UPDATE portfolio_projects SET name=${String(b.name||'').slice(0,120)},category=${String(b.category||'').slice(0,80)},description=${String(b.description||'').slice(0,500)},website_url=${b.website_url?String(b.website_url).slice(0,500):null},visible=${Boolean(b.visible)},updated_at=NOW() WHERE id=${String(b.id)}`;return json({ok:true})}
  if(b.action==='toggle'){await db`UPDATE portfolio_projects SET visible=NOT visible,updated_at=NOW() WHERE id=${String(b.id)}`;return json({ok:true})}
  if(b.action==='reorder'){const ids=Array.isArray(b.ids)?b.ids.map(String).slice(0,100):[];for(let i=0;i<ids.length;i++)await db`UPDATE portfolio_projects SET sort_order=${i},updated_at=NOW() WHERE id=${ids[i]}`;return json({ok:true})}
  if(b.action==='delete'){await db`DELETE FROM portfolio_projects WHERE id=${String(b.id)}`;return json({ok:true})}
  if(b.action==='upload'){const data=String(b.data_url||'').match(/^data:([^;]+);base64,(.+)$/s);if(!data)return json({error:'Invalid image data'},400);const mime=data[1],bytes=Buffer.from(data[2],'base64'),validation=validateUpload(mime,bytes.byteLength);if(validation)return json({error:validation},bytes.byteLength>3*1024*1024?413:400);const id=randomUUID(),projectId=String(b.project_id),next=await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_media WHERE project_id=${projectId}`,order=Number((next as any[])[0].max)+1;await db`INSERT INTO portfolio_media(id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,created_at,updated_at,file_data,file_name,mime_type) VALUES(${id},${projectId},${`/api/media?id=${id}`},${id},${String(b.alt_text||'BlueHaven Studio work').slice(0,180)},'image',${order},${order===0},NOW(),NOW(),${bytes},${String(b.file_name||`upload-${id}`).slice(0,180)},${mime})`;return json({ok:true,id,url:`/api/media?id=${id}`})}
  return json({error:'Unknown action'},400);
 }catch(e){console.error(e);return json({error:e instanceof Error?e.message:'Server error'},500)}
}
