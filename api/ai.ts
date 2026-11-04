import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHmac, timingSafeEqual } from 'node:crypto';

type Req = { method?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void };

const SKILLS = [
  ['company-values','Company Values','Define and communicate the principles behind a company.'],
  ['find-community','Find Community','Identify and build relationships with the right audience.'],
  ['first-customers','First Customers','Find and convert the first paying customers.'],
  ['grow-sustainably','Grow Sustainably','Develop practical, sustainable growth strategies.'],
  ['marketing-plan','Marketing Plan','Create focused marketing plans and campaigns.'],
  ['minimalist-review','Minimalist Review','Review work for clarity, simplicity and focus.'],
  ['mvp','MVP','Shape and validate a minimum viable product.'],
  ['pricing','Pricing','Develop and evaluate pricing approaches.'],
  ['processize','Processize','Turn repeatable work into clear operating processes.'],
  ['validate-idea','Validate Idea','Test business ideas before investing heavily.'],
  ['security-audit','Cloudflare Security Audit','Review website security and Cloudflare configuration.'],
] as const;

function send(res: Res, data: unknown, status = 200) {
  res.status(status); res.setHeader('content-type','application/json'); res.setHeader('cache-control','no-store'); res.json(data);
}
function cookie(req: Req, name: string) {
  return String(req.headers?.cookie || req.headers?.Cookie || '').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1) || '';
}
function isAdmin(req: Req) {
  const secret = process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const raw = cookie(req,'bluehaven_admin');
  if (!secret || !raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(createHmac('sha256',secret).update(parts[0]+'.'+parts[1]).digest('base64url'));
  const actual = Buffer.from(parts[2]);
  return actual.length===expected.length && timingSafeEqual(actual,expected);
}
function parseBody(req: Req) {
  if (req.body && typeof req.body === 'object') return req.body as Record<string,unknown>;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) as Record<string,unknown>; } catch {} }
  return {};
}
function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(process.env.DATABASE_URL);
}
async function ensureTables(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_skill_settings (
    skill_id TEXT PRIMARY KEY, enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_activity (
    id BIGSERIAL PRIMARY KEY, skill_id TEXT, activity_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed', task TEXT NOT NULL,
    result TEXT, model TEXT, duration_ms INTEGER, error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS bluehaven_ai_activity_created_idx ON bluehaven_ai_activity(created_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_daily_reports (
    report_date DATE PRIMARY KEY, total_runs INTEGER NOT NULL DEFAULT 0,
    successful_runs INTEGER NOT NULL DEFAULT 0, failed_runs INTEGER NOT NULL DEFAULT 0,
    chatbot_requests INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}
async function readSkill(id: string) {
  const safe = SKILLS.find(s=>s[0]===id);
  if (!safe) throw new Error('Unknown skill.');
  const file = path.join(process.cwd(),'.agents','skills',id,'SKILL.md');
  return readFile(file,'utf8');
}
async function runModel(messages: Array<{role:string;content:string}>) {
  const key = process.env.AI_GATEWAY_API_KEY;
  if (!key) throw new Error('AI_GATEWAY_API_KEY is not configured in Vercel.');
  const model = process.env.BLUEHAVEN_AI_MODEL || 'openai/gpt-4o-mini';
  const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
    method:'POST', headers:{'authorization':'Bearer '+key,'content-type':'application/json'},
    body:JSON.stringify({model,messages,temperature:0.4,max_tokens:1600})
  });
  const data:any = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data?.error?.message || data?.message || 'AI Gateway request failed ('+response.status+').');
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('AI provider returned an empty response.');
  return {text,model};
}

export async function runPublicAssistant(message: string) {
  const prompt = `You are the BlueHaven Studios website assistant. Be warm, concise and accurate. Explain that BlueHaven is a creative technology and media studio offering brand/design, content, livestreaming, web and digital media training services. Do not invent prices, availability, client promises, or claim an enquiry has been submitted. For a tailored quote or human support, direct visitors to the website enquiry form or WhatsApp +2348068483718. If you do not know an answer, say so and offer the human contact route.`;
  const result = await runModel([{role:'system',content:prompt},{role:'user',content:message.slice(0,4000)}]);
  const sql = db(); await ensureTables(sql);
  await sql`INSERT INTO bluehaven_ai_activity(activity_type,status,task,result,model) VALUES('website_chat','completed','Public website assistant request',${result.text.slice(0,1200)},${result.model})`;
  return result.text;
}

export default async function handler(req: Req, res: Res) {
  if (!isAdmin(req)) return send(res,{error:'Unauthorized'},401);
  const sql = db();
  try {
    await ensureTables(sql);
    if (req.method === 'GET') {
      const settings = await sql`SELECT skill_id,enabled,updated_at FROM bluehaven_ai_skill_settings` as any[];
      const activity = await sql`SELECT id,skill_id,activity_type,status,task,result,model,duration_ms,error,created_at FROM bluehaven_ai_activity ORDER BY created_at DESC LIMIT 50` as any[];
      const enabled = new Map(settings.map((s:any)=>[s.skill_id,s.enabled]));
      return send(res,{
        configured:{database:true,aiGateway:Boolean(process.env.AI_GATEWAY_API_KEY),model:process.env.BLUEHAVEN_AI_MODEL||'openai/gpt-4o-mini'},
        skills:SKILLS.map(([id,name,description])=>({id,name,description,enabled:enabled.get(id)!==false})),
        activity
      });
    }
    if (req.method !== 'POST') return send(res,{error:'Method not allowed'},405);
    const body = parseBody(req);
    if (body.action === 'toggle') {
      const id=String(body.skill_id||''); if(!SKILLS.some(s=>s[0]===id))return send(res,{error:'Unknown skill'},400);
      const enabled=Boolean(body.enabled);
      await sql`INSERT INTO bluehaven_ai_skill_settings(skill_id,enabled) VALUES(${id},${enabled}) ON CONFLICT(skill_id) DO UPDATE SET enabled=EXCLUDED.enabled,updated_at=NOW()`;
      return send(res,{ok:true,skill_id:id,enabled});
    }
    if (body.action === 'run') {
      const id=String(body.skill_id||''), task=String(body.task||'').trim().slice(0,5000);
      if(!task)return send(res,{error:'Describe the task you want this skill to perform.'},400);
      const skill=SKILLS.find(s=>s[0]===id); if(!skill)return send(res,{error:'Unknown skill'},400);
      const setting=await sql`SELECT enabled FROM bluehaven_ai_skill_settings WHERE skill_id=${id} LIMIT 1` as any[];
      if(setting[0]?.enabled===false)return send(res,{error:'This skill is disabled. Enable it before running.'},409);
      const start=Date.now();
      const inserted=await sql`INSERT INTO bluehaven_ai_activity(skill_id,activity_type,status,task) VALUES(${id},'manual_skill_run','running',${task}) RETURNING id` as any[];
      const activityId=inserted[0].id;
      try {
        const instructions=await readSkill(id);
        const result=await runModel([
          {role:'system',content:`You are executing the BlueHaven skill named ${skill[1]}. Follow the skill instructions below as operating guidance. Treat the user's task as the objective. Do not claim to have changed external systems, contacted people, deployed code, or completed actions that you cannot perform. Return a practical result, assumptions, and next actions.\n\nSKILL INSTRUCTIONS:\n${instructions.slice(0,18000)}`},
          {role:'user',content:task}
        ]);
        const duration=Date.now()-start;
        await sql`UPDATE bluehaven_ai_activity SET status='completed',result=${result.text.slice(0,12000)},model=${result.model},duration_ms=${duration} WHERE id=${activityId}`;
        return send(res,{ok:true,result:result.text,model:result.model,duration_ms:duration,activity_id:activityId});
      } catch(error) {
        const message=error instanceof Error?error.message:'Skill execution failed';
        await sql`UPDATE bluehaven_ai_activity SET status='failed',error=${message.slice(0,1000)},duration_ms=${Date.now()-start} WHERE id=${activityId}`;
        return send(res,{error:message,activity_id:activityId},503);
      }
    }
    return send(res,{error:'Unknown action'},400);
  } catch(error) {
    console.error('BlueHaven AI admin API error:',error);
    return send(res,{error:error instanceof Error?error.message:'AI service error'},500);
  }
}
