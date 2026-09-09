import { useEffect, useMemo, useReducer } from 'react';
import { Check, CircleAlert, Loader2, RotateCcw, UploadCloud, X, XCircle } from 'lucide-react';
import { initialUploadState, uploadTrackerReducer, type UploadItem } from './uploadTracker';

type UploadEventDetail = UploadItem;
type UploadWindow = Window & {
  __bluehavenRetryUpload?: (id: string) => Promise<void>;
  __bluehavenCancelUpload?: (id: string) => void;
};

const stageLabel: Record<UploadItem['status'], string> = {
  optimizing: 'Optimizing', uploading: 'Uploading to Blob', verifying: 'Verifying upload',
  saving: 'Saving to portfolio', complete: 'Published', failed: 'Failed', cancelled: 'Cancelled', retrying: 'Retrying',
};

export default function UploadActivity() {
  const [state, dispatch] = useReducer(uploadTrackerReducer, initialUploadState);
  const items = useMemo(() => state.items.slice(-8), [state.items]);

  useEffect(() => {
    const onStart = (event: Event) => dispatch({ type: 'start', item: (event as CustomEvent<UploadEventDetail>).detail });
    const onProgress = (event: Event) => { const d = (event as CustomEvent<{ id: string; progress: number }>).detail; dispatch({ type: 'progress', id: d.id, progress: d.progress }); };
    const onStage = (event: Event) => { const d = (event as CustomEvent<{ id: string; status: 'verifying' | 'saving' }>).detail; dispatch({ type: 'stage', id: d.id, status: d.status }); };
    const onComplete = (event: Event) => dispatch({ type: 'complete', id: (event as CustomEvent<{ id: string }>).detail.id });
    const onFailed = (event: Event) => { const d = (event as CustomEvent<{ id: string; error: string }>).detail; dispatch({ type: 'failed', id: d.id, error: d.error }); };
    const onCancelled = (event: Event) => dispatch({ type: 'cancelled', id: (event as CustomEvent<{ id: string }>).detail.id });
    window.addEventListener('bluehaven:upload-start', onStart);
    window.addEventListener('bluehaven:upload-progress', onProgress);
    window.addEventListener('bluehaven:upload-stage', onStage);
    window.addEventListener('bluehaven:upload-complete', onComplete);
    window.addEventListener('bluehaven:upload-failed', onFailed);
    window.addEventListener('bluehaven:upload-cancelled', onCancelled);
    return () => {
      window.removeEventListener('bluehaven:upload-start', onStart); window.removeEventListener('bluehaven:upload-progress', onProgress);
      window.removeEventListener('bluehaven:upload-stage', onStage); window.removeEventListener('bluehaven:upload-complete', onComplete);
      window.removeEventListener('bluehaven:upload-failed', onFailed); window.removeEventListener('bluehaven:upload-cancelled', onCancelled);
    };
  }, []);

  if (!items.length) return null;
  const activeCount = items.filter((item) => ['optimizing', 'uploading', 'verifying', 'saving', 'retrying'].includes(item.status)).length;
  const retry = async (item: UploadItem) => {
    dispatch({ type: 'retry', id: item.id });
    try { await (window as UploadWindow).__bluehavenRetryUpload?.(item.id); }
    catch (error) { dispatch({ type: 'failed', id: item.id, error: error instanceof Error ? error.message : 'Retry failed' }); }
  };
  const cancel = (id: string) => (window as UploadWindow).__bluehavenCancelUpload?.(id);

  return <aside className="fixed bottom-5 right-5 z-[80] w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/10 bg-[#111114]/95 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#7f56d6]/20 text-[#ffde59]"><UploadCloud size={16}/></span><div><p className="text-sm font-bold">Upload activity</p><p className="text-[11px] text-white/35">{activeCount ? `${activeCount} in progress` : 'Recent uploads'}</p></div></div>
      <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white/40">{items.length}</span>
    </div>
    <div className="max-h-[55vh] space-y-2 overflow-y-auto p-3">
      {items.map((item) => <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[.035] p-3"><div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-white/45">{item.status === 'complete' ? <Check size={16} className="text-emerald-300"/> : item.status === 'failed' ? <CircleAlert size={16} className="text-red-300"/> : item.status === 'cancelled' ? <XCircle size={16} className="text-white/30"/> : <Loader2 size={16} className="animate-spin text-[#ffde59]"/>}</div>
        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-bold">{item.fileName}</p><span className="shrink-0 text-[10px] font-semibold text-white/35">{item.progress}%</span></div><p className="mt-0.5 truncate text-[10px] text-white/35">{item.projectName} · {stageLabel[item.status]}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#7f56d6] transition-[width] duration-200" style={{width:`${item.progress}%`}}/></div>{item.error&&<p className="mt-2 text-[10px] leading-4 text-red-300">{item.error}</p>}</div>
        {['uploading','optimizing','retrying'].includes(item.status)&&<button type="button" onClick={()=>cancel(item.id)} className="rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white" title="Cancel upload"><X size={14}/></button>}
        {item.status==='failed'&&<button type="button" onClick={()=>retry(item)} className="rounded-lg p-1.5 text-[#ffde59] hover:bg-[#ffde59]/10" title="Retry upload"><RotateCcw size={14}/></button>}
      </div></div>)}
    </div>
    <div className="border-t border-white/10 px-4 py-2 text-[10px] text-white/25">Published means Blob upload and portfolio registration both succeeded.</div>
  </aside>;
}
