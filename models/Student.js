import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  department: String,
  department_id: String,   
  year: Number,
  rollNumber: String,
  phone: String,

  address: String,       
  date_of_birth: Date      
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
