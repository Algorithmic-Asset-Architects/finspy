import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"];

const FraudDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/deposit-fraud/");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching fraud data:", error);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const fraudMap = Array.isArray(data) ? data.reduce((acc, record) => {
    const type = record.transactiontype || "Unknown";
    if (!acc[type]) {
      acc[type] = { total: 0, fraud: 0 };
    }
    acc[type].total += 1;
    if (record.is_fraud) {
      acc[type].fraud += 1;
    }
    return acc;
  }, {}) : {};


  const chartData = Object.keys(fraudMap).map((type) => ({
    name: type,
    value: fraudMap[type].total > 0 ? ((fraudMap[type].fraud / fraudMap[type].total) * 100).toFixed(2) : 0,
  }));

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Fraud Distribution by Transaction Type</h2>

      {loading ? (
        <p className="text-gray-400">🔄 Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default FraudDistributionChart;
