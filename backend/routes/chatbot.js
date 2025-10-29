import express from 'express';

const router = express.Router();

// Chat history storage (in production, use database)
const chatHistory = [];

// Send message to chatbot
router.post('/message', async (req, res) => {
  const { message, userId, userRole } = req.body;
  
  // Store user message
  const userMessage = {
    id: chatHistory.length + 1,
    sender: 'user',
    message,
    timestamp: new Date()
  };
  chatHistory.push(userMessage);
  
  // Generate AI response (placeholder - integrate with OpenAI API in production)
  let botResponse = '';
  
  // Simple keyword-based responses (replace with actual AI in production)
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule')) {
    botResponse = 'I can help you with the timetable! Which class and day are you interested in?';
  } else if (lowerMessage.includes('attendance')) {
    botResponse = 'Your current attendance rate is 95%. You have attended 19 out of 20 classes this month. Keep up the great work!';
  } else if (lowerMessage.includes('grade') || lowerMessage.includes('marks')) {
    botResponse = 'Your current GPA is 3.6. You\'re performing well! Would you like a detailed breakdown by subject?';
  } else if (lowerMessage.includes('assignment')) {
    botResponse = 'You have 2 pending assignments: Mathematics (due Oct 28) and Science (due Oct 30).';
  } else {
    botResponse = `I'm here to help with information about timetables, attendance, grades, and assignments. How can I assist you today?`;
  }
  
  const aiMessage = {
    id: chatHistory.length + 1,
    sender: 'bot',
    message: botResponse,
    timestamp: new Date()
  };
  chatHistory.push(aiMessage);
  
  res.json(aiMessage);
});

// Get chat history
router.get('/history', (req, res) => {
  res.json(chatHistory.slice(-50)); // Return last 50 messages
});

// Clear chat history
router.delete('/history', (req, res) => {
  chatHistory.length = 0;
  res.json({ message: 'Chat history cleared' });
});

export default router;
