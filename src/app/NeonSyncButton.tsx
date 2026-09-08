import { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';

export default function NeonSyncButton(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const sync=async()=>{if(busy)return;setBusy(true);setMessage('');try{const r=await fetch('/api/portfolio-sync',{method:'POST'}),d=await r.json();if(!r.ok)throw new Error(d.error||'Neon offload failed');setMessage(d.neonStorage?.enabled?`Synced ${d.projects} projects + ${d.media} images to Neon.`:`Synced ${d.projects} projects + ${d.media} image records. Images remain on Blob until Neon Object Storage is configured.`)}catch(e){setMessage(e instanceof Error?e.message:'Neon offload failed')}finally{setBusy(false)}};
 return <div className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col items-end gap-2"><button type="button" onClick={sync} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-[#ffde59]/30 bg-[#0b0b0c]/95 px-4 py-3 text-xs font-bold text-[#ffde59] shadow-2xl backdrop-blur disabled:opacity-60">{busy?<Loader2 size={15} className="animate-spin"/>:<Database size={15}/>} {busy?'Offloading to Neon…':'Offload to Neon'}</button>{message&&<div className="rounded-2xl border border-white/10 bg-[#0b0b0c]/95 px-4 py-3 text-right text-xs leading-5 text-white/70 shadow-2xl backdrop-blur">{message}</div>}</div>;
}
