(() => {
  const orientation = (w, h) => w === h ? 'square' : w > h ? 'landscape' : 'portrait';
  const loadSize = src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(orientation(img.naturalWidth, img.naturalHeight));
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const apply = async () => {
    try {
      const r = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!r.ok) return;
      const { projects = [] } = await r.json();
      for (const project of projects) {
        const urls = (project.media || []).map(m => m.url).filter(Boolean);
        if (!urls.length) continue;
        const kinds = new Set((await Promise.all(urls.map(loadSize))).filter(Boolean));
        if (!kinds.size) continue;
        const desired = kinds.size > 1 ? 'cms-natural' : `cms-${[...kinds][0]}`;
        const sections = Array.from(document.querySelectorAll('section')).filter(s => (s.textContent || '').toLowerCase().includes(project.name.toLowerCase()));
        sections.forEach(section => {
          section.querySelectorAll('.bluehaven-cms-gallery').forEach(grid => {
            if (grid.classList.contains(desired)) return;
            grid.classList.remove('cms-square', 'cms-portrait', 'cms-landscape', 'cms-wide', 'cms-natural');
            grid.classList.add(desired);
          });
        });
      }
    } catch {}
  };
  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(apply, 400); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
})();
