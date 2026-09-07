import { useEffect } from 'react';

export const links = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Process', href: '/process' },
  { label: 'Inquire', href: '/inquire' },
];

function makeAnchor(label: string, href: string, template: Element) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.className = template.className;
  a.setAttribute('data-bh-nav', '1');
  a.setAttribute('aria-label', label);
  a.style.textDecoration = 'none';
  a.style.cursor = 'pointer';
  a.style.pointerEvents = 'auto';
  a.style.touchAction = 'manipulation';
  a.addEventListener('click', (event) => {
    // Use a real navigation rather than relying on React's removed button handler.
    // This keeps the links reliable on touch devices as well as desktop browsers.
    event.preventDefault();
    window.location.assign(href);
  });
  return a;
}

function replaceButtons(scope: string) {
  Array.from(document.querySelectorAll(`${scope} button`)).forEach((button) => {
    const label = (button.textContent || '').replace(/\s+/g, ' ').trim();
    const match = links.find((link) => label === link.label);
    if (!match || button.getAttribute('data-bh-nav') === '1') return;
    button.replaceWith(makeAnchor(label, match.href, button));
  });
}

function wirePortfolioCTA() {
  Array.from(document.querySelectorAll('button')).forEach((button) => {
    if (button.getAttribute('data-bh-portfolio-cta') === '1') return;
    const label = (button.textContent || '').replace(/\s+/g, ' ').trim();
    if (label !== 'View Portfolio') return;
    button.setAttribute('data-bh-portfolio-cta', '1');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign('/portfolio');
    });
  });
}

function addStoriesToLists(scope: string) {
  Array.from(document.querySelectorAll(`${scope} ul`)).forEach((list) => {
    if (list.querySelector('a[href="/stories"]')) return;
    const home = list.querySelector('a[href="/"]');
    if (!home) return;
    const li = document.createElement('li');
    li.appendChild(makeAnchor('Stories', '/stories', home));
    list.insertBefore(li, list.children[1] || null);
  });
}

function enhanceNavigation() {
  replaceButtons('header');
  replaceButtons('footer');
  addStoriesToLists('header');
  addStoriesToLists('footer');
  wirePortfolioCTA();
}

export default function NavigationEnhancement() {
  useEffect(() => {
    enhanceNavigation();
    const observer = new MutationObserver(enhanceNavigation);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
