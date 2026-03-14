import express from 'express';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all students (accessible to all authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.email = req.user.email;
    }
    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID (accessible to all authenticated users)
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student (admin and teacher only)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const student = new Student({
    studentId: req.body.studentId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    class: req.body.class,
    section: req.body.section,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender, // make sure frontend sends this or it's optional
    address: req.body.address,
    parentName: req.body.parentName,
    parentPhone: req.body.parentPhone,
    photograph: req.body.photograph || null,
    status: req.body.status || 'active',
    performance: req.body.performance || { gpa: 0, attendance: 0 }
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student (admin and teacher only)
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (req.body.studentId) student.studentId = req.body.studentId;
    if (req.body.name) student.name = req.body.name;
    if (req.body.email) student.email = req.body.email;
    if (req.body.phone) student.phone = req.body.phone;
    if (req.body.class) student.class = req.body.class;
    if (req.body.section) student.section = req.body.section;
    if (req.body.dateOfBirth) student.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender) student.gender = req.body.gender;
    if (req.body.address) student.address = req.body.address;
    if (req.body.parentName) student.parentName = req.body.parentName;
    if (req.body.parentPhone) student.parentPhone = req.body.parentPhone;
    if (typeof req.body.photograph !== 'undefined') student.photograph = req.body.photograph;
    if (req.body.status) student.status = req.body.status;
    if (req.body.performance) student.performance = req.body.performance;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student (admin and teacher only)
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.deleteOne();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
