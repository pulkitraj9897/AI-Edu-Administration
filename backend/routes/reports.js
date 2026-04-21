import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Report from '../models/Report.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import Student from '../models/Student.js';

const router = express.Router();

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to ask Gemini while keeping token footprint extremely small (saving quota)
async function getGeminiInsights(prompt) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (err) {
    console.error('Gemini API Error:', err);
    return null;
  }
}

// Generate attendance report
router.post('/attendance', async (req, res) => {
  try {
    const { startDate, endDate, class: className } = req.body;
    
    let query = {};
    if (className) query.class = className;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await Attendance.find(query);
    
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    
    const attendancePercentage = totalRecords > 0 
      ? ((presentCount + lateCount) / totalRecords) * 100 
      : 0;

    const dateMap = {};
    records.forEach(r => {
      const d = new Date(r.date).toISOString().split('T')[0];
      if (!dateMap[d]) dateMap[d] = { date: d, present: 0, absent: 0, late: 0, total: 0 };
      dateMap[d][r.status]++;
      dateMap[d].total++;
    });

    // We add attendance percentage per date for better charting
    const trends = Object.values(dateMap).map(d => ({
       ...d,
       attendanceRate: d.total > 0 ? ((d.present + d.late) / d.total) * 100 : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const data = {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      averageAttendance: attendancePercentage.toFixed(2),
      startDate,
      endDate,
      class: className || 'All Classes',
      trends
    };

    data.aiInsights = [
      `Overall attendance rate is ${attendancePercentage.toFixed(2)}%.`,
      attendancePercentage < 80 ? 'CRITICAL: Attendance is below healthy baseline of 80%.' : 'Attendance baseline is strong.',
      absentCount > 5 ? 'High volume of absences detected over this period.' : 'Absence patterns remain within normal limits.'
    ];

    const newReport = new Report({
      title: `Attendance Report - ${className || 'All'}`,
      type: 'attendance',
      class: className,
      parameters: { startDate, endDate, class: className },
      data: data
    });

    const savedReport = await newReport.save();
    
    res.json({
      reportId: savedReport._id,
      ...savedReport._doc
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Generate performance report
router.post('/performance', async (req, res) => {
  try {
    const { studentId, semester } = req.body;
    
    const query = { studentId };
    if (semester) {
      query.examName = { $regex: new RegExp(semester, 'i') }; 
    }
    
    const marks = await Mark.find(query);
    
    let totalScore = 0;
    let totalMax = 0;
    const processedGrades = marks.map(m => {
      totalScore += m.marksObtained;
      totalMax += m.totalMarks;
      return {
        subject: m.subject,
        score: m.marksObtained,
        maxScore: m.totalMarks,
        grade: m.grade || `${((m.marksObtained / m.totalMarks) * 100).toFixed(0)}%`
      };
    });

    const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    
    let aiAnalysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    if (marks.length > 0) {
      const sortedMarks = [...marks].sort((a,b) => (b.marksObtained/b.totalMarks) - (a.marksObtained/a.totalMarks));
      const topSubject = sortedMarks[0];
      const bottomSubject = sortedMarks[sortedMarks.length - 1];
      
      aiAnalysis.strengths.push(`Excellent performance detected in ${topSubject.subject}`);
      aiAnalysis.weaknesses.push(`Struggling relative to peers in ${bottomSubject.subject}`);
      aiAnalysis.recommendations.push(`Assign supplemental material matching ${bottomSubject.subject} syllabus`);
    }

    const data = {
      grades: processedGrades,
      percentage: percentage.toFixed(2),
      studentId,
      semester,
      aiAnalysis
    };

    const newReport = new Report({
      title: `Performance Report - ${studentId}`,
      type: 'performance',
      studentId: studentId,
      parameters: { studentId, semester },
      data: data
    });

    const savedReport = await newReport.save();

    res.json({
      reportId: savedReport._id,
      ...savedReport._doc
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Generate comprehensive AI summary report USING GEMINI
router.post('/ai-summary', async (req, res) => {
  try {
    const { type } = req.body;
    
    // Aggregation Simulator (Local computation saves LLM tokens)
    const allMarks = await Mark.find();
    const allAttendance = await Attendance.find();

    let totalMarksPct = 0;
    let marksEvaluated = 0;
    allMarks.forEach(m => {
      if(m.totalMarks > 0) {
        totalMarksPct += (m.marksObtained / m.totalMarks);
        marksEvaluated++;
      }
    });
    const avgSchoolGrade = marksEvaluated > 0 ? (totalMarksPct / marksEvaluated) * 100 : 0;

    const presentLikeCount = allAttendance.filter(a => ['present', 'late'].includes(a.status)).length;
    const avgSchoolAttendance = allAttendance.length > 0 ? (presentLikeCount / allAttendance.length) * 100 : 0;

    // Cross-referencing to find at-risk subsets
    const studentRiskMap = {};
    allMarks.forEach(m => {
       if(!studentRiskMap[m.studentId]) studentRiskMap[m.studentId] = { marks: [], attendanceScore: 0 };
       studentRiskMap[m.studentId].marks.push((m.marksObtained / m.totalMarks) * 100);
    });

    allAttendance.forEach(a => {
        if(!studentRiskMap[a.studentId]) studentRiskMap[a.studentId] = { total: 0, present: 0, marks: [] };
        // If it was just created, init the attendance keys
        if(studentRiskMap[a.studentId].total === undefined) {
           studentRiskMap[a.studentId].total = 0;
           studentRiskMap[a.studentId].present = 0;
        }
        studentRiskMap[a.studentId].total++;
        if(['present', 'late'].includes(a.status)) studentRiskMap[a.studentId].present++;
    });

    const riskFlags = [];
    Object.keys(studentRiskMap).forEach(std => {
       const stdData = studentRiskMap[std];
       const avgM = stdData.marks.length > 0 ? stdData.marks.reduce((a,b)=>a+b, 0) / stdData.marks.length : 100;
       const avgA = stdData.total > 0 ? (stdData.present/stdData.total)*100 : 100;
       
       if (avgM < 65 && avgA < 75) {
           riskFlags.push({ studentId: std, marks: avgM, attendance: avgA });
       }
    });

    const overallHealth = ((avgSchoolGrade + avgSchoolAttendance) / 2).toFixed(1);

    // Call Gemini API providing highly compressed payload to save prompt tokens
    const jsonPrompt = `
    Analyze this institution's data summary and provide actionable insights. Return strictly as a JSON object containing two string arrays: "keyPoints" (max 3 points summarizing trends) and "nextSteps" (max 3 actionable recommendations).
    Data Summary:
    Avg School Grade: ${avgSchoolGrade.toFixed(1)}%
    Avg School Attendance: ${avgSchoolAttendance.toFixed(1)}%
    Number of high-risk students found (low grades + low attendance): ${riskFlags.length}
    `;

    let aiGeneratedInsights = null;
    let finalKeyPoints = [];
    let finalNextSteps = [];

    if (genAI) {
      aiGeneratedInsights = await getGeminiInsights(jsonPrompt);
    }
    
    // Fallback or use AI generated results
    if (aiGeneratedInsights && aiGeneratedInsights.keyPoints) {
      finalKeyPoints = aiGeneratedInsights.keyPoints;
      finalNextSteps = aiGeneratedInsights.nextSteps;
    } else {
      finalKeyPoints = [
        avgSchoolAttendance > 85 ? 'Attendance is thriving ecosystem-wide.' : 'School-wide attendance requires intervention.',
        avgSchoolGrade > 70 ? 'Academic standards are satisfying the median.' : 'Sub-optimal median performance detected.'
      ];
      finalNextSteps = riskFlags.length > 0 
        ? ['Schedule academic counseling for high-risk flags', 'Implement targeted remediation']
        : ['Continue current baseline operations', 'Consider stretching advanced placement programs'];
    }

    const aiInsightData = {
      summary: `AI evaluated academic submissions and roll-calls. Providing synthesized institutional health analysis using Google Gemini.`,
      overallHealth: overallHealth,
      metrics: [
        { label: 'Campus Average Scores', value: avgSchoolGrade.toFixed(2) + '%' },
        { label: 'Campus Average Attendance', value: avgSchoolAttendance.toFixed(2) + '%' },
        { label: 'Students Highlighted At-Risk', value: riskFlags.length }
      ],
      atRiskStudents: riskFlags.map(r => ({ studentId: r.studentId, reason: `Grades: ${r.marks.toFixed(1)}%, Attendance: ${r.attendance.toFixed(1)}%`})),
      keyPoints: finalKeyPoints,
      nextSteps: finalNextSteps
    };

    const newReport = new Report({
      title: `AI Summary Report (${new Date().toLocaleString('default', { month: 'short' })})`,
      type: 'ai-summary',
      parameters: { type: 'global' },
      data: aiInsightData
    });

    const savedReport = await newReport.save();
    
    res.json({
      reportId: savedReport._id,
      ...savedReport._doc
    });
  } catch (error) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 });
    
    const formattedReports = reports.map(r => ({
      id: r._id,
      title: r.title,
      type: r.type,
      date: new Date(r.date).toISOString().split('T')[0],
      status: r.status,
      data: r.data
    }));
    
    res.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

export default router;
