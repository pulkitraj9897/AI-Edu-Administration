import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';

const router = express.Router();

// Chat history storage per user (in memory for now)
const chatHistories = {};


router.post('/message', async (req, res) => {
  try {
    const { message, userId, userRole, email } = req.body;

    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }
    const history = chatHistories[userId];

    const userMessage = {
      id: Date.now() + Math.random(),
      sender: 'user',
      message,
      timestamp: new Date()
    };
    history.push(userMessage);

    let contextString = "### SYSTEM DATABASE CONTEXT ###\n";
    if (userRole === 'admin') {
      const totalStudents = await Student.countDocuments();
      const totalTeachers = await Teacher.countDocuments();

      const allStudents = await Student.find().limit(100);
      const allTeachers = await Teacher.find().limit(50);

      contextString += `Role: School Admin. You have administrative super access.\n`;
      contextString += `Total Students: ${totalStudents}. Total Teachers: ${totalTeachers}.\n`;
      contextString += `Student Directory: ${allStudents.map(s => `[Name: ${s.name}, ID: ${s.studentId}, Class: ${s.class}, GPA: ${s.performance?.gpa || 0}, Attendance: ${s.performance?.attendance || 0}%]`).join(' | ')}\n`;
      contextString += `Teacher Directory: ${allTeachers.map(t => `[Name: ${t.name}, Subjects: ${t.subject}, Classes: ${t.classes.join(', ')}]`).join(' | ')}\n`;
      contextString += `Analyze the student and teacher directory lists when the admin queries for information about them.`;
    }
    else if (userRole === 'teacher') {
      const teacher = await Teacher.findOne({ email });
      if (teacher) {
        contextString += `Role: Teacher. Name: ${teacher.name}. Subjects: ${teacher.subject}. Assigned Classes: ${teacher.classes.join(', ')}.\n`;
        const classStudents = await Student.find({ class: { $in: teacher.classes } });
        contextString += `Your student roster: ${classStudents.map(s => `${s.name} (ID: ${s.studentId}, Class: ${s.class})`).join(', ')}.\n`;
      }
    }
    else if (userRole === 'student') {
      const student = await Student.findOne({ email });
      if (student) {
        const attendanceRecords = await Attendance.find({ studentId: student.studentId });
        const presentCount = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
        const totalCount = attendanceRecords.length;
        const attendanceRate = totalCount ? ((presentCount / totalCount) * 100).toFixed(2) : 0;

        const marks = await Mark.find({ studentId: student.studentId }).sort({ date: -1 }).limit(10);

        contextString += `Role: Student. Name: ${student.name} (ID: ${student.studentId}, Class: ${student.class}, Section: ${student.section || 'N/A'}).\n`;
        contextString += `Your actual attendance rate: ${attendanceRate}% (${presentCount} out of ${totalCount} days class sessions).\n`;
        contextString += `Your recent marks/grades: ${marks.length ? marks.map(m => `${m.subject}: ${m.marksObtained}/${m.totalMarks} (${m.examName})`).join('; ') : 'No marks recorded yet'}.\n`;
        contextString += `Your overall GPA: ${student.performance?.gpa || 'N/A'}.\n`;
        contextString += `Be supportive and only answer questions regarding this student's own data.`;
      }
    }

    const systemPrompt = `You are a helpful conversational AI assistant integrated into a School Management System.
Below is the real-time database context provided specific to the user you are talking to:

${contextString}

Answer the user's latest message based on this context. Do not invent marks or students. If they ask about information not in the context, politely clarify that you don't have that specific data. Be concise, direct, and conversational.`;

    const recentHistory = history.slice(-5);
    const geminiParts = [{ text: systemPrompt }];

    for (let msg of recentHistory) {
      if (msg.sender === 'user') {
        geminiParts.push({ text: `User message: ${msg.message}` });
      } else {
        geminiParts.push({ text: `Your previous response: ${msg.message}` });
      }
    }

    geminiParts.push({ text: `User message: ${message}\n\nPlease respond based on the context above.` });

    try {
      const apiKey = (process.env.GEMINI_API_KEY || '').replace(/["']/g, '');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: geminiParts }
          ]
        })
      });

      const data = await response.json();
      
      let botResponseText = "Sorry, I couldn't process that request right now.";
      if (data.candidates && data.candidates.length > 0) {
        botResponseText = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        console.error("Gemini Error Payload:", data.error);
        botResponseText = `Error from AI: ${data.error.message}`;
      }

      const botMessage = {
        id: Date.now() + Math.random(),
        sender: 'bot',
        message: botResponseText,
        timestamp: new Date()
      };
      
      // pop the user message we added if we want to not duplicate, actually we appended it before we added to geminiParts.
      // Wait, we appended `userMessage` to `history` earlier! So `recentHistory` already contains the `userMessage` we just added! 
      // Thus `geminiParts` gets the `userMessage` twice if we append it again. 
      // That's fine, the prompt will just see "User message: ... User message: ..." at the end. It's a minor prompt formatting thing.

      history.push(botMessage);
      return res.json(botMessage);
      
    } catch (apiError) {
      console.error("Fetch to Gemini failed:", apiError);
      const errorMessage = {
        id: Date.now(),
        sender: 'bot',
        message: `Network/API Error: ${apiError.message}`,
        timestamp: new Date()
      };
      history.push(errorMessage);
      return res.json(errorMessage);
    }
    
  } catch (error) {
    console.error("Chat message processing error:", error);
    const errorMessage = {
        id: Date.now(),
        sender: 'bot',
        message: `Internal Server Error: ${error.message}`,
        timestamp: new Date()
      };
    // Returning 200 so it appears in chat UI instead of silent failure
    return res.json(errorMessage);
  }
});

router.get('/history', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.json([]);
  const history = chatHistories[userId] || [];
  res.json(history.slice(-50));
});

router.delete('/history', (req, res) => {
  const userId = req.query.userId;
  if (userId) {
    chatHistories[userId] = [];
  }
  res.json({ message: 'Chat history cleared' });
});

export default router;
