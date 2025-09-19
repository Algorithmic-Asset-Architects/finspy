import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/common/Header.jsx";
import StatCard from "../components/common/StatCard.jsx";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart.jsx";
import SalesTrendChart from "../components/products/SalesTrendChart.jsx";
import BankTransactionsTable from "../components/products/BankTransactionsTable.jsx";

import CreditCardPrediction from "../components/datauploader/CreditCardPrediction.jsx";


const CreditCardPage = () => {
	const [rawData, setRawData] = useState([]);
	const [stats, setStats] = useState({
	  totalTransactions: 0,
	  avgFraudProbability: 0,
	  fraudRate: 0,
	  totalAmount: 0,
	});
	const [loadingStats, setLoadingStats] = useState(true);
  
	// raw data
	useEffect(() => {
	  axios.get("/api/cred-card/")
		.then((response) => {
		  // check if response.data is an array; if not, try extracting from .results
		  let data = response.data;
		  if (!Array.isArray(data)) {
			if (data.results && Array.isArray(data.results)) {
			  data = data.results;
			} else {
			  data = [];
			}
		  }
		  setRawData(data);
  
		  // summary stat
		  const totalTransactions = data.length;
		  const totalAmount = data.reduce((acc, tx) => acc + parseFloat(tx.amt || 0), 0);
		  const fraudulentTransactions = data.filter((tx) => tx.is_fraud);
		  const fraudRate = totalTransactions > 0 ? (fraudulentTransactions.length / totalTransactions) * 100 : 0;
		  const avgFraudProbability = totalTransactions > 0
			? data.reduce((acc, tx) => acc + parseFloat(tx.fraud_probability || 0), 0) / totalTransactions
			: 0;
  
		  setStats({
			totalTransactions,
			avgFraudProbability,
			fraudRate,
			totalAmount,
		  });
		  setLoadingStats(false);
		})
		.catch((error) => {
		  console.error("Error fetching credit card transactions:", error);
		  setLoadingStats(false);
		});
	}, []);
  
	// currency 
	const formattedTotalAmount = new Intl.NumberFormat("en-US", {
	  style: "currency",
	  currency: "INR",
	  maximumFractionDigits: 0,
	}).format(stats.totalAmount);
  
	return (
	  <div className="flex-1 overflow-auto relative z-10">
		<Header title="Credit Card Fraud Monitoring" />
  
		<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
		  {/* STAT CARDS */}
		  <motion.div
			className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 1 }}
		  >
			<StatCard
			  name="Total Transactions"
			  icon={Package}
			  value={loadingStats ? "Loading..." : stats.totalTransactions}
			  color="#6366F1"
			/>
			<StatCard
			  name="Avg Fraud Probability"
			  icon={TrendingUp}
			  value={loadingStats ? "Loading..." : stats.avgFraudProbability.toFixed(8)}
			  color="#F59E0B"
			/>
			<StatCard
			  name="Fraud Rate (%)"
			  icon={AlertTriangle}
			  value={loadingStats ? "Loading..." : stats.fraudRate.toFixed(2)}
			  color="#10B981"
			/>
			<StatCard
			  name="Total Amount"
			  icon={DollarSign}
			  value={loadingStats ? "Loading..." : formattedTotalAmount}
			  color="#EF4444"
			/>
		  </motion.div>
  
		  {/* Transactions Table */}
		  <BankTransactionsTable data={rawData} />
		  <br>
		 </br>
		 <CreditCardPrediction/>
		<br>
		</br>
		  {/* CHARTS */}
		  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
			<SalesTrendChart data={rawData} />
			<CategoryDistributionChart data={rawData} />
		  </div>
		</main>
	  </div>
	);
  };
  
  export default CreditCardPage;
  
