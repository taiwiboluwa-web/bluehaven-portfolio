import { motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function SouvenirsPortfolio() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8"
    >
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <div className="relative grid gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/60">
            <Sparkles size={13} />
            Brand & Digital Experience
          </div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-white/40">Selected work</p>
          <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Souvenirs</h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
            A polished digital direction for a modern souvenirs brand, combining clear product storytelling with a playful, premium visual system.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
            Explore the work <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 p-5">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_25%_25%,rgba(255,255,255,.16),transparent_22%),radial-gradient(circle_at_75%_70%,rgba(127,86,214,.28),transparent_30%)]" />
          <div className="relative flex h-full min-h-[220px] items-end justify-between">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-white/35">01 / Identity</span>
              <span className="mt-2 block text-5xl font-semibold tracking-[-0.05em] text-white/90">SOUV.</span>
            </div>
            <div className="h-24 w-24 rotate-6 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
