import { neon } from '@neondatabase/serverless';
import { randomUUID, createHash } from 'node:crypto';
import { isAuthenticated } from './_auth.js';

type Req = { method?: string; url?: string; headers?: Record<string,string|undefined>; body?: unknown };
type Res = { status:(code:number)=>Res; setHeader:(name:string,value:string)=>Res; json:(data:unknown)=>void };

const db = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
};
const bodyOf = (req:Req):Record<string,unknown> => {
  if (req.body && typeof req.body === 'object') return req.body as Record<string,unknown>;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) as Record<string,unknown>; } catch {} }
  return {};
};
const send = (res:Res,data:unknown,status=200) => {
  res.status(status).setHeader('content-type','application/json');
  res.setHeader('cache-control','no-store, no-cache, must-revalidate');
  res.setHeader('x-content-type-options','nosniff');
  res.json(data);
};
async function ensure(q:any) {
  await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_enquiries (
    id UUID PRIMARY KEY, school_name VARCHAR(180) NOT NULL, contact_name VARCHAR(120) NOT NULL,
    email VARCHAR(254), student_count VARCHAR(40) NOT NULL DEFAULT 'Not specified',
    notes VARCHAR(2000) NOT NULL DEFAULT '', status VARCHAR(24) NOT NULL DEFAULT 'new',
    source VARCHAR(40) NOT NULL DEFAULT 'sbcs-website', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await q.query('CREATE INDEX IF NOT EXISTS bluehaven_sbcs_enquiries_created_idx ON bluehaven_sbcs_enquiries(created_at DESC)');
  await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_events (
    id UUID PRIMARY KEY, event_type VARCHAR(60) NOT NULL, summary VARCHAR(500) NOT NULL,
    enquiry_id UUID, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await q.query('CREATE INDEX IF NOT EXISTS bluehaven_sbcs_events_created_idx ON bluehaven_sbcs_events(created_at DESC)');
  await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), pilot_mode BOOLEAN NOT NULL DEFAULT TRUE,
    staff_approval_required BOOLEAN NOT NULL DEFAULT TRUE, whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await q.query('INSERT INTO bluehaven_sbcs_settings(id) VALUES(1) ON CONFLICT (id) DO NOTHING');
}
const clean = (value:unknown,max:number) => String(value ?? '').trim().slice(0,max);
const event = async (q:any,event_type:string,summary:string,enquiry_id:string|null=null,metadata:Record<string,unknown>={}) =>
  q.query('INSERT INTO bluehaven_sbcs_events(id,event_type,summary,enquiry_id,metadata) VALUES($1,$2,$3,$4,$5::jsonb)',[randomUUID(),event_type,summary,enquiry_id,JSON.stringify(metadata)]);

export default async function handler(req:Req,res:Res) {
  try {
    const q=db();
    await ensure(q);
    if (req.method === 'GET') {
      if (!isAuthenticated(req)) return send(res,{error:'Unauthorized'},401);
      const [enquiries,events,settings,counts] = await Promise.all([
        q.query('SELECT id,school_name,contact_name,email,student_count,notes,status,source,created_at,updated_at FROM bluehaven_sbcs_enquiries ORDER BY created_at DESC LIMIT 250'),
        q.query('SELECT id,event_type,summary,enquiry_id,metadata,created_at FROM bluehaven_sbcs_events ORDER BY created_at DESC LIMIT 100'),
        q.query('SELECT pilot_mode,staff_approval_required,whatsapp_enabled,email_enabled,updated_at FROM bluehaven_sbcs_settings WHERE id=1 LIMIT 1'),
        q.query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE status='new')::int AS new_count,COUNT(*) FILTER (WHERE status='contacted')::int AS contacted_count,COUNT(*) FILTER (WHERE status='qualified')::int AS qualified_count,COUNT(*) FILTER (WHERE status='closed')::int AS closed_count,COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '7 days')::int AS last_7_days FROM bluehaven_sbcs_enquiries")
      ]);
      return send(res,{enquiries,events,settings:settings[0]||null,metrics:counts[0]||{total:0,new_count:0,contacted_count:0,qualified_count:0,closed_count:0,last_7_days:0}});
    }
    if (req.method !== 'POST') return send(res,{error:'Method not allowed'},405);
    const b=bodyOf(req),action=clean(b.action,40);
    if (action === 'create_enquiry') {
      // Public endpoint only accepts the limited school enquiry form, never student records.
      if (clean(b.company_website,300)) return send(res,{ok:true},200); // honeypot
      const school_name=clean(b.school,180),contact_name=clean(b.contact,120),email=clean(b.email,254),student_count=clean(b.size,40)||'Not specified',notes=clean(b.message,2000);
      if (school_name.length<2 || contact_name.length<2) return send(res,{error:'Please provide the school and contact name.'},400);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res,{error:'Please provide a valid email address.'},400);
      const id=randomUUID();
      await q.query('INSERT INTO bluehaven_sbcs_enquiries(id,school_name,contact_name,email,student_count,notes) VALUES($1,$2,$3,$4,$5,$6)',[id,school_name,contact_name,email||null,student_count,notes]);
      await event(q,'enquiry_created',`New SBCS enquiry from ${school_name}`,id,{student_count,source:'website'});
      return send(res,{ok:true,id},201);
    }
    if (!isAuthenticated(req)) return send(res,{error:'Unauthorized'},401);
    if (action === 'update_status') {
      const id=clean(b.id,80),status=clean(b.status,24);
      if (!id || !['new','contacted','qualified','closed'].includes(status)) return send(res,{error:'Invalid enquiry status.'},400);
      const rows=await q.query('UPDATE bluehaven_sbcs_enquiries SET status=$2,updated_at=NOW() WHERE id=$1 RETURNING id,school_name,status',[id,status]);
      if (!rows[0]) return send(res,{error:'Enquiry not found.'},404);
      await event(q,'enquiry_status_changed',`${rows[0].school_name} moved to ${status}`,id,{status});
      return send(res,{ok:true,enquiry:rows[0]});
    }
    if (action === 'update_settings') {
      const pilot_mode=Boolean(b.pilot_mode),staff_approval_required=Boolean(b.staff_approval_required);
      // Live sending is intentionally locked off until a provider integration and consent review are completed.
      const rows=await q.query('UPDATE bluehaven_sbcs_settings SET pilot_mode=$1,staff_approval_required=$2,whatsapp_enabled=FALSE,email_enabled=FALSE,updated_at=NOW() WHERE id=1 RETURNING *',[pilot_mode,staff_approval_required]);
      await event(q,'settings_updated','SBCS operating settings updated',null,{pilot_mode,staff_approval_required,live_delivery_locked:true});
      return send(res,{ok:true,settings:rows[0]});
    }
    if (action === 'log_note') {
      const summary=clean(b.summary,500);
      if (summary.length<3) return send(res,{error:'Add a short note.'},400);
      await event(q,'admin_note',summary,null,{category:'admin'});
      return send(res,{ok:true});
    }
    return send(res,{error:'Unknown action.'},400);
  } catch (error) {
    console.error('SBCS API error:',error);
    return send(res,{error:error instanceof Error && error.message==='DATABASE_URL is not configured' ? 'Database is not configured. Set DATABASE_URL in Vercel.' : 'SBCS service is temporarily unavailable.'},500);
  }
}
