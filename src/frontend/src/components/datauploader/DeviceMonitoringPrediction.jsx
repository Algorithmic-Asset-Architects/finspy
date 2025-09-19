import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";



const DeviceMonitoringPrediction = () => {
  const [transactionJson, setTransactionJson] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      let parsedJson = JSON.parse(transactionJson);

      const response = await axios.post("/api/predict/device_monitoring/", parsedJson);
      setPredictionResult(response.data);
    } catch (err) {
      console.error("Error predicting fraud:", err);
      setError("Invalid JSON input or API error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Device Monitoring Fraud Prediction</h2>
      <textarea
        className="w-full p-3 bg-gray-700 text-white rounded"
        rows="6"
        placeholder="Paste Device Monitoring JSON here..."
        value={transactionJson}
        onChange={(e) => setTransactionJson(e.target.value)}
      ></textarea>
      <button onClick={handlePredict} className="w-full mt-4 bg-red-500 text-white py-2 rounded">
        Predict
      </button>
      {loading && <p className="text-gray-400">Processing...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {predictionResult && (
        <div className="mt-4 text-green-500">
          <p>Fraud Probability: {predictionResult.fraud_probability.toFixed(6)}</p>
          <p>Is Fraud: {predictionResult.is_fraud ? "Yes" : "No"}</p>
        </div>
      )}
    </motion.div>
  );
};

export default DeviceMonitoringPrediction;

