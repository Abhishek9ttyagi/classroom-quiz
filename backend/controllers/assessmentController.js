// backend/controllers/assessmentController.js
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission'); // Needed for delete cascade

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private (Teacher)
exports.createAssessment = async (req, res) => {
  try {
    const { title, description, questions, timer } = req.body;

    // Basic validation
    if (!title || !questions || questions.length === 0 || !timer) {
      return res.status(400).json({ message: 'Missing required fields: title, questions, timer' });
    }
     if (isNaN(parseInt(timer)) || parseInt(timer) < 1) {
         return res.status(400).json({ message: 'Timer must be a positive number.' });
     }
     // Validate each question structure (can be more thorough)
     for (const q of questions) {
        if (!q.questionText || !q.options || q.options.length < 2 || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
             return res.status(400).json({ message: 'Invalid question structure. Ensure text, >=2 options, and a correct answer within options.' });
         }
     }


    const newAssessment = new Assessment({
      title,
      description,
      questions,
      timer: parseInt(timer),
      createdBy: req.user._id, // Get teacher ID from logged-in user
    });

    const savedAssessment = await newAssessment.save();
    res.status(201).json(savedAssessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ message: 'Server error creating assessment' });
  }
};

// @desc    Get all assessments created by the logged-in teacher
// @route   GET /api/assessments
// @access  Private (Teacher)
exports.getMyAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.user._id })
                                      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching teacher assessments:', error);
    res.status(500).json({ message: 'Server error fetching assessments' });
  }
};

// @desc    Get a single assessment's details (for teacher editing or student taking)
// @route   GET /api/assessments/:id
// @access  Private (Teacher or Student)
exports.getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // If the user is a student, remove correct answers before sending
        if (req.user.role === 'student') {
            const assessmentForStudent = assessment.toObject(); // Create a plain JS object
            assessmentForStudent.questions = assessmentForStudent.questions.map(q => ({
                _id: q._id, // Keep question _id if needed for submission keying
                questionText: q.questionText,
                options: q.options,
                // CORRECT ANSWER IS OMITTED FOR STUDENTS
            }));
             // Check if student already submitted this assessment
             const existingSubmission = await Submission.findOne({
                assessment: assessment._id,
                student: req.user._id
            });
            if (existingSubmission) {
                // Maybe redirect to results or send a specific status/message?
                // For now, just indicate they can't retake by sending null or an error
                return res.status(403).json({ message: 'You have already attempted this assessment.', submissionId: existingSubmission._id });
                // Or return res.json(null);
            }

            res.json(assessmentForStudent);
        } else if (req.user.role === 'teacher') {
            // Teacher can only view their own assessments through this specific route variant
            if (assessment.createdBy.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: You can only view your own assessments in detail here.' });
            }
            res.json(assessment); // Send full details to the teacher owner
        } else {
             res.status(403).json({ message: 'Forbidden' }); // Should not happen if middleware is correct
        }

    } catch (error) {
        console.error('Error fetching single assessment:', error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid assessment ID format' });
        }
        res.status(500).json({ message: 'Server error fetching assessment' });
    }
};


// @desc    Update an assessment
// @route   PUT /api/assessments/:id
// @access  Private (Teacher, Owner) -> Use isAssessmentOwner middleware
exports.updateAssessment = async (req, res) => {
    try {
        const { title, description, questions, timer } = req.body;
        // req.assessment is attached by the isAssessmentOwner middleware

        // Basic validation (similar to create)
        if (!title || !questions || questions.length === 0 || !timer) {
           return res.status(400).json({ message: 'Missing required fields: title, questions, timer' });
        }
         if (isNaN(parseInt(timer)) || parseInt(timer) < 1) {
            return res.status(400).json({ message: 'Timer must be a positive number.' });
        }
         for (const q of questions) {
            if (!q.questionText || !q.options || q.options.length < 2 || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
                return res.status(400).json({ message: 'Invalid question structure.' });
            }
        }

        // Check if any submissions exist for this assessment
        const submissionCount = await Submission.countDocuments({ assessment: req.params.id });
        if (submissionCount > 0) {
            // Decide policy: Prevent edit? Allow edit but warn?
            // For simplicity, let's prevent editing if submissions exist.
            return res.status(400).json({ message: 'Cannot edit assessment: Students have already submitted attempts.' });
        }


        // Update fields
        req.assessment.title = title;
        req.assessment.description = description;
        req.assessment.questions = questions;
        req.assessment.timer = parseInt(timer);

        const updatedAssessment = await req.assessment.save();
        res.json(updatedAssessment);

    } catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({ message: 'Server error updating assessment' });
    }
};


// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Teacher, Owner) -> Use isAssessmentOwner middleware
exports.deleteAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
     // req.assessment is attached by the isAssessmentOwner middleware

    // Optional: Delete related submissions first (cascade delete)
    await Submission.deleteMany({ assessment: assessmentId });

    // Now delete the assessment itself
    await Assessment.findByIdAndDelete(assessmentId); // Or req.assessment.remove() pre Mongoose 6

    res.json({ message: 'Assessment and related submissions deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ message: 'Server error deleting assessment' });
  }
};