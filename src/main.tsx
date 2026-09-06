import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import Admin from './app/Admin.tsx';
import SiteEnhancements from './app/SiteEnhancements.tsx';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);
const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
root.render(isAdmin ? <Admin /> : <><App /><SiteEnhancements /></>);
