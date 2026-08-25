const express = require("express");
const { login, logout, getUsers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/users", protect, getUsers);

module.exports = router;