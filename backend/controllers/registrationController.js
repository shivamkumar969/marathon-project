const Registration = require("../models/Registration");

const User = require("../models/User");
const Event = require("../models/Event");
const { sendEventRegistrationEmail } = require("../utils/sendEmail");

// Register Event
const registerEvent = async (req, res) => {
  try {
    const { userId, eventId, teamName, teamMembers, amountPaid, paymentStatus } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    
    if (event.registrationOpenDate && now < new Date(event.registrationOpenDate)) {
      return res.status(400).json({ message: "Registration has not opened yet." });
    }

    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) {
      return res.status(400).json({ message: "Registration is closed." });
    }

    if (!event.isFinalized) {
      return res.status(400).json({ message: "This event is still in draft mode and not finalized for registrations." });
    }

    if (event.genderParticipation && event.genderParticipation !== "any") {
      if (user.gender !== event.genderParticipation) {
        return res.status(400).json({ message: `This event is restricted to ${event.genderParticipation} participants only.` });
      }
    }

    if (event.allowedInstitutes && event.allowedInstitutes !== "any") {
      if (user.instituteType !== event.allowedInstitutes) {
        return res.status(400).json({ message: `This event is restricted to ${event.allowedInstitutes} students only.` });
      }
    }

    if (event.allowedCourses && event.allowedCourses.length > 0) {
      if (!event.allowedCourses.includes(user.course)) {
        return res.status(400).json({ message: `Your course (${user.course}) is not eligible for this event.` });
      }
    }

    let resolvedTeamMembers = [];
    let foundUsers = [];
    
    if (event.type === "team") {
      if (!teamName) {
        return res.status(400).json({ message: "Team Name is required for team events." });
      }

      // If team members are provided as emails, verify them
      if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
        // Find users by emails
        foundUsers = await User.find({ email: { $in: teamMembers } });
        
        if (foundUsers.length !== teamMembers.length) {
          return res.status(400).json({ message: "One or more team member emails do not belong to registered users." });
        }
        
        if (event.genderParticipation && event.genderParticipation !== "any") {
          const invalidMembers = foundUsers.filter(u => u.gender !== event.genderParticipation);
          if (invalidMembers.length > 0) {
            return res.status(400).json({ message: `All team members must be ${event.genderParticipation}. One or more invited members do not meet this restriction.` });
          }
        }

        if (event.allowedInstitutes && event.allowedInstitutes !== "any") {
          const invalidMembers = foundUsers.filter(u => u.instituteType !== event.allowedInstitutes);
          if (invalidMembers.length > 0) {
            return res.status(400).json({ message: `All team members must be from ${event.allowedInstitutes}. One or more invited members do not meet this restriction.` });
          }
        }

        if (event.allowedCourses && event.allowedCourses.length > 0) {
          const invalidMembers = foundUsers.filter(u => !event.allowedCourses.includes(u.course));
          if (invalidMembers.length > 0) {
            return res.status(400).json({ message: `One or more team members are enrolled in a course that is not eligible for this event.` });
          }
        }
        
        resolvedTeamMembers = foundUsers.map(u => u._id);
        
        // Ensure the registering user isn't trying to add themselves to the array
        if (resolvedTeamMembers.some(id => id.toString() === userId.toString())) {
           return res.status(400).json({ message: "You don't need to add your own email to the team members list." });
        }
      }
      
      const totalMembers = resolvedTeamMembers.length + 1; // +1 for the registering user

      if (event.teamSize && totalMembers !== event.teamSize) {
        return res.status(400).json({ message: `Team size must be exactly ${event.teamSize} members. You need to invite ${event.teamSize - 1} more member(s).` });
      }

      if (event.specificGenderForTeam && event.specificGenderForTeam !== "any" && event.minSpecificGenderInTeam > 0) {
        let specificGenderCount = 0;
        if (user.gender === event.specificGenderForTeam) specificGenderCount++;
        
        foundUsers.forEach(u => {
          if (u.gender === event.specificGenderForTeam) specificGenderCount++;
        });
        
        if (specificGenderCount < event.minSpecificGenderInTeam) {
          return res.status(400).json({ message: `Team must contain at least ${event.minSpecificGenderInTeam} ${event.specificGenderForTeam} participant(s).` });
        }
      }
      // If the user meant "matches exactly", we can change this, but "exceed" is safer for "up to".
    }

    // ENFORCE: One person can only be in ONE team per event
    // Check if the main registering user is already in any team (as leader or member)
    const selfCheck = await Registration.findOne({
      eventId,
      $or: [{ userId }, { teamMembers: userId }]
    });

    if (selfCheck) {
      return res.status(400).json({ 
        message: "You are already registered for this event (as an individual or in another team)." 
      });
    }

    // Check if any of the invited team members are already registered
    if (resolvedTeamMembers && resolvedTeamMembers.length > 0) {
      const memberCheck = await Registration.findOne({
        eventId,
        $or: [
          { userId: { $in: resolvedTeamMembers } },
          { teamMembers: { $in: resolvedTeamMembers } }
        ]
      }).populate("userId", "name");

      if (memberCheck) {
        return res.status(400).json({ 
          message: "One or more of your team members are already registered for this event in another team." 
        });
      }
    }

    const register = await Registration.create({
      userId,
      eventId,
      ...(teamName && { teamName }),
      teamMembers: resolvedTeamMembers,
      amountPaid: amountPaid || 0,
      paymentStatus: paymentStatus || "free"
    });

    // Send Registration Email in the background
    sendEventRegistrationEmail(user.email, user.name, {
      title: event.title,
      date: event.date,
      venue: event.venue,
      type: event.type,
      amountPaid: register.amountPaid
    });

    // For team events, you could optionally loop and send to all `foundUsers`
    if (foundUsers && foundUsers.length > 0) {
      foundUsers.forEach(member => {
        sendEventRegistrationEmail(member.email, member.name, {
          title: event.title,
          date: event.date,
          venue: event.venue,
          type: event.type,
          amountPaid: register.amountPaid
        });
      });
    }

    res.status(201).json(register);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// My Registrations
