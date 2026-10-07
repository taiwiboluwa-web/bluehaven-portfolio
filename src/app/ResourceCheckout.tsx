import { useMemo, useState } from 'react';
import { ArrowLeft, Check, LockKeyhole, ShoppingBag } from 'lucide-react';

const products = {
  livestream: {
    name: 'Church Livestream Starter Pack',
    amount: 2500,
    description: 'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.',
  },
  content: {
    name: 'Creator Content Planner',
    amount: 2000,
    description: 'A simple planning system for turning ideas into consistent posts, stories and short-form content.',
  },
  troubleshooting: {
    name: 'Livestream Troubleshooting Guide',
    amount: 3500,
    description: 'A field guide for fixing the problems that show up when the stream is already supposed to be live.',
  },
} as const;

type Key = keyof typeof products;

export default function ResourceCheckout() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const keys = useMemo(() => {
    const raw = params.get('resources') || params.get('resource') || '';
    return Array.from(new Set(raw.split(',').filter((key): key is Key => key in products)));
  }, [params]);

  const items = keys.map((key) => products[key]);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-5 py-20 text-white">
        <div className="mx-auto max-w-xl">
          <a href="/resources" className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white">
            <ArrowLeft size={14} /> Back to Resources
          </a>
          <h1 className="mt-10 text-4xl font-black">Your shelf is empty.</h1>
          <p className="mt-4 text-sm leading-7 text-white/45">
            Pick a resource from the shelf first, then come back here to check out.
          </p>
          <a
            href="/resources"
            className="mt-8 inline-flex items-center gap-2 bg-[#ffde59] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-black"
          >
            Browse resources <ShoppingBag size={14} />
          </a>
        </div>
      </main>
    );
  }

  const canContinue = Boolean(name.trim() && email.trim());

  function continueToPayment() {
    if (!canContinue) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-5 py-10 text-white md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <a
          href="/resources"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/40 hover:text-white"
        >
          <ArrowLeft size={14} /> Resource shelf
        </a>

        <div className="mt-10 grid overflow-hidden border border-white/10 md:grid-cols-[1.1fr_.9fr]">
          <section className="p-7 md:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ffde59]">Your selection</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Your resources. One checkout.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">
              Review what you picked, enter your details, and you’ll be ready for the payment step.
            </p>

            <div className="mt-10 space-y-5 border-t border-white/10 pt-7">
              {items.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-base font-bold">{item.name}</h2>
                    <p className="mt-1 max-w-lg text-xs leading-5 text-white/40">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#ffde59]">
                    ₦{item.amount.toLocaleString('en-NG')}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-white/35">
              <LockKeyhole size={15} />
              <span>Your name and email will be used for your purchase confirmation and delivery email.</span>
            </div>
          </section>

          <section className="border-t border-white/10 bg-white/[.025] p-7 md:border-l md:border-t-0 md:p-10">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col justify-center">
                <div className="flex h-12 w-12 items-center justify-center bg-[#ffde59] text-black">
                  <Check size={22} />
                </div>
                <p className="mt-7 text-[10px] font-bold uppercase tracking-[.2em] text-[#ffde59]">
                  Checkout details received
                </p>
                <h2 className="mt-3 text-3xl font-black">You’re ready to pay.</h2>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  Paystack will be connected to this step next. After payment is confirmed, the buyer will receive an email with the purchased materials.
                </p>
                <div className="mt-7 border border-white/10 bg-black/30 p-5">
                  <p className="text-xs font-bold text-white">{name}</p>
                  <p className="mt-1 text-xs text-white/40">{email}</p>
                  <p className="mt-4 text-sm font-black text-[#ffde59]">
                    ₦{total.toLocaleString('en-NG')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-left text-[10px] font-bold uppercase tracking-[.15em] text-white/35 hover:text-white"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30">Checkout</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <span className="text-sm text-white/40">Total</span>
                  <span className="text-3xl font-black">₦{total.toLocaleString('en-NG')}</span>
                </div>

                <label className="mt-9 block text-[10px] font-bold uppercase tracking-[.18em] text-white/40">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ffde59]/50"
                />

                <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.18em] text-white/40">
                  Email address
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ffde59]/50"
                />

                <button
                  type="button"
                  onClick={continueToPayment}
                  disabled={!canContinue}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#ffde59] px-5 py-3.5 text-[10px] font-black uppercase tracking-[.16em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Continue to payment <ArrowRightIcon />
                </button>

                <p className="mt-4 text-center text-[9px] uppercase tracking-[.14em] text-white/20">
                  Paystack • cards • bank transfer • supported payment channels
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
