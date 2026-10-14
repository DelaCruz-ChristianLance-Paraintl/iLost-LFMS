import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { LoadingProvider } from './components/Loadingprovider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </ToastProvider>
  </StrictMode>,
)