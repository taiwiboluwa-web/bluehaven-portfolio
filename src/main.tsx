import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import Admin from './app/Admin.tsx';
import Stories from './app/Stories.tsx';
import RouteView from './app/RouteView.tsx';
import NavigationEnhancement from './app/NavigationEnhancement.tsx';
import SiteEnhancements from './app/SiteEnhancements.tsx';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);
const path = window.location.pathname;
const isAdmin = path === '/admin' || path.startsWith('/admin/');
const isStories = path === '/stories' || path.startsWith('/stories/');

if (isAdmin) {
  root.render(<Admin/>);
} else if (isStories) {
  root.render(<Stories/>);
} else {
  root.render(<><RouteView/><NavigationEnhancement/></>);
}
