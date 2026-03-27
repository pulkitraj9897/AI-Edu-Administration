# 🛠️ Technology Stack & Tools

This document outlines the core technologies, frameworks, and libraries used to build the **AI-Powered Educational Administration Platform**, along with a brief explanation of why each was chosen and its role in the project.

---

## 🏗️ Core Architecture (MERN Stack)
The project is built on the **MERN** stack (MongoDB, Express, React, Node.js), a popular JavaScript-based framework stack that allows for building robust, scalable full-stack web applications entirely in JavaScript/TypeScript.

---

## 💻 Frontend (Client-Side)

The frontend is a Single Page Application (SPA) designed for speed, responsiveness, and a highly polished user experience.

- **React 19**: The core JavaScript library for building the user interface. We use functional components and Hooks (`useState`, `useEffect`, `useContext`) to manage application state and rendering interactively without page reloads.
- **Vite**: A modern frontend build tool that significantly improves the developer experience. It provides extremely fast Hot Module Replacement (HMR) during development and highly optimized, minified bundles for the final production build, outperforming legacy tools like Create React App (Webpack).
- **TypeScript**: A superset of JavaScript that adds static typing. It helps catch errors early during development, provides powerful auto-completion in code editors, and makes the codebase much more maintainable by strictly defining the shapes of objects (like `User` or `Document` interfaces).
- **Tailwind CSS**: A utility-first CSS framework used for all styling. Instead of writing custom CSS files, Tailwind provides compositional classes (e.g., `flex`, `text-center`, `bg-blue-500`) directly in the HTML/JSX. It natively supports dark mode and responsive layouts out of the box.
- **React Router v7**: The standard routing library for React. It handles navigation between different views (Dashboard, Timetable, Settings) smoothly without refreshing the browser window, giving the application a native-app feel.
- **Axios**: A promise-based HTTP client used to make requests to our backend API. It simplifies fetching data and allows us to use "interceptors" to automatically attach our security tokens to every request.
- **Recharts**: A composable charting library built on React components. It is used to render the beautiful, interactive analytics charts (like attendance trends and student performance) on the administrative dashboard.
- **Lucide React**: A clean, scalable SVG icon library used for all the visual icons across the application UI (e.g., sidebar icons, buttons, action indicators).

---

## ⚙️ Backend (Server-Side)

The backend acts as a secure, stateless REST API that handles all business logic, database interactions, and authentication.

- **Node.js**: A JavaScript runtime environment that executes JavaScript code outside a web browser. It is built on Chrome's V8 engine and uses an asynchronous, event-driven model, making it exceptionally efficient for I/O-heavy operations like database queries and API requests.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js. It provides robust routing and middleware capabilities, allowing us to easily handle different HTTP methods (GET, POST, PUT, DELETE) and structure our API endpoints cleanly.
- **MongoDB**: A highly scalable NoSQL document database. Unlike traditional SQL databases (which use tables and rows), MongoDB stores data in flexible, JSON-like documents. This is perfect for educational data, where documents like a User or Student might need flexible arrays or nested objects.
- **Mongoose**: An elegant Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straight-forward, schema-based solution to model our application data, enforcing strict validation rules and data types before anything is saved to the database.

---

## 🔒 Security & Utilities

- **JSON Web Tokens (JWT)**: Used for stateless user authentication. When a user logs in, the server generates a cryptographically signed token. The frontend stores this token and sends it with every subsequent request, proving the user's identity and role (Admin, Teacher, or Student) without the server needing to store session data in memory.
- **bcryptjs**: A cryptographic library used to salt and hash user passwords before they are stored in the database. This ensures that even if the database is technically compromised, the actual passwords remain completely unreadable and secure.
- **Multer**: A Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files. We use it to securely capture profile avatars and study material documents, validate their types, and save them to the local `/uploads` filesystem.

---

## 🛠️ Development & Version Control

- **Git & GitHub**: Used for source code version control, tracking history, and collaborative development.
- **VS Code**: The primary Integrated Development Environment (IDE) used to write, format, and debug the codebase.
- **Prettier & ESLint**: Code formatting and linting tools configured to enforce consistent code styling and catch programmatic errors dynamically as code is written.
