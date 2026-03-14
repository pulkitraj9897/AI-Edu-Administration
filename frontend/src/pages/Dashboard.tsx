import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Render specific dashboard based on role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user.role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-gray-500">
        <p className="text-lg font-medium">Unknown role. Dashboard not available.</p>
      </div>
    </div>
  );
};

export default Dashboard;
