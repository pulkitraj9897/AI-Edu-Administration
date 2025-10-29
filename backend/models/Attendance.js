import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  class: { type: String, required: true },
  period: { type: String },
  markedBy: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Attendance', attendanceSchema);
