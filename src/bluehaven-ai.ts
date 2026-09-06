(() => {
  const defaults = {
    randomness: 58,
    palette: ['#7f56d6', '#ffde59', '#19c3ff', '#ff5c8a', '#55d98a'],
    knowledge: [
      { q: 'what is bluehaven', a: 'BlueHaven Studios is a creative studio focused on visual production, brand identity, content strategy, media training and digital experiences.' },
      { q: 'what services do you offer', a: 'BlueHaven works across livestreaming, graphic design, branding, photography, videography, podcasting, storytelling, motion graphics, 3D rendering and media training.' },
      { q: 'who founded bluehaven', a: 'BlueHaven Studios was founded by Taiwo Boluwatife, also known as Heistaiwo.' },
    ],
  };

  const normalize = (text: string) => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const score = (query: string, candidate: string) => {
    const q = new Set(normalize(query).split(' ').filter(x => x.length > 2));
    const c = new Set(normalize(candidate).split(' ').filter(x => x.length > 2));
    if (!q.size || !c.size) return 0;
    let hits = 0;
    q.forEach(word => { if (c.has(word)) hits += 1; });
    return hits / q.size;
  };

  const state: any = {
    data: defaults,
    open: false,
    color: defaults.palette[0],
    lastEffect: 0,
  };

  const style = document.createElement('style');
  style.id = 'bluehaven-skales-style';
  style.textContent = `
    #bluehaven-ai-root{position:fixed;left:22px;bottom:22px;z-index:99999;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    .skales-shell{position:relative}
    .skales-orb{width:66px;height:66px;border:1px solid rgba(255,255,255,.25);border-radius:24px;background:conic-gradient(from 140deg,var(--skales-a,#7f56d6),var(--skales-b,#ffde59),var(--skales-c,#19c3ff),var(--skales-a,#7f56d6));box-shadow:0 18px 48px rgba(0,0,0,.35),0 0 0 6px color-mix(in srgb,var(--skales-a,#7f56d6) 10%,transparent);display:grid;place-items:center;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease;position:relative;overflow:hidden}
    .skales-orb:hover{transform:translateY(-5px) rotate(-3deg);box-shadow:0 24px 60px rgba(0,0,0,.4),0 0 35px color-mix(in srgb,var(--skales-a,#7f56d6) 28%,transparent)}
    .skales-face{width:38px;height:38px;border-radius:15px;background:#09090b;color:#fff;display:grid;place-items:center;font-weight:950;font-size:12px;letter-spacing:-.08em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
    .skales-eye{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff;top:24px}.skales-eye.one{left:24px}.skales-eye.two{right:24px}
    .skales-panel{position:absolute;left:0;bottom:80px;width:min(390px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.12);border-radius:26px;background:rgba(12,12,15,.95);backdrop-filter:blur(26px);box-shadow:0 30px 100px rgba(0,0,0,.5);overflow:hidden;color:#fff;transform-origin:bottom left;animation:skales-in .24s ease}
    @keyframes skales-in{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
    .skales-head{padding:17px 18px 15px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}.skales-head strong{font-size:15px}.skales-head small{display:block;margin-top:3px;color:rgba(255,255,255,.48);font-size:10px;letter-spacing:.16em;text-transform:uppercase}.skales-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
    .skales-body{padding:16px}.skales-intro{font-size:13px;line-height:1.5;color:rgba(255,255,255,.68);margin:0 0 15px}.skales-label{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:9px}
    .skales-palette{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px}.skales-swatch{width:34px;height:34px;border-radius:11px;border:2px solid rgba(255,255,255,.14);cursor:pointer;transition:transform .2s ease,border-color .2s ease}.skales-swatch:hover{transform:translateY(-3px) scale(1.05);border-color:#fff}.skales-swatch.active{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.1)}
    .skales-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.skales-action{border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:11px 12px;background:rgba(255,255,255,.05);color:#fff;font-weight:800;font-size:12px;cursor:pointer;transition:transform .2s ease,background .2s ease}.skales-action:hover{transform:translateY(-2px);background:rgba(255,255,255,.09)}.skales-action.primary{background:var(--skales-a,#7f56d6);border-color:transparent;color:#09090b}
    .skales-chat{border-top:1px solid rgba(255,255,255,.08);padding:12px;display:flex;gap:8px}.skales-chat input{min-width:0;flex:1;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#08080a;color:#fff;padding:10px 11px;outline:none}.skales-chat button{border:0;border-radius:12px;background:#ffde59;color:#080808;font-weight:900;padding:0 13px;cursor:pointer}
    .skales-spark{position:fixed;pointer-events:none;width:8px;height:8px;border-radius:50%;background:var(--skales-spark,#ffde59);z-index:99998;animation:skales-spark .9s ease-out forwards}@keyframes skales-spark{to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
    [class*="text-purple"],[class*="text-pink"],[class*="text-yellow"],[class*="text-fuchsia"],[class*="text-violet"],[class*="text-indigo"],[class*="text-emerald"]{transition:color .45s ease!important}.skales-remixed [class*="text-purple"],.skales-remixed [class*="text-pink"],.skales-remixed [class*="text-yellow"],.skales-remixed [class*="text-fuchsia"],.skales-remixed [class*="text-violet"],.skales-remixed [class*="text-indigo"],.skales-remixed [class*="text-emerald"]{color:var(--skales-a)!important}
    .skales-remixed [class*="border-purple"],.skales-remixed [class*="border-pink"],.skales-remixed [class*="border-yellow"],.skales-remixed [class*="border-fuchsia"],.skales-remixed [class*="border-violet"]{border-color:color-mix(in srgb,var(--skales-a) 55%,transparent)!important}
    @media(max-width:600px){#bluehaven-ai-root{left:14px;bottom:14px}.skales-orb{width:58px;height:58px}.skales-face{width:34px;height:34px}.skales-panel{left:-2px;bottom:70px}}
    @media(prefers-reduced-motion:reduce){.skales-orb,.skales-action,.skales-swatch{transition:none}.skales-panel{animation:none}.skales-spark{display:none}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'bluehaven-ai-root';
  document.body.appendChild(root);

  const applyColor = (color: string, burst = true) => {
    state.color = color;
    document.documentElement.style.setProperty('--skales-a', color);
    document.documentElement.style.setProperty('--skales-b', shiftColor(color, 38));
    document.documentElement.style.setProperty('--skales-c', shiftColor(color, -34));
    document.documentElement.style.setProperty('--bluehaven-accent', color);
    document.body.classList.add('skales-remixed');
    if (burst) burstSparks(color);
    root.querySelectorAll('.skales-swatch').forEach((node: any) => node.classList.toggle('active', node.dataset.color === color));
  };

  const shiftColor = (hex: string, amount: number) => {
    const raw = hex.replace('#', '');
    const n = Number.parseInt(raw.length === 3 ? raw.split('').map(x => x + x).join('') : raw, 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (n & 255) + amount));
    return `#${[r,g,b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const burstSparks = (color: string) => {
    if (Date.now() - state.lastEffect < 250) return;
    state.lastEffect = Date.now();
    for (let i = 0; i < 14; i += 1) {
      const dot = document.createElement('i');
      dot.className = 'skales-spark';
      dot.style.left = `${20 + Math.random() * 10}%`;
      dot.style.top = `${72 + Math.random() * 10}%`;
      dot.style.setProperty('--skales-spark', i % 2 ? color : '#ffde59');
      dot.style.setProperty('--dx', `${(Math.random() - .5) * 260}px`);
      dot.style.setProperty('--dy', `${(Math.random() - .5) * 190}px`);
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }
  };

  const randomize = () => {
    const palette = Array.isArray(state.data.palette) && state.data.palette.length ? state.data.palette : defaults.palette;
    applyColor(palette[Math.floor(Math.random() * palette.length)]);
    root.querySelector('.skales-orb')?.animate([
      { transform: 'translateY(0) rotate(0) scale(1)' },
      { transform: 'translateY(-9px) rotate(-8deg) scale(1.06)' },
      { transform: 'translateY(0) rotate(5deg) scale(1)' },
    ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };

  const answer = (query: string) => {
    const clean = String(query || '').trim();
    if (!clean) return;
    const box = root.querySelector('#skales-messages');
    const input = root.querySelector<HTMLInputElement>('#skales-input');
    if (input) input.value = '';
    if (!box) return;
    const user = document.createElement('div'); user.className = 'skales-msg'; user.textContent = clean; box.appendChild(user);
    const knowledge = Array.isArray(state.data.knowledge) ? state.data.knowledge : [];
    const matches = knowledge.map((item: any) => ({ item, score: Math.max(score(clean, item.q), score(clean, `${item.q} ${item.a}`) * .72) })).sort((a: any, b: any) => b.score - a.score);
    const best = matches[0];
    const reply = document.createElement('div'); reply.className = 'skales-msg'; reply.style.marginTop = '6px'; reply.style.color = 'rgba(255,255,255,.7)'; reply.textContent = best && best.score >= .28 ? best.item.a : 'I mostly play with BlueHaven colours and know the studio, its work and services. Try asking me about the studio — or hit Remix and let me mess with the palette.'; box.appendChild(reply); box.scrollTop = box.scrollHeight;
  };

  const render = () => {
    const palette = Array.isArray(state.data.palette) && state.data.palette.length ? state.data.palette : defaults.palette;
    root.innerHTML = `<div class="skales-shell"><div class="skales-panel" ${state.open ? '' : 'hidden'}><div class="skales-head"><div><strong>Skales the Chameleon AI</strong><small>BlueHaven colour creature</small></div><button class="skales-close" aria-label="Close">×</button></div><div class="skales-body"><p class="skales-intro">Pick a colour or let Skales remix the site. Nothing serious — just a little visual chaos.</p><div class="skales-label">Palette</div><div class="skales-palette">${palette.map((c: string) => `<button class="skales-swatch" data-color="${c}" style="background:${c}" aria-label="Use ${c}"></button>`).join('')}</div><div class="skales-actions"><button class="skales-action primary" id="skales-remix">✦ Remix the site</button><button class="skales-action" id="skales-reset">Reset colour</button></div></div><div class="skales-chat"><input id="skales-input" autocomplete="off" placeholder="Ask Skales…"><button id="skales-ask">Ask</button></div></div><button class="skales-orb" aria-label="Open Skales the Chameleon AI"><span class="skales-eye one"></span><span class="skales-eye two"></span><span class="skales-face">SK</span></button></div>`;
    root.querySelector('.skales-orb')?.addEventListener('click', () => { state.open = !state.open; render(); });
    root.querySelector('.skales-close')?.addEventListener('click', () => { state.open = false; render(); });
    root.querySelector('#skales-remix')?.addEventListener('click', randomize);
    root.querySelector('#skales-reset')?.addEventListener('click', () => applyColor('#7f56d6'));
    root.querySelectorAll('.skales-swatch').forEach((node: any) => node.addEventListener('click', () => applyColor(node.dataset.color)));
    root.querySelector('#skales-ask')?.addEventListener('click', () => answer(root.querySelector<HTMLInputElement>('#skales-input')?.value || ''));
    root.querySelector('#skales-input')?.addEventListener('keydown', (event: any) => { if (event.key === 'Enter') answer(event.currentTarget.value); });
    applyColor(state.color, false);
  };

  fetch(`/api/portfolio?_skales=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      const ai = data?.settings?.ai;
      if (ai && typeof ai === 'object') state.data = { ...defaults, ...ai, palette: Array.isArray(ai.palette) ? ai.palette : defaults.palette, knowledge: Array.isArray(ai.knowledge) ? ai.knowledge : defaults.knowledge };
      render();
    })
    .catch(() => render());

  render();
  setInterval(() => {
    if (!state.open && Math.random() < Number(state.data.randomness || 58) / 100) randomize();
  }, 11000);
})();
