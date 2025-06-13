import mongoose from 'mongoose';
import Class from './models/Class.js'
import dotenv from 'dotenv'; // Make sure this path is correct

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI ; // replace with your DB name

async function insertClasses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existing = await Class.find({ name: { $in: ["CSE-A", "CSE-B", "CSE-C"] } });

    if (existing.length === 0) {
      await Class.insertMany([
        { name: "CSE-A", department: "CSE", year: 3 },
        { name: "CSE-B", department: "CSE", year: 3 },
        { name: "CSE-C", department: "CSE", year: 3 },
      ]);
      console.log("Classes inserted successfully.");
    } else {
      console.log("Some or all classes already exist, skipping insertion.");
    }

  } catch (error) {
    console.error("Error inserting classes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

insertClasses();
