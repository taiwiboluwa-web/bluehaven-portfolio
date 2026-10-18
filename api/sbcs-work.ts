import { neon } from '@neondatabase/serverless';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { isAuthenticated } from './_auth.js';

type Req={method?:string;headers?:Record<string,string|undefined>;body?:unknown};
type Res={status:(n:number)=>Res;setHeader:(k:string,v:string)=>void;json:(v:unknown)=>void};
const db=()=>{if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');return neon(process.env.DATABASE_URL)};
const bodyOf=(r:Req):Record<string,any>=>{if(r.body&&typeof r.body==='object')return r.body as Record<string,any>;if(typeof r.body==='string'){try{return JSON.parse(r.body)}catch{}}return {}};
const clean=(v:unknown,n:number)=>String(v??'').trim().slice(0,n);
const sessionSecret=()=>process.env.BLUEHAVEN_SESSION_SECRET||process.env.BLUEHAVEN_ADMIN_PASSWORD||process.env.ADMIN_PASSWORD||'';
function cookie(req:Req,name:string){return String(req.headers?.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||''}
function staffToken(id:string){const exp=Date.now()+12*60*60*1000;const payload=Buffer.from(JSON.stringify({id,exp})).toString('base64url');const sig=createHmac('sha256',sessionSecret()).update(payload).digest('base64url');return payload+'.'+sig}
async function actorFor(req:Req,q:any){
 if(isAuthenticated(req))return {id:'admin',name:'BlueHaven admin',email:'',role:'admin'};
 const parts=cookie(req,'sbcs_staff_session').split('.'),secret=sessionSecret();
 if(!secret||parts.length!==2)return null;
 const expected=createHmac('sha256',secret).update(parts[0]).digest('base64url'),got=Buffer.from(parts[1]),want=Buffer.from(expected);
 if(got.length!==want.length||!timingSafeEqual(got,want))return null;
 let payload:any;try{payload=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'))}catch{return null}
 if(!payload.id||Number(payload.exp)<Date.now())return null;
 const rows=await q.query('SELECT id,name,email,role,active FROM bluehaven_sbcs_staff WHERE id=$1',[payload.id]);
 return rows[0]&&rows[0].active?rows[0]:null;
}
function verifyPassword(password:string,stored:string){const pair=stored.split(':'),salt=pair[0],hash=pair[1];if(!salt||!hash)return false;const actual=scryptSync(password,salt,64),expected=Buffer.from(hash,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected)}
const send=(r:Res,d:unknown,s=200)=>{r.status(s);r.setHeader('content-type','application/json');r.setHeader('cache-control','no-store, no-cache, must-revalidate');r.setHeader('x-content-type-options','nosniff');r.json(d)};
async function ensure(q:any){
 await q.query("CREATE TABLE IF NOT EXISTS bluehaven_sbcs_staff(id UUID PRIMARY KEY,name VARCHAR(120) NOT NULL,email VARCHAR(254) NOT NULL UNIQUE,password_hash VARCHAR(200) NOT NULL,role VARCHAR(24) NOT NULL CHECK(role IN ('coordinator','operator','reviewer')),active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
 await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_schools(
  id UUID PRIMARY KEY,name VARCHAR(180) NOT NULL,contact_name VARCHAR(120) NOT NULL DEFAULT '',
  email VARCHAR(254),phone VARCHAR(40),timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Lagos',
  status VARCHAR(20) NOT NULL DEFAULT 'pilot',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_students(
  id UUID PRIMARY KEY,school_id UUID NOT NULL REFERENCES bluehaven_sbcs_schools(id) ON DELETE CASCADE,
  student_code VARCHAR(80),first_name VARCHAR(100) NOT NULL,last_name VARCHAR(100) NOT NULL DEFAULT '',
  class_name VARCHAR(100) NOT NULL DEFAULT '',date_of_birth DATE NOT NULL,
  guardian_name VARCHAR(160) NOT NULL DEFAULT '',guardian_phone VARCHAR(40),guardian_email VARCHAR(254),
  whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE,email_consent BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await q.query('CREATE INDEX IF NOT EXISTS bluehaven_sbcs_students_birthday_idx ON bluehaven_sbcs_students(active, date_of_birth)');
 await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_templates(
  id UUID PRIMARY KEY,school_id UUID REFERENCES bluehaven_sbcs_schools(id) ON DELETE CASCADE,
  name VARCHAR(140) NOT NULL,channel VARCHAR(20) NOT NULL CHECK(channel IN ('whatsapp','email')),
  subject VARCHAR(200) NOT NULL DEFAULT '',body TEXT NOT NULL,enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_queue(
  id UUID PRIMARY KEY,school_id UUID NOT NULL REFERENCES bluehaven_sbcs_schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES bluehaven_sbcs_students(id) ON DELETE CASCADE,
  birthday_on DATE NOT NULL,channel VARCHAR(20) NOT NULL CHECK(channel IN ('whatsapp','email')),
  template_id UUID REFERENCES bluehaven_sbcs_templates(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,status VARCHAR(24) NOT NULL DEFAULT 'draft'
   CHECK(status IN ('draft','needs_approval','approved','sent','failed','cancelled')),
  approved_by VARCHAR(160),approved_at TIMESTAMPTZ,sent_at TIMESTAMPTZ,provider_id VARCHAR(200),
  error_message VARCHAR(500),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id,birthday_on,channel))`);
 await q.query('CREATE INDEX IF NOT EXISTS bluehaven_sbcs_queue_due_idx ON bluehaven_sbcs_queue(status,birthday_on)');
 await q.query(`CREATE TABLE IF NOT EXISTS bluehaven_sbcs_work_events(
  id UUID PRIMARY KEY,event_type VARCHAR(60) NOT NULL,summary VARCHAR(500) NOT NULL,
  actor VARCHAR(160) NOT NULL DEFAULT 'admin-session',entity_type VARCHAR(40),entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}
async function log(q:any,type:string,summary:string,entity_type:string|null=null,entity_id:string|null=null,metadata:Record<string,unknown>={}) {
 await q.query('INSERT INTO bluehaven_sbcs_work_events(id,event_type,summary,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6::jsonb)',[randomUUID(),type,summary,entity_type,entity_id,JSON.stringify(metadata)]);
}
function renderTemplate(body:string,student:any,school:any){
 return body.replace(/\{\{\s*(student_first_name|student_name|class_name|school_name|guardian_name)\s*\}\}/g,(_m,key)=>{
  const values:Record<string,string>={student_first_name:student.first_name||'',student_name:[student.first_name,student.last_name].filter(Boolean).join(' '),class_name:student.class_name||'',school_name:school.name||'',guardian_name:student.guardian_name||''};
  return values[key]||'';
 });
}
export default async function handler(req:Req,res:Res){
 if(req.method!=='GET'&&req.method!=='POST')return send(res,{error:'Method not allowed'},405);
 try{
  const q=db();await ensure(q);
  if(req.method==='POST'){
   const incoming=bodyOf(req);
   if(clean(incoming.action,50)==='staff_login'){
    const email=clean(incoming.email,254).toLowerCase(),password=String(incoming.password||'');
    const users=await q.query('SELECT id,name,email,role,password_hash,active FROM bluehaven_sbcs_staff WHERE lower(email)=$1 LIMIT 1',[email]);
    if(!users[0]||!users[0].active||!verifyPassword(password,users[0].password_hash))return send(res,{error:'Email or password is incorrect.'},401);
    const u=users[0],user={id:u.id,name:u.name,email:u.email,role:u.role};
    res.setHeader('set-cookie','sbcs_staff_session='+staffToken(user.id)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200');
    return send(res,{ok:true,actor:user});
   }
   if(clean(incoming.action,50)==='staff_logout'){
    res.setHeader('set-cookie','sbcs_staff_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return send(res,{ok:true});
   }
  }
  const actor=await actorFor(req,q);
  if(!actor)return send(res,{error:'Sign in with a staff account or BlueHaven admin session.'},401);
  if(req.method==='GET'){
   const [schools,students,templates,queue,events,metrics,staff]=await Promise.all([
    q.query('SELECT * FROM bluehaven_sbcs_schools ORDER BY created_at DESC LIMIT 500'),
    q.query('SELECT st.id,st.school_id,sc.name AS school_name,st.student_code,st.first_name,st.last_name,st.class_name,st.date_of_birth,st.guardian_name,st.guardian_phone,st.guardian_email,st.whatsapp_consent,st.email_consent,st.active,st.created_at FROM bluehaven_sbcs_students st JOIN bluehaven_sbcs_schools sc ON sc.id=st.school_id ORDER BY st.first_name,st.last_name LIMIT 2000'),
    q.query('SELECT * FROM bluehaven_sbcs_templates ORDER BY created_at DESC LIMIT 500'),
    q.query('SELECT qu.*,st.first_name,st.last_name,st.class_name,st.guardian_name,st.guardian_phone,st.guardian_email,sc.name AS school_name FROM bluehaven_sbcs_queue qu JOIN bluehaven_sbcs_students st ON st.id=qu.student_id JOIN bluehaven_sbcs_schools sc ON sc.id=qu.school_id ORDER BY qu.birthday_on ASC,qu.created_at DESC LIMIT 1000'),
    q.query('SELECT * FROM bluehaven_sbcs_work_events ORDER BY created_at DESC LIMIT 100'),
    q.query("SELECT (SELECT COUNT(*)::int FROM bluehaven_sbcs_schools) AS schools,(SELECT COUNT(*)::int FROM bluehaven_sbcs_students WHERE active) AS active_students,(SELECT COUNT(*)::int FROM bluehaven_sbcs_templates WHERE enabled) AS active_templates,(SELECT COUNT(*)::int FROM bluehaven_sbcs_queue WHERE status IN ('draft','needs_approval')) AS awaiting_review,(SELECT COUNT(*)::int FROM bluehaven_sbcs_queue WHERE status='approved') AS approved_not_sent"),
    actor.role==='admin'?q.query('SELECT id,name,email,role,active,created_at FROM bluehaven_sbcs_staff ORDER BY created_at DESC'):Promise.resolve([])
   ]);
   return send(res,{actor,schools,students,templates,queue,events,metrics:metrics[0],staff});
  }
  const b=bodyOf(req),action=clean(b.action,50);
  if(action==='create_staff'){
   if(actor.role!=='admin')return send(res,{error:'Only the BlueHaven admin can create staff accounts.'},403);
   const name=clean(b.name,120),email=clean(b.email,254).toLowerCase(),password=String(b.password||''),role=clean(b.role,24);
   if(name.length<2||!email||!['coordinator','operator','reviewer'].includes(role)||password.length<12)return send(res,{error:'Name, valid email, a staff role and a password of at least 12 characters are required.'},400);
   if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return send(res,{error:'Enter a valid staff email.'},400);
   const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex'),id=randomUUID();
   try{await q.query('INSERT INTO bluehaven_sbcs_staff(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)',[id,name,email,salt+':'+hash,role])}catch{return send(res,{error:'Could not create staff account. That email may already be registered.'},409)}
   await log(q,'staff_created','Staff account created: '+name,'staff',id,{role});return send(res,{ok:true,id});
  }
  if(action==='create_school'){
   const name=clean(b.name,180),contact=clean(b.contact_name,120),email=clean(b.email,254),phone=clean(b.phone,40);
   if(name.length<2)return send(res,{error:'Enter a school name.'},400);
   if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return send(res,{error:'Enter a valid school email.'},400);
   const id=randomUUID();await q.query('INSERT INTO bluehaven_sbcs_schools(id,name,contact_name,email,phone) VALUES($1,$2,$3,$4,$5)',[id,name,contact,email||null,phone||null]);
   await log(q,'school_created','School workspace created: '+name,'school',id);return send(res,{ok:true,id},201);
  }
  if(action==='create_student'){
   const school_id=clean(b.school_id,60),first_name=clean(b.first_name,100),last_name=clean(b.last_name,100),dob=clean(b.date_of_birth,10);
   if(!school_id||first_name.length<1||!/^\d{4}-\d{2}-\d{2}$/.test(dob))return send(res,{error:'School, first name and valid date of birth are required.'},400);
   const guardian_email=clean(b.guardian_email,254);if(guardian_email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardian_email))return send(res,{error:'Guardian email is invalid.'},400);
   const exists=await q.query('SELECT id FROM bluehaven_sbcs_schools WHERE id=$1',[school_id]);if(!exists[0])return send(res,{error:'Choose a valid school.'},400);
   const id=randomUUID();await q.query('INSERT INTO bluehaven_sbcs_students(id,school_id,student_code,first_name,last_name,class_name,date_of_birth,guardian_name,guardian_phone,guardian_email,whatsapp_consent,email_consent) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[id,school_id,clean(b.student_code,80)||null,first_name,last_name,clean(b.class_name,100),dob,clean(b.guardian_name,160),clean(b.guardian_phone,40)||null,guardian_email||null,b.whatsapp_consent===true,b.email_consent===true]);
   await log(q,'student_created','Student birthday record added','student',id,{school_id});return send(res,{ok:true,id},201);
  }
  if(action==='create_template'){
   const name=clean(b.name,140),channel=clean(b.channel,20),body=clean(b.body,4000),school_id=clean(b.school_id,60);
   if(name.length<2||!['whatsapp','email'].includes(channel)||body.length<3)return send(res,{error:'Template name, channel and message body are required.'},400);
   if(!body.includes('{{student_first_name}}')&&!body.includes('{{student_name}}'))return send(res,{error:'Add a student name placeholder to personalise the greeting.'},400);
   const id=randomUUID();await q.query('INSERT INTO bluehaven_sbcs_templates(id,school_id,name,channel,subject,body) VALUES($1,$2,$3,$4,$5,$6)',[id,school_id||null,name,channel,clean(b.subject,200),body]);
   await log(q,'template_created','Message template created: '+name,'template',id,{channel});return send(res,{ok:true,id},201);
  }
  if(action==='generate_queue'){
   const school_id=clean(b.school_id,60),days=Math.min(90,Math.max(1,Number(b.days)||30));
   const rows=await q.query(`SELECT st.*,sc.name AS school_name,sc.id AS sid,make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + CASE WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,EXTRACT(MONTH FROM st.date_of_birth)::int,LEAST(EXTRACT(DAY FROM st.date_of_birth)::int,28)) < CURRENT_DATE THEN 1 ELSE 0 END,EXTRACT(MONTH FROM st.date_of_birth)::int,LEAST(EXTRACT(DAY FROM st.date_of_birth)::int,28)) AS birthday_due FROM bluehaven_sbcs_students st JOIN bluehaven_sbcs_schools sc ON sc.id=st.school_id WHERE st.active=TRUE AND ($1='' OR st.school_id::text=$1) AND (make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + CASE WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,EXTRACT(MONTH FROM st.date_of_birth)::int,LEAST(EXTRACT(DAY FROM st.date_of_birth)::int,28)) < CURRENT_DATE THEN 1 ELSE 0 END,EXTRACT(MONTH FROM st.date_of_birth)::int,LEAST(EXTRACT(DAY FROM st.date_of_birth)::int,28)) <= CURRENT_DATE + ($2::int * INTERVAL '1 day'))`,[school_id,days]);
   let created=0;
   for(const st of rows){
    for(const channel of ['whatsapp','email']){
     const consent=channel==='whatsapp'?st.whatsapp_consent:st.email_consent,contact=channel==='whatsapp'?st.guardian_phone:st.guardian_email;
     if(!consent||!contact)continue;
     const templates=await q.query('SELECT * FROM bluehaven_sbcs_templates WHERE enabled=TRUE AND channel=$1 AND (school_id IS NULL OR school_id=$2) ORDER BY (school_id IS NOT NULL) DESC,created_at DESC LIMIT 1',[channel,st.school_id]);
     if(!templates[0])continue;
     const date=String(st.birthday_due).slice(0,10);
     const msg=renderTemplate(templates[0].body,st,{name:st.school_name});
     const result=await q.query("INSERT INTO bluehaven_sbcs_queue(id,school_id,student_id,birthday_on,channel,template_id,message_text,status) VALUES($1,$2,$3,$4,$5,$6,$7,'needs_approval') ON CONFLICT(student_id,birthday_on,channel) DO NOTHING RETURNING id",[randomUUID(),st.school_id,st.id,date,channel,templates[0].id,msg]);
     if(result.length){created++;await log(q,'queue_item_created','Birthday greeting prepared for review','queue',result[0].id,{channel,school_id:st.school_id});}
    }
   }
   return send(res,{ok:true,created,scanned:rows.length});
  }
  if(action==='update_queue_status'){
   const id=clean(b.id,60),status=clean(b.status,24);
   if(status==='approved'&&!['admin','coordinator','reviewer'].includes(actor.role))return send(res,{error:'Your role cannot approve birthday messages.'},403);
   if(!['needs_approval','approved','cancelled','draft'].includes(status))return send(res,{error:'Unsupported queue status. Messages cannot be marked sent from this workspace.'},400);
   const rows=await q.query('UPDATE bluehaven_sbcs_queue SET status=$2,approved_by=CASE WHEN $2=\'approved\' THEN \'BlueHaven admin session\' ELSE approved_by END,approved_at=CASE WHEN $2=\'approved\' THEN NOW() ELSE approved_at END,updated_at=NOW() WHERE id=$1 RETURNING id,status',[id,status]);
   if(!rows[0])return send(res,{error:'Queue item not found.'},404);
   await log(q,'queue_status_changed','Birthday greeting status changed to '+status,'queue',id,{status,delivery_locked:true});
   return send(res,{ok:true,status:rows[0].status,delivery_locked:true});
  }
  if(action==='toggle_student'){
   const id=clean(b.id,60),active=b.active===true;const rows=await q.query('UPDATE bluehaven_sbcs_students SET active=$2,updated_at=NOW() WHERE id=$1 RETURNING id,active',[id,active]);if(!rows[0])return send(res,{error:'Student record not found.'},404);await log(q,'student_status_changed','Student record '+(active?'activated':'paused'),'student',id,{active});return send(res,{ok:true});
  }
  return send(res,{error:'Unknown staff operation.'},400);
 }catch(e){console.error('SBCS staff API error:',e);return send(res,{error:e instanceof Error&&e.message==='DATABASE_URL is not configured'?'DATABASE_URL is not configured in Vercel.':'SBCS staff backend is temporarily unavailable.'},500)}
}
