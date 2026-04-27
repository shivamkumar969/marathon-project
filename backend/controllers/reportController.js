const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");

// GET EVENT REPORT DATA
const getEventReport = async (req, res) => {
  try {
    const { startDate, endDate, type, search, venue, gender, regStatus } = req.query;
    let query = {};

    // Basic filters
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: "i" };
    if (venue) query.venue = venue;
    if (gender) query.genderParticipation = gender;

    const events = await Event.find(query)
      .populate("coordinators", "name email")
      .sort({ createdAt: -1 });
    
    const now = new Date();

    let reportData = await Promise.all(events.map(async (event) => {
      const regCount = await Registration.countDocuments({ eventId: event._id });
      
      // Determine registration status
      let currentRegStatus = "Open";
      if (event.registrationCloseDate && new Date(event.registrationCloseDate) < now) {
        currentRegStatus = "Closed";
      } else if (event.registrationOpenDate && new Date(event.registrationOpenDate) > now) {
        currentRegStatus = "Upcoming";
      }

      return {
        title: event.title,
        type: event.type,
        date: event.date || "N/A",
        venue: event.venue || "N/A",
        gender: event.genderParticipation || "any",
        regStatus: currentRegStatus,
        coordinators: event.coordinators && event.coordinators.length > 0 
          ? event.coordinators.map(c => c.name).join(", ") 
          : "Unassigned",
        registrations: regCount,
        fee: event.fee || 0,
        totalRevenue: (event.fee || 0) * regCount,
        winners: event.maxWinners || 0
      };
    }));

    // Manual filtering for dynamic/calculated fields
    if (regStatus) {
      reportData = reportData.filter(item => item.regStatus === regStatus);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      reportData = reportData.filter(item => {
        const itemDate = new Date(item.date);
        return !isNaN(itemDate) && itemDate >= start && itemDate <= end;
      });
    }

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET UNIQUE FILTER OPTIONS
const getFilterOptions = async (req, res) => {
  try {
    const venues = await Event.distinct("venue");
    const events = await Event.find({}, "title").sort({ title: 1 });
    res.json({ venues, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PARTICIPANT REPORT DATA
const getParticipantReport = async (req, res) => {
  try {
    const { institute, startDate, endDate, search, eventId } = req.query;
    let query = { role: "participant" };

    if (institute) query.instituteName = institute;
    if (search) query.name = { $regex: search, $options: "i" };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // If filtering by specific event, find participants registered for that event
    if (eventId) {
      const registrations = await Registration.find({ eventId }).distinct("userId");
      query._id = { $in: registrations };
    }

    const participants = await User.find(query).sort({ createdAt: -1 });
    
    const reportData = await Promise.all(participants.map(async (user) => {
      // Find all event titles and payment status for this user
      const registrations = await Registration.find({ userId: user._id }).populate("eventId", "title");
      const eventInfo = registrations
        .filter(reg => reg.eventId) // Ensure event exists
        .map(reg => `${reg.eventId.title} (${reg.paymentStatus.toUpperCase()})`)
        .join(", ");

      const totalPaid = registrations.reduce((acc, reg) => acc + (reg.amountPaid || 0), 0);

      return {
        name: user.name,
        email: user.email,
        mobile: user.mobileNo,
        gender: user.gender,
        institute: user.instituteName,
        course: user.course,
        totalEvents: registrations.length,
        participationDetails: eventInfo || "No registrations",
        totalPaid: totalPaid,
        joinedAt: new Date(user.createdAt).toLocaleDateString()
      };
    }));

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PAYMENT REPORT DATA
const getPaymentReport = async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.query;
    let query = {};

    if (eventId) query.eventId = eventId;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const registrations = await Registration.find(query)
      .populate("userId", "name email mobileNo")
      .populate("eventId", "title fee")
      .sort({ createdAt: -1 });
    
    const reportData = registrations.map(reg => ({
      participant: reg.userId ? reg.userId.name : "Unknown",
      email: reg.userId ? reg.userId.email : "N/A",
      event: reg.eventId ? reg.eventId.title : "Deleted Event",
      status: reg.paymentStatus,
      amount: reg.amountPaid || 0,
      baseFee: reg.eventId ? reg.eventId.fee : 0,
      date: new Date(reg.createdAt).toLocaleDateString()
    }));

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEventReport,
  getParticipantReport,
  getFilterOptions,
  getPaymentReport
};
