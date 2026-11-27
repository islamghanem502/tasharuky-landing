import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/lalezar'
import '@fontsource-variable/alexandria'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
