import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
  transports: ['websocket'],
  autoConnect: false
})

// Helpful wrapper to ensure a single connect call
export function ensureConnected() {
  if (!socket.connected) socket.connect()
  return socket
}

export default socket
