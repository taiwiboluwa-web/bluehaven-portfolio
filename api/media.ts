import { neon } from '@neondatabase/serverless';

export default async function handler(req:Request){
 const id=new URL(req.url).searchParams.get('id');
 if(!id||!process.env.DATABASE_URL)return new Response('Not found',{status:404});
 try{
  const sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT file_data,mime_type FROM portfolio_media WHERE id=${id} LIMIT 1` as any[];const row=rows[0];if(!row?.file_data)return new Response('Not found',{status:404});
  const data=row.file_data instanceof Uint8Array?row.file_data:Buffer.from(row.file_data,'base64');
  return new Response(data,{headers:{'content-type':row.mime_type||'application/octet-stream','cache-control':'public, max-age=31536000, immutable'}});
 }catch{return new Response('Not found',{status:404})}
}
