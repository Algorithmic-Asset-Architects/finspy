import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SalesOverviewChart = () => {
  const [rawData, setRawData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    axios.get('/api/device-monitoring/')
      .then((response) => {
        setRawData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching device monitoring data:', err);
        setError(err);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    if (!rawData.length) return;


    const grouped = {};
    rawData.forEach((record) => {
      const month = record.cr_month; 
      if (month != null) {
        if (!grouped[month]) {
          grouped[month] = { totalFraudProb: 0, count: 0 };
        }

        const fraudProb = parseFloat(record.fraud_probability);
        if (!isNaN(fraudProb)) {
          grouped[month].totalFraudProb += fraudProb;
          grouped[month].count += 1;
        }
      }
    });


    const trendArray = Object.keys(grouped)
      .sort((a, b) => a - b)
      .map((month) => {
        const avgFraudProb = grouped[month].count > 0 
          ? grouped[month].totalFraudProb / grouped[month].count 
          : 0;

        const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
          month: monthLabels[parseInt(month, 10) - 1],
          avg_fraud_probability: avgFraudProb,
        };
      });

    setTrendData(trendArray);
  }, [rawData]);

  if (loading) return <div>Loading trend data...</div>;
  if (error) return <div>Error loading trend data: {error.message}</div>;

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Fraud Trend by Month</h2>
      <div className='h-80'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis 
              stroke="#9ca3af" 
              label={{ value: "Avg Fraud Probability", angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avg_fraud_probability"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, strokeWidth: 2 }}
              name="Avg Fraud Probability"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;

