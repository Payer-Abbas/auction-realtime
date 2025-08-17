import { useEffect, useState } from 'react'
import api from '../api'
import AuctionCard from '../components/AuctionCard.jsx'

export default function AuctionsList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get('/auctions')
        if (mounted) setList(data || [])
      } catch (e) {
        console.error('Fetch auctions failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Loading…</div>
  if (!list.length) return <div>No auctions yet.</div>

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {list.map(a => <AuctionCard key={a.id} a={a} />)}
    </div>
  )
}
