const express = require("express");
const router = express.Router();

const {
  markWinner,
  getWinners
} = require("../controllers/winnerController");

router.post("/", markWinner);

router.get("/", getWinners);

module.exports = router;