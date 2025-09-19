import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const APIResponseTimeChart = () => {
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/api_logs/")
      .then((response) => {
        setApiLogs(response.data.slice(0, 20)); // 10
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API logs:", error);
        setError("Failed to load API logs.");
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">API Response Time Trends</h2>

      {loading && <p className="text-gray-400">🔄 Loading API data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={apiLogs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value} ms`} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Legend />
              <Line type="monotone" dataKey="response_time" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default APIResponseTimeChart;

