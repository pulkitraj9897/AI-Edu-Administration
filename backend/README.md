# Backend - Educational Administration Platform

Express.js REST API for the AI-powered educational administration platform.

## 🚀 Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:5000`

## 📋 Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edu-admin
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

## 🔌 API Routes

All routes are prefixed with `/api`

### Authentication (`/auth`)
- `POST /login` - User login
- `POST /register` - User registration

### Students (`/students`)
- `GET /` - Get all students
- `GET /:id` - Get student by ID
- `POST /` - Create new student
- `PUT /:id` - Update student
- `DELETE /:id` - Delete student

### Attendance (`/attendance`)
- `GET /` - Get attendance records (supports date and class filters)
- `POST /` - Mark attendance
- `GET /stats` - Get attendance statistics

### Timetable (`/timetable`)
- `GET /` - Get timetable (supports class filter)
- `POST /` - Create timetable entry

### Analytics (`/analytics`)
- `GET /dashboard` - Dashboard analytics
- `GET /predictions` - AI predictions

### Reports (`/reports`)
- `GET /` - Get all reports
- `POST /attendance` - Generate attendance report
- `POST /performance` - Generate performance report
- `POST /ai-summary` - Generate AI summary

### Chatbot (`/chatbot`)
- `POST /message` - Send message to chatbot
- `GET /history` - Get chat history
- `DELETE /history` - Clear chat history

### Notifications (`/notifications`)
- `GET /` - Get all notifications
- `GET /:id` - Get notification by ID
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `POST /` - Create notification
- `DELETE /:id` - Delete notification

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/teacher/student),
  avatar: String,
  phone: String,
  createdAt: Date
}
```

### Student
```javascript
{
  studentId: String (unique),
  name: String,
  email: String,
  phone: String,
  class: String,
  section: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  parentName: String,
  parentPhone: String,
  admissionDate: Date,
  status: String (active/inactive),
  performance: {
    gpa: Number,
    attendance: Number,
    rank: Number
  }
}
```

### Attendance
```javascript
{
  studentId: String,
  date: Date,
  status: String (present/absent/late/excused),
  class: String,
  period: String,
  markedBy: String,
  timestamp: Date
}
```

## 🤖 AI Integration

### OpenAI Chatbot Integration

Install OpenAI SDK:
```bash
npm install openai
```

Update `routes/chatbot.js`:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/message', async (req, res) => {
  const { message } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a helpful educational assistant." },
      { role: "user", content: message }
    ]
  });
  
  res.json({ message: completion.choices[0].message.content });
});
```

## 🔐 Authentication

The API uses JWT for authentication. Protected routes require:

```
Authorization: Bearer <token>
```

## 📊 Sample Data

The API includes sample data for testing:
- 3 demo students
- 5 attendance records
- 2 timetable entries
- Mock analytics data

## 🚀 Deployment

### Heroku
```bash
heroku create
git push heroku main
heroku config:set MONGODB_URI=your-mongodb-uri
```

### Railway
1. Connect your GitHub repo
2. Add environment variables
3. Deploy

## 🔧 Development

Start with auto-reload:
```bash
npm run dev
```

## 📝 Notes

- MongoDB connection is optional - the app runs without it using in-memory data
- Replace sample data with database queries in production
- Implement proper error handling and validation
- Add rate limiting for production
- Set up proper logging

## 🤝 Contributing

Please read the main README for contribution guidelines.
