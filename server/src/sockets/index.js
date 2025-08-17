// src/sockets/index.js
import { Server } from "socket.io";
import http from "http";
import app from "../utils/app.js";
import { placeBidCore } from "../services/auctionService.js";

let _io;

export default function initSocketServer() {
  if (_io) return _io;

  const server = http.createServer(app);
  const PORT = process.env.PORT || 4000;

  _io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  _io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("join_auction", ({ auctionId }) => {
      socket.join(`auction:${auctionId}`);
      console.log(`✅ Socket ${socket.id} joined room auction:${auctionId}`);
    });

    socket.on("leave_auction", ({ auctionId }) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`🚪 Socket ${socket.id} left room auction:${auctionId}`);
    });

    socket.on("place_bid", async ({ auctionId, bidderId, amount }, cb) => {
      try {
        console.log(`📨 Bid attempt: auction ${auctionId}, user ${bidderId}, amount ${amount}`);
        const bid = await placeBidCore(auctionId, bidderId, amount, _io);
        cb && cb({ ok: true, bid });
      } catch (e) {
        console.error(`❌ Bid failed: ${e.message}`);
        cb && cb({ ok: false, error: e.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 HTTP + Socket.IO server listening on ${PORT}`);
  });

  return _io;
}
