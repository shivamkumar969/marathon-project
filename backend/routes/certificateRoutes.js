const express = require("express");
const router = express.Router();

const {
  participationCertificate,
  winnerCertificate
} = require(
  "../controllers/certificateController"
);

router.get(
  "/participation/:userId/:eventId",
  participationCertificate
);

router.get(
  "/winner/:userId/:eventId",
  winnerCertificate
);

module.exports = router;