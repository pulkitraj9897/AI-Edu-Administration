import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['attendance', 'performance', 'ai-summary'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  studentId: {
    type: String // Optional: only if report is specific to a student
  },
  class: {
    type: String // Optional: only if report is specific to a class
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed // For storing startDate, endDate, semester, etc.
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // The actual dynamic content/results generated for the report
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', reportSchema);
