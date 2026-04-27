const Winner = require("../models/Winner");
const Registration = require("../models/Registration");

// Mark Winner
const markWinner = async (req, res) => {
  try {
    const { userId, eventId, position } = req.body;

    const event = await require("../models/Event").findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const maxWinners = event.maxWinners || 3;
    const allowedPositions = [];
    for (let i = 1; i <= maxWinners; i++) {
      let suffix = "th";
      if (i === 1) suffix = "st";
      else if (i === 2) suffix = "nd";
      else if (i === 3) suffix = "rd";
      allowedPositions.push(`${i}${suffix}`);
    }

    if (!allowedPositions.includes(position)) {
      return res.status(400).json({ message: `Invalid position. For this event, allowed positions are: ${allowedPositions.join(", ")}` });
    }

    // Check if the user is already a winner in this event
    const alreadyWinnerUser = await Winner.findOne({ userId, eventId });
    if (alreadyWinnerUser) {
      return res.status(400).json({ message: "This participant is already a winner in this event." });
    }

    // Check if the position is already taken in this event
    const positionTaken = await Winner.findOne({ eventId, position });
    if (positionTaken) {
      return res.status(400).json({ message: `The ${position} place has already been awarded for this event.` });
    }

    const winner = await Winner.create({
      userId,
      eventId,
      position
    });

    // Enhance: Also mark the Registration document as a winner
    await Registration.findOneAndUpdate(
      { userId, eventId },
      { isWinner: true }
    );

    res.status(201).json(winner);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Winners
const getWinners = async (req, res) => {
  try {
    const data = await Winner.find()
      .populate("userId")
      .populate("eventId");

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  markWinner,
  getWinners
};