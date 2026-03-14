import express from 'express';
import Teacher from '../models/Teacher.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all teachers (accessible to all authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new teacher (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  const teacher = new Teacher({
    teacherId: req.body.teacherId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    classes: req.body.classes || [],
    status: req.body.status || 'active',
    performance: req.body.performance || { rating: 0, attendance: 0 }
  });

  try {
    const newTeacher = await teacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update teacher (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (req.body.teacherId) teacher.teacherId = req.body.teacherId;
    if (req.body.name) teacher.name = req.body.name;
    if (req.body.email) teacher.email = req.body.email;
    if (req.body.phone) teacher.phone = req.body.phone;
    if (req.body.subject) teacher.subject = req.body.subject;
    if (req.body.classes) teacher.classes = req.body.classes;
    if (req.body.status) teacher.status = req.body.status;
    if (req.body.performance) teacher.performance = req.body.performance;

    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete teacher (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await teacher.deleteOne();
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
