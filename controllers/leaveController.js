// controllers/leaveController.js
import LeaveRequest from '../models/LeaveRequest.js';
import Faculty from '../models/Faculty.js';


export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.userId;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const facultyId = faculty.id;
    const { startDate, endDate, reason, type } = req.body;

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      faculty: facultyId,
      status: { $in: ['pending', 'approved'] }, // Only check active requests
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (overlappingLeave) {
      return res.status(409).json({
        error: 'You already have a leave applied during this period',
        conflict: {
          startDate: overlappingLeave.startDate,
          endDate: overlappingLeave.endDate,
          status: overlappingLeave.status,
        },
      });
    }

    // If no conflict, proceed to save the leave
    const leave = new LeaveRequest({
      faculty: facultyId,
      startDate,
      endDate,
      reason,
      type,
    });

    await leave.save();

    res.status(201).json({ message: 'Leave application submitted successfully', leave });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ error: 'Server error applying for leave' });
  }
};



export const getLeaveStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const faculty = await Faculty.findOne({ user: userId });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        const facultyId = faculty.id;
        const leaves = await LeaveRequest.find({ faculty: facultyId }).sort({ createdAt: -1 });
        res.status(200).json({ leaves });
    } catch (err) {
        console.error("Error fetching the details....");
        res.status(500).json({ error: 'Server error fetching the details' });
    }
}