const Event = require("../models/Event");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

const { sendAllCertificates } = require("./certificateController");
const { sendCoordinatorAssignmentEmail } = require("../utils/sendEmail");

// Create Event
const createEvent = async (req, res) => {
  try {
    const { title, date } = req.body;
    let eventData = { ...req.body };

    // Parse JSON strings and Booleans from FormData
    if (typeof eventData.coordinators === 'string') {
      try {
        eventData.coordinators = JSON.parse(eventData.coordinators);
      } catch (e) {
        console.error("Error parsing coordinators:", e);
      }
    }
    if (typeof eventData.allowedCourses === 'string') {
      try {
        eventData.allowedCourses = JSON.parse(eventData.allowedCourses);
      } catch (e) {
        console.error("Error parsing allowedCourses:", e);
      }
    }

    // Convert string booleans from FormData
    if (eventData.isFinalized === "true") eventData.isFinalized = true;
    if (eventData.isFinalized === "false") eventData.isFinalized = false;
    if (eventData.resultsDeclared === "true") eventData.resultsDeclared = true;
    if (eventData.resultsDeclared === "false") eventData.resultsDeclared = false;

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, "banners");
        eventData.eventBanner = imageUrl;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload banner to cloud." });
      }
    }

    const existingEvent = await Event.findOne({ title, date });
    if (existingEvent) {
      return res.status(400).json({ message: "An event with the same title and date already exists." });
    }

    const event = await Event.create(eventData);
    
    // Send email to all assigned coordinators
    if (event.coordinators && event.coordinators.length > 0) {
      const coords = await User.find({ _id: { $in: event.coordinators } });
      coords.forEach(coord => {
        const { sendCoordinatorAssignmentEmail } = require("../utils/sendEmail");
        sendCoordinatorAssignmentEmail(coord.email, coord.name, event.title, event.date);
      });
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    
    // Get total registrations for each event
    const Registration = require("../models/Registration");
    const eventIds = events.map(e => e._id);
    
    const counts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const enrichedEvents = events.map(e => ({
      ...e,
      totalRegistrations: countMap[e._id.toString()] || 0
    }));

    res.json(enrichedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Event
const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { userId, ...updateData } = req.body;
    
    // Parse JSON strings and Booleans from FormData
    if (typeof updateData.coordinators === 'string') {
      try {
        updateData.coordinators = JSON.parse(updateData.coordinators);
      } catch (e) {
        console.error("Error parsing coordinators:", e);
      }
    }
    if (typeof updateData.allowedCourses === 'string') {
      try {
        updateData.allowedCourses = JSON.parse(updateData.allowedCourses);
      } catch (e) {
        console.error("Error parsing allowedCourses:", e);
      }
    }

    // Convert string booleans from FormData
    if (updateData.isFinalized === "true") updateData.isFinalized = true;
    if (updateData.isFinalized === "false") updateData.isFinalized = false;
    if (updateData.resultsDeclared === "true") updateData.resultsDeclared = true;
    if (updateData.resultsDeclared === "false") updateData.resultsDeclared = false;

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, "banners");
        updateData.eventBanner = imageUrl;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload banner to cloud." });
      }
    }
    
    if (userId) {
       const user = await User.findById(userId);
       if (user && user.role === "coordinator") {
          if (!event.coordinators.includes(userId)) {
             return res.status(403).json({ message: "You are not assigned to manage this event." });
          }
       }
    }

    // Check if results are being declared for the first time
    const isDeclaringResults = !event.resultsDeclared && updateData.resultsDeclared === true;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Identify newly added and removed coordinators
    if (updateData.coordinators) {
      const { sendCoordinatorAssignmentEmail, sendCoordinatorDeassignmentEmail } = require("../utils/sendEmail");
      const oldCoordinators = event.coordinators || [];
      const newCoordinators = updateData.coordinators;
      
      const newlyAddedIds = newCoordinators.filter(id => !oldCoordinators.includes(id));
      const newlyRemovedIds = oldCoordinators.filter(id => !newCoordinators.includes(id));

      if (newlyAddedIds.length > 0) {
        const coords = await User.find({ _id: { $in: newlyAddedIds } });
        coords.forEach(coord => {
          sendCoordinatorAssignmentEmail(coord.email, coord.name, updatedEvent.title, updatedEvent.date);
        });
      }

      if (newlyRemovedIds.length > 0) {
        const coords = await User.find({ _id: { $in: newlyRemovedIds } });
        coords.forEach(coord => {
          sendCoordinatorDeassignmentEmail(coord.email, coord.name, updatedEvent.title);
        });
      }
    }

    // If results were just published, fire off the certificate dispatch asynchronously
    if (isDeclaringResults) {
      sendAllCertificates(updatedEvent._id);
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent
};