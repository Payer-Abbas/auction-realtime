# Real-Time Auction Backend

Stack: **Node.js + Express + Sequelize (Supabase/Postgres) + Upstash Redis + Socket.IO + SendGrid**

## Quick Start

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, REDIS_URL, SENDGRID_API_KEY, etc.).
2. Install dependencies:

```bash
npm install
```

3. Run migrations:

```bash
npx sequelize-cli db:migrate
```

4. Start the server (HTTP + WebSocket on the same port):

```bash
npm run dev
```

## API

- `POST /api/auctions` create auction
- `GET  /api/auctions` list
- `GET  /api/auctions/:id` single
- `POST /api/auctions/:id/decision` body: `{ action: 'accept'|'reject'|'counter', price? }`
- `POST /api/auctions/:auctionId/bids` place bid (HTTP alternative to socket)

### Socket.IO Events

- Client -> Server: `join_auction` `{ auctionId }`
- Client -> Server: `place_bid` `{ auctionId, bidderId, amount }`
- Server -> Client: `bid_update` `{ auctionId, amount, bidderId }`
- Server -> Client: `auction_ended` `{ auctionId, highest }`
- Server -> Client: `auction_closed` `{ auctionId, result, amount? }`
- Server -> Client: `notification` notification object

## Notes

- Highest bid is cached in Redis at key `auction:{id}:highestBid`.
- A simple cron runs every minute to transition auctions to `live` and then call end-of-auction flow.
- Emails use SendGrid. If `SENDGRID_API_KEY` is missing, email sending is skipped gracefully.
- PDF invoices are generated into `src/invoices/` and attached to email.
- Auth is mocked by passing `sellerId`/`bidderId` from the frontend; replace with your JWT auth later.
