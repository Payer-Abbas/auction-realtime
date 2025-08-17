# ---------- STAGE 1: Build frontend ----------
FROM node:18-alpine AS build-frontend
WORKDIR /app

# Copy frontend code
COPY client ./client

# Install and build
WORKDIR /app/client
RUN npm install && npm run build


# ---------- STAGE 2: Backend + Final image ----------
FROM node:18-alpine AS final
WORKDIR /app

# Copy backend code
COPY server ./server

# Copy built frontend into backend's client/dist
COPY --from=build-frontend /app/client/dist ./client/dist

# Install backend deps
WORKDIR /app/server
RUN npm install --production

# Expose backend port
EXPOSE 4000

# Start server
CMD ["node", "src/server.js"]
