import { createRoot } from 'react-dom/client';
import RouteView from './app/RouteView.tsx';
import NavigationEnhancement from './app/NavigationEnhancement.tsx';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);
const path = window.location.pathname;
const isAdmin = path === '/admin' || path.startsWith('/admin/');
const isStories = path === '/stories' || path.startsWith('/stories/');

if (isAdmin) {
  import('./lib/imageOptimization.ts').then(({ installAdminImageOptimization }) => {
    installAdminImageOptimization();
    return import('./app/Admin.tsx');
  }).then(({ default: Admin }) => root.render(<Admin />));
} else if (isStories) {
  import('./app/Stories.tsx').then(({ default: Stories }) => root.render(<Stories />));
} else {
  root.render(<div id="main-content"><RouteView /><NavigationEnhancement /></div>);
}
