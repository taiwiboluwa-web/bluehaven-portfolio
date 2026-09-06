import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

const sql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
};

type Req = { method?: string; headers?: Record<string,string|undefined> & { get?: (name:string)=>string|null }; body?: unknown; json?:()=>Promise<unknown> };
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const header = (req:Req, name:string) => { const h=req.headers; if(!h)return ''; if(typeof h.get==='function')return h.get(name)||''; return h[name.toLowerCase()]||h[name]||''; };
function auth(req:Req) {
  const raw=header(req,'cookie').match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1]; if(!raw||!secret())return false;
  const p=raw.split('.'); if(p.length!==3)return false;
  const expected=Buffer.from(createHmac('sha256',secret()).update(`${p[0]}.${p[1]}`).digest('base64url')); const actual=Buffer.from(p[2]);
  return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
async function bodyOf(req:Req){ if(req.body&&typeof req.body==='object')return req.body as Record<string,unknown>; if(typeof req.body==='string'){try{return JSON.parse(req.body) as Record<string,unknown>}catch{return {}}} if(typeof req.json==='function'){try{const b=await req.json();return b&&typeof b==='object'?b as Record<string,unknown>:{} }catch{return {}}} return {}; }
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const normalize=(v:unknown):'bubbles'|'skales'=>v==='skales'?'skales':'bubbles';
export default async function handler(req:Req){
  try {
    const db=sql();
    if(req.method==='GET'){const rows=await db`SELECT setting_value FROM site_settings WHERE setting_key='active_buddy' LIMIT 1`;return json({active_buddy:normalize((rows as any[])[0]?.setting_value)})}
    if(req.method!=='POST')return json({error:'Method not allowed'},405);
    if(!auth(req))return json({error:'Unauthorized'},401);
    const body=await bodyOf(req); if(body.action!=='set')return json({error:'Unknown action'},400);
    const activeBuddy=normalize(body.active_buddy);
    await db`INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('active_buddy', ${JSON.stringify(activeBuddy)}::jsonb, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value=${JSON.stringify(activeBuddy)}::jsonb, updated_at=NOW()`;
    return json({ok:true,active_buddy:activeBuddy});
  } catch(error){console.error('BlueHaven buddy API error:',error);return json({error:error instanceof Error?error.message:'Server error'},500)}
}
