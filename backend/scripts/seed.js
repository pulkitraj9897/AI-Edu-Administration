import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Event from '../models/Event.js';
import Mark from '../models/Mark.js';
import Attendance from '../models/Attendance.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';

const maleFirstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Ansh', 'Aryan', 'Dhruv', 'Rohan', 'Rahul', 'Amit', 'Sanjay', 'Vikram', 'Raj', 'Karan', 'Dev', 'Arjun', 'Neil'];
const femaleFirstNames = ['Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Anika', 'Navya', 'Diya', 'Myra', 'Isha', 'Riya', 'Sneha', 'Priya', 'Anjali', 'Neha', 'Pooja', 'Kavita', 'Smriti', 'Kirti'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Joshi', 'Mishra', 'Chauhan', 'Reddy', 'Rao', 'Das', 'Sen', 'Bose', 'Nair', 'Pillai', 'Yadav', 'Pandey', 'Deshmukh'];
const subjects = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Geography', 'Economics'];

const getRandomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmail = (firstName, lastName, domain = 'school.com') => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 99)}@${domain}`;
};

const generatePhone = () => {
    return `+91 ${getRandomInt(9000000000, 9999999999)}`;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Event.deleteMany();
    await Mark.deleteMany();
    await Attendance.deleteMany();
    console.log('🗑️  All old data cleared');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const defaultPassword = await bcrypt.hash('password123', 10);

    const usersToInsert = [];
    const studentsToInsert = [];
    const teachersToInsert = [];
    const eventsToInsert = [];
    const marksToInsert = [];
    const attendancesToInsert = [];

    // 1. Create Admins
    usersToInsert.push(new User({
      name: 'System Admin',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'admin'
    }));

    // 2. Create Teachers
    console.log('🧑‍🏫 Generating Teachers...');
    for (let i = 1; i <= 15; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = getRandomChoice(isMale ? maleFirstNames : femaleFirstNames);
        const lastName = getRandomChoice(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const email = generateEmail(firstName, lastName);
        const subject = getRandomChoice(subjects);
        const teacherId = `TCH${i.toString().padStart(3, '0')}`;

        usersToInsert.push(new User({ name: fullName, email, password: defaultPassword, role: 'teacher' }));
        
        teachersToInsert.push(new Teacher({
            teacherId,
            name: fullName,
            email,
            phone: generatePhone(),
            subject,
            classes: ['10A', '10B', '11A'], // Simplified assignment
            status: 'active',
            performance: { rating: getRandomInt(35, 50) / 10, attendance: getRandomInt(85, 100) }
        }));
    }

    // 3. Create Students across Classes 6-12, Sections A-B
    console.log('🧑‍🎓 Generating Students...');
    const classes = ['6', '7', '8', '9', '10', '11', '12'];
    const sections = ['A', 'B'];
    let studentCounter = 1;

    for (let cls of classes) {
        for (let sec of sections) {
            const classString = `${cls}${sec}`;
            // Let's generate 5 students per section
            for (let i = 0; i < 5; i++) {
                const isMale = Math.random() > 0.5;
                const firstName = getRandomChoice(isMale ? maleFirstNames : femaleFirstNames);
                const lastName = getRandomChoice(lastNames);
                const fullName = `${firstName} ${lastName}`;
                const email = generateEmail(firstName, lastName, 'student.com');
                const stId = `STU${studentCounter.toString().padStart(3, '0')}`;

                usersToInsert.push(new User({ name: fullName, email, password: defaultPassword, role: 'student' }));

                studentsToInsert.push(new Student({
                    studentId: stId,
                    name: fullName,
                    email,
                    phone: generatePhone(),
                    class: classString,
                    section: sec,
                    gender: isMale ? 'male' : 'female',
                    parentName: `${getRandomChoice(maleFirstNames)} ${lastName}`,
                    parentPhone: generatePhone(),
                    status: 'active',
                    performance: { gpa: getRandomInt(60, 100) / 10, attendance: getRandomInt(70, 100) }
                }));

                // Generate Marks
                marksToInsert.push(new Mark({
                    studentId: stId, examName: 'Midterm', subject: 'Mathematics', marksObtained: getRandomInt(40, 100), totalMarks: 100
                }));
                marksToInsert.push(new Mark({
                    studentId: stId, examName: 'Midterm', subject: 'Science', marksObtained: getRandomInt(40, 100), totalMarks: 100
                }));

                // Generate Attendance
                const today = new Date();
                attendancesToInsert.push(new Attendance({
                    studentId: stId,
                    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                    status: Math.random() > 0.1 ? 'present' : 'absent',
                    class: classString
                }));

                studentCounter++;
            }
        }
    }

    // 4. Create Events
    console.log('📅 Generating Events...');
    const curDate = new Date();
    eventsToInsert.push(new Event({
        title: 'Diwali Break', type: 'holiday', targetAudience: 'all', date: new Date(curDate.getFullYear(), 9, 20)
    }));
    eventsToInsert.push(new Event({
        title: 'Midterm Examinations', type: 'exam', targetAudience: 'student', date: new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + 5)
    }));
    eventsToInsert.push(new Event({
        title: 'Annual Science Fair', type: 'event', targetAudience: 'all', date: new Date(curDate.getFullYear(), curDate.getMonth() + 1, 15), description: 'Showcase of student science projects.'
    }));

    // Execute Bulk Inserts
    console.log('💾 Inserting records into database. This might take a few seconds...');
    await User.insertMany(usersToInsert);
    await Teacher.insertMany(teachersToInsert);
    await Student.insertMany(studentsToInsert);
    await Mark.insertMany(marksToInsert);
    await Attendance.insertMany(attendancesToInsert);
    await Event.insertMany(eventsToInsert);

    console.log('✅ Database seeded comprehensively!');
    console.log(`- Users: ${usersToInsert.length} (Password for all generated users: 'password123', admin is 'admin123')`);
    console.log(`- Teachers: ${teachersToInsert.length}`);
    console.log(`- Students: ${studentsToInsert.length}`);
    console.log(`- Marks: ${marksToInsert.length}`);
    console.log(`- Attendance: ${attendancesToInsert.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
