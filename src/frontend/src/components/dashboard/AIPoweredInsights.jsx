import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const AIPoweredInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionLimit, setTransactionLimit] = useState(5);
  const [insightLimit, setInsightLimit] = useState(3);


  const fetchAllTransactionData = async () => {
    try {
      const [bankResponse, creditResponse, deviceResponse, depositResponse] = await Promise.all([
        axios.get("/api/bank-trans/"),
        axios.get("/api/credit-card/"),
        axios.get("/api/device-monitoring/"),
        axios.get("/api/deposit-fraud/"),
      ]);


      const bankData = bankResponse.data.slice(-transactionLimit);
      const creditData = creditResponse.data.slice(-transactionLimit);
      const deviceData = deviceResponse.data.slice(-transactionLimit);
      const depositData = depositResponse.data.slice(-transactionLimit);

      return { bankData, creditData, deviceData, depositData };
    } catch (err) {
      console.error("Error fetching transaction data:", err);
      setError("Failed to fetch transaction data.");
      return null;
    }
  };


  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const transactions = await fetchAllTransactionData();
      if (!transactions) throw new Error("No transaction data available.");


      const prompt = `
      Analyze the latest financial transactions:
      - Bank: ${JSON.stringify(transactions.bankData)}
      - Credit Card: ${JSON.stringify(transactions.creditData)}
      - Device Alerts: ${JSON.stringify(transactions.deviceData)}
      - Deposit Fraud: ${JSON.stringify(transactions.depositData)}
      Provide key fraud insights in a structured list format.
      `;

      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200, 
        },
        {
          headers: {
            Authorization: `Bearer j2Y0YqEohqTfjy0uXVVvPbm6RlajBVly`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("AI Response:", response.data);


      const aiText = response.data.choices?.[0]?.message?.content || "No insights generated.";
      const structuredInsights = aiText.split(/\d+\.\s/).filter((line) => line.trim() !== "");

      setInsights(structuredInsights.slice(0, insightLimit));
    } catch (err) {
      console.error("Error calling Mistral API:", err);
      setError("Failed to fetch AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [transactionLimit, insightLimit]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">AI-Powered Insights</h2>

      <div className="flex justify-between items-center mb-4">

        <div>
          <label className="text-gray-300 mr-2">Transactions:</label>
          <select
            className="bg-gray-700 text-white rounded-lg px-3 py-1"
            value={transactionLimit}
            onChange={(e) => setTransactionLimit(Number(e.target.value))}
          >
            <option value="5">Last 5</option>
            <option value="10">Last 10</option>
            <option value="15">Last 15</option>
            <option value="20">Last 20</option>
          </select>
        </div>


        <div>
          <label className="text-gray-300 mr-2">Insights:</label>
          <select
            className="bg-gray-700 text-white rounded-lg px-3 py-1"
            value={insightLimit}
            onChange={(e) => setInsightLimit(Number(e.target.value))}
          >
            <option value="3">Top 3</option>
            <option value="5">Top 5</option>
            <option value="7">Top 7</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-gray-400">🔄 Generating insights...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500 bg-opacity-20">
                <TrendingUp className="size-6 text-blue-500" />
              </div>
              <p className="text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AIPoweredInsights;
