const express = require("express");
const router = express.Router();

const {
  suggestTeammates,
  updateUserSkills
} = require("../controllers/matchmakerController");

router.get("/suggest/:userId/:eventId", suggestTeammates);
router.put("/skills/:userId", updateUserSkills);

module.exports = router;
