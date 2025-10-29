import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAttendanceData();
    fetchStats();
  }, [selectedDate, selectedClass]);

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
      const response = await axios.get('http://localhost:5000/api/attendance/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const students = [
    { id: 'STU001', name: 'Alice Johnson', rollNo: 1 },
    { id: 'STU002', name: 'Bob Smith', rollNo: 2 },
    { id: 'STU003', name: 'Charlie Brown', rollNo: 3 },
    { id: 'STU004', name: 'Diana Prince', rollNo: 4 },
    { id: 'STU005', name: 'Ethan Hunt', rollNo: 5 }
  ];

  const columns = [
    { key: 'rollNo', label: 'Roll No.' },
    { key: 'name', label: 'Student Name' },
    { key: 'id', label: 'Student ID' },
    {
      key: 'actions',
      label: 'Mark Attendance',
      render: (_: any, student: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => markAttendance(student.id, 'present')}
            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
          >
            Present
          </button>
          <button
            onClick={() => markAttendance(student.id, 'absent')}
            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            Absent
          </button>
          <button
            onClick={() => markAttendance(student.id, 'late')}
            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium transition-colors"
          >
            Late
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
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
              <option value="10A">Class 10A</option>
              <option value="10B">Class 10B</option>
              <option value="11A">Class 11A</option>
              <option value="11B">Class 11B</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button>Save All</Button>
            <Button variant="outline">Generate Report</Button>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card title={`Attendance for ${selectedClass} - ${selectedDate}`}>
        <Table columns={columns} data={students} />
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
            Automated attendance marking using AI-powered facial recognition will be available soon.
          </p>
          <Button variant="outline">Configure Camera Feed</Button>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
