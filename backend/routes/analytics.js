import express from 'express';

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
router.get('/student-dashboard/:studentId', (req, res) => {
  const { studentId } = req.params;
  const dashboardData = {
    studentId,
    gpa: 3.8,
    attendance: 94.5,
    rank: 12,
    recentMarks: [
      { subject: 'Mathematics', score: 92, grade: 'A' },
      { subject: 'Science', score: 88, grade: 'B+' },
      { subject: 'English', score: 95, grade: 'A+' }
    ],
    attendanceTrend: [
      { month: 'Jan', rate: 95 },
      { month: 'Feb', rate: 92 },
      { month: 'Mar', rate: 96 }
    ],
    upcomingAssignments: [
      { subject: 'Science', title: 'Lab Report', dueDate: new Date(Date.now() + 86400000 * 3) },
      { subject: 'English', title: 'Essay Submission', dueDate: new Date(Date.now() + 86400000 * 5) }
    ]
  };
  setTimeout(() => res.json(dashboardData), 500);
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
