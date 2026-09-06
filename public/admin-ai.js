(() => {
  const api = async payload => {
    const r = await fetch('/api/admin.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d = await r.json().catch(()=>({})); if(!r.ok)throw Error(d.error||'Request failed'); return d;
  };
  const esc = (v='') => String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const addNav = () => {
    const nav=document.querySelector('.cms-nav'); if(!nav||nav.querySelector('[data-ai-view]'))return;
    const button=document.createElement('button'); button.type='button'; button.className='nav-btn'; button.dataset.aiView='1'; button.textContent='AI / Character'; button.onclick=openEditor; nav.appendChild(button);
  };
  const getAI = async () => { const r=await fetch('/api/admin.js',{cache:'no-store'}); const d=await r.json(); return d.settings?.ai||{personality:'You are BlueHaven, a playful creative studio guide.',randomness:42,knowledge:[]}; };
  const openEditor = async () => {
    const app=document.querySelector('#app'); if(!app)return; const ai=await getAI(); const knowledge=Array.isArray(ai.knowledge)?ai.knowledge:[];
    app.innerHTML=`<div class="cms"><header class="topbar"><a href="/" class="brand"><span>BH</span><div><b>BLUEHAVEN</b><small>AI CHARACTER</small></div></a><div class="top-actions"><span class="live-dot">LIVE</span><button id="ai-back" class="ghost" type="button">Back to CMS</button></div></header><div class="workspace"><aside class="sidebar"><div class="side-head"><div><span class="eyebrow">CHARACTER</span><h2>BlueHaven AI</h2></div></div><p class="muted" style="padding:0 18px">Control exactly what the website character knows and how playful it is.</p></aside><section class="editor"><div class="editor-head"><div><span class="eyebrow">AI / KNOWLEDGE</span><h1>Teach BlueHaven.</h1><p class="muted">Changes here become the live website's source of truth.</p></div></div><form id="ai-form" class="form-grid"><label class="wide">Personality / rules<textarea name="personality" rows="7">${esc(ai.personality||'')}</textarea><small class="muted">Keep this BlueHaven-only. The bot refuses unrelated topics.</small></label><label>Playfulness<input name="randomness" type="number" min="0" max="100" value="${Number(ai.randomness??42)}"><small class="muted">0 = quiet · 100 = very playful</small></label><label class="wide">Knowledge entries<textarea name="knowledge" rows="18" placeholder="Question | Answer\nWhat services do you offer? | We offer…">${knowledge.map(x=>`${x.q||''} | ${x.a||''}`).join('\n')}</textarea><small class="muted">One entry per line. Format: question | answer.</small></label><div class="wide form-actions"><button class="primary" type="submit">Save AI knowledge</button><span id="ai-status" class="status"></span></div></form></section></div></div>`;
    document.querySelector('#ai-back').onclick=()=>window.location.reload();
    document.querySelector('#ai-form').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;const fd=new FormData(form);const rows=String(fd.get('knowledge')||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);const parsed=rows.map(line=>{const split=line.indexOf('|');return split<0?null:{q:line.slice(0,split).trim(),a:line.slice(split+1).trim()}}).filter(x=>x?.q&&x?.a);try{await api({action:'saveSetting',key:'ai',value:{personality:String(fd.get('personality')||''),randomness:Number(fd.get('randomness')||42),knowledge:parsed}});document.querySelector('#ai-status').textContent=`Saved ${parsed.length} knowledge entries.`}catch(error){document.querySelector('#ai-status').textContent=error.message}};
  };
  new MutationObserver(addNav).observe(document.documentElement,{childList:true,subtree:true}); addNav();
})();
