import { ArrowUpRight, HeartHandshake } from 'lucide-react';

const SUPPORT_URL = String(import.meta.env.VITE_SUPPORT_PAYMENT_URL || '').trim();

export default function SupportStudio() {
  const href = SUPPORT_URL || '/inquire?intent=studio-support';

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-20" aria-labelledby="support-bluehaven-heading">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.025] px-6 py-7 md:flex md:items-center md:justify-between md:gap-10 md:px-8 md:py-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#ffde59]">
            <HeartHandshake size={15} />
            <span className="text-[10px] font-bold uppercase tracking-[.24em]">Keep the studio moving</span>
          </div>
          <h2 id="support-bluehaven-heading" className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
            Like what BlueHaven is building?
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            You can quietly support the studio, sponsor an editorial story, or help fund the next creative experiment.
          </p>
        </div>
        <a
          href={href}
          target={SUPPORT_URL ? '_blank' : undefined}
          rel={SUPPORT_URL ? 'noreferrer' : undefined}
          className="mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ffde59] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-black transition hover:brightness-105 md:mt-0"
        >
          {SUPPORT_URL ? 'Support BlueHaven' : 'Support / Sponsor'}
          <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
