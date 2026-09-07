import { useEffect } from 'react';

export const links = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
  { label: 'Inquire', href: '/inquire' },
];

function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[→➜➝➞›»]/g, '')
    .replace(/[\u2190\u2191\u2192\u2193]/g, '')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getNavigationHref(label: string): string | null {
  const normalized = normalizeLabel(label);
  if (normalized === 'portfolio') return '/work';
  return links.find((link) => link.label.toLowerCase() === normalized)?.href ?? null;
}

export function getConversionHref(label: string): string | null {
  const normalized = normalizeLabel(label);
  if (normalized === 'view portfolio' || normalized === 'view work') return '/work';
  if (normalized === "let's talk" || normalized === 'start a project' || normalized === 'chat with us') return '/inquire';
  return null;
}

function makeLink(label: string, href: string, className = '') {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.setAttribute('aria-label', label);
  a.style.display = 'block';
  a.style.width = '100%';
  a.style.textDecoration = 'none';
  a.style.cursor = 'pointer';
  a.style.touchAction = 'manipulation';
  a.style.webkitTapHighlightColor = 'transparent';
  a.className = className;
  return a;
}

function addStoriesToLists() {
  document.querySelectorAll('header ul').forEach((list) => {
    if (list.querySelector('[data-bh-stories-link="1"]')) return;
    const first = list.querySelector('li');
    if (!first) return;
    const li = document.createElement('li');
    li.setAttribute('data-bh-stories-link', '1');
    li.style.listStyle = 'none';
    li.appendChild(makeLink('Stories', '/stories', first.querySelector('button, a')?.className || ''));
    list.insertBefore(li, list.children[1] || null);
  });
}

function addAboutToLists() {
  document.querySelectorAll('header ul').forEach((list) => {
    if (Array.from(list.querySelectorAll('li')).some((li) => normalizeLabel(li.textContent ?? '') === 'about')) return;
    const processItem = Array.from(list.querySelectorAll('li')).find((li) => normalizeLabel(li.textContent ?? '') === 'process');
    if (!processItem) return;
    const li = document.createElement('li');
    li.setAttribute('data-bh-about-link', '1');
    li.style.listStyle = 'none';
    li.appendChild(makeLink('About', '/about', processItem.querySelector('button, a')?.className || ''));
    processItem.after(li);
  });
}

function renamePortfolioControls() {
  document.querySelectorAll('header button, header a, footer button, footer a').forEach((control) => {
    if (normalizeLabel(control.textContent ?? '') !== 'portfolio') return;
    control.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = 'Work';
    });
    control.setAttribute('aria-label', 'Work');
  });
}

function refineConversionControls() {
  document.querySelectorAll('button, a, [role="button"]').forEach((control) => {
    const label = (control.textContent ?? '').trim();
    const href = getConversionHref(label);
    if (!href) return;

    if (href === '/work') control.setAttribute('aria-label', 'View Work');
    if (href === '/inquire') control.setAttribute('aria-label', 'Start a Project');

    if (control instanceof HTMLAnchorElement) {
      control.href = href;
    }
  });
}

function addMissingFooterNavigation() {
  document.querySelectorAll('footer ul').forEach((list) => {
    const findItem = (label: string) => Array.from(list.querySelectorAll('li')).find((li) => normalizeLabel(li.textContent ?? '') === normalizeLabel(label)) ?? null;
    links.forEach(({ label, href }) => {
      if (findItem(label)) return;
      const li = document.createElement('li');
      li.setAttribute('data-bh-footer-link', label.toLowerCase());
      li.style.listStyle = 'none';
      li.appendChild(makeLink(label, href, list.querySelector('button, a')?.className || ''));
      list.appendChild(li);
    });
  });
}

function shouldHandleNavigation(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function installReliableNavigation() {
  const handleClick = (event: MouseEvent) => {
    if (!shouldHandleNavigation(event)) return;
    const target = event.target as HTMLElement | null;
    const control = target?.closest('header button, header a, footer button, footer a') as HTMLElement | null;
    if (!control) return;
    const href = getNavigationHref(control.textContent ?? '');
    if (!href) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(href);
  };

  const handleConversion = (event: MouseEvent) => {
    if (!shouldHandleNavigation(event)) return;
    const target = event.target as HTMLElement | null;
    const control = target?.closest('button, a, [role="button"]') as HTMLElement | null;
    if (!control) return;

    const href = getConversionHref(control.textContent ?? '');
    if (!href) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(href);
  };

  document.addEventListener('click', handleConversion, true);
  document.addEventListener('click', handleClick, true);
  return () => {
    document.removeEventListener('click', handleConversion, true);
    document.removeEventListener('click', handleClick, true);
  };
}

export default function NavigationEnhancement() {
  useEffect(() => {
    const syncNavigation = () => {
      addStoriesToLists();
      addAboutToLists();
      renamePortfolioControls();
      refineConversionControls();
      addMissingFooterNavigation();
    };
    syncNavigation();
    const observer = new MutationObserver(syncNavigation);
    observer.observe(document.body, { childList: true, subtree: true });
    const removeNavigation = installReliableNavigation();
    return () => { observer.disconnect(); removeNavigation(); };
  }, []);
  return null;
}
