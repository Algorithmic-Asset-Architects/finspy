import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";

const APILogSummary = () => {
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/api_logs/")
      .then((response) => {
        setApiLogs(response.data); // 10
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API logs:", error);
        setError("Failed to load API logs.");
        setLoading(false);
      });
  }, []);

  // avg resp time
  const avgResponseTime = apiLogs.length > 0
    ? (apiLogs.reduce((acc, log) => acc + log.response_time, 0) / apiLogs.length).toFixed(2)
    : 0;

  // api call count /endpoint
  const endpointCounts = apiLogs.reduce((acc, log) => {
    acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
    return acc;
  }, {});

  // chart viz
  const chartData = Object.keys(endpointCounts).map((endpoint) => ({
    endpoint,
    calls: endpointCounts[endpoint],
  }));

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">API Logs Summary</h2>
      
      {loading && <p className="text-gray-400">🔄 Loading API logs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-700 rounded-lg">
              <Clock className="text-blue-500 size-6 mb-1" />
              <p className="text-gray-400 text-sm">Avg Response Time</p>
              <p className="text-lg font-semibold text-gray-200">{avgResponseTime} ms</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <Globe className="text-green-500 size-6 mb-1" />
              <p className="text-gray-400 text-sm">Total API Calls</p>
              <p className="text-lg font-semibold text-gray-200">{apiLogs.length}</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <ArrowUpRight className="text-yellow-500 size-6 mb-1" />
              <p className="text-gray-400 text-sm">Fastest Response</p>
              <p className="text-lg font-semibold text-gray-200">
                {Math.min(...apiLogs.map(log => log.response_time)).toFixed(2)} ms
              </p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <ArrowDownRight className="text-red-500 size-6 mb-1" />
              <p className="text-gray-400 text-sm">Slowest Response</p>
              <p className="text-lg font-semibold text-gray-200">
                {Math.max(...apiLogs.map(log => log.response_time)).toFixed(2)} ms
              </p>
            </div>
          </div>

          {/*API Calls Per Endpoint Chart */}
          <h3 className="text-lg font-semibold text-gray-100 mb-2">API Calls per Endpoint</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="endpoint" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }}
                  itemStyle={{ color: "#E5E7EB" }}
                />
                <Legend />
                <Bar dataKey="calls" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default APILogSummary;

