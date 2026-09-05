(() => {
  const api = async payload => {
    const r = await fetch('/api/admin.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(data.error || 'Request failed');
    return data;
  };

  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  const projectId = () => document.querySelector('#project-form input[name="id"]')?.value || '';
  const toast = message => {
    let el = document.querySelector('#upload-toast');
    if (!el) { el = document.createElement('div'); el.id = 'upload-toast'; document.body.appendChild(el); }
    el.textContent = message;
    el.className = 'upload-toast show';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3200);
  };
  const urlOkay = value => {
    try { const u = new URL(String(value || '').trim()); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  const styles = document.createElement('style');
  styles.textContent = `
    .section-card--locked { position:relative; }
    .section-card--locked::after { content:'LOCKED'; position:absolute; top:16px; right:16px; padding:5px 8px; border:1px solid #444; border-radius:999px; font:600 10px/1 system-ui,sans-serif; letter-spacing:.12em; color:#aaa; background:#10100f; }
    .section-card--locked .section-move-controls { display:none !important; }
    .section-card--locked .layout-controls,.section-card--locked .section-content,.section-card--locked .section-visible { pointer-events:none; opacity:.48; }
    .url-media-button { white-space:nowrap; }
    .bluehaven-url-modal { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(0,0,0,.72); backdrop-filter:blur(10px); }
    .bluehaven-url-dialog { width:min(560px,100%); padding:24px; border:1px solid #333; border-radius:18px; background:#11110f; box-shadow:0 24px 80px rgba(0,0,0,.5); }
    .bluehaven-url-dialog h2 { margin:0 0 8px; }.bluehaven-url-dialog p { color:#999; margin:0 0 18px; }.bluehaven-url-dialog label { display:grid; gap:8px; color:#bbb; }.bluehaven-url-dialog input { width:100%; box-sizing:border-box; }.bluehaven-url-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:18px; }
  `;
  document.head.appendChild(styles);

  function lockSections() {
    document.querySelectorAll('.section-card[data-section]').forEach(card => {
      card.classList.add('section-card--locked');
      card.dataset.sectionLocked = 'true';
      card.querySelectorAll('input,select,textarea,button').forEach(control => {
        control.disabled = true;
        control.setAttribute('aria-disabled', 'true');
      });
      card.querySelector('.section-move-controls')?.remove();
    });
  }

  function makeMediaCard(media) {
    const grid = document.querySelector('.media-grid'); if (!grid) return;
    const card = document.createElement('article'); card.className = 'media-card'; card.dataset.media = media.id;
    card.innerHTML = `<img src="${esc(media.url)}" alt="${esc(media.alt)}"><div class="media-meta"><div><b>${esc(media.alt) || 'Untitled image'}</b><small>${esc(media.type || 'image')} · URL</small></div><button class="delete-media" type="button">Remove</button></div>`;
    card.querySelector('.delete-media').onclick = async () => {
      if (!confirm('Remove this image?')) return;
      try { await api({ action:'deleteMedia', id:media.id }); card.remove(); document.querySelector(`.gallery-tile[data-media-order="${CSS.escape(media.id)}"]`)?.remove(); toast('Image removed.'); }
      catch (e) { toast(e.message); }
    };
    grid.appendChild(card);
  }

  function makeGalleryTile(media) {
    const preview = document.querySelector('.gallery-preview'); if (!preview) return;
    preview.querySelector('.media-empty')?.remove();
    const index = preview.querySelectorAll('.gallery-tile').length + 1;
    const tile = document.createElement('div'); tile.className='gallery-tile'; tile.draggable=true; tile.dataset.mediaOrder=media.id;
    tile.innerHTML=`<img src="${esc(media.url)}" alt="${esc(media.alt)}"><span>${String(index).padStart(2,'0')}</span>`; preview.appendChild(tile);
  }

  function readProjectForm() {
    const form = document.querySelector('#project-form');
    if (!form) return null;
    return {
      id: form.querySelector('[name="id"]')?.value || '',
      name: form.querySelector('[name="name"]')?.value || '',
      slug: form.querySelector('[name="slug"]')?.value || '',
      category: form.querySelector('[name="category"]')?.value || '',
      description: form.querySelector('[name="description"]')?.value || '',
      websiteUrl: form.querySelector('[name="websiteUrl"]')?.value || '',
      visible: form.querySelector('[name="visible"]')?.checked !== false,
    };
  }

  async function saveLogoUrl(id, url) {
    const current = readProjectForm();
    if (!current?.id) throw Error('Open a project first.');
    const currentState = await fetch('/api/admin.js', { cache:'no-store' }).then(r => r.json());
    const project = (currentState.projects || []).find(p => p.id === id);
    const galleryLayout = { ...(project?.gallery_layout || {}), logoUrl:url };
    await api({ action:'saveProject', ...current, galleryLayout });
  }

  function openUrlDialog({ logo=false }={}) {
    document.querySelector('.bluehaven-url-modal')?.remove();
    const modal=document.createElement('div'); modal.className='bluehaven-url-modal';
    modal.innerHTML=`<form class="bluehaven-url-dialog"><span class="eyebrow">${logo?'PROJECT BRANDING':'PROJECT MEDIA'}</span><h2>${logo?'Use logo URL':'Add image URL'}</h2><p>Paste a public image URL. It will be saved directly to this project without uploading a file.</p><label>Public image URL<input name="url" type="url" inputmode="url" placeholder="https://example.com/image.jpg" required></label><div class="bluehaven-url-actions"><button type="button" class="secondary" data-cancel>Cancel</button><button type="submit" class="primary">${logo?'Use logo':'Add image'}</button></div></form>`;
    document.body.appendChild(modal); const form=modal.querySelector('form'); form.querySelector('input').focus();
    modal.querySelector('[data-cancel]').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove()};
    form.onsubmit=async e=>{
      e.preventDefault(); const url=String(new FormData(form).get('url')||'').trim(); if(!urlOkay(url))return toast('Enter a valid public http(s) image URL.');
      const id=projectId(); if(!id)return toast('Open a project first.'); const submit=form.querySelector('[type="submit"]'); submit.disabled=true;
      try {
        if(logo){ await saveLogoUrl(id,url); const preview=document.querySelector('#project-logo-preview'); if(preview)preview.innerHTML=`<img src="${esc(url)}" alt="Project logo">`; toast('Project logo URL saved.'); }
        else { const name=(()=>{try{return new URL(url).pathname.split('/').filter(Boolean).pop()?.replace(/[-_]+/g,' ').replace(/\.[^.]+$/,'')||'Image'}catch{return'Image'}})(); const data=await api({action:'saveMedia',projectId:id,url,alt:name,type:'image',featured:false}); if(!data.media)throw Error('The server did not return the saved image.'); makeGalleryTile(data.media); makeMediaCard(data.media); toast('Image URL added.'); }
        modal.remove();
      } catch(e){ submit.disabled=false; toast(e.message); }
    };
  }

  function enhanceMedia() {
    const add=document.querySelector('#add-media');
    if(add&&!document.querySelector('#add-media-url')){ const button=document.createElement('button'); button.id='add-media-url'; button.type='button'; button.className='secondary small url-media-button'; button.textContent='＋ Add image URL'; button.title='Paste a public image URL'; button.onclick=()=>openUrlDialog(); add.parentElement?.appendChild(button); }
    const logoActions=document.querySelector('#upload-project-logo')?.parentElement;
    if(logoActions&&!document.querySelector('#logo-url-button')){ const button=document.createElement('button'); button.id='logo-url-button'; button.type='button'; button.className='secondary small'; button.textContent='Use logo URL'; button.onclick=()=>openUrlDialog({logo:true}); logoActions.appendChild(button); }
  }

  document.addEventListener('click', event => { if(event.target.closest('[data-section-locked]')){const blocked=event.target.closest('input,select,textarea,button');if(blocked){event.preventDefault();event.stopImmediatePropagation();}} }, true);
  const observer=new MutationObserver(()=>{lockSections();enhanceMedia()}); observer.observe(document.documentElement,{childList:true,subtree:true}); lockSections(); enhanceMedia();
})();
