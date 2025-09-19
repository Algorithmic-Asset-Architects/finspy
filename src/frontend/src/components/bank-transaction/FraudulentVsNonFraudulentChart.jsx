import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const FraudulentVsNonFraudulentChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/api/bank-trans/')
      .then(response => {
        const rawData = response.data;
        // count
        let fraudCount = 0;
        let nonFraudCount = 0;
        rawData.forEach(item => {
          if (item.is_fraud) {
            fraudCount += 1;
          } else {
            nonFraudCount += 1;
          }
        });
        const chartData = [
          { name: "Fraudulent", value: fraudCount },
          { name: "Non-Fraudulent", value: nonFraudCount }
        ];
        setData(chartData);
      })
      .catch(error => console.error('Error fetching transactions:', error));
  }, []);

  const COLORS = ["#F59E0B", "#10B981"];

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Fraudulent vs. Non-Fraudulent Transactions</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }} itemStyle={{ color: "#E5E7EB" }}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default FraudulentVsNonFraudulentChart;
