require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serviceRoutes = require("./routes/serviceRoutes");
const { ZodError, formatZodError } = require("./validation/serviceSchemas");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
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

// Service routes
app.use("/api/services", serviceRoutes);

// Global error handler (must be after routes)
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

// Listen
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
