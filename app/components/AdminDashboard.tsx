import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Plus, Save, Trash2, ImagePlus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import '../admin.css';

type Media = { id: string; url: string; alt?: string; featured?: boolean; storageKey?: string; order?: number };
type Project = { id: string; slug: string; name: string; category?: string; description?: string; website_url?: string; visible: boolean; sort_order: number; media: Media[] };
type CmsResponse = { projects: Project[]; sections: any[]; settings: Record<string, unknown> };
const emptyForm = { slug: '', name: '', category: '', description: '', websiteUrl: '', visible: true, sortOrder: 0 };

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newImage, setNewImage] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await fetch(`/api/admin-media?_=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) { setMessage('Could not load the CMS.'); return; }
    const data: CmsResponse = await response.json();
    setProjects(data.projects || []); setAuthenticated(true);
    setSelected(current => current ? (data.projects || []).find(p => p.id === current.id) || null : null);
  };
  useEffect(() => { void load(); }, []);

  const login = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin-login', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ password }) });
      if (!response.ok) { setMessage('Incorrect admin password.'); return; }
      setPassword(''); await load();
    } finally { setBusy(false); }
  };
  const logout = async () => { setBusy(true); try { await fetch('/api/admin-logout', { method: 'POST', cache: 'no-store' }); } finally { window.location.href = '/admin'; } };
  const choose = (project: Project) => { setSelected(project); setForm({ slug: project.slug || '', name: project.name || '', category: project.category || '', description: project.description || '', websiteUrl: project.website_url || '', visible: project.visible !== false, sortOrder: project.sort_order || 0 }); setMessage(''); };

  const saveProject = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin-media', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ action: 'saveProject', id: selected?.id, ...form }) });
      const data = await response.json(); if (!response.ok) { setMessage(data.error || 'Could not save project.'); return; }
      setMessage('Saved to Neon.'); await load();
    } finally { setBusy(false); }
  };
  const createProject = () => { setSelected(null); setForm({ ...emptyForm, sortOrder: projects.length * 10 }); setMessage('Fill in the new project and save it.'); };
  const deleteProject = async () => {
    if (!selected || !window.confirm(`Delete “${selected.name}” and all of its media records?`)) return;
    setBusy(true); try {
      const response = await fetch('/api/admin-media', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ action: 'deleteProject', id: selected.id }) });
      if (!response.ok) { setMessage('Could not delete project.'); return; }
      setSelected(null); setForm(emptyForm); setMessage('Project deleted.'); await load();
    } finally { setBusy(false); }
  };
  const addImage = async () => {
    if (!selected || !newImage.trim()) return; setBusy(true);
    try {
      const response = await fetch('/api/admin-media', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ action: 'saveMedia', projectId: selected.id, url: newImage.trim(), alt: selected.name, type: 'image' }) });
      const data = await response.json(); if (!response.ok) { setMessage(data.error || 'Could not add image.'); return; }
      setNewImage(''); setMessage('Image record added.'); await load();
    } finally { setBusy(false); }
  };
  const deleteImage = async (id: string) => {
    if (!window.confirm('Delete this image record?')) return; setBusy(true);
    try { const response = await fetch('/api/admin-media', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ action: 'deleteMedia', id }) }); if (!response.ok) { setMessage('Could not delete image.'); return; } setMessage('Image deleted.'); await load(); }
    finally { setBusy(false); }
  };

  if (authenticated === null) return <main className="admin-shell admin-loading">Loading Studio Admin…</main>;
  if (!authenticated) return <main className="admin-shell admin-login"><form className="admin-login-panel" onSubmit={e => { e.preventDefault(); void login(); }}><span className="admin-eyebrow">BLUEHAVEN STUDIOS / PRIVATE</span><h1>Studio Admin</h1><p>Manage projects and media without touching the codebase.</p><input autoFocus type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" autoComplete="current-password" /><button disabled={busy} type="submit">{busy ? 'Checking…' : 'Enter dashboard'}</button>{message && <small className="admin-error">{message}</small>}</form></main>;

  return <main className="admin-shell"><header className="admin-topbar"><div><span className="admin-eyebrow">BLUEHAVEN STUDIOS / CMS</span><h1>Portfolio Control</h1></div><div className="admin-actions"><a href="/" className="admin-ghost"><ArrowLeft size={16} /> Site</a><button className="admin-ghost" disabled={busy} onClick={() => void logout()}><LogOut size={16} /> Logout</button></div></header>
    <div className="admin-layout"><aside className="admin-sidebar"><div className="admin-sidebar-head"><span>Projects</span><button onClick={createProject} aria-label="Create project"><Plus size={17} /></button></div>{projects.map(project => <button key={project.id} className={`admin-project ${selected?.id === project.id ? 'active' : ''}`} onClick={() => choose(project)}><span>{project.name}</span><small>{project.category || 'Uncategorised'} · {project.media?.length || 0} media</small></button>)}{!projects.length && <p className="admin-muted">No projects yet.</p>}</aside>
      <section className="admin-editor"><div className="admin-editor-head"><div><span className="admin-eyebrow">{selected ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h2>{selected?.name || 'Create a project'}</h2></div><div className="admin-actions"><button className="admin-ghost" disabled={busy} onClick={() => void load()}><RefreshCw size={16} /> Refresh</button>{selected && <button className="admin-danger" disabled={busy} onClick={() => void deleteProject()}><Trash2 size={16} /> Delete</button>}<button className="admin-save" disabled={busy} onClick={() => void saveProject()}><Save size={16} /> {busy ? 'Saving…' : 'Save'}</button></div></div>
        <div className="admin-form-grid"><label>Project name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></label><label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label><label>Website URL<input value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://…" /></label><label className="admin-wide">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6} /></label><label className="admin-toggle"><input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} /> {form.visible ? <Eye size={16} /> : <EyeOff size={16} />} Visible on website</label></div>
        {selected && <section className="admin-media-section"><div className="admin-media-head"><div><span className="admin-eyebrow">MEDIA</span><h3>{selected.media?.length || 0} images</h3></div></div><div className="admin-add-media"><ImagePlus size={18} /><input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="Paste an HTTPS image URL" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addImage(); } }} /><button onClick={() => void addImage()} disabled={busy || !newImage.trim()}>Add image</button></div><div className="admin-media-grid">{(selected.media || []).map(item => <figure key={item.id}><img src={item.url} alt={item.alt || selected.name} /><button aria-label="Delete image" onClick={() => void deleteImage(item.id)}><Trash2 size={15} /></button></figure>)}</div>{!selected.media?.length && <div className="admin-empty">No media records. Add an HTTPS image URL above.</div>}</section>}
        {message && <p className="admin-status">{message}</p>}</section></div></main>;
}
