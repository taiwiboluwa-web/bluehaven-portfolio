import { neon } from '@neondatabase/serverless';

type Req={url?:string};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;end:(d?:unknown)=>void};

export default async function handler(req:Req,res:Res){
 try{
  const id=new URL(req.url||'/','https://bluehaven.local').searchParams.get('id');
  if(!id||!process.env.DATABASE_URL)return res.status(404).end('Not found');
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`SELECT file_data,mime_type,storage_url,storage_key FROM portfolio_media WHERE id=${id} LIMIT 1` as any[];
  const row=rows[0];
  if(!row)return res.status(404).end('Not found');
  if(String(row.storage_key||'').startsWith('portfolio/')&&row.storage_url){
   res.status(302).setHeader('location',row.storage_url);res.setHeader('cache-control','public, max-age=31536000, immutable');return res.end();
  }
  if(!row.file_data)return res.status(404).end('Not found');
  const data=row.file_data instanceof Uint8Array?row.file_data:Buffer.from(row.file_data,'base64');
  res.status(200).setHeader('content-type',row.mime_type||'application/octet-stream');res.setHeader('cache-control','public, max-age=31536000, immutable');return res.end(data);
 }catch(error){console.error('BlueHaven media API error:',error);return res.status(404).end('Not found')}
}
