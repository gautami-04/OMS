const express = require("express");
const {
  getTransformers,
} = require("../controllers/transformerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTransformers);

module.exports = router;