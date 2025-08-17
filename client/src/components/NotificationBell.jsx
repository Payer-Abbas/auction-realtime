import { useState } from 'react'
import { useNotifications } from '../context/NotificationContext.jsx'

export default function NotificationBell() {
  const { toasts } = useNotifications()
  const [open, setOpen] = useState(false)

  const pulse = !!toasts.length

  return (
    <button
      onClick={() => setOpen(!open)}
      style={{
        position: 'relative',
        height: 36,
        borderRadius: 10,
        border: '1px solid #374151',
        background: '#1f2937',
        color: '#fff',
        padding: '0 10px',
        cursor: 'pointer'
      }}
      title="Notifications"
    >
      🔔
      {pulse && (
        <span style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 10,
          height: 10,
          borderRadius: 999,
          background: '#ef4444'
        }} />
      )}
    </button>
  )
}
