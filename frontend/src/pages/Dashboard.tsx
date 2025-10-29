import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, GraduationCap, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
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

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/analytics/dashboard');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
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

  return (
    <div className="space-y-6">
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
          value={analytics?.totalStudents || 1250}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={analytics?.totalTeachers || 85}
          icon={<GraduationCap className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Active Classes"
          value={analytics?.totalClasses || 42}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Attendance Rate"
          value={`${analytics?.averageAttendance || 92.5}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 1.8, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => navigate('/attendance')}
          >
            <CheckCircle className="w-6 h-6 mb-2" />
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => navigate('/students')}
          >
            <Users className="w-6 h-6 mb-2" />
            Manage Students
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => navigate('/reports')}
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            Generate Report
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => navigate('/chatbot')}
          >
            <AlertTriangle className="w-6 h-6 mb-2" />
            AI Assistant
          </Button>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card title="Attendance Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance by Class */}
        <Card title="Performance by Class">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="class" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="avgGPA" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Subject Distribution */}
        <Card title="Subject Distribution">
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
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Alerts */}
        <Card title="Recent Alerts & Notifications">
          <div className="space-y-3">
            {analytics?.recentAlerts?.map((alert: any) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent alerts
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Based on current data, the system has identified potential improvements:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Attendance patterns show improvement in morning sessions
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Consider additional support for Class 10B mathematics
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                5 students may benefit from academic counseling
              </li>
            </ul>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/analytics')}>
              View Detailed Analytics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
