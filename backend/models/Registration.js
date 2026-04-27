const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },

  teamName: {
    type: String
  },

  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  isWinner: {
    type: Boolean,
    default: false
  },

  isPresent: {
    type: Boolean,
    default: false
  },

  presentMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  amountPaid: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "free"],
    default: "free"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);