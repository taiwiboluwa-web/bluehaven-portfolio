import { normalizeProject, projectIsVisible } from './cms-visibility.mjs';

const CMS_URL = '/api/portfolio?includeHidden=1&_=' + Date.now();
const DYNAMIC_ID = 'bluehaven-cms-projects';

const text = value => String(value || '').trim();

function matchingSections(name) {
  const needle = name.toLowerCase();
  return Array.from(document.querySelectorAll('main section, body > section, section')).filter(section =>
    (section.textContent || '').toLowerCase().includes(needle),
  );
}

function applyVisibility(projects) {
  const known = projects.map(normalizeProject).filter(project => project.name);
  known.forEach(project => {
    matchingSections(project.name).forEach(section => {
      if (projectIsVisible(project)) {
        section.removeAttribute('data-bluehaven-hidden');
        section.style.removeProperty('display');
      } else {
        section.setAttribute('data-bluehaven-hidden', 'true');
        section.style.display = 'none';
      }
    });
  });
}

function createDynamicCard(project) {
  const article = document.createElement('article');
  article.style.cssText = 'background:#111;border:1px solid rgba(255,255,255,.1);overflow:hidden;text-align:left;transition:transform .3s ease,border-color .3s ease';
  article.onmouseenter = () => { article.style.transform = 'translateY(-6px)'; article.style.borderColor = 'rgba(255,255,255,.25)'; };
  article.onmouseleave = () => { article.style.transform = ''; article.style.borderColor = 'rgba(255,255,255,.1)'; };

  const media = Array.isArray(project.media) ? project.media : [];
  if (media[0]?.url) {
    const img = document.createElement('img');
    img.src = media[0].url;
    img.alt = text(media[0].alt || project.name);
    img.loading = 'lazy';
    img.style.cssText = 'display:block;width:100%;aspect-ratio:16/10;object-fit:cover';
    article.appendChild(img);
  }

  const body = document.createElement('div');
  body.style.cssText = 'padding:22px';
  const category = document.createElement('div');
  category.textContent = text(project.category || 'Project').toUpperCase();
  category.style.cssText = 'font-size:10px;letter-spacing:.18em;color:#888;margin-bottom:9px';
  body.appendChild(category);

  const title = document.createElement('h3');
  title.textContent = text(project.name);
  title.style.cssText = 'margin:0 0 9px;font-size:24px;line-height:1.05;color:#fff';
  body.appendChild(title);

  if (project.description) {
    const description = document.createElement('p');
    description.textContent = text(project.description);
    description.style.cssText = 'margin:0;color:#999;line-height:1.6;font-size:14px';
    body.appendChild(description);
  }

  if (project.website_url) {
    const link = document.createElement('a');
    link.href = project.website_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View project';
    link.style.cssText = 'display:inline-block;margin-top:18px;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase';
    body.appendChild(link);
  }

  article.appendChild(body);
  return article;
}

function renderNewProjects(projects) {
  const visible = projects.map(normalizeProject).filter(project => project.name && projectIsVisible(project));
  const existingNames = new Set();
  document.querySelectorAll('section').forEach(section => {
    const content = (section.textContent || '').toLowerCase();
    visible.forEach(project => {
      if (content.includes(project.name.toLowerCase())) existingNames.add(project.name.toLowerCase());
    });
  });

  const newProjects = visible.filter(project => !existingNames.has(project.name.toLowerCase()));
  let host = document.getElementById(DYNAMIC_ID);
  if (!newProjects.length) {
    host?.remove();
    return;
  }

  if (!host) {
    host = document.createElement('section');
    host.id = DYNAMIC_ID;
    host.style.cssText = 'padding:5rem 7%;background:#0b0b0b;color:#fff';
    const anchor = Array.from(document.querySelectorAll('section')).find(section =>
      (section.textContent || '').toLowerCase().includes('our recent work'),
    );
    (anchor?.parentElement || document.querySelector('main') || document.body).appendChild(host);
  }

  host.innerHTML = '';
  const eyebrow = document.createElement('div');
  eyebrow.textContent = 'MORE RECENT WORK';
  eyebrow.style.cssText = 'font-size:10px;letter-spacing:.2em;color:#777;margin-bottom:10px';
  host.appendChild(eyebrow);
  const heading = document.createElement('h2');
  heading.textContent = 'New projects';
  heading.style.cssText = 'font-size:clamp(32px,5vw,58px);line-height:.95;letter-spacing:-.04em;margin:0 0 30px';
  host.appendChild(heading);
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px';
  newProjects.forEach(project => grid.appendChild(createDynamicCard(project)));
  host.appendChild(grid);
}

async function sync() {
  try {
    const response = await fetch(CMS_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    applyVisibility(projects);
    renderNewProjects(projects);
  } catch (error) {
    console.warn('Bluehaven CMS visibility bridge unavailable', error);
  }
}

let scheduled;
const schedule = () => {
  clearTimeout(scheduled);
  scheduled = setTimeout(sync, 250);
};

sync();
new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
