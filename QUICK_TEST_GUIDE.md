# ⚡ Quick Test Guide - 5 Minutes to See Everything

## 🚀 Start the Application

### Option 1: Using the Batch Script (Easiest)
1. Double-click **`start-dev.bat`** in the Capstone folder
2. Wait for both servers to start
3. Go to `http://localhost:5173`

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd D:\Capstone\backend
npm start

# Terminal 2 - Frontend  
cd D:\Capstone\frontend
npm run dev
```

---

## 🔐 Login

### Quick Login Options
On the login page, click any of these buttons:
- **Admin** (full access)
- **Teacher** (moderate access)
- **Student** (limited access)

Or manually type:
- Email: `admin@school.com`
- Password: `admin123`

---

## ✅ 5-Minute Feature Checklist

### 1. Dashboard (Home Page)
After login, you should see:
- [ ] 4 KPI cards with numbers (Total Students: 1250, etc.)
- [ ] Line chart showing attendance trends
- [ ] Bar chart showing class performance
- [ ] Pie chart showing subject distribution
- [ ] Recent alerts section
- [ ] AI insights panel

**Test**: Click "Generate Report" button → Should navigate to Reports page

---

### 2. Students Page
Click "Students" in the sidebar
- [ ] Table showing 3 students (Alice, Bob, Charlie)
- [ ] Search bar at top
- [ ] Class filter dropdown
- [ ] Import/Export buttons
- [ ] Edit, View, Delete icons on each row

**Test**: 
- Type "Alice" in search → Table filters to show only Alice
- Click Edit icon → Should show edit functionality placeholder
- Select "10B" from class filter → Shows only students in 10B

---

### 3. Attendance Page
Click "Attendance" in sidebar
- [ ] 4 stat cards (Total Records, Present, Absent, Rate)
- [ ] Date picker
- [ ] Class selector
- [ ] Table with 5 students
- [ ] Present/Absent/Late buttons for each student

**Test**:
- Click "Present" button for first student
- Check stats update (numbers should change)
- Change date and see different records

---

### 4. Timetable Page
Click "Timetable" in sidebar
- [ ] Class selector at top
- [ ] Weekly schedule grid (Monday-Friday)
- [ ] 4 periods per day
- [ ] Colored subject cards
- [ ] Teacher names and room numbers
- [ ] Break time row

**Test**:
- Change class from "10A" to "10B"
- See timetable update
- Hover over subject cards

---

### 5. AI Chatbot Page
Click "AI Chatbot" in sidebar
- [ ] Welcome message with bot icon
- [ ] 4 quick question buttons
- [ ] Message input at bottom
- [ ] Send button

**Test**:
- Click "What's my attendance rate?" quick question
- Should populate input field
- Click Send or press Enter
- Bot should respond with attendance info
- Try typing: "Show my timetable"

---

### 6. Analytics Page
Click "Analytics" in sidebar
- [ ] 4 stat cards (Avg Performance, At-Risk, Top Performers, etc.)
- [ ] Multi-line chart (Subject Performance Trend)
- [ ] Radar chart (Skills Assessment)
- [ ] At-Risk Students section with 2 students
- [ ] AI Recommendations section
- [ ] Predictive Insights cards

**Test**:
- Check if charts are rendering
- See at-risk students highlighted in red/yellow
- Click "View Details" button

---

### 7. Reports Page
Click "Reports" in sidebar
- [ ] Report generation form
- [ ] Report type dropdown
- [ ] Date pickers
- [ ] "Generate Report" button
- [ ] Previous reports table (3 reports)
- [ ] AI-Powered Templates section
- [ ] Export options

**Test**:
- Select "Attendance Report"
- Click "Generate Report"
- Should show success message with Report ID
- Check if new report appears in table

---

### 8. Notifications Page
Click "Notifications" in sidebar (or bell icon in navbar)
- [ ] Unread count display
- [ ] "Mark All Read" button
- [ ] Filter buttons (All / Unread)
- [ ] 4 notification cards with different colors
- [ ] Priority badges (High/Medium/Low)
- [ ] Mark as Read and Delete buttons

**Test**:
- Click "Unread" filter → Shows only unread (2 notifications)
- Click "Mark as Read" on a notification
- Unread count should decrease
- Click "All" filter → Shows all 4 again

---

### 9. Settings Page
Click "Settings" in sidebar
- [ ] 5 tabs in sidebar (Profile, Notifications, Security, Appearance, Preferences)
- [ ] Profile form with your name and email
- [ ] Profile picture placeholder

**Test**:
- Click "Appearance" tab
- Toggle Dark Mode switch
- Entire app should switch to dark theme
- Toggle back to light
- Click different tabs to see all settings

---

### 10. Theme & Responsive Testing

**Dark Mode**:
- [ ] Click moon/sun icon in top navbar
- [ ] All pages should switch themes
- [ ] Charts should adapt colors
- [ ] Preference saved (refresh page to verify)

**Sidebar**:
- [ ] Click hamburger menu (☰) in navbar
- [ ] Sidebar should collapse to icon-only mode
- [ ] Content area should expand
- [ ] Click again to expand sidebar

**Search**:
- [ ] Click search bar in navbar
- [ ] Type something
- [ ] Should be functional (ready for search implementation)

**User Menu**:
- [ ] Hover over profile picture in navbar
- [ ] Dropdown should appear
- [ ] Shows "Profile" and "Logout" options
- [ ] Click "Logout" → Returns to login page

---

## 📱 Mobile Testing (Optional)

1. Open browser DevTools (F12)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select a mobile device (iPhone, iPad, etc.)
4. Test:
   - [ ] Sidebar auto-collapses on mobile
   - [ ] All buttons are touch-friendly
   - [ ] Tables scroll horizontally
   - [ ] Charts resize properly
   - [ ] Forms are easy to fill

---

## 🔌 API Testing (Optional)

Open a new terminal and test backend:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected: {"status":"ok","message":"Server is running"}

# Test students endpoint
curl http://localhost:5000/api/students

# Expected: JSON array with 3 students
```

