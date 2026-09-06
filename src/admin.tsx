import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Eye, EyeOff, ImagePlus, LogOut, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import './admin.css';

type Project = { id:string; name:string; category:string; description:string; website_url?:string; visible:boolean; sort_order:number; created_at:string };
type Media = { id:string; project_id:string; storage_url:string; file_name?:string; mime_type?:string; alt_text?:string };

const api = async (url:string, init?:RequestInit) => {
  const res = await fetch(url, { credentials:'include', ...init });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

function Admin() {
  const [configured,setConfigured]=useState(true);
  const [authenticated,setAuthenticated]=useState(false);
  const [password,setPassword]=useState('');
  const [projects,setProjects]=useState<Project[]>([]);
  const [media,setMedia]=useState<Media[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [showCreate,setShowCreate]=useState(false);
  const [name,setName]=useState('');
  const [category,setCategory]=useState('Graphic Design');
  const [description,setDescription]=useState('');
  const [file,setFile]=useState<File|null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const auth=await api('/api/admin'); setConfigured(auth.configured); setAuthenticated(auth.authenticated);
      if(auth.authenticated){ const data=await api('/api/portfolio'); setProjects(data.projects||[]); setMedia(data.media||[]); }
    } catch(e){setError(e instanceof Error?e.message:'Unable to load admin');}
    finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const login = async (e:React.FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { await api('/api/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password})}); setPassword(''); await load(); } catch(e){setError(e instanceof Error?e.message:'Login failed')} finally{setBusy(false)} };
  const logout = async()=>{await api('/api/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'logout'})});setAuthenticated(false);setProjects([]);setMedia([])};
  const create = async(e:React.FormEvent)=>{e.preventDefault();if(!name.trim())return;setBusy(true);setError('');try{const data=await api('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'create',name,category,description,visible:true})});if(file){const reader=new FileReader();const dataUrl=await new Promise<string>((resolve,reject)=>{reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)});await api('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'upload',project_id:data.id,data_url:dataUrl,file_name:file.name,alt_text:name})});}setName('');setDescription('');setFile(null);setShowCreate(false);await load()}catch(e){setError(e instanceof Error?e.message:'Create failed')}finally{setBusy(false)}};
  const toggle=async(id:string)=>{try{await api('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'toggle',id})});await load()}catch(e){setError(e instanceof Error?e.message:'Update failed')}};
  const remove=async(id:string)=>{if(!confirm('Delete this project and its media?'))return;try{await api('/api/portfolio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'delete',id})});await load()}catch(e){setError(e instanceof Error?e.message:'Delete failed')}};
  const visibleCount=useMemo(()=>projects.filter(p=>p.visible).length,[projects]);

  if(loading)return <div className="admin-shell"><div className="loader">Loading BlueHaven Studio…</div></div>;
  if(!authenticated)return <div className="admin-shell"><div className="login-card"><div className="eyebrow">BLUEHAVEN STUDIOS · ADMIN</div><h1>Studio control.</h1><p>Manage the work that appears on your public portfolio.</p>{!configured&&<div className="alert">ADMIN_PASSWORD is not configured on this deployment.</div>}{error&&<div className="alert">{error}</div>}<form onSubmit={login}><label>Password<input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" /></label><button disabled={busy||!configured}>{busy?'Signing in…':'Enter studio'}</button></form><a className="back" href="/">← Back to website</a></div></div>;

  return <div className="admin-shell"><header className="admin-top"><div><div className="eyebrow">BLUEHAVEN STUDIOS</div><h1>Studio Admin</h1></div><div className="top-actions"><a href="/">View site</a><button onClick={load} title="Refresh"><RefreshCw size={17}/></button><button onClick={logout}><LogOut size={17}/> Sign out</button></div></header>
    <main className="admin-main"><div className="stats"><div><strong>{projects.length}</strong><span>Total projects</span></div><div><strong>{visibleCount}</strong><span>Visible</span></div><div><strong>{media.length}</strong><span>Uploaded media</span></div><button className="add" onClick={()=>setShowCreate(true)}><Plus size={20}/> New work</button></div>
    {error&&<div className="alert">{error}</div>}
    <section className="panel"><div className="panel-head"><div><h2>Portfolio</h2><p>Publish, hide, and manage recent graphics.</p></div></div>{projects.length===0?<div className="empty"><ImagePlus size={32}/><h3>No managed work yet</h3><p>Create your first graphic from this dashboard.</p></div>:<div className="project-list">{projects.map(p=><article className="project-row" key={p.id}><div className="thumb">{media.find(m=>m.project_id===p.id)?.storage_url?<img src={media.find(m=>m.project_id===p.id)!.storage_url} alt=""/>:<ImagePlus size={24}/>}</div><div className="project-info"><div className="project-title"><h3>{p.name}</h3><span className={p.visible?'published':'hidden'}>{p.visible?'Published':'Hidden'}</span></div><p>{p.category} · {p.description||'No description'}</p></div><div className="row-actions"><button onClick={()=>toggle(p.id)} title={p.visible?'Hide':'Publish'}>{p.visible?<EyeOff size={18}/>:<Eye size={18}/>}</button><button className="danger" onClick={()=>remove(p.id)} title="Delete"><Trash2 size={18}/></button></div></article>)}</div>}</section></main>
    {showCreate&&<div className="modal-backdrop"><form className="create-modal" onSubmit={create}><button type="button" className="close" onClick={()=>setShowCreate(false)}><X/></button><div className="eyebrow">NEW WORK</div><h2>Add a graphic</h2><label>Title<input value={name} onChange={e=>setName(e.target.value)} placeholder="Project title" required/></label><label>Category<input value={category} onChange={e=>setCategory(e.target.value)}/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description"/></label><label className="upload"><Upload size={20}/><span>{file?file.name:'Choose an image'}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button className="submit" disabled={busy}>{busy?'Publishing…':'Publish work'}</button></form></div>}
  </div>;
}

createRoot(document.getElementById('admin-root')!).render(<Admin />);
