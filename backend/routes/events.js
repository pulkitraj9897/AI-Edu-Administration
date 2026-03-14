import express from 'express';
import Event from '../models/Event.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get upcoming events
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Create a new event (restricted)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating event', error: error.message });
  }
});

export default router;
