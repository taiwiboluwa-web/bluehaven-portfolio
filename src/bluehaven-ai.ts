(() => {
  const defaults = {
    personality: 'You are BlueHaven, a playful creative studio guide. Be warm, concise, confident and a little mischievous. Only answer questions about BlueHaven Studios, its services, work, team, training, contact details and information explicitly supplied in your knowledge base.',
    knowledge: [
      { q:'what is bluehaven', a:'BlueHaven Studios is a creative studio focused on visual production, brand identity, content strategy, media training and digital experiences.' },
      { q:'what services do you offer', a:'BlueHaven works across livestreaming, graphic design, branding, photography, videography, podcasting, storytelling, motion graphics, 3D rendering and media training.' },
      { q:'who founded bluehaven', a:'BlueHaven Studios was founded by Taiwo Boluwatife, also known as Heistaiwo.' }
    ],
    randomness:42
  };
  const normalize = (text:string) => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const score = (query:string, candidate:string) => {
    const q = new Set(normalize(query).split(' ').filter(x => x.length > 2));
    const c = new Set(normalize(candidate).split(' ').filter(x => x.length > 2));
    if (!q.size || !c.size) return 0;
    let hits = 0; q.forEach(word => { if (c.has(word)) hits++; });
    return hits / q.size;
  };
  const state:any = { data:defaults, open:false, lastEffect:0 };
  const style = document.createElement('style');
  style.textContent = `
    #bluehaven-ai-root{position:fixed;right:22px;bottom:22px;z-index:99999;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    .bha-orb{width:62px;height:62px;border:1px solid rgba(255,255,255,.22);border-radius:22px;background:linear-gradient(145deg,#7f56d6,#ffde59);box-shadow:0 16px 45px rgba(0,0,0,.3);display:grid;place-items:center;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease;position:relative}.bha-orb:hover{transform:translateY(-5px) rotate(3deg);box-shadow:0 22px 55px rgba(127,86,214,.35)}.bha-face{width:34px;height:34px;border-radius:12px;background:#080808;display:grid;place-items:center;color:#fff;font-weight:900;font-size:13px;letter-spacing:-.08em}
    .bha-panel{position:absolute;right:0;bottom:76px;width:min(370px,calc(100vw - 32px));border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(12,12,15,.94);backdrop-filter:blur(24px);box-shadow:0 30px 90px rgba(0,0,0,.45);overflow:hidden;color:#fff;transform-origin:bottom right;animation:bha-in .24s ease}@keyframes bha-in{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
    .bha-head{padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between}.bha-head strong{font-size:15px}.bha-head span{font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.5}.bha-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}.bha-messages{height:270px;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}.bha-msg{max-width:88%;padding:11px 13px;border-radius:15px;font-size:13px;line-height:1.5}.bha-bot{background:#1b1b20;align-self:flex-start}.bha-user{background:#7f56d6;align-self:flex-end}.bha-form{padding:12px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px}.bha-form input{min-width:0;flex:1;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:#08080a;color:#fff;padding:11px 12px;outline:none}.bha-form button{border:0;border-radius:13px;background:#ffde59;color:#080808;font-weight:800;padding:0 15px;cursor:pointer}.bha-spark{position:fixed;pointer-events:none;width:8px;height:8px;border-radius:50%;background:var(--bha-c,#ffde59);z-index:99998;animation:bha-spark 900ms ease-out forwards}@keyframes bha-spark{to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}@media(max-width:600px){#bluehaven-ai-root{right:14px;bottom:14px}.bha-orb{width:56px;height:56px}.bha-panel{right:-2px;bottom:68px}}
  `;
  document.head.appendChild(style);
  const root = document.createElement('div'); root.id='bluehaven-ai-root'; document.body.appendChild(root);
  const render = () => {
    root.innerHTML = `<div class="bha-panel" ${state.open?'':'hidden'}><div class="bha-head"><div><strong>BlueHaven</strong><br><span>playful studio guide</span></div><button class="bha-close" aria-label="Close">×</button></div><div class="bha-messages" id="bha-messages"><div class="bha-msg bha-bot">Hey 👋 I’m BlueHaven. Ask me something about the studio.</div></div><form class="bha-form" id="bha-form"><input id="bha-input" autocomplete="off" placeholder="Ask about BlueHaven…"><button>Ask</button></form></div><button class="bha-orb" aria-label="Open BlueHaven AI"><span class="bha-face">BH</span></button>`;
    root.querySelector('.bha-orb')?.addEventListener('click',()=>{state.open=!state.open;render()});
    root.querySelector('.bha-close')?.addEventListener('click',()=>{state.open=false;render()});
    root.querySelector('#bha-form')?.addEventListener('submit',(event:any)=>{event.preventDefault();answer(root.querySelector('#bha-input')?.value || '')});
  };
  const append = (text:string, kind:string) => { const box=root.querySelector('#bha-messages'); if(!box)return; const el=document.createElement('div'); el.className=`bha-msg bha-${kind}`; el.textContent=text; box.appendChild(el); box.scrollTop=box.scrollHeight; };
  const answer = (query:string) => {
    const clean=String(query||'').trim(); if(!clean)return; const input=root.querySelector<HTMLInputElement>('#bha-input'); if(input)input.value=''; append(clean,'user');
    const knowledge=Array.isArray(state.data.knowledge)?state.data.knowledge:[];
    const matches=knowledge.map((item:any)=>({item,score:Math.max(score(clean,item.q),score(clean,`${item.q} ${item.a}`)*.72)})).sort((a:any,b:any)=>b.score-a.score);
    const best=matches[0];
    if(!best || best.score<.28){append('I’m a BlueHaven-only bot, so I can help with the studio, our work, services, training, team and contact information — but I’m not built for unrelated questions.','bot');return;}
    append(best.item.a,'bot');
  };
  const randomActivity = () => {
    if(Date.now()-state.lastEffect<5000 || Math.random()>(Math.max(0,Math.min(100,Number(state.data.randomness)||42))/100))return;
    state.lastEffect=Date.now();
    const palette=[['#7f56d6','#ffde59'],['#19c3ff','#7f56d6'],['#ff6b9d','#ffde59'],['#57d98b','#7f56d6']][Math.floor(Math.random()*4)];
    document.documentElement.style.setProperty('--bluehaven-accent',palette[0]);
    root.querySelector('.bha-orb')?.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-9px) rotate(-7deg)'},{transform:'translateY(0) rotate(5deg)'},{transform:'translateY(0) rotate(0)'}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'});
    for(let i=0;i<12;i++){const dot=document.createElement('i');dot.className='bha-spark';dot.style.left=`${50+Math.random()*30}%`;dot.style.top=`${55+Math.random()*20}%`;dot.style.setProperty('--bha-c',palette[i%2]);dot.style.setProperty('--dx',`${(Math.random()-.5)*180}px`);dot.style.setProperty('--dy',`${(Math.random()-.5)*140}px`);document.body.appendChild(dot);setTimeout(()=>dot.remove(),950)}
  };
  fetch(`/api/portfolio?_ai=${Date.now()}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{const ai=data?.settings?.ai;if(ai&&typeof ai==='object')state.data={...defaults,...ai,knowledge:Array.isArray(ai.knowledge)?ai.knowledge:defaults.knowledge}}).catch(()=>{});
  render(); setInterval(randomActivity,8500);
})();
