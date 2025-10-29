import express from 'express';

const router = express.Router();

// Sample notifications
let notifications = [
  {
    id: 1,
    title: 'New Assignment Posted',
    message: 'Mathematics assignment for Chapter 5 has been posted',
    type: 'assignment',
    priority: 'medium',
    read: false,
    timestamp: new Date('2024-10-26T09:00:00')
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting',
    message: 'Parent-teacher meeting scheduled for Nov 5th at 3 PM',
    type: 'event',
    priority: 'high',
    read: false,
    timestamp: new Date('2024-10-25T14:30:00')
  },
  {
    id: 3,
    title: 'Attendance Alert',
    message: 'Your attendance has dropped below 90%',
    type: 'alert',
    priority: 'high',
    read: true,
    timestamp: new Date('2024-10-24T11:00:00')
  },
  {
    id: 4,
    title: 'Grade Updated',
    message: 'Your Science exam grade has been updated',
    type: 'grade',
    priority: 'low',
    read: true,
    timestamp: new Date('2024-10-23T16:45:00')
  }
];

// Get all notifications
router.get('/', (req, res) => {
  const { unreadOnly } = req.query;
  
  if (unreadOnly === 'true') {
    return res.json(notifications.filter(n => !n.read));
  }
  
  res.json(notifications);
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
  const notification = notifications.find(n => n.id === parseInt(req.params.id));
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notification.read = true;
  res.json(notification);
});

// Mark all as read
router.put('/read-all', (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ message: 'All notifications marked as read' });
});

// Create new notification
router.post('/', (req, res) => {
  const newNotification = {
    id: notifications.length + 1,
    ...req.body,
    read: false,
    timestamp: new Date()
  };
  
  notifications.unshift(newNotification);
  res.status(201).json(newNotification);
});

// Delete notification
router.delete('/:id', (req, res) => {
  const index = notifications.findIndex(n => n.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notifications.splice(index, 1);
  res.json({ message: 'Notification deleted' });
});

export default router;
