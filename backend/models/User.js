const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    match: [/^[a-zA-Z\s]{2,50}$/, "Please enter a valid name (letters and spaces only, 2-50 chars)"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "coordinator", "participant"],
    default: "participant"
  },

  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer_not_to_say"],
    default: "prefer_not_to_say"
  },

  skills: [{
    type: String
  }],

  instituteType: {
    type: String,
    enum: ["SMS Varanasi", "Outsider"],
    default: "SMS Varanasi"
  },

  instituteName: {
    type: String
  },

  course: {
    type: String
  },

  mobileNo: {
    type: String,
    required: false,
    match: [/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"]
  },
  profileImage: {
    type: String
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);