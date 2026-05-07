import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const api = useMemo(() => ({
    success: (message) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, type: 'success', message }])
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3000)
    },
    error: (message) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, type: 'error', message }])
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000)
    },
    remove: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
  }), [])

  useEffect(() => {
    const onUnauthorized = () => {
      api.error('Session expired. Please sign in.')
    }
    window.addEventListener('app:unauthorized', onUnauthorized)
    return () => window.removeEventListener('app:unauthorized', onUnauthorized)
  }, [api])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(90vw,24rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 shadow-lg backdrop-blur transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within ToastProvider')
  return value
}
