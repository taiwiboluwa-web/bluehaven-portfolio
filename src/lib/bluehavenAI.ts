import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

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

function database(){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured.');
  return neon(process.env.DATABASE_URL);
}
async function ensureTables(sql:any){
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_skill_settings(skill_id TEXT PRIMARY KEY,enabled BOOLEAN NOT NULL DEFAULT TRUE,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_activity(id BIGSERIAL PRIMARY KEY,skill_id TEXT,activity_type TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'completed',task TEXT NOT NULL,result TEXT,model TEXT,duration_ms INTEGER,error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE INDEX IF NOT EXISTS bluehaven_ai_activity_created_idx ON bluehaven_ai_activity(created_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_daily_reports(report_date DATE PRIMARY KEY,total_runs INTEGER NOT NULL DEFAULT 0,successful_runs INTEGER NOT NULL DEFAULT 0,failed_runs INTEGER NOT NULL DEFAULT 0,chatbot_requests INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}
async function askModel(messages:Array<{role:string;content:string}>){
  const key=process.env.GEMINI_API_KEY;
  if(!key)throw new Error('GEMINI_API_KEY is not configured in Vercel.');
  const model=process.env.BLUEHAVEN_AI_MODEL||'gemini-2.5-flash';
  const systemText=messages.filter(m=>m.role==='system').map(m=>m.content).join('\n\n');
  const contents=messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:systemText}]},contents,generationConfig:{temperature:0.4,maxOutputTokens:1600}})});
  const data:any=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data?.error?.message||'Gemini API request failed ('+response.status+').');
  const result=(data?.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('\n').trim();
  if(!result)throw new Error(data?.promptFeedback?.blockReason||'Gemini returned an empty response.');
  return {text:result,model};
}
async function skillInstructions(id:string){
  const skill=SKILLS.find(s=>s[0]===id);if(!skill)throw new Error('Unknown skill.');
  return readFile(path.join(process.cwd(),'.agents','skills',id,'SKILL.md'),'utf8');
}

export async function runPublicAssistant(message:string){
  const sql=database();await ensureTables(sql);
  const prompt='You are the BlueHaven Studios website assistant. Be warm, concise and accurate. Explain that BlueHaven is a creative technology and media studio offering brand/design, content, livestreaming, web and digital media training services. Do not invent prices, availability, client promises, or claim an enquiry has been submitted. For a tailored quote or human support, direct visitors to the website enquiry form or WhatsApp +2348068483718. If you do not know an answer, say so and offer the human contact route.';
  const start=Date.now();
  try{
    const result=await askModel([{role:'system',content:prompt},{role:'user',content:message.slice(0,4000)}]);
    await sql`INSERT INTO bluehaven_ai_activity(activity_type,status,task,result,model,duration_ms) VALUES('website_chat','completed','Public website assistant request',${result.text.slice(0,1200)},${result.model},${Date.now()-start})`;
    return result.text;
  }catch(error){
    await sql`INSERT INTO bluehaven_ai_activity(activity_type,status,task,error,duration_ms) VALUES('website_chat','failed','Public website assistant request',${error instanceof Error?error.message.slice(0,1000):'AI request failed'},${Date.now()-start})`;
    throw error;
  }
}

export async function writeDailyAIReport(sql:any){
  const daily=await sql`
      SELECT (created_at AT TIME ZONE 'Africa/Lagos')::date AS report_date,
        COUNT(*) FILTER(WHERE activity_type='manual_skill_run')::int AS total_runs,
        COUNT(*) FILTER(WHERE activity_type='manual_skill_run' AND status='completed')::int AS successful_runs,
        COUNT(*) FILTER(WHERE activity_type='manual_skill_run' AND status='failed')::int AS failed_runs,
        COUNT(*) FILTER(WHERE activity_type='website_chat')::int AS chatbot_requests
      FROM bluehaven_ai_activity
      WHERE (created_at AT TIME ZONE 'Africa/Lagos')::date=(NOW() AT TIME ZONE 'Africa/Lagos')::date-1
      GROUP BY (created_at AT TIME ZONE 'Africa/Lagos')::date
    ` as any[];
    if(daily.length){
      const d=daily[0];
      await sql`INSERT INTO bluehaven_ai_daily_reports(report_date,total_runs,successful_runs,failed_runs,chatbot_requests) VALUES(${d.report_date},${d.total_runs},${d.successful_runs},${d.failed_runs},${d.chatbot_requests}) ON CONFLICT(report_date) DO UPDATE SET total_runs=EXCLUDED.total_runs,successful_runs=EXCLUDED.successful_runs,failed_runs=EXCLUDED.failed_runs,chatbot_requests=EXCLUDED.chatbot_requests`;
    } else {
      await sql`INSERT INTO bluehaven_ai_daily_reports(report_date,total_runs,successful_runs,failed_runs,chatbot_requests) VALUES((NOW() AT TIME ZONE 'Africa/Lagos')::date-1,0,0,0,0) ON CONFLICT(report_date) DO NOTHING`;
    }
}

