import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";

// This component receives four props (dictionaries) with aggregated data:
//   bankData, deviceData, creditData, depositData
// Each object is expected to have these keys:
//   total_transactions, total_amount, fraud_rate (in percentage), avg_fraud_probability
const OverviewCards = ({ bankData, deviceData, creditData, depositData }) => {
  // Fallbacks in case any channel is missing
  const b = bankData || { total_transactions: 0, total_amount: 0, fraud_rate: 0, avg_fraud_probability: 0 };
  const d = deviceData || { total_transactions: 0, total_amount: 0, fraud_rate: 0, avg_fraud_probability: 0 };
  const c = creditData || { total_transactions: 0, total_amount: 0, fraud_rate: 0, avg_fraud_probability: 0 };
  const dep = depositData || { total_transactions: 0, total_amount: 0, fraud_rate: 0, avg_fraud_probability: 0 };


  const totalTransactions = b.total_transactions + d.total_transactions + c.total_transactions + dep.total_transactions;
  const totalRevenue = b.total_amount + d.total_amount + c.total_amount + dep.total_amount;


  const totalFraudCount =
    (b.total_transactions * b.fraud_rate / 100) +
    (d.total_transactions * d.fraud_rate / 100) +
    (c.total_transactions * c.fraud_rate / 100) +
    (dep.total_transactions * dep.fraud_rate / 100);

  const overallFraudRate = totalTransactions > 0 ? (totalFraudCount / totalTransactions) * 100 : 0;


  const weightedAvgFraudProbability = totalTransactions > 0
    ? (
      (b.total_transactions * b.avg_fraud_probability) +
      (d.total_transactions * d.avg_fraud_probability) +
      (c.total_transactions * c.avg_fraud_probability) +
      (dep.total_transactions * dep.avg_fraud_probability)
    ) / totalTransactions
    : 0;


  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalRevenue);


  const statCards = [
    { name: "Total Transactions", value: totalTransactions, icon: Package, color: "#6366F1" },
    { name: "Overall Fraud Rate", value: overallFraudRate.toFixed(2) + "%", icon: AlertTriangle, color: "#F59E0B" },
    { name: "Total Revenue", value: formattedRevenue, icon: DollarSign, color: "#EF4444" },
    { name: "Avg Fraud Probability", value: weightedAvgFraudProbability.toFixed(8), icon: TrendingUp, color: "#10B981" },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((item, index) => (
        <motion.div
          key={item.name}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">{item.name}</h3>
              <p className="mt-1 text-xl font-semibold text-gray-100">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-20 ${item.color}`}>
              <item.icon size={20} className="text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewCards;
