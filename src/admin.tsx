import { createRoot } from 'react-dom/client';
import Admin from './app/Admin';
import './styles/index.css';

createRoot(document.getElementById('admin-root')!).render(<Admin />);
