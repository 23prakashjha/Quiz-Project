import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          QuizVerse
        </h1>

        {/* Menu Links */}
        <div className="space-x-4">
          {!token ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="hover:text-gray-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="hover:text-gray-200"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/")}
                className="hover:text-gray-200"
              >
                Quiz
              </button>
              <button
                onClick={() => navigate("/admin")}
                className="hover:text-gray-200"
              >
                Admin
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
