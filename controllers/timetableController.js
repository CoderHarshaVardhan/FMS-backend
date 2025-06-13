import Timetable from '../models/Timetable.js';
import Faculty from '../models/Faculty.js'

export const createTimetableEntry = async (req, res) => {
  try {
    console.log("Creating timetable entry...");

    const { faculty, subject, classRef, day, startTime, endTime } = req.body;

    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);

    const breakPeriods = [
      { start: toMinutes("10:50"), end: toMinutes("11:00") },
      { start: toMinutes("12:40"), end: toMinutes("13:30") },
    ];

    const overlapsBreak = breakPeriods.some(breakTime => {
      return startMin < breakTime.end && endMin > breakTime.start;
    });

    if (overlapsBreak) {
      return res.status(400).json({
        message: "⛔ Faculty cannot be scheduled during break periods (10:50–11:00 or 12:40–13:30)",
      });
    }

    const conflicts = await Timetable.find({
      day,
      $or: [
        {
          faculty,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
          ]
        },
        {
          classRef,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
          ]
        }
      ]
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "⛔ Conflict detected with existing schedule",
        conflicts,
      });
    }

    const newEntry = await Timetable.create({
      faculty,
      subject,
      classRef,
      day,
      startTime,
      endTime,
    });

    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getTimetable = async (req, res) => {
  try {
    const filter = {};

    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.classRef) filter.classRef = req.query.classRef;
    if (req.query.day) filter.day = req.query.day;

    const entries = await Timetable.find(filter)
      .populate("faculty", "name email")
      .populate("classRef", "name department year");

    res.status(200).json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch timetable", error });
  }
};

export const deleteTimetableEntry = async (req, res) => {
  try {
    const timetableId = req.params.id;
    console.log(timetableId);

    const deleted = await Timetable.findByIdAndDelete(timetableId);

    if (!deleted) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting timetable:', err);
    res.status(500).json({ message: 'Server error deleting timetable entry' });
  }
}

export const getTimeTableByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const entries = await Timetable.find({ classRef: classId })
      .populate('classRef', 'name department year')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ day: 1, startTime: 1 });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching timetable by class:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const getTimeTableByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const entries = await Timetable.find({ faculty: facultyId })
      .populate('classRef', 'name department year')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ day: 1, startTime: 1 });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching timetable by faculty:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const editTimeTable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      classRef,
      faculty,
      subject,
      day,
      startTime,
      endTime,
    } = req.body;

    const currentEntry = await Timetable.findById(id);
    if (!currentEntry) {
      return res.status(404).json({ message: "❌ Timetable entry not found." });
    }

    // ⛔ Break periods
    const breakPeriods = [
      { start: "10:50", end: "11:00" },
      { start: "12:40", end: "13:30" },
    ];

    const overlapsBreak = breakPeriods.some((breakTime) => {
      return startTime < breakTime.end && endTime > breakTime.start;
    });

    if (overlapsBreak) {
      return res.status(400).json({
        message: "⛔ Faculty cannot be scheduled during break periods (10:50–11:00 or 12:40–13:30)",
      });
    }

    const conflict = await Timetable.findOne({
      _id: { $ne: id },
      day,
      $or: [
        {
          faculty,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
        {
          classRef,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        message: "⚠️ Time conflict detected with another existing timetable entry.",
      });
    }

    currentEntry.classRef = classRef || currentEntry.classRef;
    currentEntry.faculty = faculty || currentEntry.faculty;
    currentEntry.subject = subject;
    currentEntry.day = day;
    currentEntry.startTime = startTime;
    currentEntry.endTime = endTime;

    await currentEntry.save();

    res.json(currentEntry);
  } catch (error) {
    console.error("Edit timetable error:", error);
    res.status(500).json({ message: "❌ Server error. Please try again later." });
  }
};



export const getOwnTimetable = async (req, res) => {
  try {
    const userId = req.user.userId;

    const faculty = await Faculty.findOne({ user: userId });
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const timetable = await Timetable.find({ faculty: faculty._id })
      .populate("classRef", "name department year")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json(timetable);
  } catch (err) {
    console.error("Error fetching faculty timetable:", err);
    res.status(500).json({ error: "Server error fetching timetable" });
  }
};
