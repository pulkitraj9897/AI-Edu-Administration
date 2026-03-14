import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  examName: { type: String, required: true },
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Mark', markSchema);
