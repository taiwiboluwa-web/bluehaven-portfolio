export const storiesClasses = {
  page: 'min-h-screen bg-[#0f0f0f] text-white',
  container: 'mx-auto w-full max-w-7xl px-5 md:px-[10%]',
  eyebrow: 'text-xs font-semibold uppercase tracking-[.25em] text-[#ffde59]',
};

export function getStoryGridClass(index: number) {
  return index === 0 ? 'md:col-span-2 lg:col-span-2' : '';
}
