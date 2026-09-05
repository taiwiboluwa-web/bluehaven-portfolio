const app = document.querySelector('#app');
let state = { projects: [], selected: null };

const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const api = async (payload = null) => {
  const response = await fetch('/api/admin.js', {
    method: payload ? 'POST' : 'GET',
    headers: payload ? {'Content-Type':'application/json'} : {},
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

function login(error = '') {
  app.innerHTML = `
    <section class="login-shell">
      <div class="login-mark">BH</div>
      <p class="eyebrow">BLUEHAVEN STUDIOS</p>
      <h1>Studio CMS</h1>
      <p class="muted">Private workspace for portfolio projects and media.</p>
      ${error ? `<div class="error">${esc(error)}</div>` : ''}
      <form id="login-form" class="login-form">
        <label>Admin password<input name="password" type="password" autocomplete="current-password" required autofocus /></label>
        <button>Enter studio <span>↗</span></button>
      </form>
      <a class="back" href="/">← Back to website</a>
    </section>`;
  document.querySelector('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get('password');
    try { await api({action:'login', password}); await load(); }
    catch (err) { login(err.message); }
  });
}

async function load() {
  try { state = { ...state, ...(await api()) }; render(); }
  catch (err) { login(err.message); }
}

function render() {
  const projects = state.projects || [];
  const selected = projects.find(p => p.id === state.selected) || projects[0];
  state.selected = selected?.id || null;
  app.innerHTML = `
    <div class="cms">
      <header class="topbar">
        <a href="/" class="brand"><span>BH</span><div><b>BLUEHAVEN</b><small>STUDIO CMS</small></div></a>
        <div class="top-actions"><span class="live-dot">LIVE</span><button id="logout" class="ghost">Log out</button></div>
      </header>
      <div class="workspace">
        <aside class="sidebar">
          <div class="side-head"><div><span class="eyebrow">WORKSPACE</span><h2>Portfolio</h2></div><button id="new-project" class="icon-btn">+</button></div>
          <div class="project-list">
            ${projects.map(p => `<button class="project-row ${p.id===state.selected?'active':''}" data-project="${p.id}"><span class="project-index">${String(p.sort_order+1).padStart(2,'0')}</span><span><b>${esc(p.name)}</b><small>${esc(p.category || 'Project')}</small></span><i>${p.media?.length || 0}</i></button>`).join('')}
            ${projects.length ? '' : '<div class="empty">No projects yet.<br/>Create your first one.</div>'}
          </div>
        </aside>
        <section class="editor">
          ${selected ? editor(selected) : welcome()}
        </section>
      </div>
    </div>`;

  document.querySelector('#logout')?.addEventListener('click', async () => { await api({action:'logout'}); login(); });
  document.querySelector('#new-project')?.addEventListener('click', () => projectForm());
  document.querySelectorAll('[data-project]').forEach(el => el.addEventListener('click', () => { state.selected = el.dataset.project; render(); }));
  bindEditor(selected);
}

function welcome() { return `<div class="welcome"><span class="eyebrow">BLUEHAVEN / CMS</span><h1>Make the portfolio<br/><em>move.</em></h1><p>Manage the work shown on the public site without touching the source code.</p><button id="new-project" class="primary">Create project</button></div>`; }

function editor(p) {
  return `<div class="editor-head"><div><span class="eyebrow">PROJECT / ${esc(p.slug)}</span><h1>${esc(p.name)}</h1></div><button id="delete-project" class="danger">Delete project</button></div>
    <form id="project-form" class="form-grid">
      <input type="hidden" name="id" value="${p.id}" />
      <label>Name<input name="name" value="${esc(p.name)}" required /></label>
      <label>Slug<input name="slug" value="${esc(p.slug)}" required /></label>
      <label>Category<input name="category" value="${esc(p.category || '')}" /></label>
      <label>Website URL<input name="websiteUrl" value="${esc(p.website_url || '')}" placeholder="https://..." /></label>
      <label class="wide">Description<textarea name="description" rows="4">${esc(p.description || '')}</textarea></label>
      <label>Order<input name="sortOrder" type="number" value="${p.sort_order || 0}" /></label>
      <label class="check"><input name="visible" type="checkbox" ${p.visible ? 'checked' : ''} /> Visible on public site</label>
      <div class="wide form-actions"><button class="primary">Save project</button><span id="project-status" class="status"></span></div>
    </form>
    <div class="media-head"><div><span class="eyebrow">MEDIA LIBRARY</span><h2>${p.media?.length || 0} assets</h2></div><button id="add-media" class="primary small">+ Add image</button></div>
    <div class="media-grid">${(p.media || []).map(m => mediaCard(m)).join('') || '<div class="media-empty">Add image URLs here. Neon Object Storage is ready for the production media bucket.</div>'}</div>`;
}

function mediaCard(m) { return `<article class="media-card"><img src="${esc(m.url)}" alt="${esc(m.alt || '')}" onerror="this.classList.add('broken')"/><div class="media-meta"><div><b>${esc(m.alt || 'Untitled asset')}</b><small>${esc(m.type || 'image')} · order ${m.order ?? 0}</small></div><button class="delete-media" data-media="${m.id}">Remove</button></div></article>`; }

function projectForm() {
  app.innerHTML = `<section class="new-project"><a class="back" href="/admin">← Portfolio</a><span class="eyebrow">NEW PROJECT</span><h1>Add a new<br/><em>piece.</em></h1><form id="new-form" class="form-stack"><label>Name<input name="name" required autofocus /></label><label>Slug<input name="slug" required placeholder="project-slug" /></label><label>Category<input name="category" /></label><label>Website URL<input name="websiteUrl" /></label><label>Description<textarea name="description" rows="5"></textarea></label><label>Order<input name="sortOrder" type="number" value="0" /></label><label class="check"><input name="visible" type="checkbox" checked /> Visible on public site</label><button class="primary">Create project</button></form></section>`;
  document.querySelector('#new-form').addEventListener('submit', async e => { e.preventDefault(); const d=Object.fromEntries(new FormData(e.currentTarget)); d.action='saveProject'; d.visible=true; try { await api(d); await load(); } catch(err) { alert(err.message); } });
}

function bindEditor(p) {
  if (!p) { document.querySelector('#new-project')?.addEventListener('click', projectForm); return; }
  document.querySelector('#project-form')?.addEventListener('submit', async e => { e.preventDefault(); const f=e.currentTarget; const d=Object.fromEntries(new FormData(f)); d.action='saveProject'; d.visible=f.visible.checked; try { await api(d); document.querySelector('#project-status').textContent='Saved'; await load(); } catch(err) { alert(err.message); } });
  document.querySelector('#delete-project')?.addEventListener('click', async () => { if(confirm(`Delete ${p.name}?`)) { await api({action:'deleteProject',id:p.id}); state.selected=null; await load(); } });
  document.querySelector('#add-media')?.addEventListener('click', () => mediaForm(p));
  document.querySelectorAll('.delete-media').forEach(b => b.addEventListener('click', async () => { if(confirm('Remove this image?')) { await api({action:'deleteMedia',id:b.dataset.media}); await load(); } }));
}

function mediaForm(p) {
  const modal=document.createElement('div'); modal.className='modal'; modal.innerHTML=`<div class="modal-card"><button class="modal-close">×</button><span class="eyebrow">ADD MEDIA</span><h2>Bring an image in.</h2><p class="muted">Paste a public image URL now. The Neon Object Storage bucket is reserved for direct uploads as its storage credentials are connected.</p><form id="media-form" class="form-stack"><label>Image URL<input name="url" type="url" required placeholder="https://..." autofocus /></label><label>Storage key<input name="storageKey" placeholder="projects/project/image.webp" /></label><label>Alt text<input name="alt" /></label><label>Order<input name="order" type="number" value="0" /></label><button class="primary">Add image</button></form></div>`; document.body.appendChild(modal); modal.querySelector('.modal-close').onclick=()=>modal.remove(); modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.action='saveMedia';d.projectId=p.id;try{await api(d);modal.remove();await load()}catch(err){alert(err.message)}};
}

load();
