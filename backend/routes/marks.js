import express from 'express';
import Mark from '../models/Mark.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

import Teacher from '../models/Teacher.js';

const router = express.Router();

// Get all marks (accessible to all authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (!student) return res.status(404).json({ message: 'Student profile not associated with this account.' });
      filter.studentId = student.studentId;
    } else if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }
    const marks = await Mark.find(filter).sort({ date: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new mark (admin and teacher only)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, examName, subject, marksObtained, totalMarks, grade, date } = req.body;
    
    // Check if student exists
    const studentExists = await Student.findOne({ studentId });
    if (!studentExists) {
      return res.status(404).json({ message: `Student with ID ${studentId} not found` });
    }

    if (req.user.role === 'teacher') {
       const teacher = await Teacher.findOne({ email: req.user.email });
       if (!teacher) return res.status(403).json({ message: 'Teacher profile not found' });
       if (teacher.subject.toLowerCase() !== subject.toLowerCase()) {
           return res.status(403).json({ message: `Unauthorized: You can only add marks for ${teacher.subject}` });
       }
       if (!teacher.classes.includes(studentExists.class)) {
           return res.status(403).json({ message: `Unauthorized: You are not assigned to class ${studentExists.class}` });
       }
    }

    const mark = new Mark({
      studentId,
      examName,
      subject,
      marksObtained,
      totalMarks,
      grade: grade || calculateGrade(marksObtained, totalMarks),
      date: date ? new Date(date) : new Date()
    });

    const newMark = await mark.save();
    
    res.status(201).json(newMark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a mark (admin and teacher only)
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ email: req.user.email });
      if (!teacher) return res.status(403).json({ message: 'Teacher profile not found' });
      
      const incomingSubject = req.body.subject || mark.subject;
      if (teacher.subject.toLowerCase() !== incomingSubject.toLowerCase()) {
          return res.status(403).json({ message: `Unauthorized: You are assigned to ${teacher.subject}, cannot edit ${incomingSubject}` });
      }

      const incomingStudentId = req.body.studentId || mark.studentId;
      const studentExists = await Student.findOne({ studentId: incomingStudentId });
      if (studentExists && !teacher.classes.includes(studentExists.class)) {
          return res.status(403).json({ message: `Unauthorized: You are not assigned to class ${studentExists.class}` });
      }
    }

    if (req.body.studentId) mark.studentId = req.body.studentId;
    if (req.body.examName) mark.examName = req.body.examName;
    if (req.body.subject) mark.subject = req.body.subject;
    if (typeof req.body.marksObtained !== 'undefined') mark.marksObtained = req.body.marksObtained;
    if (typeof req.body.totalMarks !== 'undefined') mark.totalMarks = req.body.totalMarks;
    
    // Recalculate grade if marks changed and grade wasn't explicitly provided
    if (req.body.grade) {
      mark.grade = req.body.grade;
    } else if (typeof req.body.marksObtained !== 'undefined' || typeof req.body.totalMarks !== 'undefined') {
      mark.grade = calculateGrade(mark.marksObtained, mark.totalMarks);
    }

    if (req.body.date) mark.date = new Date(req.body.date);

    const updatedMark = await mark.save();
    res.json(updatedMark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a mark (admin and teacher only)
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    
    await mark.deleteOne();
    res.json({ message: 'Mark record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate grade
function calculateGrade(obtained, total) {
  if (!total || total === 0) return 'N/A';
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

export default router;
