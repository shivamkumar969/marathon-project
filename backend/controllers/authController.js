const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { sendPasswordResetEmail } = require("../utils/sendEmail");


// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, instituteType, instituteName, course, mobileNo } = req.body;

    // Validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const mobileRegex = /^[6-9][0-9]{9}$/;

    if (!nameRegex.test(name)) return res.status(400).json({ message: "Invalid name. Use 2-50 letters and spaces only." });
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format." });
    if (!mobileRegex.test(mobileNo)) return res.status(400).json({ message: "Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9." });

    // Secure Role Assignment
    // The public registration route is strictly for participants. 
    // Admins and Coordinators must be created via the Admin Dashboard.
    let role = "participant";

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      instituteType,
      instituteName,
      course,
      mobileNo,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      instituteType: user.instituteType,
      instituteName: user.instituteName,
      course: user.course,
      mobileNo: user.mobileNo,
      skills: user.skills,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        instituteType: user.instituteType,
        instituteName: user.instituteName,
        course: user.course,
        mobileNo: user.mobileNo,
        skills: user.skills,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: "Invalid Email or Password" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COORDINATORS
const getCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: "coordinator" }).select("-password");
    res.json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate a random 8-character password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // Send the new password to the user's email
    await sendPasswordResetEmail(user.email, user.name, newPassword);

    res.json({ message: "A new password has been sent to your registered email address" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getCoordinators, forgotPassword };