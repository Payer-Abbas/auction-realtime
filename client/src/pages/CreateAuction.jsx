import { useState } from 'react'
import api from '../api'

export default function CreateAuction() {
  const [form, setForm] = useState({
    item_name: '',
    description: '',
    starting_price: 10000,
    bid_increment: 1,
    go_live_at: '',
    durationMinutes: 60,
    seller_id: 1, // default for testing
  })

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      console.log("Raw go_live_at (local string):", form.go_live_at)
      console.log("Raw durationMinutes:", form.durationMinutes)

      // Parse local datetime string from input
      const [datePart, timePart] = form.go_live_at.split("T")
      const [year, month, day] = datePart.split("-").map(Number)
      const [hour, minute] = timePart.split(":").map(Number)

      // Build Date in local timezone
      const goLiveDate = new Date(year, month - 1, day, hour, minute)

      if (isNaN(goLiveDate.getTime())) {
        setMsg({ type: 'error', text: 'Please enter a valid "Go Live At" datetime.' })
        setLoading(false)
        return
      }

      // Compute end time
      const endDate = new Date(goLiveDate.getTime() + Number(form.durationMinutes) * 60000)

      console.log("Computed go_live_at UTC:", goLiveDate.toISOString())
      console.log("Computed end_at UTC:", endDate.toISOString())

      const payload = {
        item_name: form.item_name.trim(),
        description: form.description.trim(),
        starting_price: Number(form.starting_price),
        bid_increment: Number(form.bid_increment),
        go_live_at: goLiveDate.toISOString(), // ✅ correct UTC
        end_at: endDate.toISOString(),        // ✅ correct UTC
        seller_id: Number(form.seller_id),
      }

      console.log('Submitting auction payload:', payload)

      const { data } = await api.post('/auctions', payload)
      setMsg({ type: 'success', text: `Created auction #${data?.id ?? ''}` })

      // reset form
      setForm({
        item_name: '',
        description: '',
        starting_price: 10000,
        bid_increment: 1,
        go_live_at: '',
        durationMinutes: 60,
        seller_id: 1,
      })
    } catch (err) {
      const serverMsg = err?.response?.data?.error || err.message || 'Unknown error'
      setMsg({ type: 'error', text: `CreateAuction error: ${serverMsg}` })
      console.error('CreateAuction error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '32px auto',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        background: '#fff',
      }}
    >
      <h1 style={{ margin: 0, marginBottom: 16, fontSize: 28 }}>
        Create Auction
      </h1>

      {msg && (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            marginBottom: 16,
            background: msg.type === 'success' ? '#e8f7ee' : '#fdecea',
            border: `1px solid ${msg.type === 'success' ? '#34c759' : '#f44336'}`,
          }}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Item Name</span>
          <input
            name="item_name"
            value={form.item_name}
            onChange={onChange}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Starting Price</span>
            <input
              type="number"
              name="starting_price"
              value={form.starting_price}
              onChange={onChange}
              min={1}
              required
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Bid Increment</span>
            <input
              type="number"
              name="bid_increment"
              value={form.bid_increment}
              onChange={onChange}
              min={1}
              required
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Go Live At</span>
            <input
              type="datetime-local"
              name="go_live_at"
              value={form.go_live_at}
              onChange={onChange}
              required
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Duration (minutes)</span>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={onChange}
              min={1}
              required
              style={inputStyle}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6, width: 160 }}>
          <span>Seller ID</span>
          <input
            type="number"
            name="seller_id"
            value={form.seller_id}
            onChange={onChange}
            min={1}
            required
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44,
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: '#111827',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {loading ? 'Creating…' : 'Create Auction'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  height: 40,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  outline: 'none',
  boxSizing: 'border-box',
}
