import Feedback from '../models/Feedback.js';
import Faculty from '../models/Faculty.js';

export const getOwnFeedback = async (req, res) => {
    try {
        const userId = req.user.userId;
        const faculty = await Faculty.findOne({ user: userId });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const feedbacks = await Feedback.find({ faculty: faculty._id })
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ feedbacks });

    } catch (err) {
        console.error('Error fetching faculty feedback:', err);
        res.status(500).json({ error: 'Server error fetching feedback' });
    }
};
