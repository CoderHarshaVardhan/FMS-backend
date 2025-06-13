
import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  department: String,
  department_id: String,   
  position: String,        
  salary: Number,         
  phone: String,

  address: String,         
  date_of_birth: Date,     
  hire_date: Date         
});

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
