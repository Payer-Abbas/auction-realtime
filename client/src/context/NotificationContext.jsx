import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]) // { id, title, body, ts }

  const pushToast = useCallback((t) => {
    const id = crypto.randomUUID()
    setToasts((list) => [...list, { id, ts: Date.now(), ...t }])
    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((list) => list.filter((x) => x.id !== id))
    }, 5000)
  }, [])

  const value = useMemo(() => ({ toasts, pushToast }), [toasts, pushToast])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
