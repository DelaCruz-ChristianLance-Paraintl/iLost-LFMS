import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import ToastContext from './ToastContext'
import './ToastProvider.css'

function ToastItem({ toast, onDismiss }) {
  const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id)
    }, 6000)

    return () => window.clearTimeout(timeoutId)
  }, [onDismiss, toast.id])

  return (
    <div
      className={`app-toast app-toast-${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon className="app-toast-icon" aria-hidden="true" />
      <div className="app-toast-content">
        <p className="app-toast-title">{toast.title}</p>
        {toast.description && (
          <p className="app-toast-description">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        className="app-toast-dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(({ type, title, description }) => {
    const id = nextId.current++
    setToasts((current) => [
      ...current.slice(-3),
      { id, type, title, description },
    ])
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="app-toast-region" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
