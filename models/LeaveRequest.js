import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { type: String, enum: ['Casual', 'Sick', 'Other'], default: 'Other' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectedReason: {type: String},
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('LeaveRequest', leaveRequestSchema);
