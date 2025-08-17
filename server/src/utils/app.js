import express from "express";
import cors from "cors";
import morgan from "morgan";
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

// API routes
app.use("/api", router);

// ✅ Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientBuildPath = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientBuildPath));

  // For any unknown route, send back index.html (React handles routing)
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
