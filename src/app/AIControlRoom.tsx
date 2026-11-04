import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Bot, CheckCircle2, CircleAlert, Clock3, Play, RefreshCw, ShieldCheck, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

type Skill={id:string;name:string;description:string;enabled:boolean};
type Log={id:number;skill_id:string|null;activity_type:string;status:string;task:string;result:string|null;model:string|null;duration_ms:number|null;error:string|null;created_at:string};
type Report={report_date:string;total_runs:number;successful_runs:number;failed_runs:number;chatbot_requests:number};
const panel='rounded-2xl border border-white/10 bg-white/[.035]';
const btn='rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold transition hover:border-[#7f56d6]/60 disabled:opacity-40';

export default function AIControlRoom(){
  const [skills,setSkills]=useState<Skill[]>([]);
  const [activity,setActivity]=useState<Log[]>([]);
  const [reports,setReports]=useState<Report[]>([]);
  const [configured,setConfigured]=useState<{database:boolean;aiGateway:boolean;model:string}|null>(null);
  const [selected,setSelected]=useState('marketing-plan');
  const [task,setTask]=useState('');
  const [running,setRunning]=useState(false);
  const [busySkill,setBusySkill]=useState('');
  const [error,setError]=useState('');
  const [result,setResult]=useState('');
  const [lastUpdated,setLastUpdated]=useState<Date|null>(null);
  const load=useCallback(async()=>{
    const response=await fetch('/api/admin?view=ai',{cache:'no-store'});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Could not load AI control room');
    setSkills(data.skills||[]);setActivity(data.activity||[]);setReports(data.reports||[]);
    setConfigured(data.configured||null);setLastUpdated(new Date());
  },[]);
  useEffect(()=>{load().catch(e=>setError(e instanceof Error?e.message:'AI control room unavailable'));},[load]);
  useEffect(()=>{const timer=window.setInterval(()=>{load().catch(()=>{});},30000);return()=>window.clearInterval(timer)},[load]);
  const today=useMemo(()=>activity.filter(item=>new Date(item.created_at).toDateString()===new Date().toDateString()),[activity]);
  const runsToday=today.filter(item=>item.activity_type==='manual_skill_run');
  const chatToday=today.filter(item=>item.activity_type==='website_chat').length;
  const completed=runsToday.filter(item=>item.status==='completed').length;
  const failed=runsToday.filter(item=>item.status==='failed').length;
  const toggle=async(skill:Skill)=>{
    setBusySkill(skill.id);setError('');
    try{
      const response=await fetch('/api/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'ai_toggle',skill_id:skill.id,enabled:!skill.enabled})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not update skill');
      setSkills(list=>list.map(item=>item.id===skill.id?{...item,enabled:!skill.enabled}:item));
    }catch(e){setError(e instanceof Error?e.message:'Could not update skill')}
    finally{setBusySkill('')}
  };
  const run=async()=>{
    if(!task.trim()||running)return;
    setRunning(true);setError('');setResult('');
    try{
      const response=await fetch('/api/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'ai_run',skill_id:selected,task})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Skill execution failed');
      setResult(data.result||'Completed.');setTask('');await load();
    }catch(e){setError(e instanceof Error?e.message:'Skill execution failed');await load().catch(()=>{});}
    finally{setRunning(false)}
  };
  return <section id="ai-control" className="scroll-mt-8 mt-8 border-t border-white/10 pt-10">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs uppercase tracking-[.2em] text-[#ffde59]">AI operations</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-black"><Bot size={27}/> AI Control Room</h2><p className="mt-2 max-w-2xl text-sm text-white/45">Manage the website assistant and run BlueHaven's installed skills. Every execution is recorded here.</p></div>
      <button type="button" onClick={()=>load().catch(e=>setError(e.message))} className={btn}><RefreshCw size={13} className="mr-1 inline"/> Refresh</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className={panel+' p-4'}><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Skills available</p><p className="mt-2 text-2xl font-black">{skills.length}</p><p className="mt-1 text-xs text-white/35">{skills.filter(s=>s.enabled).length} enabled</p></div>
      <div className={panel+' p-4'}><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Skill runs today</p><p className="mt-2 text-2xl font-black">{runsToday.length}</p><p className="mt-1 text-xs text-white/35">{completed} completed · {failed} failed</p></div>
      <div className={panel+' p-4'}><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Website AI chats</p><p className="mt-2 text-2xl font-black">{chatToday}</p><p className="mt-1 text-xs text-white/35">Requests handled today</p></div>
      <div className={panel+' p-4'}><p className="text-[10px] uppercase tracking-[.16em] text-white/40">AI connection</p><p className="mt-2 flex items-center gap-2 text-sm font-bold">{configured?.gemini?<><CheckCircle2 size={16} className="text-emerald-400"/> Gemini connected</>:<><CircleAlert size={16} className="text-amber-300"/> Needs Gemini key</>}</p><p className="mt-1 truncate text-xs text-white/35">{configured?.model||'Checking model…'}</p></div>
    </div>
    {!configured?.gemini&&<div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm text-amber-100"><strong>AI runtime needs one deployment setting.</strong> Add <code>GEMINI_API_KEY</code> in Vercel → Project → Settings → Environment Variables, then redeploy. The key stays server-side and is never sent to visitors.</div>}
    {error&&<div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[.07] p-3 text-sm text-red-200">{error}</div>}
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <div className={panel+' p-5'}>
        <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-bold">Installed skills</h3><p className="mt-1 text-xs text-white/35">Switch each skill on or off. Disabled skills cannot be run.</p></div><ShieldCheck size={18} className="text-[#ffde59]"/></div>
        <div className="space-y-2">{skills.map(skill=><div key={skill.id} className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-black/15 p-3">
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{skill.name}</p><p className="mt-0.5 text-xs leading-5 text-white/40">{skill.description}</p><p className="mt-1 text-[10px] text-white/25">{skill.id}</p></div>
          <button type="button" title={skill.enabled?'Disable skill':'Enable skill'} disabled={busySkill===skill.id} onClick={()=>toggle(skill)} className="shrink-0 text-white/70">{skill.enabled?<ToggleRight size={26} className="text-emerald-400"/>:<ToggleLeft size={26}/>}</button>
        </div>)}</div>
      </div>
      <div className="space-y-5">
        <div className={panel+' p-5'}>
          <div className="mb-4 flex items-center gap-2"><Sparkles size={17} className="text-[#ffde59]"/><h3 className="font-bold">Run a skill</h3></div>
          <label className="mb-2 block text-xs text-white/45">Choose skill</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171719] px-3 py-3 text-sm text-white">{skills.filter(s=>s.enabled).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <label className="mb-2 mt-4 block text-xs text-white/45">What should it work on?</label>
          <textarea value={task} onChange={e=>setTask(e.target.value)} rows={5} placeholder="Describe a specific BlueHaven task, goal or problem…" className="w-full resize-y rounded-xl border border-white/10 bg-white/[.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#7f56d6]"/>
          <button type="button" disabled={running||!task.trim()||!configured?.aiGateway||!skills.some(s=>s.id===selected&&s.enabled)} onClick={run} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffde59] px-4 py-3 text-sm font-black text-black disabled:opacity-40">{running?<><RefreshCw size={15} className="animate-spin"/> Running skill…</>:<><Play size={15}/> Run skill</>}</button>
          {result&&<div className="mt-4 max-h-96 overflow-auto rounded-xl border border-emerald-400/20 bg-emerald-400/[.05] p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Execution result</p><pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-white/80">{result}</pre></div>}
        </div>
        <div className={panel+' p-5'}>
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Daily activity</h3><Clock3 size={17} className="text-white/40"/></div>
          <div className="space-y-2">{reports.length?reports.slice(0,7).map(report=><div key={report.report_date} className="flex items-center justify-between gap-3 border-b border-white/[.06] pb-2 text-xs"><span className="text-white/55">{new Date(report.report_date).toLocaleDateString()}</span><span className="text-white/75">{report.total_runs} skill runs · {report.chatbot_requests} chats</span></div>):<p className="text-xs leading-5 text-white/35">Daily summaries will appear after the scheduled report job runs. Live activity is shown below.</p>}</div>
          <p className="mt-3 text-[10px] text-white/25">Activity timestamps are shown in your browser's local time. {lastUpdated?'Updated '+lastUpdated.toLocaleTimeString():''}</p>
        </div>
      </div>
    </div>
    <div className={panel+' mt-5 p-5'}>
      <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Recent activity</h3><p className="mt-1 text-xs text-white/35">Latest 50 website assistant requests and skill executions.</p></div><Activity size={18} className="text-[#ffde59]"/></div>
      <div className="space-y-2">{activity.length?activity.map(item=><article key={item.id} className="rounded-xl border border-white/[.07] bg-black/15 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={'rounded-full px-2 py-1 text-[9px] font-bold uppercase '+(item.status==='completed'?'bg-emerald-400/10 text-emerald-300':item.status==='failed'?'bg-red-400/10 text-red-300':'bg-amber-300/10 text-amber-200')}>{item.status}</span><span className="text-xs font-semibold">{skills.find(s=>s.id===item.skill_id)?.name|| (item.activity_type==='website_chat'?'Website assistant':'AI task')}</span></div><span className="text-[10px] text-white/30">{new Date(item.created_at).toLocaleString()}</span></div>
        <p className="mt-2 text-xs text-white/65">{item.task}</p>{item.result&&<details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-[#ffde59]">View output</summary><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs leading-5 text-white/55">{item.result}</pre></details>}{item.error&&<p className="mt-2 text-xs text-red-300">{item.error}</p>}
        <p className="mt-2 text-[10px] text-white/25">{item.model||'Model pending'}{item.duration_ms?' · '+item.duration_ms+'ms':''}</p>
      </article>):<p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/30">No AI activity recorded yet. Run a skill or send a message to the website assistant.</p>}</div>
    </div>
  </section>;
}
