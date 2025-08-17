import db from '../models/index.js';

export async function notify(userId, type, message, io, room = null) {
  const n = await db.Notification.create({ user_id: userId, type, message });
  if (io) {
    if (room) {
      io.to(room).emit('notification', n.toJSON());
    } else {
      io.emit('notification', n.toJSON());
    }
  }
  return n;
}
