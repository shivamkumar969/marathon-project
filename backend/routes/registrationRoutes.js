const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  allRegistrations,
  registerEvent,
  myRegistrations,
  withdrawRegistration,
  toggleAttendance
} = require("../controllers/registrationController");

/* -------------------- GET ALL REGISTRATIONS -------------------- */
router.get("/", allRegistrations);

/* -------------------- REGISTER FOR EVENT -------------------- */
router.post("/", registerEvent);

/* -------------------- GET USER REGISTRATIONS -------------------- */
router.get("/user/:userId", myRegistrations);

/* -------------------- WITHDRAW REGISTRATION -------------------- */
router.delete("/:id", withdrawRegistration);

/* -------------------- TOGGLE ATTENDANCE -------------------- */
router.put("/:id/attendance", protect, toggleAttendance);

module.exports = router;