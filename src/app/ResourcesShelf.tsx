import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from 'lucide-react';

const resources = [
  { key: 'livestream', title: 'Church Livestream Starter Pack', description: 'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.', price: 2500, tag: 'Livestreaming' },
  { key: 'content', title: 'Creator Content Planner', description: 'A simple planning system for turning ideas into consistent posts, stories and short-form content.', price: 2000, tag: 'Content' },
  { key: 'troubleshooting', title: 'Livestream Troubleshooting Guide', description: 'A field guide for fixing the problems that show up when the stream is already supposed to be live.', price: 3500, tag: 'Troubleshooting' },
] as const;

export default function ResourcesShelf() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialRaw = params.get('select') || params.get('resource') || '';
  const initial = initialRaw.split(',').filter((key) => resources.some((item) => item.key === key));
  const [selected, setSelected] = useState<string[]>(Array.from(new Set(initial)));

  const toggle = (key: string) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const total = resources
    .filter((item) => selected.includes(item.key))
    .reduce((sum, item) => sum + item.price, 0);

  const checkoutUrl = selected.length
    ? `/resources/checkout?resources=${encodeURIComponent(selected.join(','))}`
    : '#';

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-5 py-10 text-white md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <a href="/services#bluehaven-resources-heading" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/40 hover:text-white">
          <ArrowLeft size={14} /> BlueHaven Resources
        </a>

        <header className="mt-12 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">The resource shelf</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-7xl">Pick what you need.</h1>
          <p className="mt-5 text-sm leading-7 text-white/50 md:text-base">
            Browse the practical resources, add whatever you want to your shelf, then check out everything together in one payment.
          </p>
        </header>

        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {resources.map((item) => {
            const isSelected = selected.includes(item.key);
            return (
              <article key={item.key} className="bg-[#0f0f0f] p-6 transition-colors hover:bg-[#141414] md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">{item.tag}</span>
                  {isSelected && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[.14em] text-[#ffde59]"><Check size={13} /> On shelf</span>}
                </div>
                <h2 className="mt-10 text-2xl font-bold leading-tight">{item.title}</h2>
                <p className="mt-3 min-h-[96px] text-sm leading-6 text-white/45">{item.description}</p>
                <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="text-lg font-black text-[#ffde59]">₦{item.price.toLocaleString('en-NG')}</span>
                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    className={`inline-flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[.15em] transition ${isSelected ? 'bg-[#ffde59] text-black' : 'border border-white/15 text-white hover:border-white/40'}`}
                  >
                    {isSelected ? <><Check size={14} /> Selected</> : <>Add to shelf <ShoppingBag size={14} /></>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="sticky bottom-4 z-20 mt-10 border border-white/10 bg-[#111]/95 p-4 shadow-2xl backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">Your shelf</p>
              <p className="mt-1 text-sm font-bold text-white">
                {selected.length} {selected.length === 1 ? 'resource' : 'resources'} selected
                {selected.length > 0 && <span className="ml-3 text-[#ffde59]">₦{total.toLocaleString('en-NG')}</span>}
              </p>
            </div>
            <a
              href={checkoutUrl}
              aria-disabled={!selected.length}
              onClick={(event) => { if (!selected.length) event.preventDefault(); }}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[.16em] transition ${selected.length ? 'bg-[#ffde59] text-black hover:brightness-105' : 'cursor-not-allowed bg-white/10 text-white/25'}`}
            >
              Checkout selected <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
