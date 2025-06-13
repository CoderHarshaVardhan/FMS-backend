import Student from '../models/Student.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';


export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email role');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createStudent = async (req, res) => {
    try {
        const { name, email, password, department, department_id, year, rollNumber, phone, address, date_of_birth } = req.body;
        console.log(req.body);

        if (!name || !email || !password || !department || !department_id || !year || !rollNumber || !phone || !address || !date_of_birth) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const defaultPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: name,
            email: email,
            password: defaultPassword,
            role: 'student'
        });
        await user.save();

        const student = new Student({
            user: user._id,
            department,
            department_id,
            year,
            rollNumber,
            phone,
            address,
            date_of_birth,
        });

        await student.save();

        res.status(201).json({ message: 'Student created successfully' });
    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, department, department_id, year, rollNumber, phone, address, date_of_birth } = req.body;

        const student = await Student.findById(id);
        console.log(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const user = await User.findById(student.user);
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();

        student.department = department;
        student.department_id = department_id;
        student.year = year;
        student.rollNumber = rollNumber;
        student.phone = phone;
        student.address = address;
        student.date_of_birth = date_of_birth;

        await student.save();

        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        await User.findByIdAndDelete(student.user);

        await Student.findByIdAndDelete(id);

        res.json({ message: 'Student and associated user deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

