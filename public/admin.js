const app = document.querySelector('#app');
let state = { projects: [], selected: null, filter: 'all' };

const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));

const request = async (payload) => {
  const r = await fetch('/api/admin-media' + (payload ? '' : '?_=' + Date.now()), {
    method: payload ? 'POST' : 'GET',
    cache: 'no-store',
    headers: payload ? { 'Content-Type': 'application/json' } : {},
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || 'Request failed');
  return data;
};

const loginRequest = async password => {
  const r = await fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || 'Invalid password');
  return data;
};

const logoutRequest = async () => {
  await fetch('/api/admin-logout', { method: 'POST', cache: 'no-store' });
};

function login(error = '') {
  app.innerHTML = `<section class="admin-login"><div class="login-panel"><span class="eyebrow">BLUEHAVEN STUDIOS / PRIVATE</span><h1>Studio Admin</h1><p>Manage projects, media, and what is visible on the public portfolio.</p>${error ? `<div class="error">${esc(error)}</div>` : ''}<form id="login-form"><label>Admin password<input name="password" type="password" autocomplete="current-password" required autofocus></label><button type="submit">Enter dashboard</button></form><a href="/">← Back to website</a></div></section>`;
  document.querySelector('#login-form').onsubmit = async e => {
    e.preventDefault();
    try { await loginRequest(new FormData(e.currentTarget).get('password')); await load(); }
    catch (x) { login(x.message); }
  };
}

async function load() {
  try {
    state = { ...state, ...(await request()) };
    state.projects = Array.isArray(state.projects) ? state.projects : [];
    render();
  } catch (e) {
    login(e.message);
  }
}

function visibleProjects() {
  return state.projects.filter(project => state.filter === 'all' || (state.filter === 'published' ? project.visible !== false : project.visible === false));
}

function render() {
  const projects = visibleProjects();
  const selected = state.projects.find(p => p.id === state.selected) || projects[0] || state.projects[0];
  state.selected = selected?.id || null;
  const publishedCount = state.projects.filter(p => p.visible !== false).length;
  const hiddenCount = state.projects.length - publishedCount;

  app.innerHTML = `<div class="admin-app"><header class="admin-bar"><a href="/" class="admin-brand"><strong>BLUEHAVEN</strong><span>STUDIO ADMIN</span></a><div class="admin-actions"><span class="live">NEON CMS</span><a href="/">Site</a><button id="logout">Log out</button></div></header><div class="admin-workspace"><aside class="admin-sidebar"><div class="side-title"><div><span class="eyebrow">PORTFOLIO</span><h2>Projects</h2></div><button id="new-project" class="square" title="New project">+</button></div><div class="project-filters"><button data-filter="all" class="${state.filter === 'all' ? 'active' : ''}">All ${state.projects.length}</button><button data-filter="published" class="${state.filter === 'published' ? 'active' : ''}">Live ${publishedCount}</button><button data-filter="hidden" class="${state.filter === 'hidden' ? 'active' : ''}">Hidden ${hiddenCount}</button></div><div class="project-list">${projects.map(p => `<button class="project-row ${p.id === selected?.id ? 'active' : ''}" data-project="${p.id}"><b>${esc(p.name)}</b><small>${esc(p.category || 'Project')} · ${p.media?.length || 0} media · <span class="${p.visible !== false ? 'status-live' : 'status-hidden'}">${p.visible !== false ? 'LIVE' : 'HIDDEN'}</span></small></button>`).join('') || '<p class="muted">No projects in this view.</p>'}</div></aside><section class="admin-editor">${selected ? editor(selected) : createEditor()}</section></div></div>`;

  document.querySelectorAll('[data-project]').forEach(x => x.onclick = () => { state.selected = x.dataset.project; render(); });
  document.querySelectorAll('[data-filter]').forEach(x => x.onclick = () => { state.filter = x.dataset.filter; render(); });
  document.querySelector('#new-project')?.addEventListener('click', () => { state.selected = null; render(); });
  document.querySelector('#logout').onclick = async () => { await logoutRequest(); state = { projects: [], selected: null, filter: 'all' }; login(); };
  bindEditor(selected);
}

