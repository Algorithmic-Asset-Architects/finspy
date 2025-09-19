import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header.jsx";

// csrf--cookie helper
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client"); // todo - set default 
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = getCookie("csrftoken");
    try {
      const response = await axios.post(
        "/api/auth/login/",
        {
          email: email,
          password: password,
          role: role, // todo - role while ogin
        },
        {
          headers: { "X-CSRFToken": csrfToken },
        }
      );
      // save in web storage - local
      localStorage.setItem("authToken", response.data.key);
      console.log("Login successful", response.data);
      
      // redirect 
      if (role === "framework_admin") {
        navigate("/admin"); // Redirect to admin page
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-800">
      <Header title="Sign In" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Sign In</h2>
          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Role Selector */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="role">
                Select Role:
              </label>
              <select
                id="role"
                className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="client">Client</option>
                <option value="framework_admin">Framework Admin</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="password">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
