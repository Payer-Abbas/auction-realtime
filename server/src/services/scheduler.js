import cron from 'node-cron';
import db from '../models/index.js';
import { endAuctionFlow } from './auctionService.js';
import io from '../sockets/index.js';

export function startScheduler() {
  // Every minute: end auctions past end_at that are not closed
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const items = await db.Auction.findAll({ where: { status: ['live','scheduled'] } });
    for (const a of items) {
      if (now >= a.go_live_at && a.status === 'scheduled') {
        await a.update({ status: 'live' });
      }
      if (now >= a.end_at && a.status !== 'closed') {
        await endAuctionFlow(a.id, io());
      }
    }
  });
}
