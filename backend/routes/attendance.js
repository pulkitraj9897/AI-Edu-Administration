import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Teacher from '../models/Teacher.js';

const router = express.Router();

// Get all attendance records for a specific date and class
router.get('/', protect, async (req, res) => {
  try {
    const { date, class: className } = req.query;
    let filter = {};
    
    // Parse the date accurately (handling timezone shifts)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) filter.studentId = student.studentId;
    } else if (className && className !== 'all') {
      filter.class = className;
    }
    
    // Using lean() for faster read operations
    const records = await Attendance.find(filter).lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark or update attendance (Upsert) - Admin/Teacher only
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, date, status, class: className, period, markedBy } = req.body;
    
    // Validate student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: `Student ${studentId} not found` });
    }

    if (req.user.role === 'teacher') {
       const teacher = await Teacher.findOne({ email: req.user.email });
       if (!teacher) return res.status(403).json({ message: 'Teacher profile not found' });
       if (!teacher.classes.includes(student.class)) {
           return res.status(403).json({ message: `Unauthorized: You are not assigned to class ${student.class}` });
       }
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const filter = {
      studentId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    };

    const update = {
      studentId,
      date: targetDate,
      status,
      class: className || student.class,
      period,
      markedBy,
      timestamp: new Date()
    };

    // Find and update if exists, otherwise create new (upsert: true)
    const record = await Attendance.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    res.status(200).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update specific attendance record by ID - Admin/Teacher only
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (req.body.status) record.status = req.body.status;
    if (req.body.class) record.class = req.body.class;
    if (req.body.period) record.period = req.body.period;
    record.timestamp = new Date();

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete specific attendance record - Admin/Teacher only
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    await record.deleteOne();
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics
router.get('/stats', protect, async (req, res) => {
  try {
    // You can also filter stats by date/class if needed here passing query params
    const { date, class: className } = req.query;
    let filter = {};

    if (date) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      filter.date = {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) filter.studentId = student.studentId;
    } else if (className && className !== 'all') {
      filter.class = className;
    }

    const records = await Attendance.find(filter);
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    
    const attendanceRate = totalRecords === 0 ? 0 : ((presentCount / totalRecords) * 100).toFixed(2);

    res.json({
      totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      attendanceRate
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
