import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const connection = process.env.DATABASE_URL || process.env.BluehavenStudios || '';
const sql = connection ? neon(connection) : null;
const COOKIE = 'bluehaven_admin';
const password = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const sign = value => crypto.createHmac('sha256', password()).update(value).digest('hex');
const cookieValue = req => { const raw=req.headers.cookie||''; const found=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE}=`)); return found ? decodeURIComponent(found.slice(COOKIE.length+1)) : ''; };
const isAuthed = req => Boolean(password()) && cookieValue(req) === sign('admin');
const setAuth = res => res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(sign('admin'))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);
const clearAuth = res => res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
async function body(req){if(req.body)return typeof req.body==='string'?JSON.parse(req.body):req.body;return new Promise((resolve,reject)=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{});}catch(e){reject(e);}});req.on('error',reject);});}
const validImageDataUrl = value => typeof value === 'string' && /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(value) && value.length <= 4_500_000;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='POST' && req.url.split('?')[0].endsWith('/api/admin.js')){
    let data;try{data=await body(req)}catch{return res.status(400).json({error:'Invalid JSON.'})}
    if(data.action==='login'){if(!password())return res.status(503).json({error:'Admin password is not configured in Vercel.'});if(!data.password||data.password!==password())return res.status(401).json({error:'Incorrect password.'});setAuth(res);return res.status(200).json({ok:true})}
    if(data.action==='logout'){clearAuth(res);return res.status(200).json({ok:true})}
  }
  if(!isAuthed(req))return res.status(401).json({error:password()?'Unauthorized.':'Admin password is not configured in Vercel.'});
  if(!sql)return res.status(503).json({error:'Neon database environment variable is not configured.'});
  try{
    if(req.method==='GET'){
      const [projects,sections,settings]=await Promise.all([
        sql`SELECT p.id,p.slug,p.name,p.category,p.description,p.website_url,p.visible,p.sort_order,p.gallery_layout,COALESCE(json_agg(json_build_object('id',m.id,'url',m.storage_url,'storageKey',m.storage_key,'alt',m.alt_text,'type',m.media_type,'order',m.sort_order,'featured',m.featured) ORDER BY m.sort_order,m.created_at) FILTER (WHERE m.id IS NOT NULL),'[]'::json) AS media FROM portfolio_projects p LEFT JOIN portfolio_media m ON m.project_id=p.id GROUP BY p.id ORDER BY p.sort_order,p.created_at`,
        sql`SELECT id,section_key,label,visible,sort_order,layout,content FROM site_sections ORDER BY sort_order,label`,
        sql`SELECT setting_key,setting_value FROM site_settings ORDER BY setting_key`
      ]);
      return res.status(200).json({projects,sections,settings:Object.fromEntries(settings.map(s=>[s.setting_key,s.setting_value]))});
    }
    const data=await body(req);
    if(data.action==='saveProject'){
      if(!data.name||!data.slug)return res.status(400).json({error:'Project name and slug are required.'});
      const gallery=data.galleryLayout || {type:'grid',columns:3,gap:'comfortable',aspectRatio:'landscape',featured:'first'};
      if(gallery.logoUrl && !validImageDataUrl(gallery.logoUrl) && !/^https?:\/\//i.test(gallery.logoUrl))return res.status(400).json({error:'Invalid project logo.'});
      if(data.id)await sql`UPDATE portfolio_projects SET name=${data.name},slug=${data.slug},category=${data.category||null},description=${data.description||null},website_url=${data.websiteUrl||null},visible=${data.visible!==false},sort_order=${Number(data.sortOrder)||0},gallery_layout=${gallery},updated_at=now() WHERE id=${data.id}`;
      else await sql`INSERT INTO portfolio_projects(slug,name,category,description,website_url,visible,sort_order,gallery_layout) VALUES(${data.slug},${data.name},${data.category||null},${data.description||null},${data.websiteUrl||null},${data.visible!==false},${Number(data.sortOrder)||0},${gallery})`;
      return res.status(200).json({ok:true});
    }
    if(data.action==='saveProjectLogo'){
      if(!data.projectId||!validImageDataUrl(data.logoUrl))return res.status(400).json({error:'A valid image from your device is required.'});
      const current=(await sql`SELECT gallery_layout FROM portfolio_projects WHERE id=${data.projectId}`)[0];
      if(!current)return res.status(404).json({error:'Project not found.'});
      const layout={...(current.gallery_layout||{}),logoUrl:data.logoUrl};
      await sql`UPDATE portfolio_projects SET gallery_layout=${layout},updated_at=now() WHERE id=${data.projectId}`;
      return res.status(200).json({ok:true,logoUrl:data.logoUrl});
    }
    if(data.action==='removeProjectLogo'){
      const current=(await sql`SELECT gallery_layout FROM portfolio_projects WHERE id=${data.projectId}`)[0];
      if(!current)return res.status(404).json({error:'Project not found.'});
      const layout={...(current.gallery_layout||{})};delete layout.logoUrl;
      await sql`UPDATE portfolio_projects SET gallery_layout=${layout},updated_at=now() WHERE id=${data.projectId}`;
      return res.status(200).json({ok:true});
    }
    if(data.action==='deleteProject'){await sql`DELETE FROM portfolio_projects WHERE id=${data.id}`;return res.status(200).json({ok:true})}
    if(data.action==='saveMedia'){
      if(!data.projectId||!data.url)return res.status(400).json({error:'Project and image URL are required.'});
      if(/^data:image\//i.test(data.url)&&!validImageDataUrl(data.url))return res.status(400).json({error:'Device image is too large or unsupported. Please use an image under 3 MB.'});
      let row;
      if(data.id){row=(await sql`UPDATE portfolio_media SET storage_url=${data.url},storage_key=${data.storageKey||null},alt_text=${data.alt||null},media_type=${data.type||'image'},sort_order=${Number.isFinite(Number(data.order))?Number(data.order):0},featured=${Boolean(data.featured)},updated_at=now() WHERE id=${data.id} RETURNING id,storage_url AS url,storage_key AS "storageKey",alt_text AS alt,media_type AS type,sort_order AS "order",featured`)[0];}
      else {const next=(await sql`SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM portfolio_media WHERE project_id=${data.projectId}`)[0].next;row=(await sql`INSERT INTO portfolio_media(project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured) VALUES(${data.projectId},${data.url},${data.storageKey||null},${data.alt||null},${data.type||'image'},${data.order===undefined?Number(next):Number(data.order)||0},${Boolean(data.featured)}) RETURNING id,storage_url AS url,storage_key AS "storageKey",alt_text AS alt,media_type AS type,sort_order AS "order",featured`)[0];}
      return res.status(200).json({ok:true,media:row});
    }
    if(data.action==='deleteMedia'){await sql`DELETE FROM portfolio_media WHERE id=${data.id}`;return res.status(200).json({ok:true})}
    if(data.action==='saveSection'){
      if(!data.id)return res.status(400).json({error:'Section id is required.'});
      const current=(await sql`SELECT layout,content,visible,sort_order FROM site_sections WHERE id=${data.id}`)[0];if(!current)return res.status(404).json({error:'Section not found.'});
      const layout=data.layout===undefined?current.layout:{...(current.layout||{}),...(data.layout||{})};const content=data.content===undefined?current.content:{...(current.content||{}),...(data.content||{})};
      await sql`UPDATE site_sections SET visible=${data.visible===undefined?current.visible:Boolean(data.visible)},sort_order=${data.sortOrder===undefined?current.sort_order:Number(data.sortOrder)||0},layout=${layout},content=${content},updated_at=now() WHERE id=${data.id}`;return res.status(200).json({ok:true});
    }
    if(data.action==='saveSetting'){if(!data.key)return res.status(400).json({error:'Setting key is required.'});await sql`INSERT INTO site_settings(setting_key,setting_value,updated_at) VALUES(${data.key},${data.value||{}},now()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=now()`;return res.status(200).json({ok:true})}
    if(data.action==='reorderSections'){const order=Array.isArray(data.ids)?data.ids:[];for(let i=0;i<order.length;i++)await sql`UPDATE site_sections SET sort_order=${(i+1)*10},updated_at=now() WHERE id=${order[i]}`;return res.status(200).json({ok:true})}
    return res.status(400).json({error:'Unknown action.'});
  }catch(error){console.error('admin api error',error);return res.status(500).json({error:error?.message||'Admin operation failed.'})}
}
