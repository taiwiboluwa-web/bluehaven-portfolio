(() => {
  const esc = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'} as Record<string,string>)[c] || c);
  const loadSize = (src: string) => new Promise<{width:number;height:number}|null>(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const orientation = ({width, height}: {width:number;height:number}) => width === height ? 'square' : width > height ? 'landscape' : 'portrait';
  const findHost = (project: any): HTMLElement | null => {
    const needle = String(project.name || '').toLowerCase();
    const section = Array.from(document.querySelectorAll('section')).find(s => (s.textContent || '').toLowerCase().includes(needle));
    if (!section) return null;
    const matches = Array.from(section.querySelectorAll<HTMLElement>('article,li,a,div')).filter(el => (el.textContent || '').toLowerCase().includes(needle) && el.querySelector('img'));
    return matches.sort((a,b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0] || section;
  };
  const applyProject = async (project: any) => {
    const media = (project.media || []).filter((m: any) => m?.url);
    if (!media.length) return;
    const host = findHost(project);
    if (!host) return;
    let gallery = host.querySelector<HTMLElement>(`[data-bluehaven-live-gallery="${CSS.escape(project.id)}"]`);
    if (!gallery) {
      gallery = document.createElement('div');
      gallery.dataset.bluehavenLiveGallery = project.id;
      host.appendChild(gallery);
    }
    const settings = { type:'grid', columns:3, gap:'comfortable', aspectRatio:'natural', featured:'first', ...(project.gallery_layout || {}) };
    const gap = settings.gap === 'tight' ? '8px' : settings.gap === 'airy' ? '24px' : '14px';
    gallery.className = `bluehaven-live-gallery live-${settings.type} live-${settings.aspectRatio}`;
    gallery.style.setProperty('--cms-cols', String(settings.columns || 3));
    gallery.style.setProperty('--cms-gap', gap);
    const existing = new Map(Array.from(gallery.children).map(el => [el.getAttribute('data-media-id'), el as HTMLElement]));
    const ids = new Set(media.map((m:any) => String(m.id)));
    existing.forEach((el,id) => { if (!ids.has(String(id))) el.remove(); });
    media.forEach((item:any, index:number) => {
      let tile = existing.get(String(item.id));
      if (!tile) {
        tile = document.createElement('figure');
        tile.setAttribute('data-media-id', String(item.id));
        tile.innerHTML = `<img loading="lazy" decoding="async" alt="${esc(item.alt || project.name)}"><figcaption>${esc(item.alt || '')}</figcaption>`;
      }
      const img = tile.querySelector('img');
      if (img && img.src !== item.url) img.src = item.url;
      if (img) img.alt = item.alt || project.name;
      tile.style.order = String(index);
      gallery.appendChild(tile);
    });
    const dimensions = (await Promise.all(media.map((m:any) => loadSize(m.url)))).filter(Boolean) as {width:number;height:number}[];
    if (new Set(dimensions.map(orientation)).size > 1) gallery.classList.add('live-natural');
  };
  const apply = async () => {
    try {
      const response = await fetch(`/api/portfolio?_cms=${Date.now()}`, { cache:'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      for (const project of data.projects || []) await applyProject(project);
    } catch (error) { console.warn('Bluehaven live media bridge unavailable', error); }
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => { if (timer) clearTimeout(timer); timer = setTimeout(apply, 350); };
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
  schedule();
})();
