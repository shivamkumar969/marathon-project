const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const upload = require("../middleware/uploadMiddleware");

// Create Event
router.post("/", upload.single("eventBanner"), createEvent);

// Get All Events
router.get("/", getEvents);

// Get Single Event
router.get("/:id", getSingleEvent);

// Update Event
router.put("/:id", upload.single("eventBanner"), updateEvent);

// Delete Event
router.delete("/:id", deleteEvent);

module.exports = router;