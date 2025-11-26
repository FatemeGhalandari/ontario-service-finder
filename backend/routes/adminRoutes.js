const express = require("express");
const { getServiceStats } = require("../controllers/serviceController");
const {
  authMiddleware,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Everything under /api/admin must be authenticated admin
router.use(authMiddleware, requireAdmin);

router.get("/stats", getServiceStats);

module.exports = router;
