import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, AlertTriangle, Award, Target } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Analytics: React.FC = () => {
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/predictions');
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const performanceTrend = [
    { month: 'Jan', math: 75, science: 80, english: 85 },
    { month: 'Feb', math: 78, science: 82, english: 87 },
    { month: 'Mar', math: 82, science: 85, english: 89 },
    { month: 'Apr', math: 85, science: 88, english: 90 },
    { month: 'May', math: 88, science: 90, english: 92 },
  ];

  const skillsData = [
    { skill: 'Problem Solving', value: 85 },
    { skill: 'Critical Thinking', value: 78 },
    { skill: 'Communication', value: 92 },
    { skill: 'Creativity', value: 88 },
    { skill: 'Teamwork', value: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Performance Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered insights and predictive analytics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Average Performance"
          value="85%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="At-Risk Students"
          value={predictions?.atRiskStudents?.length || 2}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Top Performers"
          value="25"
          icon={<Award className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Improvement Rate"
          value="12%"
          icon={<Target className="w-6 h-6" />}
          trend={{ value: 3.5, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card title="Subject Performance Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
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
              <Line type="monotone" dataKey="math" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="science" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="english" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Skills Radar */}
        <Card title="Skills Assessment">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="skill" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card title="At-Risk Students - AI Predictions">
        <div className="space-y-3">
          {predictions?.atRiskStudents?.map((student: any) => (
            <div
              key={student.studentId}
              className={`p-4 rounded-lg border-2 ${
                student.riskLevel === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {student.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.riskLevel === 'high'
                          ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          : 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {student.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Student ID: {student.studentId}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.factors.map((factor: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card title="AI-Generated Recommendations">
        <div className="space-y-3">
          {predictions?.recommendations?.map((rec: string, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button>Generate Detailed Report</Button>
        </div>
      </Card>

      {/* Predictive Insights */}
      <Card title="Predictive Insights - Machine Learning">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Dropout Risk
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              3.2%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              2 students need immediate attention
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Expected Growth
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              +15%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Overall performance improvement
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Excellence Track
            </h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              28
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Students ready for advanced programs
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
