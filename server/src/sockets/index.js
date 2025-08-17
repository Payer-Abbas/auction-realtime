import { Server } from 'socket.io';
import http from 'http';
import app from '../utils/app.js';
import { placeBidCore } from '../services/auctionService.js';

let _io;

export default function io() {
  if (_io) return _io;
  const server = http.createServer(app);
  _io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  _io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join_auction', ({ auctionId }) => {
      socket.join(`auction:${auctionId}`);
      console.log(`✅ Socket ${socket.id} joined room auction:${auctionId}`);
    });

    socket.on('leave_auction', ({ auctionId }) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`🚪 Socket ${socket.id} left room auction:${auctionId}`);
    });

    socket.on('place_bid', async ({ auctionId, bidderId, amount }, cb) => {
      try {
        console.log(`📨 Bid attempt: auction ${auctionId}, user ${bidderId}, amount ${amount}`);
        const bid = await placeBidCore(auctionId, bidderId, amount, _io);
        console.log(`✅ Bid placed successfully:`, bid);
        cb && cb({ ok: true, bid });
      } catch (e) {
        console.error(`❌ Bid failed: ${e.message}`);
        cb && cb({ ok: false, error: e.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  const port = process.env.PORT || 4000;
  server.listen(port, () => {
    console.log('Socket/HTTP server listening on', port);
  });

  return _io;
}
