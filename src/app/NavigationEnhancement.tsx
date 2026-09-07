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
  return links.find((link) => link.label.toLowerCase() === normalized)?.href ?? null;
}

/**
 * Keep navigation reliable across both the header and footer.
 * The site has dedicated routes for every primary navigation item, so links
 * should not depend on scrollIntoView() or transformed 3D layers swallowing
 * React click events on desktop or mobile.
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

function addMissingFooterNavigation() {
  document.querySelectorAll('footer ul').forEach((list) => {
    const findItem = (label: string) =>
      Array.from(list.querySelectorAll('li')).find(
        (li) => (li.textContent ?? '').trim().toLowerCase() === label.toLowerCase()
      ) ?? null;

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

    const desiredOrder = links.map(({ label }) => label.toLowerCase());
    const currentOrder = Array.from(list.querySelectorAll(':scope > li')).map((li) =>
      (li.textContent ?? '').trim().toLowerCase()
    );

    if (currentOrder.join('|') !== desiredOrder.join('|')) {
      links.forEach(({ label }) => {
        const item = findItem(label);
        if (item) list.appendChild(item);
      });
    }
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
      addMissingFooterNavigation();
    };

    syncNavigation();

    const observer = new MutationObserver(syncNavigation);
    observer.observe(document.body, { childList: true, subtree: true });

    const removeNavigation = installReliableNavigation();

    return () => {
      observer.disconnect();
      removeNavigation();
    };
  }, []);

  return null;
}
