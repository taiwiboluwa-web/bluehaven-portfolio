import { useEffect } from 'react';

export const links = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Process', href: '/process' },
  { label: 'Inquire', href: '/inquire' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

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
    a.style.textDecoration = 'none';
    a.style.cursor = 'pointer';
    a.style.touchAction = 'manipulation';
    a.style.webkitTapHighlightColor = 'transparent';
    a.className = first.querySelector('button, a')?.className || '';

    li.appendChild(a);
    list.insertBefore(li, list.children[1] || null);
  });
}

function handleNavigationClick(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target) return;

  const clickable = target.closest('button, a');
  if (!clickable || !clickable.closest('header')) return;

  // Ignore the hamburger toggle itself.
  if (clickable.getAttribute('aria-label') === 'Toggle menu') return;

  const label = normalize(clickable.textContent || '');
  const match = links.find((link) => label === link.label);
  if (!match) return;

  // Do not mutate/replace React's buttons. Capture the touch/click and perform
  // a normal browser navigation, which is reliable on iOS and Android.
  event.preventDefault();
  event.stopPropagation();
  window.location.href = match.href;
}

function wirePortfolioCTA(event: MouseEvent) {
  const target = event.target as Element | null;
  const clickable = target?.closest('button, a');
  if (!clickable) return;
  const label = normalize(clickable.textContent || '');
  if (label !== 'View Portfolio') return;
  event.preventDefault();
  event.stopPropagation();
  window.location.href = '/portfolio';
}

export default function NavigationEnhancement() {
  useEffect(() => {
    // This component previously replaced React buttons with DOM-created anchors.
    // That raced React's mobile menu rendering and made touch targets unreliable.
    // Keep React in control and use one delegated capture listener instead.
    addStoriesToLists();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const label = normalize(target?.closest('button, a')?.textContent || '');
      if (label === 'View Portfolio') {
        wirePortfolioCTA(event);
        return;
      }
      handleNavigationClick(event);
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}
