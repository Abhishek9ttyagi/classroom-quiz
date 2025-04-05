// backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');

// @desc    Submit answers for an assessment
// @route   POST /api/submissions/:assessmentId
// @access  Private (Student)
exports.submitAssessment = async (req, res) => {
  const { assessmentId } = req.params;
  const { answers } = req.body; // Expecting answers = [{ questionIndex: number, selectedOption: string }]
  const studentId = req.user._id;

  try {
    // 1. Validate Assessment Exists and Fetch Correct Answers
    const assessment = await Assessment.findById(assessmentId).select('+questions.correctAnswer'); // Fetch correct answers
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // 2. Check if Student Already Submitted
    const existingSubmission = await Submission.findOne({ assessment: assessmentId, student: studentId });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assessment' });
    }

    // 3. Validate Answers Format (Basic)
     if (!Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid answers format. Expected an array.' });
     }
     // More detailed validation can be added here if needed


    // 4. Calculate Score
    let score = 0;
    const totalQuestions = assessment.questions.length;

    answers.forEach(answer => {
      // Find the corresponding question in the assessment
      // Using findIndex assumes the order might not match or some questions might be skipped
      const questionIndexInAssessment = assessment.questions.findIndex(
          (q, index) => index === answer.questionIndex // Match based on the index sent from frontend
      );

      if (questionIndexInAssessment !== -1) {
          const question = assessment.questions[questionIndexInAssessment];
          if (question.correctAnswer === answer.selectedOption) {
              score++;
          }
      } else {
          console.warn(`Warning: Submitted answer for non-existent question index ${answer.questionIndex} in assessment ${assessmentId}`);
      }
    });


     // Ensure answers array matches expected format from frontend for calculation
    //  Alternative simpler calculation if frontend guarantees sending full answers array in order:
    //  assessment.questions.forEach((question, index) => {
    //      const studentAnswer = answers[index]; // Assuming answers array corresponds 1:1
    //      if (studentAnswer && studentAnswer.selectedOption === question.correctAnswer) {
    //         score++;
    //      }
    //  }); 


    // 5. Create and Save Submission
    const newSubmission = new Submission({
      assessment: assessmentId,
      student: studentId,
      answers: answers, // Store the submitted answers
      score: score,
      totalQuestions: totalQuestions,
    });

    const savedSubmission = await newSubmission.save();

    // 6. Send back the result (or just the submission ID)
    res.status(201).json({
        message: 'Assessment submitted successfully!',
        submissionId: savedSubmission._id,
        score: savedSubmission.score,
        totalQuestions: savedSubmission.totalQuestions,
    });

  } catch (error) {
     console.error('Error submitting assessment:', error);
     if (error.name === 'ValidationError') {
         return res.status(400).json({ message: 'Validation Error', errors: error.errors });
     }
      if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid assessment ID format' });
        }
     res.status(500).json({ message: 'Server error submitting assessment' });
  }
};

// @desc    Get all submissions for the logged-in student
// @route   GET /api/submissions/my-results
// @access  Private (Student)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assessment', 'title description timer') // Populate assessment details (title, description, timer)
      .sort({ submittedAt: -1 }); // Sort by most recent submission first

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ message: 'Server error fetching results' });
  }
};

// @desc    Get details of a specific submission (e.g., for result page)
// @route   GET /api/submissions/:submissionId
// @access  Private (Student, Owner)
exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId)
                                           .populate('assessment', 'title questions.questionText questions.options questions.correctAnswer'); // Populate full assessment details including answers

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if the logged-in student owns this submission
        if (submission.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only view your own submissions' });
        }

        // Prepare response data including assessment details and student's answers
         // We need to combine the assessment's full question data with the student's selections
         const detailedResult = {
            submissionId: submission._id,
            assessmentTitle: submission.assessment.title,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            submittedAt: submission.submittedAt,
            questions: submission.assessment.questions.map((q, index) => {
                const studentAnswer = submission.answers.find(a => a.questionIndex === index);
                return {
                    questionIndex: index,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    selectedOption: studentAnswer ? studentAnswer.selectedOption : null, // Student's selection for this question
                    isCorrect: studentAnswer ? studentAnswer.selectedOption === q.correctAnswer : false
                };
            })
         };


        res.json(detailedResult); // Send detailed result including correct answers for review

    } catch (error) {
        console.error('Error fetching submission details:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid submission ID format' });
        }
        res.status(500).json({ message: 'Server error fetching submission details' });
    }
};