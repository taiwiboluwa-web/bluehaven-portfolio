import { createRoot } from 'react-dom/client';
import './styles/index.css';
import HarveyAdmin from './app/HarveyAdmin';

const root = document.getElementById('admin-root');
if (!root) throw new Error('Harvey admin root element is missing.');
createRoot(root).render(<HarveyAdmin />);
