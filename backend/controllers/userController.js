const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendProvisioningEmail } = require("../utils/sendEmail");
const { uploadToCloudinary } = require("../utils/cloudinary");

// CREATE USER (Admin Only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, gender, role } = req.body;

    if (role === "participant") {
      return res.status(400).json({ message: "Admins can only provision Coordinator or Admin accounts from this panel. Participants must register themselves." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender: gender || "prefer_not_to_say",
      role: role || "participant"
    });

    // Send email with credentials
    if (role === "coordinator" || role === "admin") {
      await sendProvisioningEmail(email, name, role, password);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER ROLE (Admin Only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role || user.role;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cleanup: Remove from any assigned events
    const Event = require("../models/Event");
    await Event.updateMany(
      { coordinators: req.params.id },
      { $pull: { coordinators: req.params.id } }
    );

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE (Self)
const updateProfile = async (req, res) => {
  try {
    const { name, mobileNo, course } = req.body;

    // Validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const mobileRegex = /^[6-9][0-9]{9}$/;

    if (name && !nameRegex.test(name)) return res.status(400).json({ message: "Invalid name. Use 2-50 letters and spaces only." });
    if (mobileNo && !mobileRegex.test(mobileNo)) return res.status(400).json({ message: "Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9." });

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Security: Ensure only the user themselves can update their profile
    // req.user comes from protect middleware
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only update your own profile." });
    }

    user.name = name || user.name;
    user.mobileNo = mobileNo || user.mobileNo;
    user.course = course || user.course;

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, "profiles");
        user.profileImage = imageUrl;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload profile image to cloud." });
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mobileNo: updatedUser.mobileNo,
      course: updatedUser.course,
      gender: updatedUser.gender,
      instituteType: updatedUser.instituteType,
      instituteName: updatedUser.instituteName,
      skills: updatedUser.skills,
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, createUser, updateProfile };
