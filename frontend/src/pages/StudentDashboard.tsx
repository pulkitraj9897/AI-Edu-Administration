import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Award, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { StatCard, Card } from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import CalendarWidget from '../components/UI/CalendarWidget';

interface MarkData {
  subject: string;
  score: number;
  grade: string;
}

interface TrendData {
  month: string;
  rate: number;
}

interface AssignmentData {
  subject: string;
  title: string;
  dueDate: string;
}

interface StudentAnalyticsData {
  studentId: string;
  class?: string;
  gpa: number;
  attendance: number;
  rank: number;
  recentMarks: MarkData[];
  attendanceTrend: TrendData[];
  upcomingAssignments: AssignmentData[];
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Using user.id as the identifier for analytics
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/student-dashboard/${user?.id}`);
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

  const marksData = analytics?.recentMarks || [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-orange-500">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-lg font-medium animate-pulse">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hello, {user?.name || 'Student'}!
        </h1>
        {analytics?.class && (
           <p className="text-xl font-medium text-orange-600 dark:text-orange-400 mb-2">
             You are a student of class {analytics.class}
           </p>
        )}
        <p className="text-gray-600 dark:text-gray-400">
          Here is your current academic standing. Keep up the good work!
        </p>
      </div>

      {/* Stats Grid - Using Orange/Amber Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Overall GPA"
          value={analytics?.gpa?.toFixed(2) || '0.00'}
          icon={<Award className="w-6 h-6" />}
          color="orange"
          trend={{ value: 0.2, isPositive: true }}
        />
        <StatCard
          title="Attendance"
          value={`${analytics?.attendance || 0}%`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="amber"
          trend={{ value: 1.5, isPositive: true }}
        />
        <StatCard
          title="Class Rank"
          value={`#${analytics?.rank || '-'}`}
          icon={<TrendDataIcon />}
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Marks */}
        <Card title="Recent Performance" className="hover:shadow-md transition-shadow border-t-4 border-t-orange-500">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marksData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
              <YAxis dataKey="subject" type="category" width={80} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  backdropFilter: 'blur(4px)'
                }}
                cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
              />
              <Bar dataKey="score" fill="#f97316" radius={[0, 8, 8, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Upcoming Assignments / Tasks */}
        <Card title="Upcoming Tasks" className="hover:shadow-md transition-shadow border-t-4 border-t-amber-500">
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {analytics?.upcomingAssignments?.map((assignment, index) => {
              const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
              const isUrgent = daysLeft <= 3;
              
              return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  isUrgent 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                } transition-transform hover:-translate-y-1 hover:shadow-sm`}
              >
                <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-800' : 'bg-orange-100 dark:bg-orange-800'}`}>
                  {isUrgent ? <Clock className="w-5 h-5 text-red-600 dark:text-red-300" /> : <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-300" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {assignment.subject}: {assignment.title}
                  </h4>
                  <p className={`text-xs mt-1 ${isUrgent ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-orange-600 dark:text-orange-400'}`}>
                    Due in {daysLeft} days ({new Date(assignment.dueDate).toLocaleDateString()})
                  </p>
                </div>
              </div>
            )})}
            {(!analytics?.upcomingAssignments || analytics.upcomingAssignments.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming assignments. Enjoy your free time!
              </p>
            )}
          </div>
        </Card>
        
        {/* Calendar Widget */}
        <CalendarWidget />
      </div>
    </div>
  );
};

const TrendDataIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
)

export default StudentDashboard;
