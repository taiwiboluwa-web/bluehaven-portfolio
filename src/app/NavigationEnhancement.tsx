import { useEffect } from 'react';

export const links = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Process', href: '/process' },
  { label: 'Inquire', href: '/inquire' },
];

/**
 * The main header navigation is owned by React (App.tsx).
 * This component only adds the Stories link because Stories is a separate route.
 * It deliberately does NOT install a document-level click/capture handler:
 * that handler previously intercepted React's mobile menu buttons before their
 * onClick handlers could run on touch devices.
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

export default function NavigationEnhancement() {
  useEffect(() => {
    addStoriesToLists();

    const observer = new MutationObserver(() => addStoriesToLists());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
