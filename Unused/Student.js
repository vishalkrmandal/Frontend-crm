const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  roomNo: {
    type: String,
    required: [true, "Room number is required"],
    trim: true
  },
}, { timestamps: true });

const Student = mongoose.model("User", studentSchema);
module.exports = Student;