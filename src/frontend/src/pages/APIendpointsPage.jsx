import React from "react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";

const API_ENDPOINTS = [
  
  {
    category: "Transaction Data APIs",
    links: [
      { name: "Device Monitoring", url: "/api/device-monitoring/" },
      { name: "Bank Transactions", url: "/api/bank-trans/" },
      { name: "Credit Card Transactions", url: "/api/cred-card/" },
      { name: "Deposit Fraud Transactions", url: "/api/dep-fraud/" },
    ],
  },
  {
    category: "Prediction APIs",
    links: [
      { name: "Predict Bank Transaction Fraud", url: "/api/predict/bank_transaction/" },
      { name: "Predict Credit Card Fraud", url: "/api/predict/credit_card/" },
      { name: "Predict Device Monitoring Fraud", url: "/api/predict/device_monitoring/" },
      { name: "Predict Deposit Fraud", url: "/api/predict/deposit_fraud/" },
    ],
  },
  {
    category: "Admin Dashboard APIs",
    links: [
      { name: "API Logs", url: "/api/admin/api_logs/" },
      { name: "Database Performance", url: "/api/admin/db_performance/" },
      { name: "Active Users", url: "/api/admin/active_users/" },
      { name: "Model Performance", url: "/api/admin/model_performance/" },
    ],
  },
  {
    category: "System Monitoring APIs",
    links: [
      { name: "RDS Metrics", url: "/rds_metrics/" },
      { name: "Server Logs", url: "/server_logs/" },
    ],
  },
  {
    category: "Authentication & Users",
    links: [
      { name: "User List", url: "/api/users/" },
      { name: "Current Logged-in User", url: "/api/current_user/" },
      { name: "Auth API", url: "/api/auth/" },
      { name: "User Registration", url: "/api/auth/registration/" },
    ],
  },
];

const APIendpointsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="API Endpoints Overview" />
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 max-w-5xl mx-auto mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-400">API Endpoints</h2>
        <div className="max-h-[600px] overflow-y-auto space-y-6">
          {API_ENDPOINTS.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-2">
                {section.category}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx} className="p-2 rounded-md hover:bg-gray-700 transition duration-200">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-all duration-200"
                    >
                      {link.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default APIendpointsPage;
