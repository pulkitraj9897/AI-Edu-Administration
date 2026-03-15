import express from 'express';
import Document from '../models/Document.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all documents
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      // Students only see documents assigned to their class
      const student = await Student.findOne({ email: req.user.email });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      filter.class = student.class;
    } else if (req.user.role === 'teacher') {
      // Teachers only see documents they uploaded
      filter.uploaderId = req.user.id;
    }
    // Admins see all documents, so filter stays {}

    // optionally filter by query params
    if (req.query.class && req.user.role !== 'student') filter.class = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new document (Teacher or Admin)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, url, class: assignmentClass, subject } = req.body;

    if (!title || !url || !assignmentClass || !subject) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Additional security for Teachers:
    // Only let them post for classes/subjects they teach
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ email: req.user.email });
      if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
      
      if (!teacher.classes.includes(assignmentClass) || teacher.subject !== subject) {
        return res.status(403).json({ message: `You are not authorized to upload documents for ${assignmentClass} - ${subject}` });
      }
    }

    const document = new Document({
      title,
      description: description || '',
      url,
      class: assignmentClass,
      subject,
      uploaderId: req.user.id,
      uploaderName: req.user.name
    });

    const newDocument = await document.save();
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE a document
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Teachers can only delete their own documents
    if (req.user.role === 'teacher' && document.uploaderId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await document.deleteOne();
    res.json({ message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
