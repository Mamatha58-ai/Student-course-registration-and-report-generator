const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    studentProfile: {
      studentNumber: {
        type: String,
        trim: true,
        uppercase: true,
        unique: true,
        sparse: true
      },
      department: {
        type: String,
        trim: true
      },
      semester: {
        type: String,
        trim: true
      },
      academicYear: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("User", userSchema);
