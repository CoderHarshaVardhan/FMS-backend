import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  subject: { type: String, required: true },
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

export default mongoose.model('Timetable', timetableSchema);




