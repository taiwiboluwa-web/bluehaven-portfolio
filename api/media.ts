import { neon } from '@neondatabase/serverless';

type Req={url?:string;headers?:Record<string,string|undefined>};
type Res={status:(n:number)=>Res;setHeader:(n:string,v:string)=>Res;end:(d?:unknown)=>void};
const MAX_RESPONSE_BYTES=4*1024*1024;

export default async function handler(req:Req,res:Res){
 try{
  const id=new URL(req.url||'/','https://bluehaven.local').searchParams.get('id');
  if(!id||!process.env.DATABASE_URL)return res.status(404).end('Not found');
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`SELECT file_data,mime_type,storage_url FROM portfolio_media WHERE id=${id} LIMIT 1` as any[];
  const row=rows[0];
  if(!row)return res.status(404).end('Not found');
  if(!row.file_data){
   if(row.storage_url){res.status(302).setHeader('location',row.storage_url);res.setHeader('cache-control','public, max-age=31536000, immutable');return res.end()}
   return res.status(404).end('Not found');
  }
  const data=row.file_data instanceof Uint8Array?row.file_data:Buffer.from(row.file_data,'base64');
  const total=data.byteLength;
  const range=req.headers?.range||req.headers?.Range;
  res.setHeader('accept-ranges','bytes');
  res.setHeader('content-type',row.mime_type||'application/octet-stream');
  res.setHeader('cache-control','public, max-age=31536000, immutable');
  res.setHeader('x-content-type-options','nosniff');
  if(total<=MAX_RESPONSE_BYTES&&!range){res.status(200).setHeader('content-length',String(total));return res.end(data)}
  let start=0,end=Math.min(total-1,MAX_RESPONSE_BYTES-1);
  if(range){
   const match=range.match(/bytes=(\d*)-(\d*)/);
   if(!match)return res.status(416).setHeader('content-range',`bytes */${total}`).end();
   if(match[1])start=Number(match[1]);
   if(match[2])end=Number(match[2]);
   else end=Math.min(total-1,start+MAX_RESPONSE_BYTES-1);
   if(start<0||start>=total||end<start)return res.status(416).setHeader('content-range',`bytes */${total}`).end();
   end=Math.min(end,total-1,start+MAX_RESPONSE_BYTES-1);
  }
  const chunk=data.subarray(start,end+1);
  res.status(206).setHeader('content-range',`bytes ${start}-${end}/${total}`);res.setHeader('content-length',String(chunk.byteLength));return res.end(chunk);
 }catch(error){console.error('BlueHaven media API error:',error);return res.status(404).end('Not found')}
}
