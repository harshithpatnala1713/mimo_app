require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const authRoutes     = require("./routes/auth");
const orderRoutes    = require("./routes/orders");
const optimizeRoutes  = require("./routes/optimize");
const inventoryRoutes = require("./routes/inventory");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────
// Allow the Vite dev server. Adjust origin for production.
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/optimize",   optimizeRoutes);
app.use("/api/inventory", inventoryRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀  Backend running on http://localhost:${PORT}`)
);
