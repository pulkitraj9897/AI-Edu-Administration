import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Download, Sparkles, User, Users, Eye, X } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('10A');
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('Fall 2024');

  const [viewingReport, setViewingReport] = useState<any>(null);
  
  // Hidden Export State Logic
  const [exportReportData, setExportReportData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      if (reportType === 'attendance') {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/attendance`, { startDate, endDate, class: className });
      } else if (reportType === 'performance') {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/performance`, { studentId, semester });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/ai-summary`, { type: 'global' });
      }
      alert(`Report generated successfully!`);
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please ensure parameters are correct.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDFAsyncLogic = async (report: any) => {
      const doc = new jsPDF();
      const data = report.data || {};
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('EduAdmin AI - Formal Report', 20, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Record Title: ${report.title}`, 20, 35);
      doc.text(`Generation Date: ${report.date}`, 20, 42);
      doc.text(`Classification Type: ${report.type.toUpperCase()}`, 20, 49);
      
      doc.setLineWidth(0.4);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, 190, 55);
      
      let yPos = 65;

      // 1. Chart Snapshot Rendering Block
      if ((report.type === 'attendance' || report.type === 'performance') && printRef.current) {
         try {
           doc.setFontSize(14);
           doc.setTextColor(0, 0, 0);
           doc.text('Visual Diagnostics', 20, yPos);
           yPos += 5;

           // Taking screenshot of the invisible div
           const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
           const imgData = canvas.toDataURL('image/png');
           
           doc.addImage(imgData, 'PNG', 15, yPos, 180, 90);
           yPos += 100; 
         } catch(err) {
           console.error("Failed to snapshot chart for PDF", err);
         }
      }

      // Check vertical spacing
      const checkPageBreak = (spacing: number = 10) => {
         if (yPos + spacing > 280) {
            doc.addPage();
            yPos = 20;
         }
      };

      // 2. Heavy Data Output Engine
      doc.setFontSize(14);
      doc.setTextColor(0,0,0);
      doc.text('Synthesized Analysis & Metrics', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      const writeLine = (text: string, indent: number = 0, isBold: boolean = false) => {
         checkPageBreak(7);
         if (isBold) {
             doc.setFont("helvetica", "bold");
         } else {
             doc.setFont("helvetica", "normal");
         }
         doc.text(text, 20 + indent, yPos);
         yPos += 6;
      };

      if (report.type === 'attendance') {
        writeLine(`Cohort Class Parameter: ${data.class || 'All'}`, 0, true);
        writeLine(`Period Range Covered: ${data.startDate || 'N/A'} to ${data.endDate || 'N/A'}`);
        writeLine(`Average Evaluated Attendance: ${data.averageAttendance || 0}%`, 0, true);
        yPos += 5;
        
        writeLine('AI Insights & Interventions:', 0, true);
        if (data.aiInsights?.length) {
          data.aiInsights.forEach((insight: string) => writeLine(`• ${insight}`, 5));
        }

      } else if (report.type === 'performance') {
        writeLine(`Assessed Student ID: ${data.studentId || 'N/A'}`, 0, true);
        writeLine(`Semester / Phase: ${data.semester || 'N/A'}`);
        writeLine(`Quantitative Scoring Average: ${data.percentage || 0}%`, 0, true);
        yPos += 5;
        
        writeLine('Algorithmic Diagnostics:', 0, true);
        data.aiAnalysis?.strengths?.forEach((s: string) => writeLine(`[Strength Detected] ${s}`, 5));
        data.aiAnalysis?.weaknesses?.forEach((w: string) => writeLine(`[Area of Concern] ${w}`, 5));
        data.aiAnalysis?.recommendations?.forEach((r: string) => writeLine(`[Recommended Action] ${r}`, 5));

      } else {
        // AI SUMMARY SPECIFIC HEAVY DETAIL
        doc.setFillColor(240, 240, 255);
        doc.rect(15, yPos - 4, 180, 16, 'F');
        writeLine(`Institutional Global Health Score: ${data.overallHealth || 'N/A'}/100`, 5, true);
        writeLine(`Context: ${data.summary}`, 5);
        yPos += 5;

        writeLine('AI Strategic Findings:', 0, true);
        data.keyPoints?.forEach((k: string) => writeLine(`• ${k}`, 5));
        
        yPos += 5;
        writeLine('Forward Action Plan (Next Steps):', 0, true);
        data.nextSteps?.forEach((n: string) => writeLine(`-> ${n}`, 5));

         yPos += 8;
         writeLine('CRITICAL: Identified At-Risk Student Ledger', 0, true);
         doc.setLineWidth(0.2); doc.line(20, yPos, 100, yPos); yPos += 4;

         if (data.atRiskStudents && data.atRiskStudents.length > 0) {
            data.atRiskStudents.forEach((student: any) => {
               const studentInfo = typeof student === 'string' ? student : `ID: ${student.studentId} | Breakdown - ${student.reason}`;
               writeLine(`[FLAGGED] ${studentInfo}`, 5);
            });
         } else {
            writeLine("No high-risk students intersecting low grading and low attendance thresholds were detected.", 5);
         }
      }
      
      // Footer Setup
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`Powered by Google Gemini GenAI | Page ${i} of ${pageCount}`, 20, 285);
      }
      
      doc.save(`${report.title.replace(/[\s/]/g, '_')}_Document.pdf`);
  };

  const dispatchPDFGeneration = (report: any) => {
    // Trigger hidden graph rendering state to allow DOM manipulation by html2canvas
    setExportReportData(report);

    // Provide 700ms padding for React to flush the DOM, and Recharts to draw its underlying SVG nodes completely
    setTimeout(() => {
       downloadPDFAsyncLogic(report).then(() => {
          // Cleanup the DOM afterwards
          setExportReportData(null);
       });
    }, 700);
  };

  const columns = [
    { key: 'title', label: 'Report Title' },
    {
      key: 'type',
      label: 'Classification',
      render: (type: string) => (
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
          {type}
        </span>
      )
    },
    { key: 'date', label: 'Timestamp' },
    {
      key: 'actions',
      label: 'Secure Export & Output',
      render: (_: any, report: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setViewingReport(report)}>
            <Eye className="w-4 h-4" />
            Launch Viewer
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0" onClick={() => dispatchPDFGeneration(report)}>
            <Download className="w-4 h-4" />
            PDF Export
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 relative overflow-x-hidden">
      {/* Hidden Render Engine required by html2canvas for PDF visual injection */}
      {exportReportData && (
        <div 
           ref={printRef} 
           style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px', height: '400px', background: '#ffffff', padding: '20px' }}
        >
           <h2 style={{fontSize:'22px', fontWeight:'bold', marginBottom:'15px', color:'#1e3a8a', borderBottom:'1px solid #e5e7eb', paddingBottom:'10px'}}>{exportReportData.title} Visualized</h2>
           
           {exportReportData.type === 'attendance' && (
              <LineChart width={760} height={320} data={exportReportData.data?.trends || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} />
                 <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#6b7280'}} />
                 <RechartsTooltip />
                 <Legend />
                 {/* isAnimationActive=false is critical to allow instant HTML2Canvas rendering */}
                 <Line type="monotone" name="Attendance % Lifecycle" dataKey="attendanceRate" stroke="#3B82F6" strokeWidth={3} isAnimationActive={false} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
           )}

           {exportReportData.type === 'performance' && (
              <BarChart width={760} height={320} data={exportReportData.data?.grades || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subject" tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis tick={{fontSize: 12, fill: '#6b7280'}} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8B5CF6" name="Achieved Score" isAnimationActive={false} radius={[4,4,0,0]} />
                  <Bar dataKey="maxScore" fill="#E5E7EB" name="Maximum Possible Target" isAnimationActive={false} radius={[4,4,0,0]} />
              </BarChart>
           )}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Reports & Intelligence Console
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate interactive charts, securely export to PDF formats, and leverage deep Gemini AI intelligence.
        </p>
      </div>

      <Card title="Compile New Ledger">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Architectural Profile</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              >
                <option value="attendance">Attendance Vector Tracking</option>
                <option value="performance">Academic Performance Matrix</option>
                <option value="ai-summary">System-wide AI Risk Diagnostics (Gemini)</option>
              </select>
            </div>

            {reportType === 'attendance' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class (Optional Filter)</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. 10A" className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Initiation Node</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Termination Node</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white" />
                </div>
              </>
            )}

            {reportType === 'performance' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Student ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU001 or ID..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester Frame</label>
                  <input type="text" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. Fall 2024" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" />
                </div>
              </>
            )}
            {reportType === 'ai-summary' && (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-900 dark:text-blue-100 rounded-lg font-medium border border-blue-200 dark:border-purple-800/40 w-full shadow-inner">
                     <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                     Gemini AI structural scan initialized: Mapping dense matrices to identify extreme risk outliers utilizing token-compressed arrays.
                  </div>
               </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={generateReport} disabled={generating} className={reportType === 'ai-summary' ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 shadow-md text-white' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'}>
              {generating ? 'Compiling Parameters...' : <><FileText className="w-5 h-5" /> Execute Data Compilation</>}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Historical Document Archive">
        <Table columns={columns} data={reports} />
      </Card>

      {/* Interface Modal: Launch Viewer */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/80">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  {viewingReport.type === 'ai-summary' && <Sparkles className="w-5 h-5 text-purple-500" />}
                  {viewingReport.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Snapshot captured on {viewingReport.date}</p>
              </div>
              <button onClick={() => setViewingReport(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {viewingReport.type === 'attendance' && (
                <div className="space-y-6">
                  <div className="h-72 w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest text-center">Attendance Fluctuation Trajectory</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewingReport.data?.trends || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} vertical={false}/>
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickMargin={10}/>
                        <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 100]} tickFormatter={(val)=>`${val}%`}/>
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderColor: '#374151', color: '#fff', borderRadius: '8px', paddingTop:'4px', paddingBottom:'4px' }}
                           itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend wrapperStyle={{paddingTop:'15px'}}/>
                        <Line type="monotone" name="Attendance Ratio" dataKey="attendanceRate" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">Statistical Output</h4>
                         <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 my-2">{viewingReport.data?.averageAttendance}%</div>
                         <p className="text-sm text-gray-500 font-medium tracking-wide">Arithmetic mean via active dates</p>
                     </div>
                     <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                        <h4 className="font-bold flex items-center gap-2 mb-3 text-indigo-900 dark:text-indigo-300 text-lg"><Sparkles className="w-5 h-5"/> Evaluative Remarks</h4>
                        <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200/90 font-medium">
                           {viewingReport.data?.aiInsights?.map((ins:string, i:number) => (
                              <li key={i} className="flex gap-2 items-start"><span className="mt-0.5">•</span> <span>{ins}</span></li>
                           ))}
                        </ul>
                     </div>
                  </div>
                </div>
              )}

              {viewingReport.type === 'performance' && (
                <div className="space-y-6">
                  <div className="h-80 w-full bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                     <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest text-center">Spectral Subject Performance Mapping</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewingReport.data?.grades || []} margin={{top:10}}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false}/>
                        <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={11} />
                        <YAxis stroke="#9CA3AF" fontSize={11} />
                        <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.04)'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                        <Legend wrapperStyle={{paddingTop:'15px'}}/>
                        <Bar dataKey="score" fill="#8B5CF6" name="Achieved Score Target" radius={[6, 6, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="maxScore" fill="#E5E7EB" name="Theoretical Maximum" radius={[6, 6, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                      <h4 className="font-bold text-lg mb-4 text-blue-900 dark:text-blue-300">Targeted Feedback Matrix</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                         <div className="bg-white/60 dark:bg-gray-900/50 p-4 rounded-lg">
                            <strong className="text-green-700 dark:text-green-400 uppercase text-xs tracking-wider">Identified Strengths</strong>
                            <ul className="space-y-2 mt-3 text-gray-700 dark:text-gray-300 font-medium">
                               {viewingReport.data?.aiAnalysis?.strengths?.map((s:string, i:number)=><li key={i} className="flex gap-2"><span className="text-green-500">✓</span> {s}</li>)}
                            </ul>
                         </div>
                         <div className="bg-white/60 dark:bg-gray-900/50 p-4 rounded-lg">
                            <strong className="text-orange-600 dark:text-orange-400 uppercase text-xs tracking-wider">Required Interventions</strong>
                            <ul className="space-y-2 mt-3 text-gray-700 dark:text-gray-300 font-medium">
                               {viewingReport.data?.aiAnalysis?.recommendations?.map((s:string, i:number)=><li key={i} className="flex gap-2"><span className="text-orange-500">!</span> {s}</li>)}
                            </ul>
                         </div>
                      </div>
                  </div>
                </div>
              )}

              {viewingReport.type === 'ai-summary' && (
                <div className="space-y-6">
                  <div className="text-center p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                     <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-300 relative z-10 drop-shadow-md" />
                     <h2 className="text-4xl font-extrabold mb-3 relative z-10 tracking-tight">Ecosystem Health: <span className="text-purple-300">{viewingReport.data?.overallHealth}</span> <span className="text-lg text-purple-400 opacity-70">/ 100</span></h2>
                     <p className="text-blue-100 opacity-95 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">{viewingReport.data?.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-full hover:shadow-md transition-shadow">
                        <h4 className="font-extrabold text-gray-900 dark:text-white mb-5 text-xl flex items-center gap-2">
                           <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 p-1.5 rounded-lg"><User className="w-5 h-5"/></span>
                           Strategic Directives
                        </h4>
                        <ul className="space-y-4">
                           {viewingReport.data?.keyPoints?.map((p:string, i:number) => (
                              <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                                 <span className="text-purple-500 font-bold text-lg leading-none mt-0.5">•</span> <span className="leading-snug font-medium">{p}</span>
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-full hover:shadow-md transition-shadow">
                        <h4 className="font-extrabold text-gray-900 dark:text-white mb-5 text-xl flex items-center gap-2">
                           <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 p-1.5 rounded-lg"><FileText className="w-5 h-5"/></span>
                           Execution Pipeline
                        </h4>
                        <ul className="space-y-4">
                           {viewingReport.data?.nextSteps?.map((p:string, i:number) => (
                              <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border-l-4 border-blue-500">
                                 <span className="leading-snug font-medium">{p}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* At Risk Students Block Details */}
                  {viewingReport.data?.atRiskStudents && viewingReport.data.atRiskStudents.length > 0 && (
                     <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <h4 className="font-extrabold text-red-800 dark:text-red-400 mb-4 text-lg">CRITICAL: At-Risk Population Ledger</h4>
                        <div className="space-y-3">
                           {viewingReport.data.atRiskStudents.map((std: any, i: number) => {
                              const stdData = typeof std === 'string' ? std : `ID [${std.studentId}] — ${std.reason}`;
                              return (
                                 <div key={i} className="bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-red-200 dark:border-red-800/20 text-red-900 dark:text-red-200 text-sm font-medium">
                                    <span className="font-bold text-red-600 dark:text-red-500 mr-2">FLAGGED:</span> {stdData}
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/80">
               <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-0" onClick={() => dispatchPDFGeneration(viewingReport)}>
                  <Download className="w-4 h-4 mr-1" /> Document Secure Output
               </Button>
               <Button variant="outline" className="border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setViewingReport(null)}>
                  Terminate Session
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
