import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';

const router = express.Router();

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

// Get student performance predictions (AI placeholder)
router.get('/predictions', (req, res) => {
  const predictions = {
    atRiskStudents: [
      { studentId: 'STU045', name: 'John Doe', riskLevel: 'high', factors: ['Low attendance', 'Declining grades'] },
      { studentId: 'STU089', name: 'Jane Smith', riskLevel: 'medium', factors: ['Missing assignments'] }
    ],
    recommendations: [
      'Schedule counseling for at-risk students',
      'Implement peer tutoring program',
      'Increase parent engagement'
    ]
  };
  res.json(predictions);
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

export default router;
