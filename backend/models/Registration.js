const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    studentSnapshot: {
      name: String,
      email: String,
      studentNumber: String,
      department: String,
      semester: String,
      academicYear: String,
      phone: String
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
