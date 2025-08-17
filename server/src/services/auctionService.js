import db from '../models/index.js';
import { redis, highestBidKey } from './redisClient.js';
import { notify } from './notificationService.js';
import { sendEmail } from './emailService.js';
import { generateInvoice } from './invoiceService.js';
import fs from 'fs';   

// ------------------------- CREATE AUCTION -------------------------
export async function createAuction({
  item_name,
  description,
  starting_price,
  bid_increment,
  go_live_at,
  end_at,
  durationMinutes = 60,   // ✅ optional fallback
  seller_id
}) {
  const start = new Date(go_live_at);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid go_live_at");
  }

  let end;
  if (end_at) {
    end = new Date(end_at);
  } else {
    end = new Date(start.getTime() + durationMinutes * 60000);
  }

  if (Number.isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid end_at: must be after go_live_at");
  }

  const auction = await db.Auction.create({
    item_name,
    description,
    starting_price,
    bid_increment,
    go_live_at: start,
    end_at: end,
    seller_id,
    status: 'scheduled'
  });

  return auction;
}


// ------------------------- LIST AUCTIONS -------------------------
export async function listAuctions() {
  return db.Auction.findAll({ order: [['id', 'DESC']] });
}

// ------------------------- GET AUCTION -------------------------
export async function getAuctionById(id, options = {}) {
  const auction = await db.Auction.findByPk(id, {
    include: [
      {
        association: 'seller',
        attributes: ['id', 'username', 'email']
      },
      {
        association: 'bids',
        include: [
          {
            association: 'bidder',
            attributes: ['id', 'username', 'email']
          }
        ]
      }
    ],
    ...options
  });

  if (!auction) return null;

  // dynamically compute status without overwriting DB value
  try {
    const now = new Date();
    const goLiveAt = auction.go_live_at ? new Date(auction.go_live_at) : null;
    const endAt = auction.end_at ? new Date(auction.end_at) : null;

    if (goLiveAt && endAt) {
      if (now < goLiveAt) {
        auction.setDataValue('status', 'scheduled');
      } else if (now >= goLiveAt && now < endAt) {
        auction.setDataValue('status', 'live');
      } else if (now >= endAt) {
        auction.setDataValue('status', 'ended');
      }
    }
  } catch (e) {
    console.error("Error computing auction status:", e.message, e.stack);
  }

  return auction;
}



// ------------------------- CACHE HELPERS -------------------------
export async function setHighestBidCache(auction_id, payload) {
  await redis.set(highestBidKey(auction_id), JSON.stringify(payload));
}

export async function getHighestBidCache(auction_id) {
  const v = await redis.get(highestBidKey(auction_id));
  return v ? JSON.parse(v) : null;
}

// ------------------------- PLACE BID -------------------------
export async function placeBidCore(auction_id, user_id, amount, io = null) {
  const auction = await db.Auction.findByPk(auction_id);
  if (!auction) throw new Error('Auction not found');

  const now = new Date();
  if (now < auction.go_live_at || now > auction.end_at || auction.status === 'closed') {
    throw new Error('Auction not active');
  }

  const highest = await getHighestBidCache(auction_id);
  const min = highest
    ? Number(highest.amount) + Number(auction.bid_increment)
    : Number(auction.starting_price);

  if (Number(amount) < min) {
    throw new Error(`Bid must be >= ${min}`);
  }

  const bid = await db.Bid.create({
    auction_id,
    user_id,
    amount
  });

  await setHighestBidCache(auction_id, {
    amount: Number(amount),
    user_id,
    bid_id: bid.id
  });

  // ✅ emit the correct event name for frontend
  if (io) {
    io.to(`auction:${auction_id}`).emit('bid:placed', {
      auctionId: auction_id,
      amount: Number(amount),
      userId: user_id
    });
  }

  // notify seller and previous highest bidder
  await notify(
    auction.seller_id,
    'new_bid',
    `New bid $${amount} on ${auction.item_name}`,
    io,
    `auction:${auction_id}`
  );

  if (highest && highest.user_id && highest.user_id !== user_id) {
    await notify(
      highest.user_id,
      'outbid',
      `You were outbid on ${auction.item_name}`,
      io,
      `auction:${auction_id}`
    );
  }

  return bid;
}



// ------------------------- END AUCTION -------------------------
export async function endAuctionFlow(auction_id, io = null) {
  const auction = await db.Auction.findByPk(auction_id);
  if (!auction) return;
  if (auction.status === 'closed') return;

  const highest = await getHighestBidCache(auction_id);
  await auction.update({
    status: 'ended',
    winner_bid_id: highest ? highest.bid_id : null
  });

  if (io) {
    io.to(`auction:${auction_id}`).emit('auction_ended', { auction_id, highest });
  }

  if (highest) {
    await notify(
      auction.seller_id,
      'auction_ended',
      `Auction ended. Highest bid $${highest.amount}`,
      io,
      `auction:${auction_id}`
    );
    await notify(
      highest.user_id,
      'auction_ended',
      `You are highest bidder at $${highest.amount}`,
      io,
      `auction:${auction_id}`
    );
  }
}

// ------------------------- MAKE DECISION -------------------------
export async function makeDecision(auctionId, sellerId, action, price = null, io = null) {
  const auction = await db.Auction.findByPk(auctionId);
  if (!auction) throw new Error('Auction not found');
  if (auction.seller_id !== sellerId) throw new Error('Not your auction');

  const highest = await getHighestBidCache(auctionId);
  if (!highest) throw new Error('No bids to act on');

  const buyer = await db.User.findByPk(highest.user_id);
  const seller = await db.User.findByPk(sellerId);

  if (action === 'accept') {
    await auction.update({ status: 'closed' });

    const invoicePath = await generateInvoice({
      auction,
      buyer,
      seller,
      amount: highest.amount
    });

    await sendEmail({
      to: [buyer.email, seller.email],
      subject: 'Auction Won',
      html: `<p>Winning bid: $${highest.amount}</p>`,
      attachments: [invoicePath] // ✅ just pass the file path
    });

    if (io) {
      io.to(`auction:${auctionId}`).emit('auction_closed', {
        auctionId,
        result: 'accepted',
        amount: highest.amount
      });
    }
    return { status: 'accepted', amount: highest.amount };
  }

  if (action === 'reject') {
    await auction.update({ status: 'closed', winner_bid_id: null });

    if (io) {
      io.to(`auction:${auctionId}`).emit('auction_closed', {
        auctionId,
        result: 'rejected'
      });
    }
    return { status: 'rejected' };
  }

  if (action === 'counter') {
    if (!price) throw new Error('Counter price required');

    await db.CounterOffer.create({
      auction_id: auctionId,
      seller_id: sellerId,
      highest_bidder_id: buyer.id,
      proposed_price: price
    });

    if (io) {
      io.to(`auction:${auctionId}`).emit('counter_offer', { auctionId, price });
    }
    return { status: 'counter', price };
  }

  throw new Error('Unknown action');
}