import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Sample users (in production, use database)
const users = [
  { id: 1, email: 'admin@school.com', password: '$2a$10$XQKvv9zXQK9XQKXQKXQKXO', name: 'Admin User', role: 'admin' },
  { id: 2, email: 'teacher@school.com', password: '$2a$10$XQKvv9zXQK9XQKXQKXQKXO', name: 'John Teacher', role: 'teacher' },
  { id: 3, email: 'student@school.com', password: '$2a$10$XQKvv9zXQK9XQKXQKXQKXO', name: 'Jane Student', role: 'student' }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes, accept any password
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    };
    
    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
