const express = require("express");
const { getSaidi, getSaifi } = require("../controllers/reliabilityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/saidi", protect, getSaidi);
router.get("/saifi", protect, getSaifi);

module.exports = router;