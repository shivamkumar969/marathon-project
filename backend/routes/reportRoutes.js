const express = require("express");
const router = express.Router();
const { getEventReport, getParticipantReport, getFilterOptions, getPaymentReport } = require("../controllers/reportController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/events", protect, admin, getEventReport);
router.get("/participants", protect, admin, getParticipantReport);
router.get("/options", protect, admin, getFilterOptions);
router.get("/payments", protect, admin, getPaymentReport);

module.exports = router;
