const express = require("express");
const Registration = require("../models/Registration");
const User = require("../models/User");
const Course = require("../models/Course");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

const formatStudentSnapshot = (student) => ({
  name: student.name,
  email: student.email,
  studentNumber: student.studentProfile?.studentNumber || "",
  department: student.studentProfile?.department || "",
  semester: student.studentProfile?.semester || "",
  academicYear: student.studentProfile?.academicYear || "",
  phone: student.studentProfile?.phone || ""
});

const getRegistrationDate = (registration) => {
  if (registration.createdAt) {
    return registration.createdAt;
  }

  if (registration._id?.getTimestamp) {
    return registration._id.getTimestamp();
  }

  return null;
};

const buildReportRows = (registrations) =>
  registrations.map((registration) => {
    const snapshot = registration.studentSnapshot || {};
    return {
      id: registration._id,
      studentName: snapshot.name || registration.studentId?.name || "",
      studentEmail: snapshot.email || registration.studentId?.email || "",
      studentNumber: snapshot.studentNumber || registration.studentId?.studentProfile?.studentNumber || "",
      department: snapshot.department || registration.studentId?.studentProfile?.department || "",
      semester: snapshot.semester || registration.studentId?.studentProfile?.semester || "",
      academicYear: snapshot.academicYear || registration.studentId?.studentProfile?.academicYear || "",
      phone: snapshot.phone || registration.studentId?.studentProfile?.phone || "",
      courseName: registration.courseId?.courseName || "",
      courseCode: registration.courseId?.courseCode || "",
      credits: registration.courseId?.credits || "",
      instructor: registration.courseId?.instructor || "",
      registeredAt: getRegistrationDate(registration)
    };
  });

const toCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

router.post("/register", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const existing = await Registration.findOne({ studentId, courseId });
    if (existing) {
      return res.status(409).json({ message: "Already registered for this course." });
    }

    const registration = new Registration({
      studentId,
      courseId,
      studentSnapshot: formatStudentSnapshot(student)
    });

    await registration.save();

    res.status(201).json({
      message: "Course registered successfully.",
      registration
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to register course.", error: error.message });
  }
});

router.get("/my/:studentId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const registrations = await Registration.find({
      studentId: req.params.studentId
    })
      .populate("courseId", "courseName courseCode credits instructor")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch registrations.", error: error.message });
  }
});

router.delete("/drop/:id", authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Registration not found." });
    }

    if (req.user.role !== "admin" && req.user.id !== registration.studentId.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    await registration.deleteOne();
    res.json({ message: "Course dropped successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to drop course.", error: error.message });
  }
});

router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("studentId", "name email studentProfile")
      .populate("courseId", "courseName courseCode credits instructor")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch registrations.", error: error.message });
  }
});

router.get("/report", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("studentId", "name email studentProfile")
      .populate("courseId", "courseName courseCode credits instructor")
      .sort({ createdAt: -1 });

    const rows = buildReportRows(registrations);

    res.json({
      summary: {
        totalRegistrations: rows.length,
        totalStudents: new Set(rows.map((row) => row.studentEmail)).size,
        totalCourses: new Set(rows.map((row) => row.courseCode)).size
      },
      rows
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to generate report.", error: error.message });
  }
});

router.get("/report/download", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("studentId", "name email studentProfile")
      .populate("courseId", "courseName courseCode credits instructor")
      .sort({ createdAt: -1 });

    const rows = buildReportRows(registrations);
    const csvRows = [
      [
        "Student Name",
        "Student Email",
        "Student Number",
        "Department",
        "Semester",
        "Academic Year",
        "Phone",
        "Course Name",
        "Course Code",
        "Credits",
        "Instructor",
        "Registered At"
      ],
      ...rows.map((row) => [
        row.studentName,
        row.studentEmail,
        row.studentNumber,
        row.department,
        row.semester,
        row.academicYear,
        row.phone,
        row.courseName,
        row.courseCode,
        row.credits,
        row.instructor,
        row.registeredAt ? new Date(row.registeredAt).toLocaleString() : ""
      ])
    ]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="student-registration-report.csv"');
    res.send(csvRows);
  } catch (error) {
    res.status(500).json({ message: "Unable to download report.", error: error.message });
  }
});

module.exports = router;
