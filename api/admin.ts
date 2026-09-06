import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE='bluehaven_admin';
const secret=()=>process.env.ADMIN_PASSWORD||'';
const sign=(value:string)=>createHmac('sha256',secret()).update(value).digest('base64url');
const token=()=>{const value=`${Date.now()}.${randomUUID()}`;return `${value}.${sign(value)}`};
const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}});

type VercelRequest = { method?: string; headers: Record<string,string|undefined>; body?: unknown };
function cookieHeader(req:VercelRequest){return req.headers?.cookie||req.headers?.Cookie||''}
function authenticated(req:VercelRequest){const raw=cookieHeader(req).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];if(!raw)return false;const parts=raw.split('.');if(parts.length!==3)return false;try{return timingSafeEqual(Buffer.from(parts[2]),Buffer.from(sign(`${parts[0]}.${parts[1]}`)))}catch{return false}}
function bodyOf(req:VercelRequest){if(req.body&&typeof req.body==='object')return req.body as Record<string,unknown>;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch{return {}}}return {}}

export default async function handler(req:VercelRequest){
 if(req.method==='GET')return json({authenticated:authenticated(req),configured:Boolean(secret())});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const body=bodyOf(req);
 if(body.action==='logout')return json({ok:true},200,{'set-cookie':`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`});
 if(!secret())return json({error:'ADMIN_PASSWORD is not configured on the deployment.'},503);
 if(String(body.password||'')!==secret())return json({error:'Invalid password'},401);
 return json({ok:true},200,{'set-cookie':`${COOKIE}=${token()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`});
}
