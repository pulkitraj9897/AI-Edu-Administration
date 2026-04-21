import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  class: { type: String, required: true },
  section: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  photograph: { type: String, default: null },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  performance: {
    gpa: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    rank: { type: Number }
  },
  skillsProfile: {
    hasTakenTest: { type: Boolean, default: false },
    skillsData: [{
      skill: String,
      value: Number
    }],
    aiInsights: { type: String, default: null }
  }
});

export default mongoose.model('Student', studentSchema);
