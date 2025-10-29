# 🚀 Complete Setup Guide - EduAdmin AI Platform

## Prerequisites Checklist

Before you begin, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ npm or yarn package manager
- ✅ MongoDB installed (optional - app works without it)
- ✅ A code editor (VS Code recommended)
- ✅ Git for version control

## Step-by-Step Installation

### 1️⃣ Clone or Download the Project

```bash
cd D:\Capstone
```

### 2️⃣ Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
The `.env` file is already created. Review and update if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edu-admin
JWT_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
```

**Important Notes:**
- MongoDB is **optional**. The app will run with in-memory data if MongoDB is not available
- Change `JWT_SECRET` in production to a secure random string
- Add your OpenAI API key later when you're ready to enable AI features

#### Start the Backend Server
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
⚠️  MongoDB URI not found. Running without database connection.
```

**Test the Backend:**
Open browser and go to: `http://localhost:5000/api/health`
You should see: `{"status":"ok","message":"Server is running"}`

### 3️⃣ Frontend Setup

Open a **new terminal** (keep backend running):

```bash
cd D:\Capstone\frontend
npm install
```

#### Start the Development Server
```bash
npm run dev
```

You should see:
```
ROLLDOWN-VITE v7.1.14  ready in 282 ms
➜  Local:   http://localhost:5173/
```

### 4️⃣ Access the Application

1. Open your browser
2. Go to: `http://localhost:5173`
3. You'll see the login page

#### Demo Login Credentials

**Click the quick login buttons or use:**

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@school.com     | admin123    |
| Teacher | teacher@school.com   | teacher123  |
| Student | student@school.com   | student123  |

## 🎯 First Steps After Login

### 1. Explore the Dashboard
- View KPIs and statistics
- Check attendance trends
- See performance analytics

### 2. Try Different Modules
- **Students**: Add, edit, or view student profiles
- **Attendance**: Mark attendance for different classes
- **Timetable**: View and manage class schedules
- **AI Chatbot**: Ask questions about timetables, grades, etc.
- **Analytics**: View AI-powered insights
- **Reports**: Generate various reports
- **Notifications**: Check system notifications
- **Settings**: Customize your profile and preferences

### 3. Test Dark Mode
- Click the moon/sun icon in the top navbar
- Theme preference is saved automatically

## 🤖 Enabling AI Features

### OpenAI Integration (Optional)

1. **Get API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account
   - Generate an API key

2. **Update Backend**
   ```bash
   cd backend
   npm install openai
   ```

3. **Add API Key to .env**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Update Chatbot Route**
   Edit `backend/routes/chatbot.js`:
   ```javascript
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });
   
   // Replace the simple keyword responses with:
   const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [
       { role: "system", content: "You are a helpful educational assistant..." },
       { role: "user", content: message }
     ]
   });
   
   botResponse = completion.choices[0].message.content;
   ```

5. **Restart Backend Server**

## 🗄️ MongoDB Setup (Optional)

If you want to use MongoDB instead of in-memory data:

### Windows:
1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Edition
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

### Mac/Linux:
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Verify MongoDB is Running:
```bash
mongosh
# Should connect to mongodb://localhost:27017
```

The backend will automatically connect to MongoDB if the URI is configured in `.env`.

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### CORS Issues
If you see CORS errors in the browser console:
- Ensure backend is running on port 5000
- Check that CORS is enabled in `backend/server.js`

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Styles Not Working
The CSS warnings about `@tailwind` are normal and don't affect functionality. Tailwind will work correctly at runtime.

## 📱 Mobile Testing

1. Find your local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update frontend API calls to use your IP instead of localhost

3. Access from mobile: `http://YOUR-IP:5173`

## 🚀 Production Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Heroku)
1. Create account on Railway.app or Heroku
2. Connect your Git repository
3. Add environment variables in dashboard
4. Deploy

### Important for Production:
- Change `JWT_SECRET` to a secure random string
- Use production MongoDB instance (MongoDB Atlas)
- Enable HTTPS
- Set proper CORS origins
- Add rate limiting

## 📊 Sample Data Overview

The application includes:
- **3 demo students** with complete profiles
- **5 attendance records** across different dates
- **2 timetable days** with multiple periods
- **4 notifications** (read and unread)
- **Mock analytics data** for charts
- **3 previous reports**

## 🎓 Next Steps

1. **Customize Branding**
   - Update logo in `Sidebar.tsx`
   - Change color scheme in `tailwind.config.js`
   - Modify app name throughout

2. **Add Real Data**
   - Import student CSV files
   - Set up database connection
   - Configure actual timetables

3. **Extend Features**
   - Add parent portal
   - Implement document management
   - Create mobile app (React Native)

4. **Integrate AI**
   - Connect OpenAI for chatbot
   - Add predictive analytics models
   - Enable facial recognition attendance

## 📞 Need Help?

- Check the main README.md
- Review API documentation in backend/README.md
- Check browser console for errors
- Ensure both servers are running

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login with demo credentials
- [ ] Dashboard displays charts
- [ ] Can navigate between all pages
- [ ] Dark mode works
- [ ] Sidebar collapses on click
- [ ] Notifications display correctly
- [ ] Chatbot responds to messages
- [ ] Can add/edit student data

## 🎉 You're All Set!

Your AI-Powered Educational Administration Platform is ready to use. Explore all the features and customize it for your needs!

---

**Happy Coding! 🚀**
