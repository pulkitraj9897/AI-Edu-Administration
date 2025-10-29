import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Palette, Globe, Shield } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('themeColor') || 'blue';
  });

  // Apply saved theme color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor') || 'blue';
    document.documentElement.setAttribute('data-theme-color', savedColor);
    
    const colors: { [key: string]: string } = {
      blue: '#3b82f6',
      purple: '#a855f7',
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      pink: '#ec4899',
    };
    
    document.documentElement.style.setProperty('--theme-primary', colors[savedColor]);
  }, []);

  const applyThemeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    document.documentElement.setAttribute('data-theme-color', color);
    
    // Update CSS variables for the selected color
    const colors: { [key: string]: string } = {
      blue: '#3b82f6',
      purple: '#a855f7',
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      pink: '#ec4899',
    };
    
    document.documentElement.style.setProperty('--theme-primary', colors[color]);
    
    // Show success message
    alert(`Theme color changed to ${color}!`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              <Card title="Profile Information">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white capitalize"
                      />
                    </div>
                  </div>

                  <Button>Save Changes</Button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      SMS Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive important updates via SMS
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <>
              <Card title="Change Password">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <Button>Update Password</Button>
                </div>
              </Card>

              <Card title="Two-Factor Authentication">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Secure your account
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'appearance' && (
            <Card title="Appearance Settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Toggle dark mode on or off
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isDarkMode}
                      onChange={toggleTheme}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Theme Color
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Choose your preferred accent color
                  </p>
                  <div className="grid grid-cols-6 gap-3">
                    <button
                      onClick={() => applyThemeColor('blue')}
                      className={`w-12 h-12 rounded-lg bg-blue-600 hover:ring-2 ring-offset-2 ring-blue-600 transition-all ${
                        themeColor === 'blue' ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                      }`}
                      title="Blue"
                    ></button>
                    <button
                      onClick={() => applyThemeColor('purple')}
                      className={`w-12 h-12 rounded-lg bg-purple-600 hover:ring-2 ring-offset-2 ring-purple-600 transition-all ${
                        themeColor === 'purple' ? 'ring-2 ring-offset-2 ring-purple-600' : ''
                      }`}
                      title="Purple"
                    ></button>
                    <button
                      onClick={() => applyThemeColor('green')}
                      className={`w-12 h-12 rounded-lg bg-green-600 hover:ring-2 ring-offset-2 ring-green-600 transition-all ${
                        themeColor === 'green' ? 'ring-2 ring-offset-2 ring-green-600' : ''
                      }`}
                      title="Green"
                    ></button>
                    <button
                      onClick={() => applyThemeColor('orange')}
                      className={`w-12 h-12 rounded-lg bg-orange-600 hover:ring-2 ring-offset-2 ring-orange-600 transition-all ${
                        themeColor === 'orange' ? 'ring-2 ring-offset-2 ring-orange-600' : ''
                      }`}
                      title="Orange"
                    ></button>
                    <button
                      onClick={() => applyThemeColor('red')}
                      className={`w-12 h-12 rounded-lg bg-red-600 hover:ring-2 ring-offset-2 ring-red-600 transition-all ${
                        themeColor === 'red' ? 'ring-2 ring-offset-2 ring-red-600' : ''
                      }`}
                      title="Red"
                    ></button>
                    <button
                      onClick={() => applyThemeColor('pink')}
                      className={`w-12 h-12 rounded-lg bg-pink-600 hover:ring-2 ring-offset-2 ring-pink-600 transition-all ${
                        themeColor === 'pink' ? 'ring-2 ring-offset-2 ring-pink-600' : ''
                      }`}
                      title="Pink"
                    ></button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Selected: <span className="font-medium capitalize">{themeColor}</span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card title="General Preferences">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                    <option>UTC-05:00 (Eastern Time)</option>
                    <option>UTC-06:00 (Central Time)</option>
                    <option>UTC-07:00 (Mountain Time)</option>
                    <option>UTC-08:00 (Pacific Time)</option>
                  </select>
                </div>

                <Button>Save Preferences</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
