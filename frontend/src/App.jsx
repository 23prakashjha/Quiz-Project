import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import AdaptiveQuizPage from "./pages/AdaptiveQuizPage";
import Result from "./pages/ResultPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import AdminPanel from "./components/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return Boolean(token && storedUser);
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

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

        {/* Public Routes - accessible without login */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Register Route */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />
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
              <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/quiz/:topic"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : user?.role === "admin" ? <Navigate to="/admin/dashboard" replace />
            : <QuizPage />
          }
        />
        <Route
          path="/quiz/adaptive/:topic"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : user?.role === "admin" ? <Navigate to="/admin/dashboard" replace />
            : <AdaptiveQuizPage />
          }
        />
        <Route
          path="/result"
          element={
            isAuthenticated ? <Result /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : user?.role === "admin" ? <Navigate to="/admin/dashboard" replace />
            : <Dashboard />
          }
        />
        <Route
          path="/admin"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : user?.role !== "admin" ? <Navigate to="/" replace />
            : <AdminPanel user={user} isAuthenticated={isAuthenticated} onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : user?.role !== "admin" ? <Navigate to="/" replace />
            : <AdminDashboard />
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
