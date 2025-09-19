import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cpu, Database, Server, HardDrive } from "lucide-react";

const RDSMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/rds_metrics/");
        setMetrics(response.data);
      } catch (err) {
        console.error("Error fetching RDS Metrics:", err);
        setError("Failed to load RDS Metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // conv raw
  const chartData = metrics
    ? [
        { name: "CPU Utilization (%)", value: metrics["CPU Utilization (%)"] || 0 },
        { name: "Free Memory (MB)", value: metrics["Free Memory (MB)"] || 0 },
        { name: "Read IOPS", value: metrics["Read IOPS"] || 0 },
        { name: "Write IOPS", value: metrics["Write IOPS"] || 0 },
        { name: "Database Connections", value: metrics["Database Connections"] || 0 },
      ]
    : [];

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">AWS RDS Metrics</h2>

      {loading ? (
        <p className="text-gray-400">🔄 Loading RDS Metrics...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU Usage */}
          <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <Cpu className="text-green-400 size-8" />
            <div>
              <p className="text-gray-300">CPU Utilization</p>
              <p className="text-xl font-semibold text-white">{metrics["CPU Utilization (%)"] || 0}%</p>
            </div>
          </div>

          {/* Free Memory */}
          <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <HardDrive className="text-blue-400 size-8" />
            <div>
              <p className="text-gray-300">Free Memory</p>
              <p className="text-xl font-semibold text-white">{metrics["Free Memory (MB)"] || 0} MB</p>
            </div>
          </div>

          {/* Read IOPS */}
          <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <Server className="text-yellow-400 size-8" />
            <div>
              <p className="text-gray-300">Read IOPS</p>
              <p className="text-xl font-semibold text-white">{metrics["Read IOPS"] || 0}</p>
            </div>
          </div>

          {/* Write IOPS */}
          <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <Server className="text-purple-400 size-8" />
            <div>
              <p className="text-gray-300">Write IOPS</p>
              <p className="text-xl font-semibold text-white">{metrics["Write IOPS"] || 0}</p>
            </div>
          </div>

          {/* Database Connections */}
          <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700 col-span-2">
            <Database className="text-red-400 size-8" />
            <div>
              <p className="text-gray-300">Database Connections</p>
              <p className="text-xl font-semibold text-white">{metrics["Database Connections"] || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* viz */}
      {metrics && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default RDSMetrics;
