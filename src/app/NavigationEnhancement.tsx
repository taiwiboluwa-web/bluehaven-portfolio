import { useEffect } from 'react';
import { scrollToSection } from './scrollNavigation';

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
 * This component adds the Stories link and provides a small compatibility
 * layer for navigation. The page uses transformed 3D depth layers, so the
 * native scrollIntoView() path can be unreliable on some browsers.
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

    const label = button.textContent?.trim().toLowerCase().replace(/\s+/g, ' ');
    const sectionByLabel: Record<string, string> = {
      services: 'services',
      portfolio: 'portfolio',
      process: 'process',
      inquire: 'contact',
    };

    const sectionId = label ? sectionByLabel[label] : undefined;
    if (!sectionId) return;

    // Capture the click before React's scrollIntoView handler. This makes
    // desktop and mobile use the same reliable window-level scroll behavior.
    event.preventDefault();
    event.stopPropagation();
    scrollToSection(sectionId);
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
