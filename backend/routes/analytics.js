import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const predictionsCache = new Map();

// Get dashboard analytics
router.get('/dashboard', (req, res) => {
  const analytics = {
    totalStudents: 1250,
    totalTeachers: 85,
    totalClasses: 42,
    averageAttendance: 92.5,
    recentAlerts: [
      { id: 1, type: 'warning', message: 'Low attendance in Class 10B', timestamp: new Date() },
      { id: 2, type: 'info', message: '5 students need academic counseling', timestamp: new Date() }
    ],
    insights: [
      "Attendance patterns show improvement in morning sessions",
      "Consider additional support for Class 10B mathematics",
      "5 students may benefit from academic counseling"
    ],
    attendanceTrend: [
      { month: 'Jan', rate: 91 },
      { month: 'Feb', rate: 93 },
      { month: 'Mar', rate: 89 },
      { month: 'Apr', rate: 92 },
      { month: 'May', rate: 94 },
      { month: 'Jun', rate: 92.5 }
    ],
    performanceByClass: [
      { class: '10A', avgGPA: 3.6, students: 35 },
      { class: '10B', avgGPA: 3.4, students: 32 },
      { class: '11A', avgGPA: 3.8, students: 38 },
      { class: '11B', avgGPA: 3.5, students: 30 }
    ]
  };
  
  // Simulate network delay for loading states
  setTimeout(() => {
    res.json(analytics);
  }, 800);
});

