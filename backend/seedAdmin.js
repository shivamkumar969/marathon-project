const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected Successfully!");

    const adminEmail = "admin@marathon.com";
    const adminPassword = "password123";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists in Database.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
      name: "Main Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      gender: "male",
      instituteType: "SMS Varanasi",
      instituteName: "Main Office",
      mobileNo: "9876543210" // Added required field
    });

    await adminUser.save();
    console.log("-----------------------------------------");
    console.log("✅ Admin User Created Successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
