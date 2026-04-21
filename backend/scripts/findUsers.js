import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';

async function findUsers() {
    await mongoose.connect(MONGODB_URI);
    const teacher = await User.findOne({ role: 'teacher' });
    const student = await User.findOne({ role: 'student' });
    console.log('Teacher:', teacher?.email);
    console.log('Student:', student?.email);
    process.exit(0);
}
findUsers();
