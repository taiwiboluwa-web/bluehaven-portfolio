import { neon } from '@neondatabase/serverless';

type Req={url?:string;headers?:Record<string,string|undefined>};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;end:(d?:unknown)=>void};

function isPublicNeonObjectUrl(value:string){
 try{
  const url=new URL(value);
  return url.protocol==='https:' && url.hostname.includes('.storage.') && url.hostname.endsWith('.neon.tech') && url.pathname.startsWith('/bluehaven-portfolio-media/');
 }catch{return false}
}

export default async function handler(req:Req,res:Res){
 try{
  const id=new URL(req.url||'/','https://bluehaven.local').searchParams.get('id');
  if(!id||!process.env.DATABASE_URL)return res.status(404).end('Not found');
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`SELECT storage_url FROM portfolio_media WHERE id=${id} LIMIT 1` as any[];
  const url=String(rows[0]?.storage_url||'');
  if(!isPublicNeonObjectUrl(url))return res.status(404).end('Not found');
  res.status(302).setHeader('location',url);
  res.setHeader('cache-control','public, max-age=31536000, immutable');
  res.setHeader('x-content-type-options','nosniff');
  return res.end();
 }catch(error){
  console.error('BlueHaven media redirect error:',error);
  return res.status(404).end('Not found');
 }
}
