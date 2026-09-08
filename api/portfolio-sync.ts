import { neon } from '@neondatabase/serverless';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readPortfolioManifest } from '../src/lib/blobPortfolioManifest.js';

type Req={method?:string;headers?:Record<string,string|undefined>};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;json:(d:unknown)=>void};
const secret=()=>process.env.BLUEHAVEN_ADMIN_PASSWORD||process.env.ADMIN_PASSWORD||'';
const auth=(r:Req)=>{const raw=r.headers?.cookie||r.headers?.Cookie||'',token=raw.match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1],s=secret();if(!token||!s)return false;const p=token.split('.');if(p.length!==3)return false;const a=Buffer.from(p[2]),b=Buffer.from(createHmac('sha256',s).update(`${p[0]}.${p[1]}`).digest('base64url'));return a.length===b.length&&timingSafeEqual(a,b)};
const send=(res:Res,d:unknown,s=200)=>{res.status(s).setHeader('content-type','application/json');res.json(d)};

export default async function handler(req:Req,res:Res){
 if(req.method!=='POST')return send(res,{error:'Method not allowed'},405);
 if(!auth(req))return send(res,{error:'Unauthorized'},401);
 try{
  const manifest=await readPortfolioManifest();
  const db=neon(process.env.DATABASE_URL!);
  const hasS3=Boolean(process.env.AWS_ACCESS_KEY_ID&&process.env.AWS_SECRET_ACCESS_KEY&&process.env.AWS_ENDPOINT_URL_S3&&process.env.AWS_REGION);
  const s3=hasS3?new S3Client({region:process.env.AWS_REGION,endpoint:process.env.AWS_ENDPOINT_URL_S3,forcePathStyle:true,credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID!,secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!}}):null;
  const bucket=process.env.NEON_STORAGE_BUCKET||'bluehaven-portfolio-media';
  let projects=0,media=0,bytes=0,objects=0;
  for(const p of manifest.projects){
   await db`INSERT INTO portfolio_projects(id,slug,name,category,description,website_url,visible,sort_order,gallery_layout,created_at,updated_at) VALUES(${p.id},${p.slug},${p.name},${p.category},${p.description},${p.website_url},${p.visible},${p.sort_order},${JSON.stringify({aspectRatio:p.gallery_layout})}::jsonb,${p.created_at},NOW()) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,category=EXCLUDED.category,description=EXCLUDED.description,website_url=EXCLUDED.website_url,visible=EXCLUDED.visible,sort_order=EXCLUDED.sort_order,gallery_layout=EXCLUDED.gallery_layout,updated_at=NOW()`;
   projects++;
  }
  for(const m of manifest.media){
   await db`INSERT INTO portfolio_media(id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,created_at,updated_at,file_data,file_name,mime_type) VALUES(${m.id},${m.project_id},${m.storage_url},${m.storage_key},${m.alt_text},'image',${m.sort_order},${m.featured},NOW(),NOW(),NULL,${m.file_name},${m.mime_type}) ON CONFLICT(id) DO UPDATE SET project_id=EXCLUDED.project_id,storage_url=EXCLUDED.storage_url,storage_key=EXCLUDED.storage_key,alt_text=EXCLUDED.alt_text,sort_order=EXCLUDED.sort_order,featured=EXCLUDED.featured,file_data=NULL,file_name=EXCLUDED.file_name,mime_type=EXCLUDED.mime_type,updated_at=NOW()`;
   media++;
   if(s3){
    const response=await fetch(m.storage_url);if(!response.ok)throw new Error(`Could not read Blob media ${m.id}: HTTP ${response.status}`);
    const data=Buffer.from(await response.arrayBuffer());
    await s3.send(new PutObjectCommand({Bucket:bucket,Key:`portfolio/${m.project_id}/${m.id}/${m.file_name}`,Body:data,ContentType:m.mime_type}));
    bytes+=data.byteLength;objects++;
   }
  }
  return send(res,{ok:true,projects,media,neonStorage:{enabled:Boolean(s3),objects,bytes},message:s3?'Portfolio metadata and optimized Blob images were offloaded to Neon/Postgres + Neon Object Storage.':'Portfolio metadata was synced to Neon. Neon Object Storage credentials are not configured, so Blob images remain the live source.'});
 }catch(e){console.error('BlueHaven Neon offload failed:',e);return send(res,{error:e instanceof Error?e.message:'Neon offload failed'},500)}
}
