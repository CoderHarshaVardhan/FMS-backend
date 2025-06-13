
import LeaveRequest from "../models/LeaveRequest.js";
import Class from '../models/Class.js';
import FacultyPerformance from '../models/FacultyPerformance.js';
import Timetable from '../models/Timetable.js';



export const getLeaveRequests = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find()
            .populate({
                path: 'faculty',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json({ leaves });
        console.log(JSON.stringify(leaves, null, 2));

    } catch (err) {
        console.error('Error fetching all leave requests:', err);
        res.status(500).json({ error: 'Server error fetching leave requests' });
    }
}




const TOTAL_WEEKS = 16;
const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getLeaveDays = (start, end) => {
    const leaveDays = [];
    const current = new Date(start);

    while (current <= end) {
        const day = current.toLocaleDateString('en-US', { weekday: 'long' });
        if (workingDays.includes(day)) {
            leaveDays.push(day);
        }
        current.setDate(current.getDate() + 1);
    }

    return leaveDays;
};

export const approveLeaveRequests = async (req, res) => {
    const { status, rejectedReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updateFields = { status };

        if (status === 'rejected') {
            updateFields.rejectedReason = rejectedReason || 'No reason provided';
        } else {
            updateFields.rejectedReason = undefined;
        }

        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        if (status === 'approved') {
            const facultyId = leave.faculty;

            const weeklyTimetable = await Timetable.find({ faculty: facultyId });
            const weeklyClassCount = weeklyTimetable.length;
            const totalClassesHandled = weeklyClassCount * TOTAL_WEEKS;

            // Step 2: Get number of missed classes during leave period
            const leaveDays = getLeaveDays(leave.startDate, leave.endDate); // e.g., ['Monday', 'Wednesday']

            console.log(leaveDays);
            // Count how many classes were missed due to this leave
            const missedClasses = weeklyTimetable.filter(entry => leaveDays.includes(entry.day)).length;

            let totalMissedClasses = missedClasses;


            // Step 4: Calculate updated attendance rate
            const attendanceRate = totalClassesHandled > 0
                ? ((totalClassesHandled - totalMissedClasses) / totalClassesHandled) * 100
                : 0;

            // Step 5: Update FacultyPerformance
            await FacultyPerformance.findOneAndUpdate(
                { facultyId },
                {
                    classesHandled: totalClassesHandled,
                    attendanceRate: attendanceRate.toFixed(2),
                },
                { new: true, upsert: true }
            );
        }

        res.status(200).json({ message: 'Leave status updated and faculty performance recalculated', leave });
        console.log('Leave status updated and faculty performance recalculated', leave );

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update leave and performance metrics' });
    }
};

export const getClasses = async (req, res) => {
    try {
        const classes = await Class.find().sort({ name: 1 });
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch classes", error: err.message });
    }
};


import Feedback from '../models/Feedback.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';

export const getFeedbackSummary = async (req, res) => {
    try {
        const summary = await Feedback.aggregate([
            {
                $group: {
                    _id: "$faculty",
                    averageRating: { $avg: "$rating" },
                    totalFeedbacks: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "faculties",
                    localField: "_id",
                    foreignField: "_id",
                    as: "faculty"
                }
            },
            { $unwind: "$faculty" },
            {
                $lookup: {
                    from: "users",
                    localField: "faculty.user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    facultyId: "$_id",
                    facultyName: "$user.name",
                    averageRating: { $round: ["$averageRating", 2] },
                    totalFeedbacks: 1
                }
            },
            { $sort: { averageRating: -1 } }
        ]);

        res.status(200).json({ summary });
    } catch (error) {
        console.error("Error fetching feedback summary:", error);
        res.status(500).json({ error: "Failed to get feedback summary" });
    }
};
