import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Callback from './pages/Callback.tsx'

const isCallback = window.location.pathname === '/callback'
createRoot(document.getElementById('root')!).render(
  <StrictMode>{isCallback ? <Callback /> : <App />}</StrictMode>,
)
