const app = document.querySelector('#app');
let state = { projects: [], selected: null, password: false };
const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
const request = async (payload) => {
  const r = await fetch('/api/admin-media' + (payload ? '' : '?_=' + Date.now()), {
    method: payload ? 'POST' : 'GET', cache: 'no-store',
    headers: payload ? { 'Content-Type': 'application/json' } : {},
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || 'Request failed');
  return data;
};
const loginRequest = async password => {
  const r = await fetch('/api/admin-login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ password }) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || 'Invalid password');
  return data;
};

function login(error = '') {
  app.innerHTML = `<section class="admin-login"><div class="login-panel"><span class="eyebrow">BLUEHAVEN STUDIOS / PRIVATE</span><h1>Studio Admin</h1><p>Manage portfolio projects and media without touching the codebase.</p>${error ? `<div class="error">${esc(error)}</div>` : ''}<form id="login-form"><label>Admin password<input name="password" type="password" autocomplete="current-password" required autofocus></label><button type="submit">Enter dashboard</button></form><a href="/">← Back to website</a></div></section>`;
  document.querySelector('#login-form').onsubmit = async e => { e.preventDefault(); try { await loginRequest(new FormData(e.currentTarget).get('password')); await load(); } catch (x) { login(x.message); } };
}

async function load() {
  try { state = { ...state, ...(await request()) }; state.projects = state.projects || []; render(); }
  catch (e) { login(e.message); }
}

function render() {
  const projects = state.projects;
  const selected = projects.find(p => p.id === state.selected) || projects[0];
  state.selected = selected?.id || null;
  app.innerHTML = `<div class="admin-app"><header class="admin-bar"><a href="/" class="admin-brand"><strong>BLUEHAVEN</strong><span>STUDIO ADMIN</span></a><div class="admin-actions"><span class="live">NEON CMS</span><a href="/">Site</a><button id="logout">Log out</button></div></header><div class="admin-workspace"><aside class="admin-sidebar"><div class="side-title"><div><span class="eyebrow">PORTFOLIO</span><h2>Projects</h2></div><button id="new-project" class="square">+</button></div><div class="project-list">${projects.map(p => `<button class="project-row ${p.id === selected?.id ? 'active' : ''}" data-project="${p.id}"><b>${esc(p.name)}</b><small>${esc(p.category || 'Project')} · ${p.media?.length || 0} media</small></button>`).join('') || '<p class="muted">No projects in Neon yet.</p>'}</div></aside><section class="admin-editor">${selected ? editor(selected) : createEditor()}</section></div></div>`;
  document.querySelectorAll('[data-project]').forEach(x => x.onclick = () => { state.selected = x.dataset.project; render(); });
  document.querySelector('#new-project')?.addEventListener('click', () => { state.selected = null; render(); });
  document.querySelector('#logout').onclick = () => { document.cookie = 'bluehaven_admin_session=; Max-Age=0; Path=/'; login(); };
  bindEditor(selected);
}

function createEditor() {
  return `<div class="editor-head"><div><span class="eyebrow">NEW PROJECT</span><h1>Create a project</h1></div></div>${projectForm()}`;
}
function projectForm(p = {}) {
  return `<form id="project-form" class="form-grid"><label>Name<input name="name" value="${esc(p.name || '')}" required></label><label>Slug<input name="slug" value="${esc(p.slug || '')}" required></label><label>Category<input name="category" value="${esc(p.category || '')}"></label><label>Website URL<input name="websiteUrl" value="${esc(p.website_url || '')}" placeholder="https://…"></label><label class="wide">Description<textarea name="description" rows="6">${esc(p.description || '')}</textarea></label><label class="check"><input name="visible" type="checkbox" ${p.visible !== false ? 'checked' : ''}> Visible on public site</label><div class="wide actions"><button class="primary" type="submit">Save project</button><span id="status"></span></div></form>`;
}
function editor(p) {
  return `<div class="editor-head"><div><span class="eyebrow">PROJECT / ${esc(p.slug)}</span><h1>${esc(p.name)}</h1></div><div class="actions"><button id="delete-project" class="danger">Delete project</button></div></div>${projectForm(p)}<section class="media-section"><div class="media-head"><div><span class="eyebrow">MEDIA</span><h2>${p.media?.length || 0} images</h2><p class="muted">Image records are stored in Neon. Paste a public HTTPS image URL to add new media.</p></div></div><form id="media-form" class="media-add"><input name="url" type="url" placeholder="https://example.com/image.jpg" required><button class="primary" type="submit">Add image</button></form><div class="media-grid">${(p.media || []).map(m => `<article class="media-card"><img src="${esc(m.url)}" alt="${esc(m.alt || p.name)}"><div><span>${esc(m.alt || p.name)}</span><button class="remove-media" data-media="${m.id}" type="button">Remove</button></div></article>`).join('') || '<div class="media-empty">No media records. The Neon media table is currently empty.</div>'}</div></section>`;
}
function bindEditor(p) {
  document.querySelector('#project-form')?.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.currentTarget; const d = Object.fromEntries(new FormData(f)); d.action='saveProject'; d.id=p?.id; d.visible=f.visible.checked; d.sortOrder=p?.sort_order || state.projects.length * 10;
    try { await request(d); document.querySelector('#status').textContent='Saved to Neon'; await load(); } catch(x) { document.querySelector('#status').textContent=x.message; }
  });
  document.querySelector('#delete-project')?.addEventListener('click', async () => { if (!p || !confirm(`Delete “${p.name}” and its media records?`)) return; try { await request({ action:'deleteProject', id:p.id }); state.selected=null; await load(); } catch(x) { alert(x.message); } });
  document.querySelector('#media-form')?.addEventListener('submit', async e => { e.preventDefault(); const url=new FormData(e.currentTarget).get('url'); try { await request({action:'saveMedia',projectId:p.id,url,alt:p.name,type:'image'}); await load(); } catch(x) { alert(x.message); } });
  document.querySelectorAll('.remove-media').forEach(b => b.onclick = async () => { if (!confirm('Remove this image record?')) return; await request({action:'deleteMedia',id:b.dataset.media}); await load(); });
}

load();
