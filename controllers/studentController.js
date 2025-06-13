
import Feedback from '../models/Feedback.js';
import Faculty from '../models/Faculty.js';
import FacultyPerformance from '../models/FacultyPerformance.js';



export const submitFeedback = async (req, res) => {
  try {
    const { facultyId, rating, comments } = req.body;

    // Check faculty exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Save feedback
    const feedback = new Feedback({
      student: req.user.userId,
      faculty: facultyId,
      rating,
      comments
    });

    await feedback.save();

    // Step 1: Fetch all feedbacks for that faculty
    const allFeedbacks = await Feedback.find({ faculty: facultyId });
    const ratings = allFeedbacks.map(fb => fb.rating);

    // Step 2: Calculate average
    const averageRating = ratings.length
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
      : 0;

    // Step 3: Update FacultyPerformance with the avg in feedbackScores
    let performance = await FacultyPerformance.findOne({ facultyId });

    if (!performance) {
      performance = new FacultyPerformance({
        facultyId,
        feedbackScores: [averageRating]
      });
    } else {
      performance.feedbackScores = [averageRating]; // overwrite with latest average
    }

    await performance.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });

  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};




export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().populate('user', 'name email');

    res.status(200).json({ faculties });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};