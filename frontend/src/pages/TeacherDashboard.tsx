import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, Calendar, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { StatCard, Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../components/UI/CalendarWidget';

interface AlertData {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface TrendData {
  month: string;
  rate: number;
}

interface PerformanceData {
  class: string;
  avgGPA: number;
  students: number;
}

interface TeacherAnalyticsData {
  teacherId: string;
  totalClasses: number;
  averageAttendance: number;
  recentAlerts: AlertData[];
  classTeacherOf: string | null;
  classAttendanceTrend: TrendData[];
  performanceByClass: PerformanceData[];
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<TeacherAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Using user.id as the identifier for analytics
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/teacher-dashboard/${user?.id}`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user]);

  const attendanceData = analytics?.classAttendanceTrend || [];
  const performanceData = analytics?.performanceByClass || [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-lg font-medium animate-pulse">Loading teacher insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hello, {user?.name || 'Teacher'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your teaching dashboard. {analytics?.classTeacherOf && <span className="font-semibold text-emerald-600 dark:text-emerald-400">Class Teacher of {analytics.classTeacherOf}</span>}
        </p>
      </div>

      {/* Stats Grid - Using Emerald/Teal Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="My Classes"
          value={analytics?.totalClasses || 0}
          icon={<BookOpen className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Overall Attendance"
          value={`${analytics?.averageAttendance || 0}%`}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 1.2, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Next Class"
          value="10B Maths"
          icon={<Calendar className="w-6 h-6" />}
          color="teal"
          trend={{ value: 0, isPositive: true }} // hide trend visually if possible or just show simple text
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="transform transition-all duration-300 hover:shadow-lg border-t-4 border-t-emerald-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all border-emerald-200 dark:border-emerald-800"
            onClick={() => navigate('/attendance')}
          >
            <CheckCircle className="w-6 h-6 mb-2 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all border-emerald-200 dark:border-emerald-800"
            onClick={() => navigate('/timetable')}
          >
            <Calendar className="w-6 h-6 mb-2 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            My Timetable
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all border-emerald-200 dark:border-emerald-800"
            onClick={() => navigate('/marks')}
          >
            <TrendingUp className="w-6 h-6 mb-2 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            Enter Marks
          </Button>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Class */}
        <Card title="Class Performance Overview" className="hover:shadow-md transition-shadow">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="class" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  backdropFilter: 'blur(4px)'
                }}
                cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
              />
              <Legend />
              <Bar dataKey="avgGPA" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Actionable Alerts for Teachers */}
        <Card title="Action Items & Alerts" className="hover:shadow-md transition-shadow">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {analytics?.recentAlerts?.map((alert: AlertData) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl transition-transform hover:-translate-y-1 hover:shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!analytics?.recentAlerts || analytics.recentAlerts.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No pending action items
              </p>
            )}
          </div>
        </Card>
        
        {/* Calendar Widget */}
        <CalendarWidget />
      </div>

      {analytics?.classTeacherOf && (
         <div className="grid grid-cols-1 gap-6">
            <Card title={`Attendance Trend for ${analytics.classTeacherOf}`} className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    backdropFilter: 'blur(4px)'
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                />
                </LineChart>
            </ResponsiveContainer>
            </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
