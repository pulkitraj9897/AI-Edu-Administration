# AI-Powered Educational Administration Platform

This is a web application I built to help schools and universities manage their daily operations more efficiently. It's designed as an administration dashboard where you can handle everything from student records to attendance tracking. I built it using React and Node.js, and it's set up to integrate AI features when needed.

## 🚀 What It Does

### Main Features
- **Dashboard Overview** - See all the important stats at a glance with charts and quick action buttons
- **Student Management** - Add, edit, or remove student records. You can also import/export data using CSV files
- **Attendance System** - Mark attendance manually, with the structure ready for facial recognition in the future
- **Timetable Management** - Create and manage class schedules (can be enhanced with AI optimization later)
- **AI Chatbot** - A helpful assistant that answers questions about the system
- **Performance Analytics** - Track student performance with insights and predictions
- **Report Generation** - Generate detailed reports in PDF or CSV format
- **Notifications** - Stay updated with important alerts and announcements
- **Settings** - Manage your profile and customize your preferences

### Technical Details
- 🎨 **Modern Interface** - Clean design with dark and light themes using TailwindCSS
- 📱 **Works Everywhere** - Looks great on phones, tablets, and desktops
- 🔐 **Secure Login** - User authentication with different access levels for admins, teachers, and students
- 📊 **Visual Data** - Interactive charts to make data easy to understand
- 🤖 **AI-Ready** - Built with placeholders for AI features you can add later
- ⚡ **Fast & Modern** - Built with the latest React 19 and Vite

## 📋 Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Styling:** TailwindCSS
- **Routing:** React Router v7
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **PDF Generation:** jsPDF

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT + bcryptjs
- **CORS Enabled**

## 🛠️ How to Set It Up

### What You'll Need
- Node.js version 18 or higher
- MongoDB (optional - the app will work without a database for demo purposes)
- Git

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edu-admin
JWT_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
```

Start the backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👤 Login Credentials for Testing

### Demo Accounts (You Can Use These)
- **Admin Account:** admin@school.com / admin123
- **Teacher Account:** teacher@school.com / teacher123
- **Student Account:** student@school.com / student123

## 🎯 Getting Started Quickly

1. **Download the Code**
   ```bash
   git clone <repository-url>
   cd Capstone
   ```

2. **Install Required Packages**
   You'll need to install packages for both the backend and frontend:
   ```bash
   # First, the backend
   cd backend
   npm install

   # Then, the frontend
   cd ../frontend
   npm install
   ```

3. **Run the Application**
   You'll need two terminal windows:
   ```bash
   # Terminal 1 - Start the backend server
   cd backend
   npm start

   # Terminal 2 - Start the frontend
   cd frontend
   npm run dev
   ```

4. **Access the App**
   Open your browser and go to `http://localhost:5173`, then login using any of the demo accounts above

## 📁 Project Structure

```
Capstone/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Express server
│   └── .env            # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Route pages
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/stats` - Get statistics

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create timetable entry

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/predictions` - AI predictions

### Reports
- `POST /api/reports/attendance` - Generate attendance report
- `POST /api/reports/performance` - Generate performance report
- `POST /api/reports/ai-summary` - AI summary report

### Chatbot
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/history` - Get chat history

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🤖 Adding AI Features (Optional)

### Setting Up the OpenAI Chatbot
If you want to enable real AI responses in the chatbot:
1. Sign up and get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file: `OPENAI_API_KEY=your-key-here`
3. Update the chatbot route in `backend/routes/chatbot.js` to use the OpenAI SDK
4. Install the OpenAI package: `npm install openai`

### Example Integration:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: message }]
});
```

## 🎨 Customization

### Theme Colors
Edit `frontend/tailwind.config.js` to customize colors:
```javascript
colors: {
  primary: {
    500: '#3b82f6', // Change to your brand color
  }
}
```

### Adding New Pages
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation item in `frontend/src/components/Layout/Sidebar.tsx`

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Collapsible sidebar on mobile
- Touch-friendly buttons
- Optimized table views
- Responsive charts

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected API routes
- CORS configuration
- Input validation
- Role-based access control

## 🚀 Deploying to Production

### Deploying the Frontend (Netlify or Vercel)
Build the frontend first:
```bash
cd frontend
npm run build
# Then upload the 'dist' folder to your hosting service
```

### Deploying the Backend (Heroku or Railway)
```bash
cd backend
# Follow your hosting platform's instructions to deploy
```

### Important Note
Make sure to add all your environment variables (like API keys and database URLs) to your production hosting environment!

## 📝 Sample Data

The application comes with sample data for:
- 3 demo students
- Sample attendance records
- Timetable for classes
- Mock analytics data
- Notification examples

## 🤝 Want to Contribute?

I welcome contributions! Here's how you can help:
1. Fork this repository
2. Create a new branch for your feature
3. Make your changes and commit them
4. Push your branch
5. Open a Pull Request with a description of what you've added or fixed

## 📄 License

This project is under the MIT License, which means you're free to use it for educational or personal projects.

## 🙏 Credits

This project wouldn't be possible without these amazing tools:
- React - for making frontend development enjoyable
- TailwindCSS - for making styling so much easier
- Recharts - for the beautiful and interactive charts
- Lucide - for the clean icon library

## 📞 Need Help?

If you run into any issues or have questions:
- Open an issue on GitHub
- Check out the documentation files in this repository
- Review the API endpoints list

## 🎓 Use Cases

I designed this project with educational institutions in mind, but it's flexible enough to be:
- Used as a capstone or portfolio project
- Extended with additional features for specific needs
- Integrated with existing school management systems
- Customized for different types of educational institutions (K-12, colleges, training centers)

---

**Built with care to help educational institutions run more smoothly**
