import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ImagePlus, LogOut, Save, Trash2 } from 'lucide-react';

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({ slug: '', name: '', category: '', description: '', websiteUrl: '', visible: true, sortOrder: 0 });
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await fetch('/api/admin-media');
    if (response.status === 401) return setAuthenticated(false);
    if (response.ok) setProjects(await response.json());
  };

  useEffect(() => { load(); }, []);

  const login = async () => {
    const response = await fetch('/api/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (response.ok) { setAuthenticated(true); setPassword(''); load(); } else setMessage('Incorrect admin password.');
  };

  const choose = (project: any) => {
    setSelected(project);
    setForm({ slug: project.slug, name: project.name, category: project.category || '', description: project.description || '', websiteUrl: project.website_url || '', visible: project.visible, sortOrder: project.sort_order });
    setMessage('');
  };

  const save = async () => {
    const response = await fetch('/api/admin-media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (response.ok) { setMessage('Saved to Neon.'); await load(); } else setMessage('Could not save changes.');
  };

  if (!authenticated) return <main className='min-h-screen bg-[#080808] text-white grid place-items-center p-6'><div className='w-full max-w-md border border-white/10 rounded-3xl p-8 bg-white/[0.03] shadow-2xl'><p className='text-xs uppercase tracking-[0.3em] text-white/40 mb-3'>Bluehaven Studios</p><h1 className='text-4xl font-semibold tracking-tight mb-3'>Studio Admin</h1><p className='text-white/50 mb-8'>Manage portfolio content without touching the codebase.</p><input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} type='password' placeholder='Admin password' className='w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30' /><button onClick={login} className='mt-3 w-full rounded-xl bg-white text-black font-semibold py-3 hover:bg-white/90'>Enter dashboard</button>{message && <p className='mt-4 text-sm text-red-300'>{message}</p>}</div></main>;

  return <main className='min-h-screen bg-[#080808] text-white p-4 md:p-8'><div className='max-w-7xl mx-auto'><header className='flex flex-wrap items-center justify-between gap-4 mb-8'><div><p className='text-xs uppercase tracking-[0.3em] text-white/40'>Bluehaven Studios</p><h1 className='text-3xl md:text-5xl font-semibold tracking-tight'>Portfolio Control</h1></div><div className='flex gap-2'><button onClick={() => window.location.href = '/'} className='border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2'><ArrowLeft size={16}/> Site</button><button onClick={() => { document.cookie = 'bluehaven_admin_session=; Max-Age=0; Path=/'; location.reload(); }} className='border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2'><LogOut size={16}/> Logout</button></div></header><div className='grid lg:grid-cols-[320px_1fr] gap-5'><aside className='border border-white/10 rounded-2xl p-3 bg-white/[0.02] h-fit'><div className='flex items-center justify-between px-2 py-2 mb-2'><span className='text-sm text-white/50'>Projects</span><ImagePlus size={17}/></div>{projects.map(project => <button key={project.id} onClick={() => choose(project)} className={`w-full text-left rounded-xl px-3 py-3 mb-1 transition ${selected?.id === project.id ? 'bg-white text-black' : 'hover:bg-white/5'}`}><div className='font-medium'>{project.name}</div><div className='text-xs opacity-50'>{project.category || project.slug}</div></button>)}</aside><section className='border border-white/10 rounded-2xl p-5 md:p-8 bg-white/[0.02]'>{selected ? <><div className='flex items-start justify-between gap-4 mb-8'><div><p className='text-xs uppercase tracking-[0.25em] text-white/40'>Edit project</p><h2 className='text-2xl font-semibold'>{selected.name}</h2></div><button onClick={save} className='rounded-xl bg-white text-black px-4 py-2 font-semibold flex items-center gap-2'><Save size={16}/> Save</button></div><div className='grid md:grid-cols-2 gap-4'>{[['name','Project name'],['slug','Slug'],['category','Category'],['websiteUrl','Website URL']].map(([key,label]) => <label key={key} className='text-sm text-white/50'>{label}<input value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})} className='mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30'/></label>)}<label className='text-sm text-white/50 md:col-span-2'>Description<textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} className='mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30'/></label></div><div className='mt-8 border-t border-white/10 pt-6'><h3 className='font-semibold mb-3'>Current media</h3><div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-3'>{(selected.media || []).map((item: any) => <div key={item.id} className='aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10'><img src={item.url} alt={item.alt || ''} className='w-full h-full object-cover'/></div>)}</div><p className='mt-4 text-sm text-white/40'>Media records are stored in Neon. The storage layer can be connected separately for direct file uploads.</p></div>{message && <motion.p initial={{opacity:0}} animate={{opacity:1}} className='mt-5 text-sm text-emerald-300'>{message}</motion.p>}</> : <div className='min-h-[420px] grid place-items-center text-center'><div><Trash2 className='mx-auto mb-4 text-white/20' size={36}/><h2 className='text-xl font-semibold'>Select a project</h2><p className='text-white/40 mt-2'>Choose a portfolio project to edit its content.</p></div></div>}</section></div></div></main>;
}
