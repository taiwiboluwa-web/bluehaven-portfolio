export function scrollToSection(id: string): boolean {
  const element = document.getElementById(id);
  if (!element) return false;

  const header = document.querySelector('header');
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const top = Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY - headerHeight - 16,
  );

  window.scrollTo({ top, behavior: 'smooth' });
  return true;
}
