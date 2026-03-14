import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Bot,
  BarChart3,
  FileText,
  Bell,
  Settings,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/teachers', icon: BookOpen, label: 'Teachers', roles: ['admin'] },
    { path: '/marks', icon: Award, label: 'Marks' },
    { path: '/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/chatbot', icon: Bot, label: 'AI Chatbot' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
    { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'teacher'] },
    { path: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'teacher', 'student'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
              EduAdmin
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              AI-Powered Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
