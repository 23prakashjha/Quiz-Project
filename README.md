# 🧠 QuizVerse — Master the Code, One Quiz at a Time

A full-stack MERN quiz application with 30+ programming topics, JWT authentication, dark mode, and an admin panel for managing questions.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## ✨ Features

- **30+ Quiz Topics** — HTML, CSS, JavaScript, React, Python, Java, Git, Docker, and more
- **User Authentication** — Register / Login with JWT-based auth
- **Dark Mode** — Toggle between light and dark themes (persisted in localStorage)
- **Responsive Design** — Fully mobile-optimized UI with TailwindCSS
- **Animated Progress** — Real-time progress bar, timer, and circular score indicator
- **Confetti Effect** — Celebrate your results with animated confetti
- **Admin Panel** — Add questions individually, in bulk (JSON), or manage pending lists
- **Search Topics** — Quickly filter topics by name or description
- **Timer** — 1 min per question countdown with auto-submit
- **Result Sharing** — Share your score via Web Share API or clipboard copy

## 🚀 Live Demo

**Frontend:** [https://quiz-frontend-latest.netlify.app](https://quiz-frontend-latest.netlify.app)  
**Backend API:** [https://quiz-project-yx56.onrender.com](https://quiz-project-yx56.onrender.com)

## 🛠️ Tech Stack

### Frontend
| Library | Version |
|---------|---------|
| React | 19.2 |
| Vite | 7.2 |
| TailwindCSS | 4.1 |
| React Router | 7.9 |
| Axios | 1.13 |

### Backend
| Library | Version |
|---------|---------|
| Express | 4.19 |
| Mongoose | 8.8 |
| bcryptjs | 2.4 |
| jsonwebtoken | 9.0 |
| multer | 2.0 |
| pdf-parse | 2.4 |

## 📁 Project Structure

```
Quiz-Project/
├── Backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── quizController.js   # PDF parsing & legacy quiz logic
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT auth middleware
│   ├── models/
│   │   ├── Question.js         # Question schema (current)
│   │   ├── Quiz.js             # Quiz schema (legacy)
│   │   └── User.js             # User schema with bcrypt
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth (register/login)
│   │   └── quizRoutes.js       # /api/quiz (CRUD questions)
│   ├── utils/
│   │   └── generateToken.js    # JWT token helper
│   ├── server.js               # Express entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Responsive nav + dark mode toggle
│   │   │   └── AdminPanel.jsx   # Question management dashboard
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Topic grid with search
│   │   │   ├── Login.jsx        # Sign in page
│   │   │   ├── Register.jsx     # Sign up page
│   │   │   ├── QuizPage.jsx     # Quiz taking with timer
│   │   │   └── ResultPage.jsx   # Score with confetti
│   │   ├── App.jsx              # Router & auth state
│   │   ├── index.css            # Tailwind + custom animations
│   │   └── main.jsx             # React entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
```

## 🧪 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/quiz?language=html` | Fetch questions by language | No |
| POST | `/api/quiz/add` | Add single question | No |
| POST | `/api/quiz/add-multiple` | Add multiple questions | Bearer |

### Question Schema
```json
{
  "language": "html",
  "questionText": "What does HTML stand for?",
  "options": [
    "Hyper Text Markup Language",
    "High Tech Modern Language",
    "Home Tool Markup Language",
    "Hyper Transfer Markup Language"
  ],
  "correctAnswer": 0
}
```

## 🏃‍♂️ Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd Backend
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_uri" >> .env
echo "JWT_SECRET=your_secret_key" >> .env
echo "PORT=5000" >> .env

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 🎨 Design Highlights

- **Glassmorphism cards** with backdrop blur
- **Animated gradient borders** on interactive elements
- **Smooth page transitions** via custom `fade-in`, `slide-up`, `scale-in` animations
- **Floating emoji** in hero section
- **Progress ring** with animated stroke-dashoffset
- **Confetti explosion** on quiz completion
- **Shimmer loading** states for async operations
- **Custom scrollbar** matching the indigo theme
- **Fully responsive** grid that adapts from 1 to 4 columns

## 🌙 Dark Mode

Toggle dark mode via the sun/moon icon in the navbar. The preference is saved to `localStorage` and also respects the system's `prefers-color-scheme` media query.

## 🤝 Contributing

PRs are welcome! Feel free to add new quiz topics, improve animations, or fix bugs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT
