// src/server.js
import initSocketServer from "./sockets/index.js";

// Boot the server (HTTP + Socket.IO are started inside sockets/index.js)
initSocketServer();
