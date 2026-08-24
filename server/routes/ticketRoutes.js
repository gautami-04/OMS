const express = require("express");
const {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTickets);
router.post("/", protect, createTicket);
router.put("/:id", protect, updateTicket);
router.delete("/:id", protect, deleteTicket);

module.exports = router;