export async function getAIAdminData(){
  const sql=database();await ensureTables(sql);
  const settings=await sql`SELECT skill_id,enabled FROM bluehaven_ai_skill_settings` as any[];
  const activity=await sql`SELECT id,skill_id,activity_type,status,task,result,model,duration_ms,error,created_at FROM bluehaven_ai_activity ORDER BY created_at DESC LIMIT 50` as any[];
  const enabled=new Map(settings.map((s:any)=>[s.skill_id,s.enabled]));
  await writeDailyAIReport(sql);
  const reports=await sql`SELECT report_date,total_runs,successful_runs,failed_runs,chatbot_requests FROM bluehaven_ai_daily_reports ORDER BY report_date DESC LIMIT 14` as any[];
  return {configured:{database:true,gemini:Boolean(process.env.GEMINI_API_KEY),provider:'Google Gemini',model:process.env.BLUEHAVEN_AI_MODEL||'gemini-2.5-flash'},skills:SKILLS.map(([id,name,description])=>({id,name,description,enabled:enabled.get(id)!==false})),activity,reports};
}

export async function handleAIAdminAction(body:Record<string,unknown>){
  const sql=database();await ensureTables(sql);
  if(body.action==='ai_toggle'){
    const id=String(body.skill_id||'');if(!SKILLS.some(s=>s[0]===id))throw new Error('Unknown skill.');
    const enabled=Boolean(body.enabled);
    await sql`INSERT INTO bluehaven_ai_skill_settings(skill_id,enabled) VALUES(${id},${enabled}) ON CONFLICT(skill_id) DO UPDATE SET enabled=EXCLUDED.enabled,updated_at=NOW()`;
    return {ok:true,skill_id:id,enabled};
  }
  if(body.action==='ai_run'){
    const id=String(body.skill_id||''),task=String(body.task||'').trim().slice(0,5000);
    if(!task)throw new Error('Describe the task you want this skill to perform.');
    const skill=SKILLS.find(s=>s[0]===id);if(!skill)throw new Error('Unknown skill.');
    const setting=await sql`SELECT enabled FROM bluehaven_ai_skill_settings WHERE skill_id=${id} LIMIT 1` as any[];
    if(setting[0]?.enabled===false)throw new Error('This skill is disabled. Enable it before running.');
    const started=Date.now();
    const rows=await sql`INSERT INTO bluehaven_ai_activity(skill_id,activity_type,status,task) VALUES(${id},'manual_skill_run','running',${task}) RETURNING id` as any[];
    const activityId=rows[0].id;
    try{
      const instructions=await skillInstructions(id);
      const result=await askModel([{role:'system',content:'Execute the BlueHaven '+skill[1]+' skill. Follow these instructions as operating guidance. Do not claim to have changed external systems, contacted people or deployed code. Return a practical result, assumptions and next actions.\n\n'+instructions.slice(0,18000)},{role:'user',content:task}]);
      const duration=Date.now()-started;
      await sql`UPDATE bluehaven_ai_activity SET status='completed',result=${result.text.slice(0,12000)},model=${result.model},duration_ms=${duration} WHERE id=${activityId}`;
      return {ok:true,result:result.text,model:result.model,duration_ms:duration,activity_id:activityId};
    }catch(error){
      const message=error instanceof Error?error.message:'Skill execution failed';
      await sql`UPDATE bluehaven_ai_activity SET status='failed',error=${message.slice(0,1000)},duration_ms=${Date.now()-started} WHERE id=${activityId}`;
      throw error;
    }
  }
  throw new Error('Unknown AI action.');
}
