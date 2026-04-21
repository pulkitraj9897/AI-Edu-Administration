import mongoose from 'mongoose';
import Event from '../models/Event.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';

const indianHolidays = [
  { title: 'Republic Day', type: 'holiday', date: '2026-01-26' },
  { title: 'Holi', type: 'holiday', date: '2026-03-04' },
  { title: 'Good Friday', type: 'holiday', date: '2026-04-03' },
  { title: 'Eid al-Fitr', type: 'holiday', date: '2026-03-20' },
  { title: 'Independence Day', type: 'holiday', date: '2026-08-15' },
  { title: 'Mahatma Gandhi Jayanti', type: 'holiday', date: '2026-10-02' },
  { title: 'Dussehra', type: 'holiday', date: '2026-10-19' },
  { title: 'Diwali', type: 'holiday', date: '2026-11-08' },
  { title: 'Christmas', type: 'holiday', date: '2026-12-25' },
  { title: 'Annual Sports Meet', type: 'event', date: '2026-05-15', description: 'Inter-house sports competition' },
  { title: 'Mid-Term Exams Begin', type: 'exam', date: '2026-09-10', description: 'All classes' },
  { title: 'Final Exams Begin', type: 'exam', date: '2026-03-01', description: 'All classes' }
];

async function seedEvents() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');
        
        // Remove old generated events that match these titles to avoid duplicates
        await Event.deleteMany({ title: { $in: indianHolidays.map(h => h.title) } });
        
        const eventsToInsert = indianHolidays.map(h => ({
            ...h,
            targetAudience: 'all',
            date: new Date(h.date)
        }));
        
        await Event.insertMany(eventsToInsert);
        console.log('Successfully added holidays and demo events');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
}

seedEvents();
