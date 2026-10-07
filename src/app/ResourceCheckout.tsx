import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole } from 'lucide-react';

const products = {
  livestream: { name: 'Church Livestream Starter Pack', amount: 2500, description: 'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.' },
  content: { name: 'Creator Content Planner', amount: 2000, description: 'A simple planning system for turning ideas into consistent posts, stories and short-form content.' },
  troubleshooting: { name: 'Livestream Troubleshooting Guide', amount: 3500, description: 'A field guide for fixing the problems that show up when the stream is already supposed to be live.' },
} as const;

type Key = keyof typeof products;

export default function ResourceCheckout() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const keys = useMemo(() => {
    const raw = params.get('resources') || params.get('resource') || '';
    return Array.from(new Set(raw.split(',').filter((key): key is Key => key in products)));
  }, [params]);
  const reference = String(params.get('reference') || '');
  const items = keys.map((key) => products[key]);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(reference));
  const [error, setError] = useState('');
  const [downloads, setDownloads] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    if (!reference) return;
    fetch(`/api/stories?payment=verify&resources=${encodeURIComponent(keys.join(','))}&reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
      .then(async r => {
        const data = await r.json();
        if (!r.ok || !data.ok) throw new Error(data.error || 'Payment could not be verified.');
        setDownloads(Array.isArray(data.downloads) ? data.downloads : []);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Payment could not be verified.'))
      .finally(() => setVerifying(false));
  }, [keys, reference]);

  if (!items.length) {
    return <main className="min-h-screen bg-[#0b0b0b] px-5 py-20 text-white"><div className="mx-auto max-w-xl"><a href="/resources" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14}/> Back to Resources</a><h1 className="mt-10 text-4xl font-black">No resources selected.</h1><p className="mt-4 text-sm leading-7 text-white/45">Choose something from the resource shelf before checking out.</p></div></main>;
  }

  async function startPayment() {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/stories?payment=initialize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resources: keys, email }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Unable to start payment.');
      window.location.href = data.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start payment.');
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#0b0b0b] px-5 py-12 text-white md:px-10 md:py-20">
    <div className="mx-auto max-w-5xl">
      <a href="/resources" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/40 hover:text-white"><ArrowLeft size={14}/> Resource shelf</a>
      <div className="mt-12 grid overflow-hidden border border-white/10 md:grid-cols-[1.1fr_.9fr]">
        <section className="p-7 md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">Your selection</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Ready when you are.</h1>
          <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
            {items.map((item) => <div key={item.name} className="flex items-start justify-between gap-6"><div><h2 className="text-base font-bold">{item.name}</h2><p className="mt-1 text-xs leading-5 text-white/40">{item.description}</p></div><span className="shrink-0 text-sm font-black text-[#ffde59]">₦{item.amount.toLocaleString('en-NG')}</span></div>)}
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-white/35"><LockKeyhole size={15}/> Payment is processed securely by Paystack.</div>
        </section>
        <section className="border-t border-white/10 bg-white/[.025] p-7 md:border-l md:border-t-0 md:p-10">
          {verifying ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><LoaderCircle className="animate-spin text-[#ffde59]" size={26}/><p className="mt-4 text-sm text-white/50">Verifying your payment…</p></div> :
          reference ? <div className="flex min-h-64 flex-col justify-center"><CheckCircle2 size={30} className="text-[#ffde59]"/><h2 className="mt-5 text-2xl font-black">Payment confirmed.</h2>{downloads.length ? <div className="mt-7 space-y-3">{downloads.map((download) => <a key={download.name} href={download.url} className="flex items-center justify-between border border-white/10 bg-white/[.03] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white hover:border-[#ffde59]/50"><span>{download.name}</span><span className="text-[#ffde59]">Download</span></a>)}</div> : <p className="mt-4 text-sm leading-6 text-white/45">Your payment is confirmed. The resource download links still need to be connected in the BlueHaven payment settings.</p>}{error&&<p className="mt-5 text-sm text-red-300">{error}</p>}</div> :
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30">One payment for your shelf</p><p className="mt-3 text-3xl font-black">₦{total.toLocaleString('en-NG')}</p><label className="mt-8 block text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Email for receipt</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ffde59]/50" /><button onClick={startPayment} disabled={loading||!email.trim()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ffde59] px-5 py-3.5 text-[10px] font-black uppercase tracking-[.16em] text-black disabled:cursor-not-allowed disabled:opacity-40">{loading?<><LoaderCircle size={14} className="animate-spin"/> Starting secure checkout</>:`Pay ₦${total.toLocaleString('en-NG')}`}</button>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<p className="mt-4 text-center text-[9px] uppercase tracking-[.14em] text-white/20">Cards • bank transfer • other supported Paystack channels</p></div>}
        </section>
      </div>
    </div>
  </main>;
}
