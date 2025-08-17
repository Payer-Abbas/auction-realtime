import { Link, Routes, Route, NavLink } from 'react-router-dom'
import AuctionsList from './pages/AuctionsList.jsx'
import CreateAuction from './pages/CreateAuction.jsx'
import AuctionRoom from './pages/AuctionRoom.jsx'
import NotificationBell from './components/NotificationBell.jsx'
import Toasts from './components/Toasts.jsx'

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  background: '#111827',
  color: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 40
}

const linkStyle = ({ isActive }) => ({
  color: '#fff',
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: 10,
  background: isActive ? '#1f2937' : 'transparent'
})

export default function App() {
  return (
    <>
      <header style={navStyle}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          Auction ⚡
        </Link>
        <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <NavLink to="/" style={linkStyle}>Auctions</NavLink>
          <NavLink to="/create" style={linkStyle}>Create</NavLink>
          <NotificationBell />
        </nav>
      </header>

      <main style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<AuctionsList />} />
          <Route path="/create" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionRoom />} />
        </Routes>
      </main>

      <Toasts />
    </>
  )
}
