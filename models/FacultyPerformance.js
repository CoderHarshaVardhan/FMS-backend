import mongoose from 'mongoose';




const facultyPerformanceSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  classesHandled: { type: Number, default: 0 },
  feedbackScores: [{ type: Number }],
  researchPapers: [{
    title: String,
    year: Number,
  }],
  attendanceRate: { type: Number, default: 0 },
}, { timestamps: true });

const FacultyPerformance = mongoose.model('FacultyPerformance', facultyPerformanceSchema);

export default FacultyPerformance;

