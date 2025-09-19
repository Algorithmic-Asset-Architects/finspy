import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DepositFraudRatioChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/deposit-fraud/");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching deposit fraud data:", error);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const ratioMap = Array.isArray(data) ? data.reduce((acc, record) => {
    const type = record.transactiontype || "Unknown";
    if (!acc[type]) {
      acc[type] = { count: 0, fraudCount: 0 };
    }
    acc[type].count += 1;
    if (record.is_fraud) {
      acc[type].fraudCount += 1;
    }
    return acc;
  }, {}) : {};


  const chartData = Object.keys(ratioMap).map((type) => {
    const { count, fraudCount } = ratioMap[type];
    return {
      transactiontype: type,
      fraudRatio: count > 0 ? ((fraudCount / count) * 100).toFixed(2) : 0,
    };
  });

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Fraud Ratio by Transaction Type</h2>

      {loading ? (
        <p className="text-gray-400">🔄 Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="transactiontype" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Legend />
              <Bar dataKey="fraudRatio" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default DepositFraudRatioChart;
