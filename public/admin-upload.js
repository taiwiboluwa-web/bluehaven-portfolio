(() => {
  const MAX_SOURCE = 12 * 1024 * 1024;
  const MAX_OUTPUT = 3_900_000;
  let busy = false;

  const api = async payload => {
    const r = await fetch('/api/admin.js', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || 'Upload failed');
    return d;
  };

  const fileToImage = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(Error('That image could not be read.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });

  async function optimize(file, maxSide = 1800) {
    if (!file || !file.type.startsWith('image/')) throw Error('Please choose an image file.');
    if (file.size > MAX_SOURCE) throw Error('That image is too large. Choose an image under 12 MB.');
    const img = await fileToImage(file);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const ctx = canvas.getContext('2d', {alpha:true});
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL('image/webp', 0.84);
    if (!data.startsWith('data:image/webp') || data.length > MAX_OUTPUT) data = canvas.toDataURL('image/jpeg', 0.82);
    if (data.length > MAX_OUTPUT) throw Error('The optimized image is still too large. Please choose a smaller image.');
    return data;
  }

  const pick = (accept='image/*') => new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept; input.style.display = 'none';
    input.onchange = () => { resolve(input.files?.[0] || null); input.remove(); };
    document.body.appendChild(input); input.click();
  });

  const selectedProjectId = () => document.querySelector('#project-form input[name="id"]')?.value || '';
  const notify = message => {
    let n = document.querySelector('#upload-toast');
    if (!n) { n = document.createElement('div'); n.id='upload-toast'; document.body.appendChild(n); }
    n.textContent = message; n.className='upload-toast show';
    clearTimeout(n._timer); n._timer=setTimeout(()=>n.classList.remove('show'),2800);
  };

  async function uploadGalleryImage() {
    const projectId = selectedProjectId(); if (!projectId) return notify('Open a project first.');
    const file = await pick(); if (!file) return;
    try {
      busy = true; notify('Optimizing image…');
      const url = await optimize(file);
      await api({action:'saveMedia', projectId, url, alt:file.name.replace(/\.[^.]+$/, ''), type:'image', order:9999, featured:false});
      notify('Image uploaded from your device. Refreshing…');
      setTimeout(()=>location.reload(),500);
    } catch (e) { notify(e.message); } finally { busy=false; }
  }

  async function replaceMedia(mediaId) {
    const file = await pick(); if (!file) return;
    try {
      busy=true; notify('Replacing image…');
      const url=await optimize(file);
      await api({action:'saveMedia', id:mediaId, projectId:selectedProjectId(), url, alt:file.name.replace(/\.[^.]+$/, ''), type:'image', order:0, featured:false});
      notify('Image replaced. Refreshing…'); setTimeout(()=>location.reload(),500);
    } catch(e){notify(e.message);} finally{busy=false;}
  }

  async function uploadLogo() {
    const projectId=selectedProjectId(); if(!projectId)return notify('Open a project first.');
    const file=await pick(); if(!file)return;
    try{
      busy=true; notify('Optimizing project logo…');
      const url=await optimize(file, 1000);
      await api({action:'saveProjectLogo', projectId, logoUrl:url});
      notify('Project logo updated. Refreshing…'); setTimeout(()=>location.reload(),500);
    }catch(e){notify(e.message);}finally{busy=false;}
  }

  async function removeLogo() {
    const projectId=selectedProjectId(); if(!projectId)return;
    if(!confirm('Remove this project logo?'))return;
    try{await api({action:'removeProjectLogo',projectId});notify('Project logo removed. Refreshing…');setTimeout(()=>location.reload(),400);}catch(e){notify(e.message);}
  }

  function enhance() {
    const form=document.querySelector('#project-form');
    if(form && !form.dataset.uploadEnhanced){
      form.dataset.uploadEnhanced='1';
      const section=document.createElement('section');
      section.className='project-logo-uploader wide';
      section.innerHTML='<div><span class="eyebrow">PROJECT BRANDING</span><h2>Project logo</h2><p class="muted">Upload a logo directly from your device. PNG, JPG and WebP are supported.</p></div><div class="logo-upload-row"><div class="logo-preview" id="project-logo-preview"><span>NO LOGO</span></div><div class="logo-actions"><button type="button" class="primary small" id="upload-project-logo">Upload logo</button><button type="button" class="secondary small" id="remove-project-logo">Remove</button></div></div>';
      const gallery=form.parentElement.querySelector('.gallery-editor');
      (gallery || form).before(section);
      section.querySelector('#upload-project-logo').onclick=uploadLogo;
      section.querySelector('#remove-project-logo').onclick=removeLogo;
      loadLogoPreview();
    }
    const add=document.querySelector('#add-media');
    if(add && !add.dataset.deviceUpload){
      add.dataset.deviceUpload='1';
      add.textContent='＋ Upload from device';
      add.title='Upload an image from your computer or phone';
    }
    document.querySelectorAll('.media-card').forEach(card=>{
      if(card.querySelector('.replace-media'))return;
      const img=card.querySelector('img'); const id=card.querySelector('.delete-media')?.dataset.media; if(!id)return;
      const actions=card.querySelector('.media-meta'); if(!actions)return;
      const b=document.createElement('button'); b.type='button'; b.className='replace-media'; b.textContent='Replace'; b.onclick=()=>replaceMedia(id); actions.appendChild(b);
    });
  }

  async function loadLogoPreview(){
    const id=selectedProjectId(); const preview=document.querySelector('#project-logo-preview'); if(!id||!preview)return;
    try{const d=await (await fetch('/api/admin.js')).json();const p=(d.projects||[]).find(x=>x.id===id);const url=p?.gallery_layout?.logoUrl;
      if(url) preview.innerHTML=`<img src="${url}" alt="Project logo">`; else preview.innerHTML='<span>NO LOGO</span>';
    }catch{}
  }

  document.addEventListener('click', e => {
    const add=e.target.closest('#add-media');
    if(add && !busy){e.preventDefault();e.stopImmediatePropagation();uploadGalleryImage();}
  }, true);

  const observer=new MutationObserver(enhance);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  enhance();
})();
