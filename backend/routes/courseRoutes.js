const express = require("express");
const Course = require("../models/Course");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/add", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { courseName, courseCode, credits, instructor } = req.body;

    const existingCourse = await Course.findOne({
      courseCode: courseCode?.trim().toUpperCase()
    });

    if (existingCourse) {
      return res.status(409).json({ message: "A course with this code already exists." });
    }

    const course = new Course({
      courseName,
      courseCode,
      credits,
      instructor
    });

    await course.save();

    res.status(201).json({
      message: "Course added successfully.",
      course
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to add course.", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch courses.", error: error.message });
  }
});

router.put("/update/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json({
      message: "Course updated successfully.",
      course: updatedCourse
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update course.", error: error.message });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json({ message: "Course deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete course.", error: error.message });
  }
});

module.exports = router;
