const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  date: {
    type: String
  },

  venue: {
    type: String
  },

  type: {
    type: String,
    enum: ["individual", "team"],
    default: "individual"
  },
  
  coordinators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  registrationOpenDate: {
    type: Date
  },
  
  registrationCloseDate: {
    type: Date
  },
  
  genderParticipation: {
    type: String,
    enum: ["any", "male", "female", "other"],
    default: "any"
  },
  
  teamSize: {
    type: Number,
    default: 1
  },
  
  minSpecificGenderInTeam: {
    type: Number,
    default: 0
  },
  
  specificGenderForTeam: {
    type: String,
    enum: ["any", "male", "female", "other"],
    default: "any"
  },
  
  isFinalized: {
    type: Boolean,
    default: false
  },
  
  fee: {
    type: Number,
    default: 0
  },
  
  resultsDeclared: {
    type: Boolean,
    default: false
  },
  
  allowedInstitutes: {
    type: String,
    enum: ["any", "SMS Varanasi", "Outsider"],
    default: "any"
  },
  
  allowedCourses: [{
    type: String
  }],
    
  maxWinners: {
    type: Number,
    default: 3
  },
    
  eventBanner: {
    type: String
  }
},
{ timestamps: true }
);

// Performance Indexes for fast querying
eventSchema.index({ date: 1 });
eventSchema.index({ coordinators: 1 });
eventSchema.index({ type: 1 });

module.exports = mongoose.model("Event", eventSchema);