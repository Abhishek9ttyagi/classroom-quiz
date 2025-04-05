// backend/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{ // Store the index of the question and the selected option
    questionIndex: Number,
    selectedOption: String,
  }],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
     type: Number,
     required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  // You could add timeTaken if needed
});

// Add indexes for efficient querying
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ assessment: 1 });
SubmissionSchema.index({ student: 1, assessment: 1 }, { unique: true }); // A student can submit only once per assessment

module.exports = mongoose.model('Submission', SubmissionSchema);