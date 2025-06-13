import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import FacultyPerformance from '../models/FacultyPerformance.js';


export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.userId});

    console.log(user);


    const profile = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === "student") {
      const student = await Student.findOne({ user: user.id });

      if (student) {
        profile.studentDetails = {
          department: student.department,
          department_id: student.department_id,
          year: student.year,
          rollNumber: student.rollNumber,
          phone: student.phone,
          address: student.address,
          date_of_birth: student.date_of_birth,
        };
      }
    }

     if (user.role === "faculty") {
      const faculty = await Faculty.findOne({ user: user._id });
      if (faculty) {
        profile.facultyDetails = {
          department: faculty.department,
          department_id: faculty.department_id,
          position: faculty.position,
          salary: faculty.salary,
          phone: faculty.phone,
          address: faculty.address,
          date_of_birth: faculty.date_of_birth,
          hire_date: faculty.hire_date,
        };
      }
    }
    console.log(profile);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, studentDetails, facultyDetails } = req.body;

    const updates = {};
    if (name) updates.name = name;

    // Update base User fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedStudent = null;
    let updatedFaculty = null;

    if (updatedUser.role === "student" && studentDetails) {
      const { phone, address, date_of_birth } = studentDetails;

      const studentUpdates = {};
      if (phone) studentUpdates.phone = phone;
      if (address) studentUpdates.address = address;
      if (date_of_birth) studentUpdates.date_of_birth = date_of_birth;

      updatedStudent = await Student.findOneAndUpdate(
        { user: req.user.userId },
        { $set: studentUpdates },
        { new: true }
      );
    }

    if (updatedUser.role === "faculty" && facultyDetails) {
      const {
        department,
        department_id,
        position,
        salary,
        phone,
        address,
        date_of_birth,
        hire_date,
      } = facultyDetails;

      const facultyUpdates = {};
      if (department) facultyUpdates.department = department;
      if (department_id) facultyUpdates.department_id = department_id;
      if (position) facultyUpdates.position = position;
      if (salary) facultyUpdates.salary = salary;
      if (phone) facultyUpdates.phone = phone;
      if (address) facultyUpdates.address = address;
      if (date_of_birth) facultyUpdates.date_of_birth = date_of_birth;
      if (hire_date) facultyUpdates.hire_date = hire_date;

      updatedFaculty = await Faculty.findOneAndUpdate(
        { user: req.user.userId },
        { $set: facultyUpdates },
        { new: true }
      );
    }

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      studentDetails: updatedStudent,
      facultyDetails: updatedFaculty,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};



export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.create({ name, email, password, role });

    if (role === 'faculty') {
      await FacultyPerformance.create({ facultyId: user._id });
    }

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};
