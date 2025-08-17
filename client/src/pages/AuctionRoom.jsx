// AuctionRoom.jsx
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api"
import { ensureConnected } from "../socket"
import Countdown from "../components/Countdown.jsx"
import BidPanel from "../components/BidPanel.jsx"
import { useNotifications } from "../context/NotificationContext.jsx"
import { formatCurrency } from "../utils/time.js"

export default function AuctionRoom() {
  const { id } = useParams()
  const [auction, setAuction] = useState(null)
  const [highestBid, setHighestBid] = useState(null)
  const [highestBidderEmail, setHighestBidderEmail] = useState(null)
  const [status, setStatus] = useState("loading")
  const { pushToast } = useNotifications()

  // mock user (replace with auth later)
  const user = { id: 1, username: "testuser" }

  const minNextBid = useMemo(() => {
    const base = Number(highestBid || auction?.starting_price || 0)
    return base + Number(auction?.bid_increment || 1)
  }, [highestBid, auction])

  // 🔹 normalize auction data and extract highest bid/email
  const processAuctionData = (data) => {
    let hb = null
    let hbEmail = null

    if (data.current_highest_bid || data.highest_bid) {
      hb = data.current_highest_bid ?? data.highest_bid
      hbEmail = data.highest_bidder_email || null
    } else if (data.bids && data.bids.length > 0) {
      const top = data.bids.reduce((a, b) => (b.amount > a.amount ? b : a))
      hb = top.amount
      hbEmail = top.email || null
    }

    setAuction(data)
    setHighestBid(hb)
    setHighestBidderEmail(hbEmail)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get(`/auctions/${id}`)
        if (!mounted) return
        processAuctionData(data)
        setStatus("ready")
      } catch (e) {
        console.error("Failed to load auction", e)
        setStatus("error")
      }
    })()

    // sockets
    const socket = ensureConnected()
    socket.emit("join_auction", { auctionId: id })
    console.log("📡 Joined auction room: auction:" + id)

    socket.on("bid:placed", (p) => {
      if (String(p.auctionId) !== String(id)) return
      setHighestBid(p.amount)
      if (p.email) setHighestBidderEmail(p.email)
      pushToast({
        title: "New Bid",
        body: `New highest bid: ${formatCurrency(p.amount)}`,
      })
    })

    socket.on("auction:ended", (p) => {
      if (String(p.auctionId) !== String(id)) return
      setStatus("ended")
      pushToast({ title: "Auction Ended", body: "The auction has ended." })
    })

    socket.on("notify", (n) => {
      pushToast({
        title: n.title || "Notification",
        body: n.body || "",
      })
    })

    return () => {
      socket.emit("leave_auction", { auctionId: id })
      console.log("📡 Left auction room: auction:" + id)
      socket.off("bid:placed")
      socket.off("auction:ended")
      socket.off("notify")
    }
  }, [id, pushToast])

  const refreshAuction = async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`)
      processAuctionData(data)
    } catch (e) {
      console.error("Failed to refresh auction", e)
    }
  }

  const placeBid = async (amount, email) => {
    if (!email) {
      pushToast({ title: "Bid Failed", body: "Email is required" })
      return
    }
    try {
      await api.post(`/auctions/${id}/bids`, {
        amount: Number(amount),
        user_id: user.id,
        email,
      })
    } catch (e) {
      const serverMsg = e?.response?.data?.error || e.message || "Unknown error"
      pushToast({ title: "Bid Failed", body: serverMsg })
    }
  }

  const sellerAccept = async () => {
    try {
      await api.post(`/auctions/${id}/decision`, {
        action: "accept",
        seller_id: user.id,
      })
      pushToast({
        title: "Accepted",
        body: "Winner has been notified by email.",
      })
      await refreshAuction()
    } catch (e) {
      pushToast({
        title: "Action failed",
        body: e?.response?.data?.error || e.message,
      })
    }
  }

  const sellerReject = async () => {
    try {
      await api.post(`/auctions/${id}/decision`, {
        action: "reject",
        seller_id: user.id,
      })
      pushToast({
        title: "Rejected",
        body: "Bidder has been notified by email.",
      })
      await refreshAuction()
    } catch (e) {
      pushToast({
        title: "Action failed",
        body: e?.response?.data?.error || e.message,
      })
    }
  }

  const sellerCounter = async () => {
    const v = prompt("Counter-offer amount:")
    if (!v) return
    const price = Number(v)
    if (!Number.isFinite(price) || price <= 0) return
    try {
      await api.post(`/auctions/${id}/decision`, {
        action: "counter",
        price,
        seller_id: user.id,
      })
      pushToast({
        title: "Counter sent",
        body: `Bidder notified with ${formatCurrency(price)}.`,
      })
      await refreshAuction()
    } catch (e) {
      pushToast({
        title: "Action failed",
        body: e?.response?.data?.error || e.message,
      })
    }
  }

  if (status === "loading") return <div>Loading…</div>
  if (status === "error" || !auction) return <div>Not found.</div>

  const isActive = auction.status === "live"
  const isEnded = status === "ended" || auction.status === "ended"
  const isUpcoming = auction.status === "scheduled"

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ margin: 0 }}>{auction.item_name}</h2>
        <div style={{ color: "#6b7280", marginTop: 6 }}>
          {auction.description}
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            Start: <b>{formatCurrency(auction.starting_price)}</b>
          </div>
          <div>
            Increment: <b>{formatCurrency(auction.bid_increment)}</b>
          </div>

          {isUpcoming && (
            <>
              <div>
                Status: <b style={{ color: "blue" }}>Not started yet ⏳</b>
              </div>
              <div>
                <Countdown startAt={auction.go_live_at} endAt={auction.end_at} />
              </div>
            </>
          )}

          {isActive && (
            <>
              <div>
                Status: <b style={{ color: "green" }}>Live 🟢</b>
              </div>
              <div>
                <Countdown startAt={auction.go_live_at} endAt={auction.end_at} />
              </div>
            </>
          )}

          {isEnded && (
            <div>
              Status: <b style={{ color: "red" }}>Auction Ended 🔴</b>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          Highest Bid:{" "}
          <b>
            {highestBid !== null
              ? formatCurrency(highestBid)
              : "No bids yet"}
          </b>
        </div>
        {highestBidderEmail && (
          <div style={{ marginTop: 4, color: "#374151" }}>
            Bidder Email: <b>{highestBidderEmail}</b>
          </div>
        )}
      </div>

      <BidPanel
        highestBid={highestBid}
        minNextBid={minNextBid}
        onPlaceBid={placeBid}
        disabled={!isActive || isEnded}
      />

      {(isEnded || auction.status === "awaiting_seller") && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button onClick={sellerAccept} style={btn}>
            Accept
          </button>
          <button onClick={sellerReject} style={btnDanger}>
            Reject
          </button>
          <button onClick={sellerCounter} style={btnSecondary}>
            Counter-Offer
          </button>
        </div>
      )}
    </div>
  )
}

const btn = {
  height: 40,
  borderRadius: 10,
  border: "none",
  background: "#111827",
  color: "#fff",
  padding: "0 12px",
  cursor: "pointer",
  fontWeight: 600,
}
const btnSecondary = { ...btn, background: "#374151" }
const btnDanger = { ...btn, background: "#b91c1c" }
