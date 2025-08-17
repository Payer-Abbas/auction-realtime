import { Router } from 'express';
import * as auctions from '../controllers/auctionsController.js';
import * as bids from '../controllers/bidsController.js';
import * as notifications from '../controllers/notificationsController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

// Auctions
router.post('/auctions', auctions.create);
router.get('/auctions', auctions.list);
router.get('/auctions/:id', auctions.getById);
router.post('/auctions/:id/decision', auctions.decision);

// Bids
router.post('/auctions/:auctionId/bids', bids.place);

// Notifications
router.get('/users/:userId/notifications', notifications.listForUser);

export default router;
