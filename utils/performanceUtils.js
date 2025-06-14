// utils/performanceUtils.js
import Timetable from '../models/Timetable.js';
import FacultyPerformance from '../models/FacultyPerformance.js';
import LeaveRequest from '../models/LeaveRequest.js';

const TOTAL_WEEKS = 16; // Adjust as per your semester

function getLeaveDays(startDate, endDate) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const leaveDates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    leaveDates.push(days[current.getDay()]);
    current.setDate(current.getDate() + 1);
  }

  return [...new Set(leaveDates)]; // remove duplicates
}

export const updateFacultyPerformance = async (facultyId) => {
  const weeklyTimetable = await Timetable.find({ faculty: facultyId });
  const weeklyClassCount = weeklyTimetable.length;
  const totalClassesHandled = weeklyClassCount * TOTAL_WEEKS;

  const leaves = await LeaveRequest.find({ faculty: facultyId, status: 'approved' });

  let totalMissedClasses = 0;

  for (const leave of leaves) {
    const leaveDays = getLeaveDays(leave.startDate, leave.endDate);
    const missedClasses = weeklyTimetable.filter(entry => leaveDays.includes(entry.day)).length;
    totalMissedClasses += missedClasses;
  }

  const attendanceRate = totalClassesHandled > 0
    ? ((totalClassesHandled - totalMissedClasses) / totalClassesHandled) * 100
    : 0;

  await FacultyPerformance.findOneAndUpdate(
    { facultyId },
    {
      classesHandled: totalClassesHandled,
      attendanceRate: attendanceRate.toFixed(2),
    },
    { new: true, upsert: true }
  );
};
