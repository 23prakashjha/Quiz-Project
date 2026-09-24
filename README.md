# 🤖 QuizVerse AI — Intelligent Learning & Assessment Platform

A full-stack MERN platform that doesn't just conduct quizzes — it **analyzes performance with AI** and delivers personalized learning recommendations and **adaptive quizzes** that adjust difficulty to each student in real time.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## ✨ Features

### 🤖 AI Module (the differentiator)
- **AI question generation** — admin enters `Topic + Difficulty + Count` → OpenAI (or the built-in engine) writes fresh questions
- **AI answer explanations** — a student who gets a question wrong gets a "why your answer is wrong" explanation
- **AI performance report** — after each quiz, an AI report highlights strengths, weaknesses, and next steps
- **Personalized recommendations** — weak topics drive suggested adaptive quizzes on the dashboard & home page

### ⚡ Adaptive Quiz Engine
Instead of a fixed test, difficulty **adjusts after every answer**:
- ✅ Correct twice in a row → difficulty goes **up**
- ❌ Wrong → difficulty goes **down** + an AI concept explanation is shown
- The session ends by generating an attempt + AI report automatically

### 👨‍🎓 Student Module
Register/login · select topic & difficulty · attempt classic or adaptive quizzes · view AI report · review answers · track progress & weak topics · get recommended quizzes

### 👨‍🏫 Admin/Teacher Module
AI question generator · create/edit/delete questions · manage users · platform statistics (attempts per topic, top students, recent activity)

### Core
- 30+ quiz topics · JWT auth · dark mode · responsive Tailwind UI · animated progress · confetti results · timer · result sharing

## 🚀 Live Demo

**Frontend:** [https://quiz-frontend-latest.netlify.app](https://quiz-frontend-latest.netlify.app)  
**Backend API:** [https://quiz-project-aqu6.onrender.com](https://quiz-project-aqu6.onrender.com)

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

### 🤖 AI
| Provider | Notes |
|---------|-------|
| OpenAI (optional) | `OPENAI_API_KEY` in `Backend/.env` → GPT question generation, explanations & reports |
| Built-in mock engine | No key needed — deterministic question bank + rule-based analysis keeps the app fully functional offline |

## 📁 Project Structure

```
Quiz-Project/
├── Backend/
│   ├── config/db.js                # MongoDB connection
│   ├── middleware/authMiddleware.js# JWT auth middleware
│   ├── models/
│   │   ├── Question.js             # Question schema (difficulty + explanation)
│   │   ├── QuizAttempt.js          # Saved attempts + learning history
│   │   ├── AdaptiveSession.js      # Active adaptive quiz sessions
│   │   └── User.js                 # User schema with bcrypt & roles
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── quizRoutes.js           # /api/quiz
│   │   ├── attemptRoutes.js        # /api/attempts
│   │   ├── adaptiveRoutes.js       # /api/quiz/adaptive
│   │   ├── aiRoutes.js             # /api/ai
│   │   └── adminRoutes.js          # /api/admin
│   ├── services/aiService.js       # OpenAI + mock AI engine
│   ├── utils/generateToken.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api.js                  # Central API config
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── AdminPanel.jsx
│   │   └── pages/
│   │       ├── Home.jsx            # Topic grid + AI recommendations
│   │       ├── QuizPage.jsx        # Classic quiz (difficulty setup)
│   │       ├── AdaptiveQuizPage.jsx# ✨ Adaptive engine UI
│   │       ├── ResultPage.jsx      # AI report + answer review
│   │       ├── Dashboard.jsx       # 📊 Student analytics
│   │       ├── AdminDashboard.jsx  # Teacher: questions/users/stats/AI
│   │       └── ...
│   └── package.json
```

## 🧪 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/quiz?language=react&difficulty=easy&generate=1` | Fetch questions (AI fallback when bank empty) | No |
| POST | `/api/quiz/add` · `/add-multiple` | Add single / bulk questions | Bearer |
| POST | `/api/attempts` | Save attempt → returns AI analysis | Bearer |
| GET | `/api/attempts` | Student learning history | Bearer |
| GET | `/api/attempts/stats` | Per-topic analytics + recommendations | Bearer |
| POST | `/api/quiz/adaptive/start` | Start adaptive session | Bearer |
| POST | `/api/quiz/adaptive/:id/answer` | Answer → server adjusts difficulty | Bearer |
| GET | `/api/quiz/adaptive/:id` | Session status | Bearer |
| POST | `/api/ai/generate-questions` | AI question generation | Admin |
| POST | `/api/ai/explain` | "Why was my answer wrong?" | Bearer |
| POST | `/api/ai/analyze` | Personalized study report | Bearer |
| GET | `/api/admin/stats` | Platform quiz statistics | Admin |

### Question Schema
```json
{
  "language": "react",
  "questionText": "How do you prevent a child component from re-rendering?",
  "options": ["React.memo", "useState", "useContext", "render-prop"],
  "correctAnswer": 0,
  "difficulty": "easy",
  "explanation": "React.memo wraps the component and performs a shallow prop comparison.",
  "aiGenerated": false
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

# Create .env file (see Backend/.env.example)
# MONGO_URI, JWT_SECRET, PORT
# Optional AI: OPENAI_API_KEY=sk-...  (falls back to the mock engine if empty)

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Optional: create frontend/.env
# VITE_API_URL=http://localhost:5000   (defaults to the deployed API)

npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 🎨 Design Highlights

- **Glassmorphism cards** with backdrop blur
- **Animated gradient borders** on interactive elements
- **Smooth page transitions** via custom `fade-in`, `slide-up`, `scale-in` animations
- **Progress ring** with animated stroke-dashoffset
- **Confetti explosion** on quiz completion
- **Custom Tailwind charts** — lightweight progress bars & stat cards (no chart library)
- **Shimmer/loading states** for async operations
- **Fully responsive** grid that adapts from 1 to 4 columns

## 🌙 Dark Mode

Toggle dark mode via the sun/moon icon in the navbar. The preference is saved to `localStorage` and also respects the system's `prefers-color-scheme` media query.

## 🤝 Contributing

PRs are welcome! Feel free to add AI topics, extend the adaptive engine, or improve analytics.

## 📄 License

MIT
