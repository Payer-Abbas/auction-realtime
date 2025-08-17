import { placeBidCore } from '../services/auctionService.js';
import io from '../sockets/index.js';

export const place = async (req, res) => {
  try {
    const { user_id, amount, email } = req.body; // capture email too

    if (!user_id || !amount || !email) {
      return res.status(400).json({ error: "user_id, amount, and email are required" });
    }

    const result = await placeBidCore(
      req.params.auctionId,
      user_id,
      Number(amount),
      io()   // ✅ pass actual Socket.IO instance
    );

    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Bid placement failed:", err);
    res.status(400).json({ error: err.message });
  }
};
