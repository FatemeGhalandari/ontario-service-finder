const express = require("express");
const {
  listServices,
  exportServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const {
  authMiddleware,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// /api/services/export
router.get("/export", exportServices);

// /api/services/
router.get("/", listServices);
router.get("/:id", getServiceById);

// protected: admin only
router.post("/", authMiddleware, requireAdmin, createService);
router.put("/:id", authMiddleware, requireAdmin, updateService);
router.delete("/:id", authMiddleware, requireAdmin, deleteService);

module.exports = router;
