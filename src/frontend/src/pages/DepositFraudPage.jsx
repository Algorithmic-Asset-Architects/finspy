import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { ShoppingBag, DollarSign, CheckCircle, TrendingUp } from "lucide-react";

// Import deposit fraud-specific components (you'll need to create these)
//import DepositFraudDistributionChart from "../components/deposit/DepositFraudDistributionChart";
//import DepositFraudTable from "../components/deposit/DepositFraudTable";

import DepositFraudRatioChart from "../components/orders/DepositFraudRatioChart";
import OrderDistribution from "../components/orders/OrderDistribution";
import DepositFraudTable from "../components/orders/DepositFraudTable";

import DepositFraudPrediction from "../components/datauploader/DepositFraudPrediction.jsx";

const DepositFraudPage = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  // get data from api
  useEffect(() => {
    axios.get("/api/dep-fraud/")
      .then((response) => {
        setRawData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching deposit fraud data:", error);
        setLoading(false);
      });
  }, []);

  // metrics from data
  const totalAlerts = rawData.length;
  const fraudulentAlerts = rawData.filter(tx => tx.is_fraud).length;
  const totalAffectedAmount = rawData.reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);
  const avgFraudProbability = totalAlerts > 0
    ? rawData.reduce((acc, tx) => acc + parseFloat(tx.fraud_probability || 0), 0) / totalAlerts
    : 0;

  // format currency
  const formattedTotalAffectedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalAffectedAmount);

  return (
    <div className="flex-1 relative z-10 overflow-auto bg-gray-900">
      <Header title="Deposit Fraud Monitoring" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {loading ? (
          <div className="text-white">Loading deposit fraud data...</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <StatCard
                name="Total Alerts"
                icon={ShoppingBag}
                value={totalAlerts}
                color="#6366F1"
              />
              <StatCard
                name="Fraudulent Alerts"
                icon={CheckCircle}
                value={fraudulentAlerts}
                color="#10B981"
              />
              <StatCard
                name="Total Affected Amount"
                icon={DollarSign}
                value={formattedTotalAffectedAmount}
                color="#EF4444"
              />
              <StatCard
                name="Avg Fraud Probability"
                icon={TrendingUp}
                value={avgFraudProbability.toFixed(8)}
                color="#F59E0B"
              />
            </motion.div>
			
            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* You can add another chart for deposit fraud metrics here 
				<DepositFraudRatioChart data={rawData} />			
				<OrderDistribution /> */}
            </div>
            
            <DepositFraudPrediction/>
            <br>
            </br>
			<DepositFraudTable data={rawData} />
            {/* TABLE */}
          </>
        )}
      </main>
    </div>
  );
};

export default DepositFraudPage;
