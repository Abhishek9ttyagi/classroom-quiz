// backend/models/Assessment.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of possible answers
  correctAnswer: { type: String, required: true }, // Store the correct option text
});

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questions: [QuestionSchema],
  timer: { // Timer in minutes
    type: Number,
    required: true,
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the teacher who created it
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add an index on createdBy to efficiently fetch assessments by teacher
AssessmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);