import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

/*
  The single entry point: find the root element, mount React into it.

  <StrictMode> is development-only — it disappears from the production build.
  It deliberately renders components twice and runs effects twice to surface
  impure code (a component that mutates something outside itself, or an effect
  without proper cleanup). If something breaks only in StrictMode, that is a
  real bug it has just saved you from shipping.
*/
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
