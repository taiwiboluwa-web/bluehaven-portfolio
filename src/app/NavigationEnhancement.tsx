import { useEffect } from 'react';

export const links = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Process', href: '/process' },
  { label: 'Inquire', href: '/inquire' },
];

export function getNavigationHref(label: string): string | null {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, ' ');
  return links.find((link) => link.label.toLowerCase() === normalized && link.label !== 'Home' && link.label !== 'Stories')?.href ?? null;
}

/**
 * The main header navigation is rendered by App.tsx.
 * The section links are real Vercel routes, so use those routes instead of
 * relying on scrollIntoView() inside the page's transformed 3D layers.
 * This is especially important on mobile, where the sticky/transformed header
 * can otherwise swallow or mis-handle the synthetic React click.
 */
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

function installReliableSectionNavigation() {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('header button') as HTMLButtonElement | null;
    if (!button) return;

    const href = getNavigationHref(button.textContent ?? '');
    if (!href) return;

    // Capture before React's onClick handlers. The app already has dedicated
    // routes for these sections and Vercel rewrites them back to index.html.
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(href);
  };

  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}

export default function NavigationEnhancement() {
  useEffect(() => {
    addStoriesToLists();

    const observer = new MutationObserver(() => addStoriesToLists());
    observer.observe(document.body, { childList: true, subtree: true });

    const removeSectionNavigation = installReliableSectionNavigation();

    return () => {
      observer.disconnect();
      removeSectionNavigation();
    };
  }, []);

  return null;
}
