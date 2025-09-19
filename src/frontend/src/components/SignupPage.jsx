import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/common/Header.jsx";

// csrf
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

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin"); default - todo 
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password1 !== password2) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    const csrfToken = getCookie("csrftoken");

    try {
      const response = await axios.post(
        "/api/auth/registration/",
        {
          email,
          password1,
          password2,
          role, // role in 
        },
        {
          headers: { "X-CSRFToken": csrfToken },
        }
      );

      setSuccessMsg("Registration successful! Check your email for confirmation.");
      console.log("Registration successful:", response.data);
      console.log("Role:", role);
      // if client , goto / , if admin goto /admin
      if(role === 'client'){
        window.location.href = "/";
      }
      else{
        window.location.href = "/admin";
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-800">
      <Header title="Sign Up" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Sign Up</h2>
          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 mb-4">{successMsg}</p>}
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
              <label className="block text-gray-300 mb-1" htmlFor="password1">
                Password:
              </label>
              <input
                type="password"
                id="password1"
                className="w-full p-2 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="password2">
                Confirm Password:
              </label>
              <input
                type="password"
                id="password2"
                className="w-full p-2 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Sign Up
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default SignupPage;
