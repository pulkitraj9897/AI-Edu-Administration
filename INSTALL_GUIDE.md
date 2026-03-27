# Comprehensive Project Installation & Setup Guide

This guide details the exact, step-by-step process required to clone, configure, and launch the **AI-Powered Educational Administration Platform** locally without encountering "missing module" errors.

---

## 🛑 Common Errors & Why They Happen
If you are seeing errors like:
- `Cannot find module 'express'`
- `vite: command not found`
- `Error: Cannot find module 'react'`
- `Cannot find module 'multer'`

**Reason**: This happens because the source code repository strictly does *not* include the heavy `node_modules/` folders (tracked via `.gitignore`). You must manually tell `npm` (Node Package Manager) to download all the required libraries explicitly listed in our `package.json` files before attempting to boot the servers.

---

## 🛠️ Step 1: Install Required System Software
Before interacting with the terminal, ensure your PC has the necessary base software installed:
1. **Node.js**: The JavaScript runtime environment.
   - Download the LTS (Long Term Support) version from: [https://nodejs.org/](https://nodejs.org/)
   - *Verification*: Open your terminal (Command Prompt, PowerShell, or Git Bash) and type `node -v` and `npm -v`. Both commands should print versions (e.g., `v18.0.0`).
2. **MongoDB**: The NoSQL Database.
   - For local development, install MongoDB Community Server: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - *Verification*: Your local computer should now be reserving the generic MongoDB port: `localhost:27017`.
3. **VS Code** (Recommended Code Editor).

---

## 📥 Step 2: Clone the Project
Open your terminal inside the folder where you want to store the Capstone project.

```bash
git clone https://github.com/pulkitraj9897/AI-Edu-Administration.git
cd AI-Edu-Administration
```

---

## ⚙️ Step 3: Backend Setup & Dependency Installation

Because our architecture separates the Server (Backend) from the UI (Frontend), they handle entirely completely different pools of modules. **You must install backend modules explicitly**.

1. Open a terminal and navigate into the `backend/` folder:
```bash
cd backend
```

2. Force npm to install every package listed in `backend/package.json` (such as `express`, `mongoose`, `jsonwebtoken`, `multer`, `bcryptjs`, and `cors`):
```bash
npm install
```
*(Wait until you see `added X packages, and audited...`)*

3. **Critical**: Create the Environment configuration file.
Inside the `backend/` folder, create a new file named exactly `.env`. Paste the following text strictly:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-edu-admin
JWT_SECRET=super_secret_capstone_key_2026
```

4. Boot the server explicitly:
```bash
npm start
```
*Expected Output:*
```text
🚀 Server running on http://localhost:5000
✅ MongoDB connected successfully
```
*(Leave this terminal window completely open and running)*

---

## 🎨 Step 4: Frontend Setup & Dependency Installation

Now you must resolve the User Interface dependencies (like `react`, `vite`, `tailwindcss`, `lucide-react`, and `axios`).

1. Open a **SECOND, NEW** terminal window. Navigate into the `frontend/` folder:
```bash
cd frontend
```

2. Force npm to pull down all frontend visual libraries strictly:
```bash
npm install
```
*(This may take a minute or two as it pulls down React and Tailwind compilers)*

3. Launch the Vite Development Server explicitly:
```bash
npm run dev
```

*Expected Output:*
```text
  VITE v5.x.x  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🚀 Step 5: Explore the Application

1. Open your Chrome/Firefox browser and navigate to: `http://localhost:5173`
2. Since the database is freshly generated and empty, if you do not have the CSV seeding tools configured, you may need to use `Postman` to hit the `POST /api/auth/register` route, or utilize any Data Seed scripts provided in the repository to generate testing accounts.
3. If seed data is active, login via:
   - **Admin View**: `admin@school.com` | Password: `admin123`
   - **Teacher View**: `teacher@school.com` | Password: `teacher123`
   - **Student View**: `student@school.com` | Password: `student123`

---

## ℹ️ Troubleshooting Guide
- **"EADDRINUSE: address already in use :::5000"**
  - *Fix*: You already have a backend node server running in the background. Close the rogue terminal using `CTRL+C`, or restart your PC, and try `npm start` again.
- **"MongoTimeoutError" or "Server selection timed out after 30000 ms"**
  - *Fix*: The Node application cannot detect your MongoDB database. Ensure the MongoDB Community Server Service is actively running under Windows Services, or check that your `.env` connection string properly maps to an active Cloud Atlas string.
- **"Axios Network Error / Connection Refused"**
  - *Fix*: Your Frontend (localhost:5173) is running fine, but it failed to speak to your Backend. Ensure your Backend Terminal (localhost:5000) hasn't crashed.
