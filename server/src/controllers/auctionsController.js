// controllers/auctionsController.js
import { createAuction, listAuctions, getAuctionById, makeDecision } from '../services/auctionService.js';

// helper: compute status dynamically
function computeStatus(auction) {
  const now = new Date();
  const goLiveAt = auction.go_live_at ? new Date(auction.go_live_at) : null;
  const endAt = auction.end_at ? new Date(auction.end_at) : null;

  if (goLiveAt && endAt) {
    if (now < goLiveAt) {
      auction.status = 'scheduled';
    } else if (now >= goLiveAt && now < endAt) {
      auction.status = 'live';
    } else {
      auction.status = 'ended';
    }
  }
  return auction;
}

export const create = async (req, res) => {
  try {
    console.log("📥 Received auction data:", req.body);
    const auction = await createAuction({ ...req.body });
    // compute status immediately for consistency
    res.status(201).json(computeStatus(auction));
  } catch (err) {
    console.error("Auction create error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const list = async (req, res) => {
  try {
    const auctions = await listAuctions();
    // ensure every auction has up-to-date status
    const enriched = auctions.map(a => computeStatus(a));
    res.json(enriched);
  } catch (err) {
    console.error("❌ list auctions error:", err);
    res.status(500).json({ error: 'Failed to list auctions' });
  }
};

export const getById = async (req, res) => {
  try {
    const a = await getAuctionById(req.params.id, {
      include: [
        {
          association: 'seller',
          attributes: ['id', 'username', 'email']  // ✅ use username not name
        },
        {
          association: 'bids',
          include: [
            {
              association: 'bidder',
              attributes: ['id', 'username', 'email'] // ✅ same here
            }
          ]
        }
      ]
    });

    if (!a) return res.status(404).json({ error: 'Not found' });

    // compute status before sending
    res.json(computeStatus(a));
  } catch (err) {
    console.error("❌ getAuctionById error:", err);
    res.status(500).json({ error: 'Failed to fetch auction', details: err.message });
  }
};

export const decision = async (req, res) => {
  try {
    const { action, price } = req.body;
    const seller_id = req.body.seller_id; // mock auth

    // 🔑 Pass email notification responsibility to service
    const result = await makeDecision(req.params.id, seller_id, action, price);

    res.json(result);
  } catch (err) {
    console.error("❌ decision error:", err);
    res.status(400).json({ error: err.message });
  }
};

