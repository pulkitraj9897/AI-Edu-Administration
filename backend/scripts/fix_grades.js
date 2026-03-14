import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mark from '../models/Mark.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';

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

const fixGrades = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const allMarks = await Mark.find();
    console.log(`Checking ${allMarks.length} total mark records...`);
    
    let updated = 0;
    for (let m of allMarks) {
        const correctGrade = calculateGrade(m.marksObtained, m.totalMarks);
        if (m.grade !== correctGrade) {
            m.grade = correctGrade;
            await m.save();
            updated++;
        }
    }
    
    console.log(`✅ Successfully calculated and updated grades for ${updated} mark records.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing grades:', error);
    process.exit(1);
  }
};

fixGrades();
