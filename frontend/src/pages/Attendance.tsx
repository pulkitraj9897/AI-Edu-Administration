import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, Loader2, Camera, StopCircle, ScanFace } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { loadModels } from '../utils/faceApi';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [pendingAttendance, setPendingAttendance] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isAutonomousMode, setIsAutonomousMode] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanStatus, setScanStatus] = useState("Idle");
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const scanIntervalRef = React.useRef<any>(null);

  useEffect(() => {
    loadModels().then(() => setModelsLoaded(true)).catch(console.error);
    return () => {
      stopAutonomousScanner();
    };
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    setPendingAttendance({});
    if (isAdminOrTeacher && students.length > 0) {
      fetchAttendanceData();
      fetchStats();
    } else if (!isAdminOrTeacher) {
      fetchAttendanceData();
      fetchStats();
    }
  }, [selectedDate, selectedClass, students, isAdminOrTeacher]);

  const startAutonomousScanner = async () => {
    if (!modelsLoaded) {
      alert("AI Models are still loading. Please wait.");
      return;
    }

    const studentsWithFaces = students.filter(s => s.faceDescriptor && s.faceDescriptor.length === 128);
    if (studentsWithFaces.length === 0) {
      alert("No students in this class have registered face data. Please register faces in the Students page first.");
      return;
    }

    const labeledDescriptors = studentsWithFaces.map(student => {
      const float32Array = new Float32Array(student.faceDescriptor);
      return new faceapi.LabeledFaceDescriptors(student.studentId, [float32Array]);
    });
    
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    setIsAutonomousMode(true);
    setScanStatus("Initializing camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      videoRef.current!.onloadeddata = () => {
        setScanStatus("Scanning for faces...");
        
        scanIntervalRef.current = setInterval(async () => {
          try {
            if (videoRef.current && canvasRef.current) {
              // Ensure video has intrinsic dimensions before processing
              const displaySize = { 
                width: videoRef.current.videoWidth, 
                height: videoRef.current.videoHeight 
              };
              
              if (displaySize.width === 0 || displaySize.height === 0) return;

              // Match canvas dimensions to video
              faceapi.matchDimensions(canvasRef.current, displaySize);

              const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              const context = canvasRef.current.getContext('2d');
              context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

              const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
              
              results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                
                let labelText = 'Unknown Face';
                let boxColor = 'red';

                if (result.label !== 'unknown' && result.distance < 0.6) {
                  const student = students.find(s => s.studentId === result.label);
                  labelText = student ? student.name : result.label;
                  boxColor = '#10b981'; // green-500
                  
                  setPendingAttendance(prev => {
                    if (prev[result.label] !== 'present') {
                      setScanStatus(`Recognized: ${labelText}`);
                      return { ...prev, [result.label]: 'present' };
                    }
                    return prev;
                  });
                }

                const drawBox = new faceapi.draw.DrawBox(box, { 
                  label: labelText,
                  lineWidth: 3,
                  boxColor: boxColor
                });
                drawBox.draw(canvasRef.current!);
              });
            }
          } catch (err) {
            console.error("Face detection interval error:", err);
          }
        }, 300);
      };
    } catch (err) {
      console.error(err);
      alert("Camera access denied or failed.");
      setIsAutonomousMode(false);
    }
  };

  const stopAutonomousScanner = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsAutonomousMode(false);
    setScanStatus("Idle");
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students`);
      // Filter students by selected class
      const filtered = response.data.filter((s: any) => s.class === selectedClass);
      setStudents(filtered);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      if (students.length === 0) setLoading(false); // If no students, stop loading here. Else other hooks stop it.
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const params: any = {};
      if (isAdminOrTeacher) {
        params.date = selectedDate;
        params.class = selectedClass;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/attendance`, { params });
      // Sort to show most recent first for students
      const sortedData = response.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendanceData(sortedData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (isAdminOrTeacher) {
        params.date = selectedDate;
        params.class = selectedClass;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/attendance/stats`, { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string, status: string) => {
    setPendingAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAllAttendance = async () => {
    const studentIds = Object.keys(pendingAttendance);
    if (studentIds.length === 0) {
      window.alert('No unsaved attendance changes.');
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(studentIds.map(studentId => 
        axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/attendance`, {
          studentId,
          date: selectedDate,
          status: pendingAttendance[studentId],
          class: selectedClass
        })
      ));
      
      setPendingAttendance({});
      await fetchAttendanceData();
      await fetchStats();
      // fetchStats sets loading false in finally clause, but if we await here we can just alert
      window.alert('Attendance is saved');
    } catch (error) {
      console.error('Error saving attendance:', error);
      window.alert('Error saving attendance');
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/attendance`, { 
        startDate: selectedDate, 
        endDate: selectedDate, 
        class: selectedClass 
      });
      window.alert('Attendance report generated successfully! You can view it in the Reports section.');
      navigate('/reports');
    } catch (error) {
      console.error('Error generating report:', error);
      window.alert('Failed to generate report.');
      setLoading(false);
    }
  };

  // Map to get the status of each student for the current date
  const getAttendanceStatus = (studentId: string) => {
    if (pendingAttendance[studentId]) return pendingAttendance[studentId];
    const record = attendanceData.find(a => a.studentId === studentId);
    return record ? record.status : null;
  };

  const getStudentColumns = () => [
    { 
      key: 'date', 
      label: 'Date',
      render: (_: any, record: any) => new Date(record.date).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (_: any, record: any) => {
        const { status } = record;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'present' ? 'bg-green-100 text-green-700' : 
            status === 'absent' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    { key: 'markedBy', label: 'Marked By', render: (_: any, record: any) => record.markedBy || 'Teacher' }
  ];

  const adminTeacherColumns = [
    { 
      key: 'photograph', 
      label: 'Photo', 
      render: (_: any, student: any) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {student.photograph ? (
            <img src={student.photograph} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">No img</span>
          )}
        </div>
      )
    },
    { key: 'studentId', label: 'Student ID' },
    { key: 'name', label: 'Student Name' },
    {
      key: 'status',
      label: 'Current Status',
      render: (_: any, student: any) => {
        const status = getAttendanceStatus(student.studentId);
        if (!status) return <span className="text-gray-400">Not Marked</span>;
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'present' ? 'bg-green-100 text-green-700' : 
            status === 'absent' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    }
  ];

  const columns = isAdminOrTeacher ? adminTeacherColumns : getStudentColumns();

  if (isAdminOrTeacher) {
    columns.push({
      key: 'actions',
      label: 'Mark Attendance',
      render: (_: any, student: any) => {
        const status = getAttendanceStatus(student.studentId);
        
        return (
          <div className="flex gap-2">
            <button
              onClick={() => toggleAttendance(student.studentId, 'present')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                status === 'present' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 text-green-700 dark:text-green-400'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => toggleAttendance(student.studentId, 'absent')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                status === 'absent' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400'
              }`}
            >
              Absent
            </button>
            <button
              onClick={() => toggleAttendance(student.studentId, 'late')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                status === 'late' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 text-yellow-700 dark:text-yellow-400'
              }`}
            >
              Late
            </button>
          </div>
        );
      }
    });
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-lg font-medium animate-pulse">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Attendance Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage student attendance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value={stats?.totalRecords || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Present"
          value={stats?.present || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Absent"
          value={stats?.absent || 0}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Filters */}
      {isAdminOrTeacher && (
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'].map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={saveAllAttendance}>Save All</Button>
              <Button variant="outline" onClick={handleGenerateReport}>Generate Report</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Table */}
      <Card title={isAdminOrTeacher ? `Attendance for ${selectedClass} - ${new Date(selectedDate).toLocaleDateString()}` : "Your Recent Attendance"}>
        <Table columns={columns} data={isAdminOrTeacher ? students : attendanceData} />
        {isAdminOrTeacher && students.length === 0 && (
          <p className="text-center text-gray-500 py-4">No students found for this class.</p>
        )}
        {!isAdminOrTeacher && attendanceData.length === 0 && (
          <p className="text-center text-gray-500 py-4">No attendance records found.</p>
        )}
      </Card>

      {/* Autonomous AI Attendance Scanner */}
      {isAdminOrTeacher && (
        <Card title="AI Autonomous Attendance Scanner">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isAutonomousMode ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <ScanFace className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Live Classroom Scanning</h3>
                  <p className="text-sm text-gray-500">Automatically mark students present using facial recognition</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status: <span className={isAutonomousMode ? "text-green-600" : "text-gray-500"}>{scanStatus}</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  Ready students in {selectedClass}: {students.filter(s => s.faceDescriptor && s.faceDescriptor.length === 128).length} / {students.length}
                </p>
              </div>

              <div className="flex gap-3">
                {!isAutonomousMode ? (
                  <Button onClick={startAutonomousScanner} disabled={!modelsLoaded} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Camera className="w-5 h-5 mr-2" /> Start Scanner
                  </Button>
                ) : (
                  <Button onClick={stopAutonomousScanner} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent">
                    <StopCircle className="w-5 h-5 mr-2" /> Stop Scanner
                  </Button>
                )}
              </div>
              {isAutonomousMode && (
                <p className="text-xs text-center text-gray-500 animate-pulse">
                  Keep this window open. As students walk into the frame, they will be marked 'Present' automatically. Click 'Save All' when finished.
                </p>
              )}
            </div>

            <div className="flex-1 w-full flex justify-center">
              {isAutonomousMode ? (
                <div 
                   className="relative rounded-lg overflow-hidden border-4 border-indigo-500 shadow-xl bg-black" 
                   style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}
                >
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto' }} />
                  <canvas ref={canvasRef} className="absolute top-0 left-0" style={{ width: '100%', height: '100%' }} />
                </div>
              ) : (
                <div className="w-full max-w-md aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
                  <Camera className="w-12 h-12 mb-2 opacity-50" />
                  <p>Camera feed inactive</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
