import { placeBidCore } from './auctionService.js';
import io from '../sockets/index.js';

export async function placeBidHttp(auctionId, bidderId, amount, email) {
  return placeBidCore(auctionId, bidderId, amount, email, io);
}
