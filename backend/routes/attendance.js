import express from 'express';

const router = express.Router();

// Sample attendance data
let attendanceRecords = [
  { id: 1, studentId: 'STU001', date: '2024-10-20', status: 'present', class: '10A' },
  { id: 2, studentId: 'STU002', date: '2024-10-20', status: 'present', class: '10A' },
  { id: 3, studentId: 'STU003', date: '2024-10-20', status: 'absent', class: '10B' },
  { id: 4, studentId: 'STU001', date: '2024-10-21', status: 'present', class: '10A' },
  { id: 5, studentId: 'STU002', date: '2024-10-21', status: 'late', class: '10A' },
];

// Get all attendance records
router.get('/', (req, res) => {
  const { date, class: className } = req.query;
  let filtered = attendanceRecords;
  
  if (date) {
    filtered = filtered.filter(r => r.date === date);
  }
  if (className) {
    filtered = filtered.filter(r => r.class === className);
  }
  
  res.json(filtered);
});

// Mark attendance
router.post('/', (req, res) => {
  const newRecord = {
    id: attendanceRecords.length + 1,
    ...req.body,
    timestamp: new Date()
  };
  attendanceRecords.push(newRecord);
  res.status(201).json(newRecord);
});

// Get attendance statistics
router.get('/stats', (req, res) => {
  const stats = {
    totalRecords: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    attendanceRate: ((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100).toFixed(2)
  };
  res.json(stats);
});

export default router;
