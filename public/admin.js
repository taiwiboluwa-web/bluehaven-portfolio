const app = document.querySelector('#app');
let state = { projects: [], sections: [], settings: {}, selected: null, view: 'overview' };

const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const api = async (payload = null) => {
  const response = await fetch('/api/admin.js', { method: payload ? 'POST' : 'GET', headers: payload ? {'Content-Type':'application/json'} : {}, body: payload ? JSON.stringify(payload) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

function login(error = '') {
  app.innerHTML = `<section class="login-shell"><div class="login-mark">BH</div><p class="eyebrow">BLUEHAVEN STUDIOS</p><h1>Studio CMS</h1><p class="muted">Private control room for content, portfolio, media and layout.</p>${error ? `<div class="error">${esc(error)}</div>` : ''}<form id="login-form" class="login-form"><label>Admin password<input name="password" type="password" autocomplete="current-password" required autofocus /></label><button>Enter studio <span>↗</span></button></form><a class="back" href="/">← Back to website</a></section>`;
  document.querySelector('#login-form').addEventListener('submit', async e => { e.preventDefault(); const password = new FormData(e.currentTarget).get('password'); try { await api({action:'login', password}); await load(); } catch (err) { login(err.message); } });
}

async function load() { try { state = { ...state, ...(await api()) }; render(); } catch (err) { login(err.message); } }

function render() {
  const projects = state.projects || [];
  const selected = projects.find(p => p.id === state.selected) || projects[0];
  state.selected = selected?.id || null;
  app.innerHTML = `<div class="cms"><header class="topbar"><a href="/" class="brand"><span>BH</span><div><b>BLUEHAVEN</b><small>STUDIO CMS</small></div></a><div class="top-actions"><span class="live-dot">LIVE</span><button id="logout" class="ghost">Log out</button></div></header><div class="workspace"><aside class="sidebar"><nav class="cms-nav"><button data-view="overview" class="nav-btn ${state.view==='overview'?'active':''}">Overview</button><button data-view="layout" class="nav-btn ${state.view==='layout'?'active':''}">Sections & Layout</button><button data-view="portfolio" class="nav-btn ${state.view==='portfolio'?'active':''}">Portfolio</button><button data-view="settings" class="nav-btn ${state.view==='settings'?'active':''}">Site Settings</button></nav>${state.view==='portfolio' ? portfolioSidebar(projects, selected) : ''}</aside><section class="editor">${state.view==='overview' ? overview() : state.view==='layout' ? layoutEditor() : state.view==='settings' ? settingsEditor() : (selected ? editor(selected) : welcome())}</section></div></div>`;
  document.querySelector('#logout')?.addEventListener('click', async () => { await api({action:'logout'}); login(); });
  document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', () => { state.view = el.dataset.view; render(); }));
  document.querySelectorAll('[data-project]').forEach(el => el.addEventListener('click', () => { state.selected = el.dataset.project; state.view='portfolio'; render(); }));
  bindCurrentView(selected);
}

function portfolioSidebar(projects, selected) { return `<div class="side-head"><div><span class="eyebrow">WORKSPACE</span><h2>Portfolio</h2></div><button id="new-project" class="icon-btn">+</button></div><div class="project-list">${projects.map(p => `<button class="project-row ${p.id===selected?.id?'active':''}" data-project="${p.id}"><span class="project-index">${String(p.sort_order+1).padStart(2,'0')}</span><span><b>${esc(p.name)}</b><small>${esc(p.category || 'Project')}</small></span><i>${p.media?.length || 0}</i></button>`).join('') || '<div class="empty">No projects yet.</div>'}</div>`; }

function overview() {
  const visible = (state.sections || []).filter(s => s.visible).length;
  const media = (state.projects || []).reduce((n,p) => n + (p.media?.length || 0), 0);
  return `<div class="welcome"><span class="eyebrow">BLUEHAVEN / CONTROL ROOM</span><h1>Run the site<br/><em>without code.</em></h1><p>Content changes live in Neon. Layout changes are controlled here. GitHub and Vercel are only needed when the underlying code or visual system changes.</p><div class="metric-grid"><div><b>${state.projects.length}</b><span>Projects</span></div><div><b>${media}</b><span>Media assets</span></div><div><b>${visible}</b><span>Live sections</span></div></div><div class="quick-actions"><button class="primary" data-view="layout">Open layout editor</button><button class="secondary" data-view="portfolio">Manage portfolio</button></div></div>`;
}

function layoutEditor() {
  const sections = [...(state.sections || [])].sort((a,b) => a.sort_order-b.sort_order);
  return `<div class="editor-head"><div><span class="eyebrow">WEBSITE BUILDER</span><h1>Sections & layout</h1><p class="muted">Drag sections, hide sections and tune the approved layout system. Changes save directly to Neon.</p></div></div><div class="layout-list">${sections.map((s,i) => sectionCard(s,i)).join('')}</div>`;
}

function sectionCard(s,i) {
  const l=s.layout||{};
  return `<article class="section-card" draggable="true" data-section="${s.id}"><div class="section-drag">☰</div><div class="section-main"><div class="section-title"><div><span class="eyebrow">${String(i+1).padStart(2,'0')}</span><h2>${esc(s.label)}</h2><small>${esc(s.section_key)}</small></div><label class="switch"><input class="section-visible" data-id="${s.id}" type="checkbox" ${s.visible?'checked':''}/><span>Visible</span></label></div><div class="layout-controls"><label>Width<select data-layout="width" data-id="${s.id}">${options(['contained','wide','full'],l.width||'wide')}</select></label><label>Alignment<select data-layout="alignment" data-id="${s.id}">${options(['left','center','right'],l.alignment||'center')}</select></label><label>Spacing<select data-layout="spacing" data-id="${s.id}">${options(['compact','comfortable','airy'],l.spacing||'comfortable')}</select></label><label>Columns<select data-layout="columns" data-id="${s.id}">${options(['1','2','3','4'],String(l.columns||3))}</select></label><label>Media<select data-layout="mediaPosition" data-id="${s.id}">${options(['balanced','left','right','stacked'],l.mediaPosition||'balanced')}</select></label><label>Motion<select data-layout="motion" data-id="${s.id}">${options(['none','reveal','cinematic','morph','float'],l.motion||'reveal')}</select></label></div><div class="section-content"><label>Section heading<input data-content="heading" data-id="${s.id}" value="${esc(s.content?.heading||'')}" placeholder="Optional heading override"/></label><label>Section intro<input data-content="intro" data-id="${s.id}" value="${esc(s.content?.intro||'')}" placeholder="Optional intro override"/></label><button class="save-section" data-id="${s.id}">Save section</button></div></div></article>`;
}

function options(values,current){ return values.map(v=>`<option value="${v}" ${String(current)===v?'selected':''}>${v}</option>`).join(''); }

function settingsEditor(){
  const site = state.settings?.site || {};
  return `<div class="editor-head"><div><span class="eyebrow">GLOBAL SETTINGS</span><h1>Site settings</h1><p class="muted">These values are stored in Neon and can be changed without a deployment.</p></div></div><form id="settings-form" class="form-grid"><label>Site title<input name="title" value="${esc(site.title||'Bluehaven Studios')}"/></label><label>Tagline<input name="tagline" value="${esc(site.tagline||'Creativity Beyond Limits')}"/></label><label class="wide">Meta description<textarea name="description" rows="4">${esc(site.description||'')}</textarea></label><label>Accent color<input name="accent" value="${esc(site.accent||'#ffde59')}"/></label><label>Dark base<input name="base" value="${esc(site.base||'#070707')}"/></label><div class="wide form-actions"><button class="primary">Save settings</button><span id="settings-status" class="status"></span></div></form>`;
}

function welcome(){return `<div class="welcome"><span class="eyebrow">BLUEHAVEN / CMS</span><h1>Make the portfolio<br/><em>move.</em></h1><p>Manage the work shown on the public site without touching the source code.</p><button id="new-project" class="primary">Create project</button></div>`;}

function editor(p){return `<div class="editor-head"><div><span class="eyebrow">PROJECT / ${esc(p.slug)}</span><h1>${esc(p.name)}</h1></div><button id="delete-project" class="danger">Delete project</button></div><form id="project-form" class="form-grid"><input type="hidden" name="id" value="${p.id}"/><label>Name<input name="name" value="${esc(p.name)}" required/></label><label>Slug<input name="slug" value="${esc(p.slug)}" required/></label><label>Category<input name="category" value="${esc(p.category||'')}"/></label><label>Website URL<input name="websiteUrl" value="${esc(p.website_url||'')}" placeholder="https://..."/></label><label class="wide">Description<textarea name="description" rows="4">${esc(p.description||'')}</textarea></label><label>Order<input name="sortOrder" type="number" value="${p.sort_order||0}"/></label><label class="check"><input name="visible" type="checkbox" ${p.visible?'checked':''}/> Visible on public site</label><div class="wide form-actions"><button class="primary">Save project</button><span id="project-status" class="status"></span></div></form><div class="media-head"><div><span class="eyebrow">MEDIA LIBRARY</span><h2>${p.media?.length||0} assets</h2></div><button id="add-media" class="primary small">+ Add image</button></div><div class="media-grid">${(p.media||[]).map(mediaCard).join('')||'<div class="media-empty">Add an image URL now. Direct Neon Object Storage upload can be enabled when its scoped storage credential is connected.</div>'}</div>`;}
function mediaCard(m){return `<article class="media-card"><img src="${esc(m.url)}" alt="${esc(m.alt||'')}" onerror="this.classList.add('broken')"/><div class="media-meta"><div><b>${esc(m.alt||'Untitled asset')}</b><small>${esc(m.type||'image')} · order ${m.order??0}</small></div><button class="delete-media" data-media="${m.id}">Remove</button></div></article>`;}

function bindCurrentView(selected){
  document.querySelectorAll('.quick-actions [data-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.view;render();}));
  if(state.view==='layout') bindLayout();
  if(state.view==='settings') bindSettings();
  if(state.view==='portfolio'){ document.querySelector('#new-project')?.addEventListener('click',projectForm); bindEditor(selected); }
}

function bindLayout(){
  document.querySelectorAll('.section-visible').forEach(input=>input.addEventListener('change',async()=>{await api({action:'saveSection',id:input.dataset.id,visible:input.checked});await load();}));
  document.querySelectorAll('[data-layout]').forEach(input=>input.addEventListener('change',async()=>{const s=state.sections.find(x=>x.id===input.dataset.id);const layout={...(s.layout||{}),[input.dataset.layout]:input.value};await api({action:'saveSection',id:s.id,layout});state.sections=state.sections.map(x=>x.id===s.id?{...x,layout}:x);}));
  document.querySelectorAll('.save-section').forEach(btn=>btn.addEventListener('click',async()=>{const id=btn.dataset.id;const s=state.sections.find(x=>x.id===id);const content={...(s.content||{})};document.querySelectorAll(`[data-content][data-id="${id}"]`).forEach(el=>content[el.dataset.content]=el.value);await api({action:'saveSection',id,content});btn.textContent='Saved';setTimeout(()=>btn.textContent='Save section',1000);await load();}));
}

function bindSettings(){document.querySelector('#settings-form')?.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));await api({action:'saveSetting',key:'site',value:d});document.querySelector('#settings-status').textContent='Saved';await load();});}