const myRegistrations = async (req, res) => {
  try {
    const data = await Registration.find({
      $or: [{ userId: req.params.userId }, { teamMembers: req.params.userId }]
    })
    .populate("eventId")
    .populate("userId", "name email mobileNo");

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Withdraw Registration
const withdrawRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("eventId");
    if (!registration) return res.status(404).json({ message: "Registration not found" });

    const event = registration.eventId;
    const now = new Date();

    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) {
      return res.status(400).json({ message: "Cannot withdraw. Registration is already closed." });
    }

    await Registration.findByIdAndDelete(req.params.id);

    res.json({
      message: "Registration Withdrawn"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const allRegistrations = async (req, res) => {
  try {
    const data = await Registration.find()
      .populate("userId")
      .populate("eventId")
      .populate("teamMembers");

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const toggleAttendance = async (req, res) => {
  try {
    if (req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Only coordinators can mark attendance." });
    }

    const { memberId } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });

    if (!registration.presentMembers) {
      registration.presentMembers = [];
    }

    if (memberId) {
      // Toggle individual member
      const index = registration.presentMembers.indexOf(memberId);
      if (index === -1) {
        registration.presentMembers.push(memberId);
      } else {
        registration.presentMembers.splice(index, 1);
      }
    } else {
      // Toggle main user / individual participant
      const index = registration.presentMembers.indexOf(registration.userId);
      if (index === -1) {
        registration.presentMembers.push(registration.userId);
        registration.isPresent = true; // legacy support
      } else {
        registration.presentMembers.splice(index, 1);
        registration.isPresent = false; // legacy support
      }
    }

    await registration.save();
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerEvent,
  myRegistrations,
  withdrawRegistration,
  allRegistrations,
  toggleAttendance
};