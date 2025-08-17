# Realtime Auction App (React + Node + Socket.IO + Supabase + Redis)

This project provides a minimal but production-ready scaffold for a realtime auction platform.

## Tech
- Frontend: React (Vite), Socket.IO client
- Backend: Node.js, Express, Socket.IO
- Database: Supabase Postgres (via Sequelize)
- Cache/RT checks: Redis
- Email: SendGrid (stubbed with env flags)
- SMS: Twilio (optional; stubbed with env flags)

## Features Implemented
1. **Auction Creation**
   - Item name, description, starting price, bid increment, go-live datetime, duration
   - Stored in Supabase with Sequelize

2. **Realtime Auction Room**
   - Live current highest bid
   - Countdown timer
   - Live updates on new bids & auction end
   - In-app toasts for outbid/new bid

3. **Bid Logic**
   - Only during active window
   - Must be >= current + bidIncrement
   - Highest bid cached in Redis for speed
   - Valid bids persisted to Supabase and broadcast via sockets

4. **Auction End + Seller Decision & Counter-Offer**
   - At end, seller sees Accept / Reject / Counter-Offer
   - Acceptance notifies highest bidder + (optional) email/SMS
   - Counter-offer flow with accept/reject by bidder
   - On acceptance, confirmation notifications + (optional) email/SMS
   - On rejection, auction closes with no winner

---

## Local Setup

### Prereqs
- Node 18+
- Redis running locally or hosted (provide `REDIS_URL`)
- Supabase (Postgres) connection string in `DATABASE_URL` (see `.env.example` in `server/`)
- Optional: SendGrid API Key, Twilio creds

### 1) Install deps
```bash
cd server && npm install
cd ../client && npm install
```

### 2) Configure env
Copy `.env.example` to `.env` in both `server/` and `client/`, fill values.

### 3) Run in dev
In two terminals:
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```
Frontend will start on `http://localhost:5173`, backend on `http://localhost:4000` by default.

### Database
- Sequelize models auto-sync on server boot (`SEQUELIZE_SYNC=true`).
- You can later use migrations if you prefer.

### Notes
- This is a solid starting point. For production, consider persistent job runners for auction-end handling and a message queue.
