import { motion } from "motion/react";

export function WendeesBakeryPortfolio() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] px-4 py-14 md:px-[10%] md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-end"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Selected work</p>
            <h3 className="text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">Wendee's Bakery</h3>
          </div>
          <div>
            <p className="max-w-2xl text-base leading-7 text-white/55 md:text-lg">
              A warm, contemporary bakery identity and digital presentation built to make handcrafted food feel premium, memorable, and easy to discover.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02)] p-1"
        >
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.8rem] bg-[#151515] px-8 py-16 text-center md:min-h-[440px]">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-pink-400/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl">✦</div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/35">Brand identity · Digital experience</p>
              <h4 className="mt-4 text-2xl font-semibold text-white md:text-4xl">Made with care. Presented beautifully.</h4>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
