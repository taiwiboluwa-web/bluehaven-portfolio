import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../app/App'
import { AdminDashboard } from '../app/components/AdminDashboard'
import '../index.css'
import './cms-live-media.css'
import './cms-live-media'
import './bluehaven-ai'

const root = createRoot(document.getElementById('root')!)
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

root.render(
  <StrictMode>
    {isAdmin ? <AdminDashboard /> : <App />}
  </StrictMode>,
)