function createEditor() {
  return `<div class="editor-head"><div><span class="eyebrow">NEW PROJECT</span><h1>Create a project</h1><p class="muted">New projects publish immediately unless you switch them off before saving.</p></div></div>${projectForm()}`;
}

function projectForm(p = {}) {
  const isLive = p.visible !== false;
  return `<form id="project-form" class="form-grid"><label>Name<input name="name" value="${esc(p.name || '')}" required></label><label>Slug<input name="slug" value="${esc(p.slug || '')}" required></label><label>Category<input name="category" value="${esc(p.category || '')}"></label><label>Website URL<input name="websiteUrl" value="${esc(p.website_url || '')}" placeholder="https://…"></label><label class="wide">Description<textarea name="description" rows="6">${esc(p.description || '')}</textarea></label><label class="check"><input name="visible" type="checkbox" ${isLive ? 'checked' : ''}> Publish on public site</label><div class="wide actions"><button class="primary" type="submit">Save project</button><span id="status"></span></div></form>`;
}

function editor(p) {
  const isLive = p.visible !== false;
  return `<div class="editor-head"><div><span class="eyebrow">PROJECT / ${esc(p.slug)}</span><div class="project-title-row"><h1>${esc(p.name)}</h1><span class="project-status ${isLive ? 'published' : 'hidden'}">${isLive ? 'LIVE ON SITE' : 'HIDDEN FROM SITE'}</span></div></div><div class="actions"><button id="toggle-project" class="${isLive ? 'secondary' : 'primary'}">${isLive ? 'Hide project' : 'Publish project'}</button><button id="delete-project" class="danger">Delete project</button></div></div>${projectForm(p)}<section class="media-section"><div class="media-head"><div><span class="eyebrow">MEDIA</span><h2>${p.media?.length || 0} images</h2><p class="muted">Images are stored as records in Neon. Paste a public HTTPS image URL to add media.</p></div></div><form id="media-form" class="media-add"><input name="url" type="url" placeholder="https://example.com/image.jpg" required><button class="primary" type="submit">Add image</button></form><div class="media-grid">${(p.media || []).map(m => `<article class="media-card"><img src="${esc(m.url)}" alt="${esc(m.alt || p.name)}"><div><span>${esc(m.alt || p.name)}</span><button class="remove-media" data-media="${m.id}" type="button">Remove</button></div></article>`).join('') || '<div class="media-empty">No media records yet.</div>'}</div></section>`;
}

async function saveProjectFromForm(form, p) {
  const d = Object.fromEntries(new FormData(form));
  d.action = 'saveProject';
  if (p?.id) d.id = p.id;
  d.visible = form.visible.checked;
  d.sortOrder = p?.sort_order ?? state.projects.length * 10;
  await request(d);
}

function bindEditor(p) {
  document.querySelector('#project-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const status = document.querySelector('#status');
    try {
      await saveProjectFromForm(form, p);
      status.textContent = 'Saved to Neon';
      await load();
    } catch (x) {
      status.textContent = x.message;
    }
  });

  document.querySelector('#toggle-project')?.addEventListener('click', async () => {
    try {
      await request({ action: 'saveProject', id: p.id, slug: p.slug, name: p.name, category: p.category, description: p.description, websiteUrl: p.website_url, visible: p.visible === false, sortOrder: p.sort_order });
      await load();
    } catch (x) { alert(x.message); }
  });

  document.querySelector('#delete-project')?.addEventListener('click', async () => {
    if (!p || !confirm(`Delete “${p.name}” and its media records?`)) return;
    try { await request({ action:'deleteProject', id:p.id }); state.selected = null; await load(); }
    catch (x) { alert(x.message); }
  });

  document.querySelector('#media-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get('url');
    try { await request({ action:'saveMedia', projectId:p.id, url, alt:p.name, type:'image' }); await load(); }
    catch (x) { alert(x.message); }
  });

  document.querySelectorAll('.remove-media').forEach(button => button.onclick = async () => {
    if (!confirm('Remove this image record?')) return;
    try { await request({ action:'deleteMedia', id:button.dataset.media }); await load(); }
    catch (x) { alert(x.message); }
  });
}

load();
