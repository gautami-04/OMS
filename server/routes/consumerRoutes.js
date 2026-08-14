const express = require("express");
const { getConsumers } = require("../controllers/consumerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getConsumers);

module.exports = router;
