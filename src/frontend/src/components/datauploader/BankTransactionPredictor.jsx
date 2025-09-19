import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const BankTransactionPredictor = () => {
  const [transactionJson, setTransactionJson] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleInputChange = (e) => {
    setTransactionJson(e.target.value);
  };


  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {

      const parsedJson = JSON.parse(transactionJson);


      const response = await axios.post("/api/predict/bank_transaction/", parsedJson);
      setPredictionResult(response.data);
    } catch (err) {
      console.error("Error predicting fraud:", err);
      setError("Invalid JSON input or API error. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Bank Transaction Fraud Prediction</h2>

      {/* Input Section */}
      <textarea
        className="w-full h-40 p-3 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder='Enter transaction JSON here...'
        value={transactionJson}
        onChange={handleInputChange}
      ></textarea>

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Processing..." : "Predict Fraud"}
      </button>

      {/* Result Section */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {predictionResult && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100">Prediction Result</h3>
          <p className="text-gray-300">
            <strong>Fraud Probability:</strong> {predictionResult.fraud_probability.toFixed(8)}
          </p>
          <p className={`mt-2 text-lg font-semibold ${predictionResult.is_fraud ? "text-red-500" : "text-green-500"}`}>
            {predictionResult.is_fraud ? "🚨 Fraudulent Transaction" : "✅ Legitimate Transaction"}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BankTransactionPredictor;
