import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChannelComparisonChart = () => {
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
          axios.get("/api/deposit-fraud/")
        ]);

        // Ensure the response data is an array, else default to an empty array
        const bankData = Array.isArray(bankRes.data) ? bankRes.data : [];
        const deviceData = Array.isArray(deviceRes.data) ? deviceRes.data : [];
        const creditData = Array.isArray(creditRes.data) ? creditRes.data : [];
        const depositData = Array.isArray(depositRes.data) ? depositRes.data : [];

        // Calculate fraud metrics only if data is present
        const fraudData = [
          {
            subject: "High-Risk Transactions",
            Bank: bankData.length > 0 ? bankData.filter(item => item.is_fraud).length : 0,
            Device: deviceData.length > 0 ? deviceData.filter(item => item.is_fraud).length : 0,
            Credit: creditData.length > 0 ? creditData.filter(item => item.is_fraud).length : 0,
            Deposit: depositData.length > 0 ? depositData.filter(item => item.is_fraud).length : 0,
            fullMark: 150,
          },
          {
            subject: "Anomalous Behavior",
            Bank: bankData.length > 0 ? bankData.filter(item => item.fraud_probability > 0.5).length : 0,
            Device: deviceData.length > 0 ? deviceData.filter(item => item.fraud_probability > 0.5).length : 0,
            Credit: creditData.length > 0 ? creditData.filter(item => item.fraud_probability > 0.5).length : 0,
            Deposit: depositData.length > 0 ? depositData.filter(item => item.fraud_probability > 0.5).length : 0,
            fullMark: 150,
          },
          {
            subject: "Velocity Checks",
            Bank: bankData.length,
            Device: deviceData.length,
            Credit: creditData.length,
            Deposit: depositData.length,
            fullMark: 150,
          },
          {
            subject: "Geolocation Risk",
            Bank: bankData.reduce((acc, item) => acc + (item.lat ? Math.abs(item.lat - item.merch_lat) : 0), 0),
            Device: deviceData.reduce((acc, item) => acc + (item.device_fraud_count ? item.device_fraud_count : 0), 0),
            Credit: creditData.reduce((acc, item) => acc + (item.lat ? Math.abs(item.lat - item.merch_lat) : 0), 0),
            Deposit: depositData.reduce((acc, item) => acc + (item.oldbaldestclient ? Math.abs(item.oldbaldestclient - item.newbaldestclient) : 0), 0),
            fullMark: 150,
          },
          {
            subject: "IP Reputation Score",
            Bank: bankData.filter(item => item.is_fraud).length * 5,
            Device: deviceData.filter(item => item.is_fraud).length * 5,
            Credit: creditData.filter(item => item.is_fraud).length * 5,
            Deposit: depositData.filter(item => item.is_fraud).length * 5,
            fullMark: 150,
          }
        ];

        setData(fraudData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching fraud data:", err);
        setError("Failed to load fraud data.");
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
      transition={{ delay: 0.6 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Fraud Risk Across Channels</h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading fraud data...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#4B5563" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, Math.max(...data.map((d) => d.fullMark || 100))]} stroke="#9CA3AF" fontSize={10} />
              <Radar name="Bank" dataKey="Bank" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
              <Radar name="Device" dataKey="Device" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
              <Radar name="Credit" dataKey="Credit" stroke="#EC4899" fill="#EC4899" fillOpacity={0.5} />
              <Radar name="Deposit" dataKey="Deposit" stroke="#10B981" fill="#10B981" fillOpacity={0.5} />
              <Legend verticalAlign="bottom" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(31,41,55,0.9)", borderColor: "#4B5563" }}
                itemStyle={{ color: "#E5E7EB", fontSize: "14px" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default ChannelComparisonChart;
