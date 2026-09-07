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
 * This component adds the Stories link and provides a small mobile-navigation
 * compatibility layer. The main page uses transformed 3D depth layers, which
 * can make scrollIntoView unreliable on some mobile browsers. The app already
 * has route-aware views for /portfolio, /process and /inquire, so on mobile we
 * use those real routes instead of relying on transformed-element scrolling.
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

function installMobileRouteNavigation() {
  const handleClick = (event: MouseEvent) => {
    if (!window.matchMedia('(max-width: 767px)').matches) return;

    const target = event.target as HTMLElement | null;
    const button = target?.closest('header nav button') as HTMLButtonElement | null;
    if (!button) return;

    const label = button.textContent?.trim().toLowerCase().replace(/\s+/g, ' ');
    const hrefByLabel: Record<string, string> = {
      home: '/',
      services: '/services',
      portfolio: '/portfolio',
      process: '/process',
      inquire: '/inquire',
    };

    const href = label ? hrefByLabel[label] : undefined;
    if (!href) return;

    // Let React finish its menu-close/animation handler first, then navigate.
    // Using a real route avoids mobile browser issues with scrollIntoView on
    // elements inside transformed 3D depth layers.
    window.setTimeout(() => {
      window.location.assign(href);
    }, 0);
  };

  document.addEventListener('click', handleClick, false);
  return () => document.removeEventListener('click', handleClick, false);
}

export default function NavigationEnhancement() {
  useEffect(() => {
    addStoriesToLists();

    const observer = new MutationObserver(() => addStoriesToLists());
    observer.observe(document.body, { childList: true, subtree: true });

    const removeMobileRouteNavigation = installMobileRouteNavigation();

    return () => {
      observer.disconnect();
      removeMobileRouteNavigation();
    };
  }, []);

  return null;
}
