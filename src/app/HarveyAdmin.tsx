import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, CircleAlert, LoaderCircle, LogOut, RefreshCw, ShieldCheck, Users, Mail, PauseCircle } from 'lucide-react';

type Item = Record<string, unknown>;
type HarveyData = { status?: Item; stats?: Item; outbox?: Item[]; activity?: Item[] };

const panel = 'rounded-2xl border border-white/10 bg-white/[0.035] p-5';
const btn = 'inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm transition hover:bg-white/10 disabled:opacity-50';

export default function HarveyAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<HarveyData>({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const auth = await fetch('/api/admin', { cache: 'no-store' }).then(r => r.json());
      setAuthenticated(Boolean(auth.authenticated)); setConfigured(Boolean(auth.configured));
      if (!auth.authenticated) return;
      const results = await Promise.all([
        fetch('/api/admin?harvey=%2Fapi%2Fharvey%2Fstatus', { cache: 'no-store' }),
        fetch('/api/admin?harvey=%2Fapi%2Fstats', { cache: 'no-store' }),
        fetch('/api/admin?harvey=%2Fapi%2Foutbox', { cache: 'no-store' }),
        fetch('/api/admin?harvey=%2Fapi%2Factivity', { cache: 'no-store' }),
      ]);
      const parsed = await Promise.all(results.map(async r => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || 'Harvey service is not reachable.');
        return body;
      }));
      setData({ status: parsed[0], stats: parsed[1], outbox: Array.isArray(parsed[2]) ? parsed[2] : parsed[2].items || parsed[2].outbox || [], activity: Array.isArray(parsed[3]) ? parsed[3] : parsed[3].items || parsed[3].activity || [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to Harvey.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Sign in failed.');
      setPassword(''); setAuthenticated(true); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed.'); }
    finally { setLoading(false); }
  };

  const act = async (action: 'approve' | 'reject' | 'pause' | 'resume', id = '') => {
    setBusyId(id || action); setError(''); setNotice('');
    try {
      const path = action === 'pause' || action === 'resume' ? `/api/sending/${action}` : `/api/outbox/${encodeURIComponent(id)}/${action}`;
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'harvey_proxy', path, method: 'POST' }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Action could not be completed.');
      setNotice(action === 'approve' ? 'Draft approved in Harvey.' : action === 'reject' ? 'Draft rejected.' : action === 'pause' ? 'Harvey sending paused.' : 'Harvey sending resumed.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); }
    finally { setBusyId(''); }
  };

  const stat = (key: string, fallback = '—') => {
    const stats = data.stats || {};
    const value = stats[key];
    return value === undefined || value === null ? fallback : String(value);
  };
  const outbox = data.outbox || [];
  const status = data.status || {};
  const isRunning = Boolean(status.running ?? status.is_running);

  if (authenticated === null) return <div className="min-h-screen bg-[#09090b] text-zinc-100 grid place-items-center"><LoaderCircle className="animate-spin" /></div>;

  if (!authenticated) return <main className="min-h-screen bg-[#09090b] text-zinc-100 px-5 grid place-items-center">
    <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-8">
      <p className="text-xs tracking-[.24em] text-zinc-400">BLUEHAVEN STUDIOS / PRIVATE</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Harvey Control Room</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Sign in with your existing BlueHaven admin password to access sales operations.</p>
      {!configured && <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-100">Admin access is not configured on this deployment.</p>}
      <label className="mt-6 block text-sm text-zinc-300">Admin password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-zinc-500" required /></label>
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      <button disabled={loading} className={btn + ' mt-5 w-full justify-center'}>{loading ? 'Signing in…' : 'Sign in securely'}</button>
    </form>
  </main>;

  return <main className="min-h-screen bg-[#09090b] text-zinc-100">
    <header className="border-b border-white/10 px-5 py-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div><p className="text-[10px] tracking-[.28em] text-zinc-500">BLUEHAVEN STUDIOS / PRIVATE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Harvey <span className="text-zinc-500">Control Room</span></h1><p className="mt-1 text-sm text-zinc-400">Prospecting, conversations and approval-first outreach.</p></div>
        <div className="flex items-center gap-2"><button className={btn} onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Refresh</button><button className={btn} onClick={async () => { await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); setAuthenticated(false); }}><LogOut size={15}/> Sign out</button></div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200"><CircleAlert size={18} className="mt-0.5 shrink-0"/><div><p className="font-medium">Connection or action issue</p><p className="mt-1 break-words text-rose-200/80">{error}</p></div></div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200">{notice}</div>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={panel}><div className="flex items-center justify-between text-sm text-zinc-400">Agent status <Activity size={17}/></div><p className="mt-4 text-2xl font-semibold">{loading ? 'Checking…' : isRunning ? 'Running' : 'Not running'}</p><p className="mt-1 text-xs text-zinc-500">{status.pid ? `Process ID ${status.pid}` : 'Agent heartbeat status'}</p><div className="mt-4 flex gap-2"><button className={btn} onClick={() => void act('pause')} disabled={Boolean(busyId)}>Pause sending</button><button className={btn} onClick={() => void act('resume')} disabled={Boolean(busyId)}>Resume</button></div></article>
        <article className={panel}><div className="flex items-center justify-between text-sm text-zinc-400">Companies <Users size={17}/></div><p className="mt-4 text-3xl font-semibold">{stat('companies')}</p><p className="mt-1 text-xs text-zinc-500">Businesses in the prospect pipeline</p></article>
        <article className={panel}><div className="flex items-center justify-between text-sm text-zinc-400">Contacts / prospects <Mail size={17}/></div><p className="mt-4 text-3xl font-semibold">{stat('prospects')}</p><p className="mt-1 text-xs text-zinc-500">Potential contacts discovered</p></article>
        <article className={panel}><div className="flex items-center justify-between text-sm text-zinc-400">Approval queue <ShieldCheck size={17}/></div><p className="mt-4 text-3xl font-semibold">{outbox.length}</p><p className="mt-1 text-xs text-zinc-500">Drafts waiting for your review</p></article>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className={panel}><div className="flex items-start justify-between gap-3"><div><p className="text-xs tracking-[.18em] text-zinc-500">REVIEW DESK</p><h2 className="mt-2 text-xl font-semibold">Outgoing drafts</h2><p className="mt-1 text-sm text-zinc-400">Nothing should send until you approve it.</p></div><ShieldCheck className="text-zinc-400"/></div>
          {outbox.length ? <div className="mt-5 space-y-3">{outbox.map((item, i) => { const id = String(item.id || item.outbox_id || i); const subject = String(item.subject || item.prospect_name || item.to_email || 'Draft awaiting review'); const recipient = String(item.to_email || item.email || item.recipient || 'Recipient not supplied'); const body = String(item.body_text || item.body || item.text || item.content || ''); return <article key={id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-medium">{subject}</h3><p className="mt-1 break-all text-xs text-zinc-500">{recipient}</p></div><span className="rounded-full border border-amber-300/20 px-2.5 py-1 text-[10px] uppercase tracking-wide text-amber-200">Needs approval</span></div>{body && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{body.slice(0, 1200)}{body.length > 1200 ? '…' : ''}</p>}<div className="mt-4 flex gap-2"><button className={btn} disabled={Boolean(busyId)} onClick={() => void act('approve', id)}>{busyId === id ? 'Working…' : <><CheckCircle2 size={15}/> Approve draft</>}</button><button className={btn} disabled={Boolean(busyId)} onClick={() => void act('reject', id)}>Reject</button></div></article> })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center"><p className="text-sm text-zinc-300">No drafts are waiting for approval.</p><p className="mt-1 text-xs text-zinc-500">When Harvey is connected, drafts appear here.</p></div>}
        </div>
        <div className={panel}><p className="text-xs tracking-[.18em] text-zinc-500">ACTIVITY</p><h2 className="mt-2 text-xl font-semibold">Recent events</h2><div className="mt-5 space-y-3">{(data.activity || []).slice(0, 10).map((item, i) => <div key={String(item.id || i)} className="border-l border-white/15 pl-3"><p className="text-sm text-zinc-300">{String(item.description || item.message || item.action || item.event || 'Pipeline event')}</p><p className="mt-1 text-xs text-zinc-500">{String(item.created_at || item.timestamp || item.time || '')}</p></div>)}{!data.activity?.length && <p className="text-sm text-zinc-500">Activity will appear when the agent service is connected.</p>}</div>
          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2 text-sm font-medium"><PauseCircle size={16}/> Safety controls</div><p className="mt-2 text-xs leading-5 text-zinc-400">Keep human approval enabled. Start with low daily volume and a dedicated sending domain; do not connect the main BlueHaven mailbox to cold outreach.</p></div>
          <a className={btn + ' mt-4 w-full justify-center'} href="https://github.com/ethanplusai/harvey" target="_blank" rel="noreferrer">Harvey source and setup <ArrowUpRight size={15}/></a>
        </div>
      </section>
      <footer className="border-t border-white/10 pt-5 text-xs leading-5 text-zinc-500">BlueHaven Harvey integration · Protected by the existing admin session. Outbound delivery stays approval-gated.</footer>
    </div>
  </main>;
}
