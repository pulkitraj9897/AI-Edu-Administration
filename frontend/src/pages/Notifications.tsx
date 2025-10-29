import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  timestamp: Date;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications', {
        params: { unreadOnly: filter === 'unread' }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: any = {
      assignment: '📝',
      event: '📅',
      alert: '⚠️',
      grade: '📊',
      announcement: '📢'
    };
    return icons[type] || '🔔';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      high: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
      medium: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      low: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    };
    return colors[priority] || '';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="w-5 h-5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={getPriorityColor(notification.priority)}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        notification.read
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${
                        notification.priority === 'high'
                          ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          : notification.priority === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                          : 'bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {notification.priority}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-3 ${
                      notification.read
                        ? 'text-gray-500 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCheck className="w-4 h-4" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
