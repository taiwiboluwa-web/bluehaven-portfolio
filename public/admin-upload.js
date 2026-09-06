(() => {
  const MAX_SOURCE = 12 * 1024 * 1024;
  const MAX_OUTPUT = 1_200_000;
  let busy = false;

  const api = async payload => {
    const r = await fetch('/api/admin.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || 'Upload failed');
    return d;
  };

  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const projectId = () => document.querySelector('#project-form input[name="id"]')?.value || '';
  const notify = message => {
    let n = document.querySelector('#upload-toast');
    if (!n) { n = document.createElement('div'); n.id = 'upload-toast'; document.body.appendChild(n); }
    n.textContent = message;
    n.className = 'upload-toast show';
    clearTimeout(n._timer);
    n._timer = setTimeout(() => n.classList.remove('show'), 3200);
  };

  const readImage = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ img, source: String(reader.result) });
      img.onerror = () => reject(Error(`Could not read ${file.name}.`));
      img.src = reader.result;
    };
    reader.onerror = () => reject(Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

  async function optimize(file, maxSide = 1800, preserveAlpha = false) {
    if (!file?.type?.startsWith('image/')) throw Error(`${file?.name || 'File'} is not an image.`);
    if (file.size > MAX_SOURCE) throw Error(`${file.name} is over 12 MB.`);
    const { img } = await readImage(file);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let url = canvas.toDataURL('image/webp', preserveAlpha ? .92 : .82);
    if (!url.startsWith('data:image/webp') || (!preserveAlpha && url.length > MAX_OUTPUT)) {
      url = canvas.toDataURL('image/jpeg', .80);
    }
    if (preserveAlpha && !url.startsWith('data:image/webp')) {
      url = canvas.toDataURL('image/png');
    }
    if (url.length > MAX_OUTPUT) throw Error(`${file.name} is still too large after optimization.`);
    return { url, width: canvas.width, height: canvas.height };
  }

  const pickMultiple = () => new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
    input.style.display = 'none';
    input.onchange = () => { resolve(Array.from(input.files || [])); input.remove(); };
    document.body.appendChild(input);
    input.click();
  });

  const orientation = (width, height) => width === height ? 'square' : width > height ? 'landscape' : 'portrait';

  function addCard(media) {
    const grid = document.querySelector('.media-grid');
    if (!grid) return;
    const card = document.createElement('article');
    card.className = 'media-card';
    card.dataset.media = media.id;
    card.innerHTML = `<img src="${safe(media.url)}" alt="${safe(media.alt)}"><div class="media-meta"><div><b>${safe(media.alt) || 'Untitled image'}</b><small>${safe(media.type || 'image')} · just added</small></div><div class="media-actions"><button class="replace-media" type="button">Replace</button><button class="delete-media" type="button">Remove</button></div></div>`;
    card.querySelector('.replace-media').onclick = () => replaceMedia(media.id, card);
    card.querySelector('.delete-media').onclick = () => deleteMedia(media.id, card);
    grid.appendChild(card);
  }

  function addTile(media, index) {
    const preview = document.querySelector('.gallery-preview');
    if (!preview) return;
    preview.querySelector('.media-empty')?.remove();
    const tile = document.createElement('div');
    tile.className = 'gallery-tile';
    tile.draggable = true;
    tile.dataset.mediaOrder = media.id;
    tile.innerHTML = `<img src="${safe(media.url)}" alt="${safe(media.alt)}"><span>${String(index).padStart(2,'0')}</span>`;
    preview.appendChild(tile);
  }

  async function uploadGalleryImages() {
    const id = projectId();
    if (!id) return notify('Open a project first.');
    const files = await pickMultiple();
    if (!files.length) return;

    try {
      busy = true;
      let completed = 0;
      let failed = 0;
      const total = files.length;
      notify(`Preparing ${total} image${total === 1 ? '' : 's'}…`);

      for (const file of files) {
        try {
          notify(`Uploading ${completed + 1} of ${total} · ${file.name}`);
          const { url, width, height } = await optimize(file);
          const type = orientation(width, height);
          const alt = file.name.replace(/\.[^.]+$/, '');
          const d = await api({ action: 'saveMedia', projectId: id, url, alt, type, featured: false });
          const media = d.media;
          if (!media) throw Error('The server did not return the saved image.');
          const index = document.querySelectorAll('.gallery-tile').length + 1;
          addTile(media, index);
          addCard(media);
          completed += 1;
        } catch (error) {
          failed += 1;
          console.error('Bluehaven media upload failed:', file.name, error);
        }
      }

      if (failed) notify(`${completed} image${completed === 1 ? '' : 's'} added · ${failed} failed. The dashboard stayed open.`);
      else notify(`${completed} image${completed === 1 ? '' : 's'} added · dashboard stayed open.`);
    } finally {
      busy = false;
    }
  }

  async function replaceMedia(id, card) {
    const files = await pickMultiple();
    const file = files[0];
    if (!file) return;
    try {
      busy = true;
      notify('Replacing image…');
      const { url, width, height } = await optimize(file);
      const alt = file.name.replace(/\.[^.]+$/, '');
      await api({ action: 'saveMedia', id, projectId: projectId(), url, alt, type: orientation(width, height), featured: false });
      const img = card?.querySelector('img');
      if (img) { img.src = url; img.alt = alt; }
      const tile = [...document.querySelectorAll('.gallery-tile')].find(x => x.dataset.mediaOrder === id);
      const tileImg = tile?.querySelector('img');
      if (tileImg) { tileImg.src = url; tileImg.alt = alt; }
      notify(`Image replaced · ${orientation(width, height)}.`);
    } catch (e) {
      notify(e.message);
    } finally {
      busy = false;
    }
  }

  async function deleteMedia(id, card) {
    if (!confirm('Remove this image?')) return;
    try {
      await api({ action: 'deleteMedia', id });
      card?.remove();
      document.querySelector(`.gallery-tile[data-media-order="${CSS.escape(id)}"]`)?.remove();
      notify('Image removed.');
    } catch (e) {
      notify(e.message);
    }
  }

  async function uploadLogo() {
    const id = projectId();
    if (!id) return notify('Open a project first.');
    const files = await pickMultiple();
    const file = files[0];
    if (!file) return;
    try {
      busy = true;
      notify('Optimizing project logo…');
      const { url } = await optimize(file, 900, true);
      await api({ action: 'saveProjectLogo', projectId: id, logoUrl: url });
      const preview = document.querySelector('#project-logo-preview');
      if (preview) preview.innerHTML = `<img src="${safe(url)}" alt="Project logo">`;
      const legacyPreview = document.querySelector('.current-logo');
      if (legacyPreview) legacyPreview.innerHTML = `<img src="${safe(url)}" alt="Current project logo">`;
      notify('Project logo updated.');
    } catch (e) {
      notify(e.message);
    } finally {
      busy = false;
    }
  }

  async function removeLogo() {
    const id = projectId();
    if (!id || !confirm('Remove this project logo?')) return;
    try {
      await api({ action: 'removeProjectLogo', projectId: id });
      const preview = document.querySelector('#project-logo-preview');
      if (preview) preview.innerHTML = '<span>NO LOGO</span>';
      document.querySelector('.current-logo')?.remove();
      notify('Project logo removed.');
    } catch (e) {
      notify(e.message);
    }
  }

  async function loadLogoPreview() {
    const id = projectId();
    const preview = document.querySelector('#project-logo-preview');
    if (!id || !preview) return;
    try {
      const r = await fetch('/api/admin.js', { cache: 'no-store' });
      if (!r.ok) return;
      const d = await r.json();
      const p = (d.projects || []).find(x => x.id === id);
      const url = p?.gallery_layout?.logoUrl;
      preview.innerHTML = url ? `<img src="${safe(url)}" alt="Project logo">` : '<span>NO LOGO</span>';
    } catch {}
  }

  function enhance() {
    const form = document.querySelector('#project-form');
    if (form && !form.dataset.uploadEnhanced) {
      form.dataset.uploadEnhanced = '1';
      const section = document.createElement('section');
      section.className = 'project-logo-uploader wide';
      section.innerHTML = '<div><span class="eyebrow">PROJECT BRANDING</span><h2>Project logo</h2><p class="muted">Upload a logo directly from your device.</p></div><div class="logo-upload-row"><div class="logo-preview" id="project-logo-preview"><span>NO LOGO</span></div><div class="logo-actions"><button type="button" class="primary small" id="upload-project-logo">Upload logo</button><button type="button" class="secondary small" id="remove-project-logo">Remove</button></div></div>';
      const gallery = form.parentElement.querySelector('.gallery-editor');
      (gallery || form).before(section);
      section.querySelector('#upload-project-logo').onclick = uploadLogo;
      section.querySelector('#remove-project-logo').onclick = removeLogo;
      loadLogoPreview();
    }

    const add = document.querySelector('#add-media');
    if (add && !add.dataset.deviceUpload) {
      add.dataset.deviceUpload = '1';
      add.type = 'button';
      add.textContent = '＋ Upload images';
      add.title = 'Upload multiple images from your computer or phone';
    }
  }

  document.addEventListener('click', event => {
    const add = event.target.closest('#add-media');
    if (add && !busy) {
      event.preventDefault();
      event.stopImmediatePropagation();
      uploadGalleryImages();
    }
  }, true);

  document.addEventListener('change', event => {
    const input = event.target.closest('#project-logo-file');
    if (!input || busy) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    uploadLogo();
  }, true);

  new MutationObserver(enhance).observe(document.documentElement, { subtree: true, childList: true });
  enhance();
})();
