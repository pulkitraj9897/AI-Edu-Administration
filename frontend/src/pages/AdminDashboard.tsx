import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, GraduationCap, Calendar, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { StatCard, Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averageAttendance: number;
  recentAlerts: AlertData[];
  insights: string[];
  attendanceTrend: TrendData[];
  performanceByClass: PerformanceData[];
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/dashboard`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const attendanceData = analytics?.attendanceTrend || [];
  const performanceData = analytics?.performanceByClass || [];

  const subjectDistribution = [
    { name: 'Mathematics', value: 25, color: '#3b82f6' },
    { name: 'Science', value: 22, color: '#10b981' },
    { name: 'English', value: 20, color: '#f59e0b' },
    { name: 'History', value: 18, color: '#8b5cf6' },
    { name: 'Others', value: 15, color: '#6b7280' }
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-lg font-medium animate-pulse">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your institution.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={analytics?.totalStudents || 0}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={analytics?.totalTeachers || 0}
          icon={<GraduationCap className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Active Classes"
          value={analytics?.totalClasses || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Attendance Rate"
          value={`${analytics?.averageAttendance || 0}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 1.8, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="transform transition-all duration-300 hover:shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-all"
            onClick={() => navigate('/attendance')}
          >
            <CheckCircle className="w-6 h-6 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-green-50 dark:hover:bg-green-900/20 group transition-all"
            onClick={() => navigate('/students')}
          >
            <Users className="w-6 h-6 mb-2 text-gray-400 group-hover:text-green-500 transition-colors" />
            Manage Students
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-orange-50 dark:hover:bg-orange-900/20 group transition-all"
            onClick={() => navigate('/reports')}
          >
            <TrendingUp className="w-6 h-6 mb-2 text-gray-400 group-hover:text-orange-500 transition-colors" />
            Generate Report
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-all"
            onClick={() => navigate('/chatbot')}
          >
            <AlertTriangle className="w-6 h-6 mb-2 text-gray-400 group-hover:text-purple-500 transition-colors" />
            AI Assistant
          </Button>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card title="Attendance Trend" className="hover:shadow-md transition-shadow">
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
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance by Class */}
        <Card title="Performance by Class" className="hover:shadow-md transition-shadow">
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

        {/* Subject Distribution */}
        <Card title="Subject Distribution" className="hover:shadow-md transition-shadow">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subjectDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Alerts */}
        <Card title="Recent Alerts & Notifications" className="hover:shadow-md transition-shadow">
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
                No recent alerts
              </p>
            )}
          </div>
        </Card>
        
        {/* Calendar Widget */}
        <CalendarWidget />
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-100 dark:border-purple-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <TrendingUp className="w-48 h-48 text-purple-600 rotate-12" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">
              Based on current data, the system has identified potential improvements:
            </p>
            <ul className="space-y-3">
              {analytics?.insights?.map((insight, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                  {insight}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-6 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30" onClick={() => navigate('/analytics')}>
              View Detailed Analytics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
