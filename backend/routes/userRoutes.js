const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const VALID_ROLES = ["student", "admin"];

const buildStudentProfile = (payload) => ({
  studentNumber: payload.studentNumber?.trim().toUpperCase(),
  department: payload.department?.trim(),
  semester: payload.semester?.trim(),
  academicYear: payload.academicYear?.trim(),
  phone: payload.phone?.trim()
});

const validateStudentFields = (payload) => {
  const requiredFields = ["studentNumber", "department", "semester", "academicYear", "phone"];
  return requiredFields.filter((field) => !payload[field]?.trim());
};

const normalizeStudentProfile = (payload = {}) => ({
  studentNumber: payload.studentNumber?.trim().toUpperCase() || "",
  department: payload.department?.trim() || "",
  semester: payload.semester?.trim() || "",
  academicYear: payload.academicYear?.trim() || "",
  phone: payload.phone?.trim() || ""
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = role?.trim().toLowerCase() || "student";

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (normalizedRole === "student") {
      const missingFields = validateStudentFields(req.body);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing student details: ${missingFields.join(", ")}`
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    if (normalizedRole === "student" && req.body.studentNumber) {
      const existingStudentNumber = await User.findOne({
        "studentProfile.studentNumber": req.body.studentNumber.trim().toUpperCase()
      });

      if (existingStudentNumber) {
        return res.status(409).json({ message: "Student number already exists." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: normalizedRole,
      studentProfile: normalizedRole === "student" ? buildStudentProfile(req.body) : undefined
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully.",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to register user.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = role?.trim().toLowerCase();

    if (normalizedRole && !VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid login role." });
    }

    const user = await User.findOne({
      email: email?.toLowerCase().trim()
    }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    if (normalizedRole && user.role !== normalizedRole) {
      return res.status(403).json({
        message: `This account does not have ${normalizedRole} portal access.`
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d"
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      role: user.role,
      userId: user._id,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to login.", error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      return res.status(400).json({ message: "Email, new password, and confirm password are required." });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password reset successful. You can login now." });
  } catch (error) {
    res.status(500).json({ message: "Unable to reset password.", error: error.message });
  }
});

router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch profile.", error: error.message });
  }
});

router.put("/profile/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.body.name?.trim()) {
      user.name = req.body.name.trim();
    }

    if (user.role === "student") {
      const nextProfile = normalizeStudentProfile(req.body);

      if (!nextProfile.studentNumber) {
        return res.status(400).json({ message: "Student number is required." });
      }

      const existingStudentNumber = await User.findOne({
        _id: { $ne: user._id },
        "studentProfile.studentNumber": nextProfile.studentNumber
      });

      if (existingStudentNumber) {
        return res.status(409).json({ message: "Student number already exists." });
      }

      user.studentProfile = nextProfile;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update profile.", error: error.message });
  }
});

module.exports = router;
