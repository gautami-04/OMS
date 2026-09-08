const express = require("express");

const {
  getConsumerImpact,
} = require("../controllers/consumerImpactController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:outageId", protect, getConsumerImpact);

module.exports = router;