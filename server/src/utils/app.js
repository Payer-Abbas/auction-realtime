// src/utils/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import router from "../routes/index.js";
import db from "../models/index.js";
import { startScheduler } from "../services/scheduler.js";

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(morgan("dev"));
app.use(express.json());

// ✅ Apply helmet with custom CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        fontSrc: ["'self'", "data:","https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
      },
    },
  })
);

// API routes
app.use("/api", router);

// ✅ Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientBuildPath = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientBuildPath));

  // Catch-all route for React Router
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Initialize DB
db.sequelize
  .authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch((err) => console.error("❌ DB connect error", err));

// Start cron/scheduler
startScheduler();

export default app;
