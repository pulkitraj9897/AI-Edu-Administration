import express from 'express';
import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get timetable
router.get('/', async (req, res) => {
  try {
    const { class: className } = req.query;
    let query = {};
    if (className) query.class = className;
    const timetables = await Timetable.find(query);
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create timetable entry
router.post('/', async (req, res) => {
  try {
    const newEntry = new Timetable(req.body);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update timetable entry
router.put('/:id', async (req, res) => {
  try {
    const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Timetable entry not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mathematical Target Target Generator
router.post('/generate', async (req, res) => {
  try {
     const { class: className } = req.body;
     if (!className) return res.status(400).json({message: "Class required"});

     // Clear existing for this class
     await Timetable.deleteMany({ class: className });

     const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
     const periods = [
        { period: 1, time: '08:00-09:00' },
        { period: 2, time: '09:00-10:00' },
        { period: 3, time: '10:30-11:30' },
        { period: 4, time: '11:30-12:30' }
     ];

     let teachers = await Teacher.find({ classes: className });
     if (teachers.length === 0) {
        teachers = await Teacher.find({});
     }

     const allTimetables = await Timetable.find();
     
     const isTeacherBusy = (teacherName, day, blockPeriod) => {
        for (const t of allTimetables) {
          if (t.day === day) {
             const collision = t.schedule.find(s => s.period === blockPeriod && s.teacher === teacherName);
             if (collision) return true;
          }
        }
        return false;
     };

     const generated = [];

     for (const day of days) {
        const daySchedule = [];
        for (const p of periods) {
            const usedSubjectsThatDay = daySchedule.map(s => s.subject);
            
            let available = teachers.filter(t => !isTeacherBusy(t.name, day, p.period));
            
            let optimal = available.filter(t => !usedSubjectsThatDay.includes(t.subject));
            if (optimal.length > 0) available = optimal;

            if (available.length > 0) {
               // Cycle the teachers deterministically based on day and period indices to spread them out
               const selIndex = (days.indexOf(day) + p.period) % available.length;
               const selected = available[selIndex];
               daySchedule.push({
                   period: p.period,
                   time: p.time,
                   subject: selected.subject,
                   teacher: selected.name,
                   room: `Rm-${Math.floor(Math.random() * 90) + 10}`
               });
               allTimetables.push({ day, schedule: [{ period: p.period, teacher: selected.name }] });
            } else {
               daySchedule.push({
                   period: p.period,
                   time: p.time,
                   subject: 'Study Hall',
                   teacher: 'Staff',
                   room: 'Library'
               });
            }
        }
        
        const newTimetable = new Timetable({ class: className, day, schedule: daySchedule });
        await newTimetable.save();
        generated.push(newTimetable);
     }

     res.json(generated);
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
});

export default router;
