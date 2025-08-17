import db from '../models/index.js';

export const listForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const items = await db.Notification.findAll({ where: { user_id: userId }, order: [['created_at','DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
