import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, AlertTriangle, Award, Target, Loader2, BrainCircuit, Activity, BarChart4 } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Questionnaire State (15 questions default -1)
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(-1));

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await api.get(`/analytics/predictions?forceRefresh=${forceRefresh}`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTestSubmit = async () => {
    if (answers.includes(-1)) return alert("Please answer all 15 questions to accurately calculate your abilities map.");
    try {
      setSubmittingTest(true);
      await api.post('/analytics/skills-test', { answers });
      setAnswers(Array(15).fill(-1));
      setShowQuiz(false);
      await fetchPredictions(true);
    } catch (error) {
      console.error("Error submitting test", error);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleRetakeTest = () => {
    setPredictions((prev: any) => ({ ...prev, hasTakenTest: false }));
    setShowQuiz(true);
  };

  if (loading && !predictions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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

  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const quizQuestions = [
     // PS
     { q: '1. When an equation or formula produces an error, you...', opts: ['Ask for help instantly', 'Try random adjustments', 'Review steps backwards', 'Build a structured diagnostic plan'] },
     { q: '2. If you notice a bug or flaw in a project, you first...', opts: ['Ignore it', 'Mention it to others', 'Attempt a quick fix', 'Analyze root causes documented'] },
     { q: '3. Approaching a brand new complex puzzle, you...', opts: ['Feel overwhelmed', 'Jump straight in', 'Map out edge cases', 'Implement a step-by-step strategy'] },
     // CT
     { q: '4. How do you respond to an article that contradicts your beliefs?', opts: ['Stop reading', 'Doubt it entirely', 'Check its sources', 'Contrast it deeply with opposite data'] },
     { q: '5. When interpreting statistical graphs, what do you look for?', opts: ['Just the big colors', 'The obvious peaks', 'The axis scales', 'Underlying hidden outliers'] },
     { q: '6. If someone makes an absolute claim, you tend to...', opts: ['Agree broadly', 'Disagree quietly', 'Ask for examples', 'Promptly evaluate exceptions'] },
     // CM
     { q: '7. In a group discussion, you usually...', opts: ['Stay entirely silent', 'Speak when forced', 'Share ideas freely', 'Actively moderate to engage everyone'] },
     { q: '8. If an instructions document is confusing to you...', opts: ['Complain', 'Guess the meaning', 'Ask a clarifying question', 'Rewrite it for clarity'] },
     { q: '9. When giving feedback to peers, you...', opts: ['Just say "looks good"', 'Point out errors', 'Offer direct critiques', 'Use constructive sandwich methods'] },
     // CR
     { q: '10. If an assignment allows "any format", you...', opts: ['Write an essay', 'Do what others do', 'Try a cool video', 'Build an entirely new hybrid format'] },
     { q: '11. When brainstorming ideas, you typically...', opts: ['Wait for others', 'Go with the first thought', 'List obvious links', 'Combine wildly unrelated domains'] },
     { q: '12. If the standard approach fails, you...', opts: ['Give up', 'Wait for instructions', 'Try the exact opposite', 'Invent a new conceptual angle'] },
     // TW
     { q: '13. If a team member falls behind, you...', opts: ['Ignore them', 'Tell the teacher', 'Help them do it', 'Coach them to understand blockages'] },
     { q: '14. How do you handle scheduling conflicts in group work?', opts: ['Skip meetings', 'Force your schedule', 'Compromise your time', 'Organize an asynchronous workflow'] },
     { q: '15. When your team wins an award but you did the most work, you...', opts: ['Claim all credit', 'Feel silently bitter', 'Acknowledge them', 'Publicly celebrate the collective effort'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdminOrTeacher ? "School Insights" : "Personal Insights"} & predictive analytics
          </p>
        </div>
        <Button onClick={() => fetchPredictions(true)} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : <RefreshIcon />}
          Refresh Analytics
        </Button>
      </div>

      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Current GPA"
            value={predictions?.studentAnalytics?.gpa || 'N/A'}
            icon={<Target className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Attendance"
            value={`${predictions?.studentAnalytics?.attendance || 0}%`}
            icon={<Activity className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Class Ranking"
            value={predictions?.studentAnalytics?.rank || 'N/A'}
            icon={<Award className="w-6 h-6" />}
            color="purple"
          />
        </div>
      )}

      {isAdminOrTeacher && (
        <React.Fragment>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Average Performance" value="85%" icon={<TrendingUp className="w-6 h-6" />} trend={{ value: 5.2, isPositive: true }} color="blue" />
            <StatCard title="At-Risk Students" value={predictions?.atRiskStudents?.length || 2} icon={<AlertTriangle className="w-6 h-6" />} color="red" />
            <StatCard title="Top Performers" value="25" icon={<Award className="w-6 h-6" />} color="green" />
            <StatCard title="Improvement Rate" value="12%" icon={<Target className="w-6 h-6" />} trend={{ value: 3.5, isPositive: true }} color="purple" />
          </div>

          <Card title="Subject Performance Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictions?.performanceTrend || performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="math" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="science" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="english" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </React.Fragment>
      )}

      {isStudent && !predictions?.hasTakenTest && !showQuiz && (
        <Card title="Unlock Your Abilities Profile">
          <div className="p-10 text-center flex flex-col items-center">
            <BrainCircuit className="w-20 h-20 text-blue-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Discover Your Core Abilities</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Ready to see where your strengths lie? Take our 15-question psychometric assessment to generate a tailored Abilities Radar Chart and receive precise AI feedback covering Problem Solving, Creativity, Communication, and more.
            </p>
            <Button size="lg" onClick={() => setShowQuiz(true)}>Start Capabilities Quiz</Button>
          </div>
        </Card>
      )}

      {isStudent && showQuiz && (
        <Card title="Capabilities Assessment Questionnaire">
          <div className="p-6 text-center">
            <div className="text-left max-w-2xl mx-auto space-y-6">
               {quizQuestions.map((item, qIdx) => (
                 <div key={qIdx} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-white text-lg mb-4">{item.q}</p>
                    <div className="space-y-3">
                       {item.opts.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                             <input 
                                type="radio"
                                name={`q${qIdx}`}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={answers[qIdx] === oIdx}
                                onChange={() => {
                                   const newAnswers = [...answers];
                                   newAnswers[qIdx] = oIdx;
                                   setAnswers(newAnswers);
                                }}
                             />
                             <span className="text-sm md:text-base">{opt}</span>
                          </label>
                       ))}
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <Button onClick={() => setShowQuiz(false)} variant="outline">Back to Dashboard</Button>
              <Button onClick={handleTestSubmit} disabled={submittingTest}>
                {submittingTest ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : null}
                Submit Assessment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isStudent && predictions?.hasTakenTest && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card title="Your Abilities Profile">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-medium text-gray-500">Based on 15 core parameters</h3>
                 <Button variant="outline" size="sm" onClick={handleRetakeTest}>Retake Abilities Test</Button>
             </div>
             <ResponsiveContainer width="100%" height={300}>
               <RadarChart data={predictions?.skillsData || skillsData}>
                 <PolarGrid stroke="#374151" />
                 <PolarAngleAxis dataKey="skill" stroke="#9ca3af" />
                 <PolarRadiusAxis stroke="#9ca3af" />
                 <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
               </RadarChart>
             </ResponsiveContainer>
           </Card>

           <Card title="AI Analyst Insights">
              <div className="p-6 h-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-center">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                       <BarChart4 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Evaluation</h3>
                 </div>
                 <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 italic font-medium">
                    "{predictions?.aiInsights || "Your analytical abilities form a profound baseline for accelerated learning."}"
                 </p>
              </div>
           </Card>
         </div>
      )}

    </div>
  );
};

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 inline">
    <path d="M21 2v6h-6"></path><path d="M21 13a9 9 0 1 1-3-7.7L21 8"></path>
  </svg>
)

export default Analytics;
