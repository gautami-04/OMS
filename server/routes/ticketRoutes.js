const express = require("express");
const { createTicket ,updateTicket} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTicket);
router.put("/:id", protect, updateTicket);

module.exports = router;