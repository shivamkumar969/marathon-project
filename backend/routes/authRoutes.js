const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCoordinators,
  forgotPassword
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/coordinators", getCoordinators);
router.post("/forgot-password", forgotPassword);

module.exports = router;