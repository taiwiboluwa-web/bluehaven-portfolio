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

export function getNavigationHref(label: string): string | null {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, ' ');
  if (normalized === 'portfolio') return '/work';
  return links.find((link) => link.label.toLowerCase() === normalized)?.href ?? null;
}

function addStoriesToLists() {
  document.querySelectorAll('header ul').forEach((list) => {
    if (list.querySelector('[data-bh-stories-link="1"]')) return;
    const first = list.querySelector('li');
    if (!first) return;
    const li = document.createElement('li');
    li.setAttribute('data-bh-stories-link', '1');
    li.style.listStyle = 'none';
    const a = document.createElement('a');
    a.href = '/stories';
    a.textContent = 'Stories';
    a.setAttribute('aria-label', 'Stories');
    a.style.display = 'block';
    a.style.width = '100%';
    a.style.textDecoration = 'none';
    a.style.cursor = 'pointer';
    a.style.touchAction = 'manipulation';
    a.style.webkitTapHighlightColor = 'transparent';
    a.className = first.querySelector('button, a')?.className || '';
    li.appendChild(a);
    list.insertBefore(li, list.children[1] || null);
  });
}

function renamePortfolioControls() {
  document.querySelectorAll('header button, footer button').forEach((control) => {
    if ((control.textContent ?? '').trim() !== 'Portfolio') return;
    control.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = 'Work';
    });
  });
}

function addMissingFooterNavigation() {
  document.querySelectorAll('footer ul').forEach((list) => {
    const findItem = (label: string) => Array.from(list.querySelectorAll('li')).find((li) => (li.textContent ?? '').trim().toLowerCase() === label.toLowerCase()) ?? null;
    links.forEach(({ label, href }) => {
      if (findItem(label)) return;
      const li = document.createElement('li');
      li.setAttribute('data-bh-footer-link', label.toLowerCase());
      li.style.listStyle = 'none';
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      a.setAttribute('aria-label', label);
      a.style.display = 'inline-block';
      a.style.textDecoration = 'none';
      a.style.cursor = 'pointer';
      a.style.touchAction = 'manipulation';
      a.style.webkitTapHighlightColor = 'transparent';
      a.className = list.querySelector('button, a')?.className || '';
      li.appendChild(a);
      list.appendChild(li);
    });
  });
}

function installReliableNavigation() {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const control = target?.closest('header button, footer button') as HTMLButtonElement | null;
    if (!control) return;
    const href = getNavigationHref(control.textContent ?? '');
    if (!href) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(href);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}

export default function NavigationEnhancement() {
  useEffect(() => {
    const syncNavigation = () => {
      addStoriesToLists();
      renamePortfolioControls();
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
