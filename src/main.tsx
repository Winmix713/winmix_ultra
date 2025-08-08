import React from 'react'
import ReactDOM from 'react-dom/client'
 phase1-modern-football-prediction-system-migration-foundation
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
=======
import App from './App'
 main
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
 phase1-modern-football-prediction-system-migration-foundation
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
=======
    <App />
 main
  </React.StrictMode>,
)