Or open in browser:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/students`
- `http://localhost:5000/api/attendance`

---

## 🎯 Key Features to Demonstrate

### Visual Appeal
- Modern, clean interface
- Smooth transitions
- Professional color scheme
- Consistent design language

### Functionality
- All navigation works
- Forms are interactive
- Buttons trigger actions
- Data displays correctly

### Responsiveness
- Works on different screen sizes
- Sidebar adapts to space
- Charts resize
- Tables scroll when needed

### Dark Mode
- Complete theme switching
- All components adapt
- Saved preference

---

## ❗ Common Issues & Solutions

### Backend not starting?
```bash
cd backend
npm install
node server.js
```
Should see: "🚀 Server running on http://localhost:5000"

### Frontend not starting?
```bash
cd frontend
npm install
npm run dev
```
Should see: "Local: http://localhost:5173/"

### Port already in use?
Kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Can't login?
Use quick login buttons instead of typing manually

### Charts not showing?
Refresh the page, charts may take a moment to render

---

## ✅ Success Checklist

After 5 minutes, you should have:
- [ ] Logged in successfully
- [ ] Seen all 10 pages
- [ ] Tested dark/light mode
- [ ] Collapsed/expanded sidebar
- [ ] Interacted with charts
- [ ] Clicked various buttons
- [ ] Seen data in tables
- [ ] Chatted with AI bot
- [ ] Generated a report
- [ ] Marked notifications as read

---

## 🎉 What's Next?

If everything works:
1. ✅ Read `FEATURES.md` for complete feature list
2. ✅ Check `SETUP_GUIDE.md` for AI integration
3. ✅ Review `README.md` for deployment options
4. ✅ Customize branding and colors
5. ✅ Add real data or connect database
6. ✅ Integrate AI APIs

If something doesn't work:
1. Check console for errors (F12)
2. Verify both servers are running
3. Clear browser cache
4. Restart servers
5. Check `SETUP_GUIDE.md` troubleshooting section

---

## 💡 Tips

- **Best browser**: Chrome, Edge, or Firefox
- **Screen size**: At least 1280px wide for best experience
- **Network**: Ensure localhost ports 5000 and 5173 are accessible
- **Node version**: v18 or higher recommended

---

**Enjoy exploring your new EduAdmin AI Platform! 🎓✨**
