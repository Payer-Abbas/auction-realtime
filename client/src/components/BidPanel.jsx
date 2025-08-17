import { useEffect, useState } from 'react'
import { formatCurrency } from '../utils/time.js'

export default function BidPanel({ highestBid, minNextBid, onPlaceBid, disabled }) {
  const [amount, setAmount] = useState("")
  const [email, setEmail] = useState("")

  // update bid input when minNextBid changes (auction loads or new bid placed)
  useEffect(() => {
    if (minNextBid) setAmount(minNextBid)
  }, [minNextBid])

  const handlePlaceBid = () => {
    if (!amount || !email) {
      alert("Please enter a valid bid amount and your email")
      return
    }

    onPlaceBid(Number(amount), email)

    // ✅ reset amount to the next minimum after placing bid
    if (minNextBid) {
      setAmount(minNextBid)
    }
    // ✅ keep email for convenience, do not clear it
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      display: 'grid', gap: 10
    }}>
      <div>Highest Bid: <b>{formatCurrency(highestBid || 0)}</b></div>
      <div>Minimum Next Bid: <b>{formatCurrency(minNextBid)}</b></div>

      {/* Bid Amount Input */}
      <input
        type="number"
        value={amount}
        min={minNextBid}
        onChange={e => setAmount(Number(e.target.value))}
        disabled={disabled}
        placeholder="Enter your bid"
        style={{
          height: 40, padding: '0 12px', borderRadius: 10,
          border: '1px solid #e5e7eb', outline: 'none', boxSizing: 'border-box'
        }}
      />

      {/* Email Input */}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={disabled}
        placeholder="Enter your email"
        style={{
          height: 40, padding: '0 12px', borderRadius: 10,
          border: '1px solid #e5e7eb', outline: 'none', boxSizing: 'border-box'
        }}
      />

      <button
        onClick={handlePlaceBid}
        disabled={disabled}
        style={{
          height: 44, borderRadius: 12, border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: '#111827', color: '#fff', fontWeight: 600
        }}
      >
        Place Bid
      </button>
    </div>
  )
}
