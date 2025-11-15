import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import Result from "./pages/ResultPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [user, setUser] = useState(null);

  // ✅ Check login status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // ✅ Handle login/register success (from Login/Register pages)
  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ⏳ Loading state to avoid flicker on refresh
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold text-blue-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <Router>
      {/* Navbar visible only when logged in */}
      {isAuthenticated && <Navbar onLogout={handleLogout} user={user} />}

      <Routes>
        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Home /> : <Navigate to="/register" replace />
          }
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/quiz/:topic"
          element={
            isAuthenticated ? <QuizPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/result"
          element={
            isAuthenticated ? <Result /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated ? <AdminPanel /> : <Navigate to="/login" replace />
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
