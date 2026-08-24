const express = require("express");
const {
  getSmartMeters,
  getSmartMeterById,
  createSmartMeter,
  updateSmartMeter,
  deleteSmartMeter,
} = require("../controllers/smartMeterController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getSmartMeters);
router.get("/:id", protect, getSmartMeterById);
router.post("/", protect, createSmartMeter);
router.put("/:id", protect, updateSmartMeter);
router.delete("/:id", protect, deleteSmartMeter);

module.exports = router;
