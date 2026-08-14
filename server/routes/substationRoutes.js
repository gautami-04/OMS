const express = require("express");
const { getSubstations } = require("../controllers/substationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getSubstations);

module.exports = router;