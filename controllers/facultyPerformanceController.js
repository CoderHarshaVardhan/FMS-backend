import FacultyPerformance from '../models/FacultyPerformance.js';
import Faculty from '../models/Faculty.js';

import { updateFacultyPerformance } from '../utils/performanceUtils.js';

export const getFacultyPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const facultyId = faculty._id;

    // 👇 Auto-update performance on fetch
    await updateFacultyPerformance(facultyId);

    const performance = await FacultyPerformance.findOne({ facultyId });

    if (!performance) {
      return res.status(404).json({ message: 'Performance data not found' });
    }

    res.status(200).json({
      classesHandled: performance.classesHandled,
      attendanceRate: performance.attendanceRate,
      averageFeedback: performance.feedbackScores?.length > 0 ? performance.feedbackScores[0].toFixed(2) : '0.00',
      researchCount: performance.researchPapers?.length || 0,
    });

  } catch (err) {
    console.error('Error in getFacultyPerformance:', err);
    res.status(500).json({ message: 'Error fetching performance data', error: err.message });
  }
};

