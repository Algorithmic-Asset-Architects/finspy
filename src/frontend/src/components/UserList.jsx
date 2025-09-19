import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import { User, Shield, AlertTriangle, Loader } from "lucide-react";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/api/users/")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          setError("Unexpected response format.");
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load user data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="User Management" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Registered Users</h2>

          {/* 🔄 Loading Indicator */}
          {loading && (
            <div className="text-gray-400 flex items-center space-x-2">
              <Loader className="animate-spin size-5" />
              <span>Loading users...</span>
            </div>
          )}

          {/* ⚠ Error Message */}
          {error && (
            <div className="text-red-500 flex items-center space-x-2">
              <AlertTriangle className="size-5" />
              <span>{error}</span>
            </div>
          )}

          {/* ✅ User List */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <motion.div
                    key={user.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-500 bg-opacity-20">
                        {user.role === "framework_admin" ? (
                          <Shield className="text-yellow-400 size-6" />
                        ) : (
                          <User className="text-blue-500 size-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-gray-100 font-semibold">{user.email}</h3>
                        <p className="text-sm text-gray-400">
                          Role: {user.role === "framework_admin" ? "Admin" : "Client"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No users found.</p>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default UserListPage;
