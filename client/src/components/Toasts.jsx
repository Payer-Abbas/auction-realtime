import { useNotifications } from '../context/NotificationContext.jsx'

export default function Toasts() {
  const { toasts } = useNotifications()
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, display: 'grid', gap: 10, zIndex: 50
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          minWidth: 260,
          padding: '10px 12px',
          borderRadius: 12,
          background: '#111827',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.16)'
        }}>
          <div style={{ fontWeight: 700 }}>{t.title || 'Notification'}</div>
          <div style={{ opacity: 0.95 }}>{t.body}</div>
        </div>
      ))}
    </div>
  )
}
