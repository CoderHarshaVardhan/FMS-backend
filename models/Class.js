
import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  department: { type: String, required: true },
  year: { type: Number, required: true } 
});

export default mongoose.model('Class', classSchema);

