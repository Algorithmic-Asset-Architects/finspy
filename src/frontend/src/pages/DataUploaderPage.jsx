import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { motion } from "framer-motion";
import { FileText, UploadCloud, CheckCircle, AlertTriangle, Loader } from "lucide-react";
import Header from "../components/common/Header";

const CATEGORY_FIELDS = {
  "Bank Transactions": [
    "step", "t_type", "amount", "nameorig", "oldbalanceorg", "newbalanceorg",
    "namedest", "oldbalancedest", "newbalancedest"
  ],
  "Device Monitoring": [
    "income", "name_email_similarity", "customer_age",
    "employment_status", "credit_risk_score", "device_os",
    "device_fraud_count"
  ],
  "Credit Card": [
    "merchant", "category", "amt", "gender", "lat", "long",
    "city_pop", "unix_time", "merch_lat", "merch_long"
  ],
  "Deposit Fraud": [
    "step", "transactiontype", "amount", "startingclient",
    "oldbalstartingclient", "newbalstartingclient", "destinationclient",
    "oldbaldestclient", "newbaldestclient"
  ]
};

const API_ENDPOINTS = {
  "Bank Transactions": "/api/predict/bank_transaction/",
  "Device Monitoring": "/api/predict/device_monitoring/",
  "Credit Card": "/api/predict/credit_card/",
  "Deposit Fraud": "/api/predict/deposit_fraud/",
};

const DataUploaderPage = () => {
  const [category, setCategory] = useState("");
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fraudResults, setFraudResults] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      let parsedData = [];
      let fileHeaders = [];

      try {
        if (file.name.endsWith(".csv")) {
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
          fileHeaders = sheet[0];
          parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (file.name.endsWith(".json")) {
          parsedData = JSON.parse(binaryStr);
          fileHeaders = Object.keys(parsedData[0]);
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          parsedData = sheet;
          fileHeaders = Object.keys(parsedData[0]);
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        return;
      }

      setHeaders(fileHeaders);
      setData(parsedData);
      validateHeaders(fileHeaders);
    };

    if (file.name.endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const validateHeaders = (fileHeaders) => {
    if (!category) return;

    const expectedHeaders = CATEGORY_FIELDS[category];
    const missingHeaders = expectedHeaders.filter((header) => !fileHeaders.includes(header));
    const extraHeaders = fileHeaders.filter((header) => !expectedHeaders.includes(header));

    setValidationResult({
      isValid: missingHeaders.length === 0,
      missingHeaders,
      extraHeaders,
    });
  };

  const handleSubmit = async () => {
    if (!category || !API_ENDPOINTS[category]) {
      alert("Please select a valid category before submitting.");
      return;
    }

    setLoading(true);
    setFraudResults([]);

    try {
      const responses = await Promise.all(
        data.map(async (transaction) => {
          try {
            const response = await axios.post(API_ENDPOINTS[category], transaction);
            return { transaction, result: response.data };
          } catch (error) {
            console.error("Error predicting fraud:", error);
            return { transaction, result: { error: "Prediction failed" } };
          }
        })
      );

      setFraudResults(responses);
    } catch (error) {
      console.error("Error processing transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Data Uploader" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Upload Data File
          </h2>

          <div className="mb-4">
            <label className="text-gray-300 mb-1 block">Select Category:</label>
            <select
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {Object.keys(CATEGORY_FIELDS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <input
              type="file"
              accept=".csv, .json, .xlsx"
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500 file:text-white
              hover:file:bg-blue-600"
              onChange={handleFileUpload}
            />
          </div>

          {validationResult && (
            <div className={`p-4 rounded-lg ${validationResult.isValid ? "bg-green-600" : "bg-red-600"}`}>
              {validationResult.isValid ? (
                <p className="text-white flex items-center">
                  <CheckCircle className="mr-2" /> File headers match expected format.
                </p>
              ) : (
                <p className="text-white flex items-center">
                  <AlertTriangle className="mr-2" /> Missing or incorrect headers detected.
                </p>
              )}
            </div>
          )}

          <button
            className="w-full bg-green-500 text-white py-2 mt-4 rounded hover:bg-green-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin inline-block mr-2" /> : null}
            {loading ? "Processing..." : "Submit for Fraud Detection"}
          </button>

          {fraudResults.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100">Fraud Detection Results</h3>
              <ul className="text-gray-300 mt-2">
                {fraudResults.map((result, index) => (
                  <li key={index} className="mt-2">
                    Transaction {index + 1}: {JSON.stringify(result.result)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DataUploaderPage;
