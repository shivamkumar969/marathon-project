const express = require("express");
const { getAllUsers, updateUserRole, deleteUser, createUser, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Base path: /api/users
router.route("/")
  .get(getAllUsers)
  .post(createUser);

router.route("/profile/:id")
  .put(protect, upload.single("profileImage"), updateProfile);

router.route("/:id")
  .put(updateUserRole)
  .delete(deleteUser);

module.exports = router;
