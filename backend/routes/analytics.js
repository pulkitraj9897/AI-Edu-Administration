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
  res.json(analytics);
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

export default router;
