import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import timetableRoutes from './routes/timetable.js';
import analyticsRoutes from './routes/analytics.js';
import reportsRoutes from './routes/reports.js';
import chatbotRoutes from './routes/chatbot.js';
import notificationRoutes from './routes/notifications.js';
import marksRoutes from './routes/marks.js';
import eventsRoutes from './routes/events.js';
import documentRoutes from './routes/documents.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection (Optional - can be commented out if not using MongoDB yet)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  MongoDB URI not found. Running without database connection.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
