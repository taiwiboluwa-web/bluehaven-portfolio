import { createRoot } from 'react-dom/client';
import './styles/index.css';
import SBCSAdmin from './app/SBCSAdmin';

const root = createRoot(document.getElementById('admin-root')!);
root.render(<SBCSAdmin />);
