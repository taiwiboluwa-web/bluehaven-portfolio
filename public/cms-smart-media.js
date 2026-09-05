import { chooseGalleryAspect } from './admin-media-utils.mjs';

(() => {
  const loadSize = src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const installLogoFit = () => {
    if (document.querySelector('#bluehaven-logo-fit-style')) return;
    const style = document.createElement('style');
    style.id = 'bluehaven-logo-fit-style';
    style.textContent = `
      .bluehaven-cms-logo-host { position: relative !important; }
      .bluehaven-cms-project-logo {
        position: absolute !important;
        z-index: 20 !important;
        left: 18px !important;
        top: 18px !important;
        width: clamp(76px, 18%, 132px) !important;
        height: clamp(76px, 18%, 132px) !important;
        max-width: 132px !important;
        max-height: 132px !important;
        min-width: 76px !important;
        min-height: 76px !important;
        aspect-ratio: 1 / 1 !important;
        object-fit: contain !important;
        object-position: center !important;
        display: block !important;
        padding: clamp(8px, 1.5vw, 14px) !important;
        box-sizing: border-box !important;
        border-radius: 16px !important;
        background: rgba(255,255,255,.96) !important;
        box-shadow: 0 12px 32px rgba(0,0,0,.18) !important;
        pointer-events: none !important;
      }
      @media (max-width: 640px) {
        .bluehaven-cms-project-logo {
          left: 12px !important;
          top: 12px !important;
          width: 82px !important;
          height: 82px !important;
          min-width: 82px !important;
          min-height: 82px !important;
          padding: 9px !important;
          border-radius: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const apply = async () => {
    installLogoFit();
    try {
      const r = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!r.ok) return;
      const { projects = [] } = await r.json();
      for (const project of projects) {
        const urls = (project.media || []).map(m => m.url).filter(Boolean);
        if (!urls.length) continue;
        const dimensions = (await Promise.all(urls.map(loadSize))).filter(Boolean);
        if (!dimensions.length) continue;
        const aspect = chooseGalleryAspect(dimensions);
        const desired = `cms-${aspect}`;
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
