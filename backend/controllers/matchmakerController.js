const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Winner = require("../models/Winner");

const suggestTeammates = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!user || !event) {
      return res.status(404).json({ message: "User or Event not found" });
    }

    // Get all registered user IDs for this event
    const registrations = await Registration.find({ eventId });
    const registeredUserIds = new Set();
    
    registrations.forEach(reg => {
      registeredUserIds.add(reg.userId.toString());
      if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
        reg.teamMembers.forEach(memberId => registeredUserIds.add(memberId.toString()));
      }
    });

    // Find all users who are NOT the current user, NOT already registered for this event, and are "participants"
    const candidates = await User.find({
      _id: { $ne: userId, $nin: Array.from(registeredUserIds) },
      role: "participant"
    });

    // We will build a scored list
    let scoredCandidates = [];

    // Helper to calculate Jaccard similarity between two arrays of strings
    const calculateSkillOverlap = (skillsA, skillsB) => {
      if (!skillsA || !skillsA.length || !skillsB || !skillsB.length) return 0;
      const setA = new Set(skillsA.map(s => s.toLowerCase().trim()));
      const setB = new Set(skillsB.map(s => s.toLowerCase().trim()));
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      return intersection.size / union.size;
    };

    // Pre-calculate win history for all candidates to avoid N queries
    // We can just query Winner for all candidate IDs
    const candidateIds = candidates.map(c => c._id);
    const winners = await Winner.find({ userId: { $in: candidateIds } });
    
    const winCounts = {};
    winners.forEach(w => {
      const id = w.userId.toString();
      winCounts[id] = (winCounts[id] || 0) + 1;
    });

    for (let candidate of candidates) {
      // 1. Hard Filter: Gender Check for the Event
      // If the event has strict gender rules, ensure candidate is eligible.
      // E.g. If event is "Male Only", drop female/other.
      if (event.genderParticipation && event.genderParticipation !== "any") {
        if (candidate.gender !== event.genderParticipation) {
          continue; // Skip this candidate, they aren't allowed in the event at all
        }
      }

      // If it's a team event with a specific gender requirement, we might optionally prioritize that gender
      // but if genderParticipation allows "any", we won't strictly filter them out here.

      // 2. Score Calculation
      let score = 0;

      // Score Component A: Skill Overlap (0 to 1) * weight
      const skillScore = calculateSkillOverlap(user.skills, candidate.skills);
      score += skillScore * 50; // Max 50 points for perfect skill match

      // Score Component B: Past Achievement (Win History)
      const pastWins = winCounts[candidate._id.toString()] || 0;
      score += pastWins * 10; // 10 points per past win

      // Score Component C: Event-Specific Gender Need Bonus
      if (event.specificGenderForTeam && event.specificGenderForTeam !== "any" && event.minSpecificGenderInTeam > 0) {
        if (candidate.gender === event.specificGenderForTeam) {
          score += 20; // 20 bonus points if they help fulfill the team's gender quota
        }
      }

      scoredCandidates.push({
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        gender: candidate.gender,
        skills: candidate.skills || [],
        pastWins: pastWins,
        matchScore: Math.round(score)
      });
    }

    // Sort by descending score
    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 5 suggestions
    res.json(scoredCandidates.slice(0, 5));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array of strings" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { skills } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  suggestTeammates,
  updateUserSkills
};
