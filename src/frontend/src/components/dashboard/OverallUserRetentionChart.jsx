import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const FraudTrendsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, deviceRes, creditRes, depositRes] = await Promise.all([
          axios.get("/api/bank-trans/"),
          axios.get("/api/device-monitoring/"),
          axios.get("/api/cred-card/"),
          axios.get("/api/deposit-fraud/"),
        ]);

        const bankData = Array.isArray(bankRes.data) ? bankRes.data : [];
        const deviceData = Array.isArray(deviceRes.data) ? deviceRes.data : [];
        const creditData = Array.isArray(creditRes.data) ? creditRes.data : [];
        const depositData = Array.isArray(depositRes.data) ? depositRes.data : [];

        // Group by time periods (last 10 periods)
        const periods = [...new Set([...bankData, ...deviceData, ...creditData, ...depositData].map(tx => tx.trans_date_trans_time?.slice(0, 10)))].slice(-10);

        const fraudTrends = periods.map(period => ({
          period,
          bankFraud: bankData.filter(tx => tx.is_fraud && tx.trans_date_trans_time?.startsWith(period)).length,
          deviceFraud: deviceData.filter(tx => tx.is_fraud && tx.trans_date_trans_time?.startsWith(period)).length,
          creditFraud: creditData.filter(tx => tx.is_fraud && tx.trans_date_trans_time?.startsWith(period)).length,
          depositFraud: depositData.filter(tx => tx.is_fraud && tx.trans_date_trans_time?.startsWith(period)).length,
        }));

        setData(fraudTrends);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching fraud trend data:", err);
        setError("Failed to load fraud trend data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Fraud Trends Over Time</h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading fraud trend data...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }} itemStyle={{ color: "#E5E7EB" }} />
              <Legend />
              <Line type="monotone" dataKey="bankFraud" stroke="#3B82F6" strokeWidth={2} name="Bank Fraud" />
              <Line type="monotone" dataKey="deviceFraud" stroke="#8B5CF6" strokeWidth={2} name="Device Fraud" />
              <Line type="monotone" dataKey="creditFraud" stroke="#EC4899" strokeWidth={2} name="Credit Card Fraud" />
              <Line type="monotone" dataKey="depositFraud" stroke="#10B981" strokeWidth={2} name="Deposit Fraud" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default FraudTrendsChart;
