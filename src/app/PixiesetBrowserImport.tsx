import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, ExternalLink, Globe2, LoaderCircle, X } from 'lucide-react';
import { buildPixiesetCaptureScript } from '../lib/pixiesetBrowser';

type Preview = { title: string; description: string; photos: { url: string; fileName: string }[]; expectedPhotoCount: number | null };

const input = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#7f56d6]';

export default function PixiesetBrowserImport() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Photography');
  const [description, setDescription] = useState('');

  const targetOrigin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    const receive = async (event: MessageEvent) => {
      if (event.origin !== 'https://www.bluehavens.name.ng' && event.origin !== targetOrigin) return;
      if (!event.data || event.data.type !== 'bluehaven-pixieset-snapshot') return;
      setBusy(true);
      setMessage('Reading the public gallery captured by your browser…');
      try {
        const response = await fetch('/api/pixieset', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'browser_preview', source_url: url || event.data.url, browser_snapshot: event.data }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'The browser capture could not be read.');
        setPreview(data.preview);
        setName((current) => current || data.preview?.title || '');
        setDescription((current) => current || data.preview?.description || '');
        setUrl(event.data.url || url);
        setMessage(`${data.preview?.photos?.length || 0} public images found. Ready to import.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Browser capture failed.');
      } finally {
        setBusy(false);
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [targetOrigin, url]);

  const openGallery = () => {
    setMessage('Gallery opened. Leave this admin tab open.');
    const popup = window.open(url, 'bluehaven-pixieset-gallery', 'popup,width=1280,height=900');
    if (!popup) setMessage('Your browser blocked the popup. Allow popups for BlueHaven Admin and try again.');
  };

  const copyCaptureScript = async () => {
    try {
      await navigator.clipboard.writeText(buildPixiesetCaptureScript(targetOrigin));
      setCopied(true);
      setMessage('Capture helper copied. In the Pixieset tab, paste it into the address bar and run it.');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage('Could not copy the helper. Use a desktop browser and copy it from the fallback instructions.');
    }
  };

  const importGallery = async () => {
    if (!preview || !url) return;
    setBusy(true);
    setMessage('Importing images into BlueHaven storage…');
    try {
      const response = await fetch('/api/pixieset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'browser_import', source_url: url, browser_snapshot: { type: 'bluehaven-pixieset-snapshot', url, html: document.__bluehavenPixiesetSnapshotHtml }, name, category, description, visible: true, gallery_layout: 'landscape' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Pixieset import failed.');
      if (data.duplicate) throw new Error(`This Pixieset gallery is already linked to “${data.project?.name || 'an existing project'}”.`);
      setMessage(`Imported ${data.imported || 0} images into “${data.project?.name || name}”.`);
      setPreview(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Pixieset import failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-[#7f56d6]/50 bg-[#15111f] px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-black/40"><Globe2 size={15} className="text-[#ffde59]"/> Pixieset browser import</button>;

  return <div className="fixed bottom-5 right-5 z-50 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111114] shadow-2xl shadow-black/60">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ffde59]">Browser fallback</p><h3 className="mt-1 font-bold">Pixieset gallery import</h3></div><button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white"><X size={16}/></button></div>
    <div className="space-y-3 p-5">
      <input className={input} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://yourname.pixieset.com/gallery/" type="url"/>
      <div className="grid grid-cols-2 gap-2"><button type="button" onClick={openGallery} disabled={!url||busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"><ExternalLink size={14}/> Open gallery</button><button type="button" onClick={copyCaptureScript} disabled={!url||busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7f56d6] px-3 py-2 text-xs font-bold disabled:opacity-40">{copied?<Check size={14}/>:<Clipboard size={14}/>} {copied?'Copied':'Copy capture helper'}</button></div>
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-[11px] leading-5 text-white/50"><strong className="text-white/75">If Pixieset returns 403:</strong> open the gallery, then paste the copied <code className="text-[#ffde59]">javascript:</code> helper into the Pixieset address bar and run it. It sends only the public page currently rendered in your browser back to this admin tab. No password/private collection is bypassed.</div>
      {busy&&<div className="flex items-center gap-2 text-xs text-white/60"><LoaderCircle size={14} className="animate-spin"/> {message}</div>}
      {!busy&&message&&<p className="text-xs text-white/55">{message}</p>}
      {preview&&<div className="rounded-xl bg-black/20 p-3"><p className="font-bold">{preview.title}</p><p className="mt-1 text-xs text-white/45">{preview.photos.length} images found{preview.expectedPhotoCount&&preview.expectedPhotoCount>preview.photos.length?` of ${preview.expectedPhotoCount} advertised`:''}.</p><div className="mt-2 grid grid-cols-5 gap-1">{preview.photos.slice(0,5).map(photo=><img key={photo.url} src={photo.url} alt="" className="aspect-square rounded object-cover" loading="lazy"/>)}</div><div className="mt-3 space-y-2"><input className={input} value={name} onChange={e=>setName(e.target.value)} placeholder="Project title"/><input className={input} value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category"/><textarea className={`${input} min-h-20`} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"/><button type="button" onClick={importGallery} disabled={busy} className="w-full rounded-xl bg-[#ffde59] px-3 py-2 text-xs font-bold text-black disabled:opacity-40">Import this gallery into Work</button></div></div>}
    </div>
  </div>;
}

declare global {
  interface Document { __bluehavenPixiesetSnapshotHtml?: string }
}
