import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  endDate: { type: Date },
  type: { type: String, enum: ['holiday', 'event', 'exam', 'other'], default: 'event' },
  targetAudience: { type: String, enum: ['all', 'admin', 'teacher', 'student'], default: 'all' },
  targetClass: { type: String, default: null }, // If targetAudience is 'student' and it applies to a specific class
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Event', eventSchema);
