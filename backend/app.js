require("dotenv").config();
const express = require("express");
const cors = require("cors");

const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { ZodError, formatZodError } = require("./validation/serviceSchemas");

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:4173"];

if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser/CLI tools with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  })
);

app.use(express.json());

// Simple logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Service routes
app.use("/api/services", serviceRoutes);

// Admin routes - protected by middleware inside adminRoutes
app.use("/api/admin", adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: formatZodError(err),
    });
  }

  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
