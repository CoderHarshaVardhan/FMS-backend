import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import FacultyPerformance from '../models/FacultyPerformance.js';
import Feedback from "../models/Feedback.js"
import bcrypt from 'bcryptjs';
import LeaveRequest from '../models/LeaveRequest.js';
import Timetable from '../models/Timetable.js';


export const getAllFaculties = async (req, res) => {
    const faculties = await Faculty.find().populate('user', 'name email');
    res.json(faculties);
    console.log(faculties);
};


export const createFaculty = async (req, res) => {
    const {
        name, email, password,
        phone, department, department_id,
        position, salary, address,
        date_of_birth, hire_date
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });


    const defaultPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name: name,
        email: email,
        password: defaultPassword,
        role: "faculty",
    });

    const faculty = await Faculty.create({
        user: user._id,
        phone,
        department,
        department_id,
        position,
        salary,
        address,
        date_of_birth,
        hire_date
    });

    await FacultyPerformance.create({
        facultyId: faculty._id
    });

    res.status(201).json({ message: 'Faculty created successfully', faculty });
};



export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the faculty
    const faculty = await Faculty.findById(id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    // Update Faculty fields
    await Faculty.findByIdAndUpdate(id, updates);

    // If name or email is included, update the linked User
    if (updates.name || updates.email) {
      const user = await User.findById(faculty.user);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email;
        await user.save();
      }
    }

    res.json({ message: 'Faculty and user updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating faculty' });
  }
};


export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    await FacultyPerformance.findOneAndDelete({ facultyId: faculty.user });
    await Feedback.deleteMany({ faculty: faculty._id });
    await User.findByIdAndDelete(faculty.user);
    await LeaveRequest.deleteMany({ faculty: faculty._id });
    await Timetable.deleteMany({ faculty: faculty._id });

    await Faculty.findByIdAndDelete(id);

    res.json({ message: 'Faculty and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ message: 'Server error' });
  }
};