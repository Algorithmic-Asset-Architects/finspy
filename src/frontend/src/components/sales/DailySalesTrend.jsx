import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const DailySalesTrend = () => {
  const [data, setData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    axios.get('/api/device-monitoring/')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    const aggregation = {};
    data.forEach(tx => {

      const paymentType = tx.payment_type && tx.payment_type.trim() !== "" ? tx.payment_type : "Unknown";
      aggregation[paymentType] = (aggregation[paymentType] || 0) + 1;
    });
    const aggArray = Object.keys(aggregation).map(key => ({
      payment_type: key,
      count: aggregation[key]
    }));
    setAggregatedData(aggArray);
  }, [data]);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Payment Type Distribution</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={aggregatedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="payment_type" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Bar dataKey="count" fill="#10B981" name="Transaction Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DailySalesTrend;
