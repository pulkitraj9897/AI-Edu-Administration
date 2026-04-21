import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  class: { type: String, required: true },
  day: { type: String, required: true },
  schedule: [{
    period: { type: Number, required: true },
    subject: { type: String, required: true },
    teacher: { type: String, required: true },
    room: { type: String, required: true },
    time: { type: String, required: true }
  }]
});

export default mongoose.model('Timetable', timetableSchema);
