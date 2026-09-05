import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../app/App'
import '../index.css'
import './cms-live-media.css'
import './cms-live-media'
import './bluehaven-ai'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
