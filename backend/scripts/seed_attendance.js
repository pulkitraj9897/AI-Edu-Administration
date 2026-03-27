import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';

const seedAttendance = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for seeding attendance');

    // Find all students
    const students = await Student.find();
    if (students.length === 0) {
      console.log('No students found. Please run seed.js first.');
      process.exit(0);
    }

    // Generate last 15 days of attendance
    const attendancesToInsert = [];
    
    for (const student of students) {
      for (let i = 1; i <= 15; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        // Random attendance (mostly present, some absent/late)
        const rand = Math.random();
        let status = 'present';
        if (rand > 0.9) status = 'absent';
        else if (rand > 0.8) status = 'late';
        
        attendancesToInsert.push(new Attendance({
          studentId: student.studentId,
          date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          status: status,
          class: student.class
        }));
      }
    }

    console.log(`💾 Inserting ${attendancesToInsert.length} attendance records...`);
    await Attendance.insertMany(attendancesToInsert);

    console.log('✅ Attendance data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding attendance:', error.message);
    process.exit(1);
  }
};

seedAttendance();