function bindEditor(p){if(!p)return;document.querySelector('#project-form')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));d.action='saveProject';d.visible=f.visible.checked;await api(d);await load();});document.querySelector('#delete-project')?.addEventListener('click',async()=>{if(confirm(`Delete ${p.name}?`)){await api({action:'deleteProject',id:p.id});state.selected=null;await load();}});document.querySelector('#add-media')?.addEventListener('click',()=>mediaForm(p));document.querySelectorAll('.delete-media').forEach(b=>b.addEventListener('click',async()=>{if(confirm('Remove this image?')){await api({action:'deleteMedia',id:b.dataset.media});await load();}}));}

function projectForm(){app.innerHTML=`<section class="new-project"><button class="back" id="back-portfolio">← Portfolio</button><span class="eyebrow">NEW PROJECT</span><h1>Add a new<br/><em>piece.</em></h1><form id="new-form" class="form-stack"><label>Name<input name="name" required autofocus/></label><label>Slug<input name="slug" required placeholder="project-slug"/></label><label>Category<input name="category"/></label><label>Website URL<input name="websiteUrl"/></label><label>Description<textarea name="description" rows="5"></textarea></label><label>Order<input name="sortOrder" type="number" value="0"/></label><label class="check"><input name="visible" type="checkbox" checked/> Visible on public site</label><button class="primary">Create project</button></form></section>`;document.querySelector('#back-portfolio').onclick=()=>{state.view='portfolio';render();};document.querySelector('#new-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.action='saveProject';d.visible=true;await api(d);state.view='portfolio';await load();});}

function mediaForm(p){const modal=document.createElement('div');modal.className='modal';modal.innerHTML=`<div class="modal-card"><button class="modal-close">×</button><span class="eyebrow">ADD MEDIA</span><h2>Bring an image in.</h2><p class="muted">Paste a public image URL. The media record is stored in Neon and immediately available to the public portfolio.</p><form id="media-form" class="form-stack"><label>Image URL<input name="url" type="url" required placeholder="https://..." autofocus/></label><label>Storage key<input name="storageKey" placeholder="projects/project/image.webp"/></label><label>Alt text<input name="alt"/></label><label>Order<input name="order" type="number" value="0"/></label><button class="primary">Add image</button></form></div>`;document.body.appendChild(modal);modal.querySelector('.modal-close').onclick=()=>modal.remove();modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.action='saveMedia';d.projectId=p.id;await api(d);modal.remove();await load();};}

load();
