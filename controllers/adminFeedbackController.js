import Feedback from '../models/Feedback.js';

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('student', 'name email') 
      .populate({
        path: 'faculty',
        populate: {
          path: 'user',
          select: 'name email'
        }
      }) 
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
    console.log(feedbacks);
  } catch (err) {
    console.error('Error fetching all feedbacks:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
