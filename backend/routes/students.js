import express from 'express';

const router = express.Router();

// Sample student data
let students = [
  {
    id: 1,
    studentId: 'STU001',
    name: 'Alice Johnson',
    email: 'alice@school.com',
    phone: '555-0101',
    class: '10A',
    section: 'A',
    dateOfBirth: '2008-05-15',
    gender: 'female',
    parentName: 'Robert Johnson',
    parentPhone: '555-0201',
    status: 'active',
    performance: { gpa: 3.8, attendance: 95, rank: 5 }
  },
  {
    id: 2,
    studentId: 'STU002',
    name: 'Bob Smith',
    email: 'bob@school.com',
    phone: '555-0102',
    class: '10A',
    section: 'A',
    dateOfBirth: '2008-03-22',
    gender: 'male',
    parentName: 'Sarah Smith',
    parentPhone: '555-0202',
    status: 'active',
    performance: { gpa: 3.5, attendance: 88, rank: 12 }
  },
  {
    id: 3,
    studentId: 'STU003',
    name: 'Charlie Brown',
    email: 'charlie@school.com',
    phone: '555-0103',
    class: '10B',
    section: 'B',
    dateOfBirth: '2008-07-10',
    gender: 'male',
    parentName: 'Lucy Brown',
    parentPhone: '555-0203',
    status: 'active',
    performance: { gpa: 3.9, attendance: 98, rank: 2 }
  }
];

// Get all students
router.get('/', (req, res) => {
  res.json(students);
});

// Get student by ID
router.get('/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

// Create new student
router.post('/', (req, res) => {
  const newStudent = {
    id: students.length + 1,
    ...req.body,
    studentId: `STU${String(students.length + 1).padStart(3, '0')}`
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Update student
router.put('/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// Delete student
router.delete('/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  students.splice(index, 1);
  res.json({ message: 'Student deleted successfully' });
});

export default router;
