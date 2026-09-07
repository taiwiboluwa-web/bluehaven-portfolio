export const storiesClasses = {
  page: 'relative min-h-screen overflow-x-hidden bg-[#0f0f0f] text-white',
  shell: 'relative z-10 mx-auto w-full max-w-7xl px-5 md:px-10',
  section: 'relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-24',
  eyebrow: 'text-xs font-semibold uppercase tracking-[.25em] text-white/45',
  accent: 'text-[#ffde59]',
  rule: 'border-white/10',
  card: 'overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]',
};

export function getStoryGridClass(index: number) {
  return index === 0 ? 'md:col-span-2 lg:col-span-2' : '';
}
