const express = require("express");
const {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const router = express.Router();

// /api/services/
router.get("/", listServices);
router.get("/:id", getServiceById);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
