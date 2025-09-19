import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";

import Header from "../components/common/Header";

const API_ENDPOINTS = {
  "Bank Transactions": "/api/bank-trans/",
  "Credit Card Transactions": "/api/credit-card/",
  "Device Monitoring": "/api/device-monitoring/",
  "Deposit Fraud": "/api/deposit-fraud/"
};

const AIFraudInsights = () => {
  const [selectedAPI, setSelectedAPI] = useState("Bank Transactions");
  const [transactionCount, setTransactionCount] = useState(5);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recent transactions from the selected API
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    setInsights([]);

    try {
      const apiURL = API_ENDPOINTS[selectedAPI];
      const response = await axios.get(apiURL);
      const recentTransactions = response.data.slice(-transactionCount); // Get last N transactions

      return recentTransactions;
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transaction data.");
      return null;
    }
  };

  // ai insights from mistral
  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights([]);

    try {
      const transactions = await fetchTransactions();
      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions available for analysis.");
      }

      // promptis
      const prompt = `
      Analyze the following ${selectedAPI} transactions:
      ${JSON.stringify(transactions)}
      
      Provide the following:
      - Detect fraud patterns and anomalies.
      - Suggest improvements to reduce fraud risk.
      - Identify weaknesses in transaction security.
      - Summarize the top insights concisely.

      Keep the response structured as clear bullet points for easy reading.
      `;

      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer j2Y0YqEohqTfjy0uXVVvPbm6RlajBVly`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("AI Response:", response.data);

      // extract insight
      const aiText = response.data.choices?.[0]?.message?.content || "No insights generated.";
      setInsights(aiText.split("\n").filter((line) => line.trim() !== "")); // Clean formatting
    } catch (err) {
      console.error("Error calling Mistral API:", err);
      setError("Failed to fetch AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [selectedAPI, transactionCount]);

  return (



    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Enhanced AI Insights" />
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Dropdown for API selection */}
      <div className="mb-4">
        <label className="text-gray-300">Select Data Source:</label>
        <select
          className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none"
          value={selectedAPI}
          onChange={(e) => setSelectedAPI(e.target.value)}
        >
          {Object.keys(API_ENDPOINTS).map((api) => (
            <option key={api} value={api}>{api}</option>
          ))}
        </select>
      </div>

      {/* Dropdown for transaction count selection */}
      <div className="mb-4">
        <label className="text-gray-300">Select Number of Transactions:</label>
        <select
          className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none"
          value={transactionCount}
          onChange={(e) => setTransactionCount(parseInt(e.target.value))}
        >
          {[5, 10, 20, 50].map((count) => (
            <option key={count} value={count}>{count} Transactions</option>
          ))}
        </select>
      </div>

      {/* Loading & Error Handling */}
      {loading && <p className="text-gray-400">🔄 Generating insights...</p>}
      {error && <p className="text-red-500">{error}</p>}


      {!loading && !error && insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center space-x-3">
              {/* Dynamic Icons for different insights */}
              <div className="p-2 rounded-full bg-blue-500 bg-opacity-20">
                {index % 3 === 0 ? (
                  <TrendingUp className="size-6 text-blue-500" />
                ) : index % 3 === 1 ? (
                  <AlertTriangle className="size-6 text-yellow-500" />
                ) : (
                  <Lightbulb className="size-6 text-green-500" />
                )}
              </div>
              <p className="text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
    </div>  
  );
};

export default AIFraudInsights;
