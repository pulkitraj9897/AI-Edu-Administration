import express from 'express';

const router = express.Router();

// Sample timetable data
const timetable = [
  {
    id: 1,
    class: '10A',
    day: 'Monday',
    schedule: [
      { period: 1, subject: 'Mathematics', teacher: 'Mr. Smith', time: '08:00-09:00', room: '101' },
      { period: 2, subject: 'English', teacher: 'Ms. Johnson', time: '09:00-10:00', room: '102' },
      { period: 3, subject: 'Science', teacher: 'Dr. Brown', time: '10:30-11:30', room: '201' },
      { period: 4, subject: 'History', teacher: 'Mr. Davis', time: '11:30-12:30', room: '103' }
    ]
  },
  {
    id: 2,
    class: '10A',
    day: 'Tuesday',
    schedule: [
      { period: 1, subject: 'Physics', teacher: 'Dr. Wilson', time: '08:00-09:00', room: '202' },
      { period: 2, subject: 'Chemistry', teacher: 'Ms. Taylor', time: '09:00-10:00', room: '203' },
      { period: 3, subject: 'Mathematics', teacher: 'Mr. Smith', time: '10:30-11:30', room: '101' },
      { period: 4, subject: 'Physical Education', teacher: 'Coach Anderson', time: '11:30-12:30', room: 'Gym' }
    ]
  }
];

// Get timetable
router.get('/', (req, res) => {
  const { class: className } = req.query;
  if (className) {
    const filtered = timetable.filter(t => t.class === className);
    return res.json(filtered);
  }
  res.json(timetable);
});

// Create timetable entry
router.post('/', (req, res) => {
  const newEntry = {
    id: timetable.length + 1,
    ...req.body
  };
  timetable.push(newEntry);
  res.status(201).json(newEntry);
});

export default router;
