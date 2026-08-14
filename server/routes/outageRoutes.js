const express = require("express");
const { getOutages,createOutage,updateOutage,deleteOutage } = require("../controllers/outageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getOutages);
router.post("/", protect, createOutage);
router.put("/:id", protect, updateOutage);
router.delete("/:id", protect, deleteOutage);

module.exports = router;