const express = require("express");
const { getFeeders } = require("../controllers/feederController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getFeeders);

module.exports = router;
