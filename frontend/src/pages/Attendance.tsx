import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { useAuth } from '../context/AuthContext';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendanceData();
      fetchStats();
    }
  }, [selectedDate, selectedClass, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/students');
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
      const response = await axios.get('http://localhost:5000/api/attendance', {
        params: { date: selectedDate, class: selectedClass }
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/stats', {
        params: { date: selectedDate, class: selectedClass }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false); // Stop loading after the final data dependency is resolved
    }
  };

  const markAttendance = async (studentId: string, status: string) => {
    try {
      await axios.post('http://localhost:5000/api/attendance', {
        studentId,
        date: selectedDate,
        status,
        class: selectedClass
      });
      fetchAttendanceData();
      fetchStats();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  // Map to get the status of each student for the current date
  const getAttendanceStatus = (studentId: string) => {
    const record = attendanceData.find(a => a.studentId === studentId);
    return record ? record.status : null;
  };

  const columns = [
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

  if (isAdminOrTeacher) {
    columns.push({
      key: 'actions',
      label: 'Mark Attendance',
      render: (_: any, student: any) => {
        const status = getAttendanceStatus(student.studentId);
        
        return (
          <div className="flex gap-2">
            <button
              onClick={() => markAttendance(student.studentId, 'present')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                status === 'present' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 text-green-700 dark:text-green-400'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => markAttendance(student.studentId, 'absent')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                status === 'absent' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400'
              }`}
            >
              Absent
            </button>
            <button
              onClick={() => markAttendance(student.studentId, 'late')}
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
              <Button>Save All</Button>
              <Button variant="outline">Generate Report</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Table */}
      <Card title={isAdminOrTeacher ? `Attendance for ${selectedClass} - ${new Date(selectedDate).toLocaleDateString()}` : "Your Recent Attendance"}>
        <Table columns={columns} data={students} />
        {students.length === 0 && (
          <p className="text-center text-gray-500 py-4">No students found for this class.</p>
        )}
      </Card>

      {/* AI-Based Recognition Placeholder */}
      <Card title="AI-Powered Attendance (Coming Soon)">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Facial Recognition Integration
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Automated attendance marking using AI-powered facial recognition will be available soon. Upload student photographs via the Students page to prepare.
          </p>
          <Button variant="outline">Configure Camera Feed</Button>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
