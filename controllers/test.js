import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const users = [
  { name: "Dr. A. Kumar", email: "akumar@example.com" },
  { name: "Dr. B. Rani", email: "brani@example.com" },
  { name: "Mr. C. Raj", email: "craj@example.com" },
  { name: "Ms. D. Sharma", email: "dsharma@example.com" },
  { name: "Dr. E. Verma", email: "everma@example.com" },
  { name: "Ms. F. Nair", email: "fnair@example.com" },
  { name: "Mr. G. Das", email: "gdas@example.com" },
  { name: "Dr. H. Iyer", email: "hiyer@example.com" },
  { name: "Ms. I. Reddy", email: "ireddy@example.com" },
  { name: "Mr. J. Khan", email: "jkhan@example.com" },
];

const defaultPassword = await bcrypt.hash("password123", 10);

try {
  for (let i = 0; i < users.length; i++) {
    const existingUser = await User.findOne({ email: users[i].email });

    let userId;

    if (existingUser) {
      userId = existingUser._id;
      console.log(`ℹ️ User already exists: ${users[i].email}`);
    } else {
      const newUser = new User({
        name: users[i].name,
        email: users[i].email,
        password: defaultPassword,
        role: "faculty",
      });
      const savedUser = await newUser.save();
      userId = savedUser._id;
      console.log(`✅ Created user: ${users[i].email}`);
    }

    const existingFaculty = await Faculty.findOne({ user: userId });

    if (!existingFaculty) {
      const faculty = new Faculty({
        user: userId,
        department: ["CSE", "ECE", "IT", "MECH", "CIVIL", "EEE", "AI&ML"][i % 7],
        department_id: `DPT-${100 + i}`,
        position: ["Assistant Professor", "Associate Professor", "Professor"][i % 3],
        salary: 50000 + i * 1000,
        phone: `98765432${10 + i}`,
        address: `Street ${i + 1}, City ABC`,
        date_of_birth: new Date(1980 + i, i % 12, 10 + i),
        hire_date: new Date(2010 + i % 10, i % 12, 1 + i),
      });
      await faculty.save();
      console.log(`✅ Added faculty for: ${users[i].email}`);
    } else {
      console.log(`ℹ️ Faculty already exists for: ${users[i].email}`);
    }
  }

  console.log("🎉 Done adding faculty members!");
  process.exit();
} catch (err) {
  console.error("❌ Error:", err);
  process.exit(1);
}
