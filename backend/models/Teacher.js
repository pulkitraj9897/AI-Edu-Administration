import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  classes: [{ type: String }],
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isClassTeacher: { type: Boolean, default: false },
  classTeacherOf: { type: String, default: null },
  performance: {
    rating: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 }
  }
});

export default mongoose.model('Teacher', teacherSchema);
