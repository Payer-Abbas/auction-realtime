import Redis from 'ioredis';
import 'dotenv/config';

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const highestBidKey = (auctionId) => `auction:${auctionId}:highestBid`;