// Get student performance predictions with AI
router.get('/predictions', protect, async (req, res) => {
  try {
    const forceRefresh = req.query.forceRefresh === 'true';
    const userId = req.user.id;
    const role = req.user.role;

    if (!forceRefresh && predictionsCache.has(userId)) {
      return res.json(predictionsCache.get(userId));
    }

    // Determine scope based on role
    let studentFilter = {};
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ email: req.user.email });
      if (teacher && teacher.classes && teacher.classes.length > 0) {
        studentFilter = { class: { $in: teacher.classes } };
      } else {
        studentFilter = { class: 'NONE' }; // Teacher with no classes
      }
    } else if (role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) {
        studentFilter = { studentId: student.studentId };
      }
    }

    // Fetch relevant students
    const students = await Student.find(studentFilter);
    const studentIds = students.map(s => s.studentId);

    // Fetch Attendance
    const attendances = await Attendance.find({ studentId: { $in: studentIds } });
    
    // Fetch Marks
    const marks = await Mark.find({ studentId: { $in: studentIds } });

    // Mathematical calculations for Performance Trend
    let performanceTrend = [
      { month: 'Jan', math: 75, science: 80, english: 85 },
      { month: 'Feb', math: 78, science: 82, english: 87 },
      { month: 'Mar', math: 82, science: 85, english: 89 },
      { month: 'Apr', math: 85, science: 88, english: 90 },
      { month: 'May', math: 88, science: 90, english: 92 },
    ];
    
    let skillsData = [
      { skill: 'Problem Solving', value: 85 },
      { skill: 'Critical Thinking', value: 78 },
      { skill: 'Communication', value: 92 },
      { skill: 'Creativity', value: 88 },
      { skill: 'Teamwork', value: 90 },
    ];
    let hasTakenTest = false;
    let aiInsights = null;
    let studentAnalytics = null;

    if (role === 'student' && students.length === 1) {
      const st = students[0];
      if (st.skillsProfile && st.skillsProfile.hasTakenTest) {
        hasTakenTest = true;
        skillsData = st.skillsProfile.skillsData;
        aiInsights = st.skillsProfile.aiInsights;
      }
      studentAnalytics = {
         gpa: st.performance?.gpa || 0,
         attendance: st.performance?.attendance || 0,
         rank: st.performance?.rank || 'N/A'
      };
    }

    // Identify At-Risk Students mathematically to save tokens (Attendance < 75 or GPA under 2.5)
    const studentSummaries = [];
    students.forEach(st => {
      const stAtt = attendances.filter(a => a.studentId === st.studentId);
      const present = stAtt.filter(a => a.status === 'present' || a.status === 'late').length;
      const attPerc = stAtt.length ? (present / stAtt.length) * 100 : 100;
      
      const stMarks = marks.filter(m => m.studentId === st.studentId);
      let gpa = 4.0;
      if (stMarks.length) {
        const avg = stMarks.reduce((sum, m) => sum + (m.marksObtained / (m.totalMarks || 100)) * 100, 0) / stMarks.length;
        gpa = (avg / 100) * 4.0;
      }
      
      if (attPerc < 75 || gpa < 2.5) {
        studentSummaries.push({
          id: st.studentId,
          name: st.name || st.studentId,
          attendance: Math.round(attPerc),
          gpa: gpa.toFixed(2),
          issues: attPerc < 75 ? 'Low Attendance' : 'Low Grades'
        });
      }
    });

    let atRiskStudents = [];
    let recommendations = [
      'Maintain current teaching strategies',
      'No critical at-risk students identified based on current algorithm.'
    ];

    // Call Gemini API if there are at-risk students
    if (studentSummaries.length > 0) {
      const apiKey = (process.env.GEMINI_API_KEY || '').replace(/["']/g, '');
      if (apiKey) {
        const prompt = `Analyze these at-risk students and provide recommendations strictly in this JSON format:
{
  "atRiskStudents": [
    { "studentId": "id", "name": "name", "riskLevel": "high/medium", "factors": ["reason 1", "reason 2"] }
  ],
  "recommendations": ["rec 1", "rec 2"]
}
Data: ${JSON.stringify(studentSummaries)}
Limit output strictly to valid JSON only, without any markdown formatting wrappers.`;

        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { response_mime_type: "application/json" }
            })
          });

          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
             const jsonStr = data.candidates[0].content.parts[0].text;
             const parsed = JSON.parse(jsonStr);
             if (parsed.atRiskStudents) atRiskStudents = parsed.atRiskStudents;
             if (parsed.recommendations) recommendations = parsed.recommendations;
          }
        } catch (geminiErr) {
          console.error("Gemini API Error:", geminiErr);
          // Fallback
          atRiskStudents = studentSummaries.map(s => ({
             studentId: s.id,
             name: s.name,
             riskLevel: s.gpa < 2.0 || s.attendance < 50 ? 'high' : 'medium',
             factors: [s.issues]
          }));
        }
      } else {
        // No key fallback
        atRiskStudents = studentSummaries.map(s => ({
           studentId: s.id,
           name: s.name,
           riskLevel: s.gpa < 2.0 || s.attendance < 50 ? 'high' : 'medium',
           factors: [s.issues]
        }));
      }
    } else {
       atRiskStudents = [
          { studentId: "N/A", name: "All students performing well", riskLevel: "low", factors: ["No risk factors flagged"] }
       ];
    }

    const finalPredictions = {
       atRiskStudents,
       recommendations,
       performanceTrend,
       skillsData,
       hasTakenTest,
       aiInsights,
       studentAnalytics
    };
    
    predictionsCache.set(userId, finalPredictions);
    res.json(finalPredictions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

// Get Student Dashboard Data
router.get('/student-dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const student = await Student.findOne({ email: user.email });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Calculate actual attendance
    const attendanceRecords = await Attendance.find({ studentId: student.studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    // Calculate attendance trend (by month)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const attendanceTrendMap = {};
    attendanceRecords.forEach(r => {
       const d = new Date(r.date);
       const month = months[d.getMonth()];
       if (!attendanceTrendMap[month]) attendanceTrendMap[month] = { total: 0, present: 0 };
       attendanceTrendMap[month].total++;
       if (r.status === 'present' || r.status === 'late') attendanceTrendMap[month].present++;
    });
    const attendanceTrend = Object.keys(attendanceTrendMap).map(m => ({
       month: m,
       rate: parseFloat(((attendanceTrendMap[m].present / attendanceTrendMap[m].total) * 100).toFixed(2))
    }));

    // Retrieve real marks
    const marksRecords = await Mark.find({ studentId: student.studentId }).sort({ date: -1 }).limit(5);
    const recentMarks = marksRecords.map(m => ({
       subject: m.subject || m.examName || 'Subject',
       score: m.marksObtained,
       grade: m.grade || (m.marksObtained > 90 ? 'A' : m.marksObtained > 80 ? 'B' : 'C')
    }));

    // GPA calculation mapping average to 4.0
    let totalScore = 0;
    marksRecords.forEach(m => totalScore += (m.marksObtained / (m.totalMarks || 100)) * 100);
    const avgScore = marksRecords.length > 0 ? totalScore / marksRecords.length : 0;
    const gpa = ((avgScore / 100) * 4.0).toFixed(2);

    // Update the student model's performance
    if (!student.performance) student.performance = { gpa: 0, attendance: 0 };
    student.performance.attendance = parseFloat(attendancePercentage);
    student.performance.gpa = parseFloat(gpa);
    
    // Calculate dynamic class rank based on GPA
    const classmates = await Student.find({ class: student.class });
    classmates.forEach(c => {
       if (c.studentId === student.studentId) {
           if (!c.performance) c.performance = { gpa: 0, attendance: 0 };
           c.performance.gpa = parseFloat(gpa);
       }
    });
    classmates.sort((a, b) => (b.performance?.gpa || 0) - (a.performance?.gpa || 0));
    const rank = classmates.findIndex(c => c.studentId === student.studentId) + 1;
    student.performance.rank = rank;

    await student.save();

    const dashboardData = {
      studentId: student.studentId,
      gpa: parseFloat(gpa),
      attendance: parseFloat(attendancePercentage),
      rank: student.performance.rank || '-',
      recentMarks: recentMarks.length > 0 ? recentMarks : [
        { subject: 'No exams yet', score: 0, grade: 'N/A' }
      ],
      attendanceTrend: attendanceTrend.length > 0 ? attendanceTrend : [
        { month: 'Current', rate: parseFloat(attendancePercentage) }
      ],
      upcomingAssignments: [
        { subject: 'General', title: 'Welcome to new term', dueDate: new Date(Date.now() + 86400000 * 5) }
      ]
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Teacher Dashboard Data
router.get('/teacher-dashboard/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  // Mock data assuming this might be a class teacher
  const isClassTeacher = true; 
  const dashboardData = {
    teacherId,
    totalClasses: 5,
    averageAttendance: 90.2, // Overall attendance for their classes
    recentAlerts: [
      { id: 1, type: 'warning', message: 'Low attendance in Class 10B (Your Class)', timestamp: new Date() }
    ],
    classTeacherOf: isClassTeacher ? '10B' : null,
    classAttendanceTrend: isClassTeacher ? [
      { month: 'Jan', rate: 91 },
      { month: 'Feb', rate: 93 },
      { month: 'Mar', rate: 89 }
    ] : [],
    performanceByClass: [
      { class: '10A', avgGPA: 3.6, students: 35 },
      { class: '10B', avgGPA: 3.4, students: 32 }
    ]
  };
  
  setTimeout(() => res.json(dashboardData), 600);
});

// Process Student Skills Test
router.post('/skills-test', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can take this test' });
    }

    const { answers } = req.body;
    let ps = 50, ct = 50, cm = 50, cr = 50, tw = 50;
    
    if (answers && answers.length >= 15) {
       const scoreMap = [40, 60, 80, 100];
       const getAvg = (indices) => {
          let sum = 0;
          indices.forEach(i => sum += scoreMap[answers[i]] || 70);
          return Math.round(sum / indices.length);
       };

       ps = getAvg([0, 1, 2]);
       ct = getAvg([3, 4, 5]);
       cm = getAvg([6, 7, 8]);
       cr = getAvg([9, 10, 11]);
       tw = getAvg([12, 13, 14]);
    }

    const skillsData = [
      { skill: 'Problem Solving', value: ps },
      { skill: 'Critical Thinking', value: ct },
      { skill: 'Communication', value: cm },
      { skill: 'Creativity', value: cr },
      { skill: 'Teamwork', value: tw },
    ];

    const studentSummary = `A student scored: Problem Solving: ${ps}, Critical Thinking: ${ct}, Communication: ${cm}, Creativity: ${cr}, Teamwork: ${tw}.`;

    let aiInsights = "Your abilities suggest a balanced profile with solid fundamental skills.";
    const apiKey = (process.env.GEMINI_API_KEY || '').replace(/["']/g, '');
    
    if (apiKey) {
        const prompt = `Based on the following student skills profile: ${studentSummary}. Provide exactly one short paragraph (max 3 sentences) of personalized insight and encouragement for this student. Do not use markdown.`;
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
             aiInsights = data.candidates[0].content.parts[0].text.replace(/\n(.*)/g, '').trim(); 
          }
        } catch (geminiErr) {
           console.error("Gemini API Error:", geminiErr);
        }
    }

    const student = await Student.findOne({ email: req.user.email });
    if (student) {
      student.skillsProfile = {
        hasTakenTest: true,
        skillsData,
        aiInsights
      };
      await student.save();
    }
    
    predictionsCache.delete(req.user.id);
    res.json({ message: "Test processed successfully", skillsData, aiInsights });
  } catch (error) {
    console.error("Skills Test Error:", error);
    res.status(500).json({ message: 'Error processing test' });
  }
});

export default router;
