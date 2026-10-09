import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted variable fonts. The opsz builds let the browser pick Big
// Shoulders' Display cut for headings and its Text cut for small lettering.
import '@fontsource-variable/big-shoulders/opsz.css'
import '@fontsource-variable/big-shoulders-stencil/opsz.css'
import '@fontsource-variable/instrument-sans/wdth.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
