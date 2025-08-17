import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/time.js'

export default function AuctionCard({ a }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{a.item_name}</div>
      <div style={{ color: '#6b7280', marginTop: 6 }}>{a.description}</div>
      <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>Start: <b>{formatCurrency(a.starting_price)}</b></div>
        <div>Increment: <b>{formatCurrency(a.bid_increment)}</b></div>
        <div>Status: <b>{a.status}</b></div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link to={`/auction/${a.id}`} style={{
          display: 'inline-block',
          padding: '10px 12px',
          borderRadius: 10,
          background: '#111827',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600
        }}>
          Enter Room
        </Link>
      </div>
    </div>
  )
}
