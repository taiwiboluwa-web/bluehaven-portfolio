import { createRoot } from 'react-dom/client';
import RouteView from './app/RouteView.tsx';
import NavigationEnhancement from './app/NavigationEnhancement.tsx';
import { installPortfolioGalleryRuntime } from './lib/portfolioGalleryRuntime.ts';
import './styles/index.css';

installPortfolioGalleryRuntime();

const root = createRoot(document.getElementById('root')!);
const path = window.location.pathname;
const isBlogAdmin = path === '/admin/blog' || path === '/admin/blog/';
const isAdmin = (path === '/admin' || path.startsWith('/admin/')) && !isBlogAdmin;
const isWriter = path === '/stories/write' || path === '/stories/account';
const isStories = (path === '/stories' || path.startsWith('/stories/')) && !isWriter;

if (isBlogAdmin) {
  import('./app/BlogAdmin.tsx').then(({ default: BlogAdmin }) => root.render(<BlogAdmin />));
} else if (isAdmin) {
  import('./lib/imageOptimization.ts').then(({ installAdminImageOptimization }) => {
    installAdminImageOptimization();
    return import('./app/Admin.tsx');
  }).then(({ default: Admin }) => root.render(<Admin />));
} else if (isWriter) {
  import('./app/BlogPortal.tsx').then(({ default: BlogPortal }) => root.render(<BlogPortal />));
} else if (isStories) {
  import('./app/Stories.tsx').then(({ default: Stories }) => root.render(<Stories />));
} else {
  root.render(<div id="main-content"><RouteView /><NavigationEnhancement /></div>);
}
