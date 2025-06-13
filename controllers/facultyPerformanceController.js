import FacultyPerformance from '../models/FacultyPerformance.js';
import Faculty from '../models/Faculty.js';

export const getFacultyPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const faculty = await Faculty.findOne({ user: userId });

    const facultyId = faculty?._id;
    console.log(userId, facultyId);

    const performance = await FacultyPerformance.findOne({ facultyId });
    console.log(performance);

    if (!performance) {
      return res.status(404).json({ message: 'Performance data not found' });
    }

    res.status(200).json({
      classesHandled: performance.classesHandled,
      attendanceRate: performance.attendanceRate,
      averageFeedback: performance.feedbackScores.length > 0 ? performance.feedbackScores[0].toFixed(2) : '0.00',
      researchCount: performance.researchPapers.length,
    });

  } catch (err) {
    console.error('Error in getFacultyPerformance:', err);
    res.status(500).json({ message: 'Error fetching performance data', error: err.message });
  }
};
