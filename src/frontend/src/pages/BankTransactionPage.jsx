import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/common/Header.jsx";
import StatCard from "../components/common/StatCard.jsx";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import BankTransactionsTable from "../components/products/BankTransactionsTable.jsx";
import BankTransactionPredictor from "../components/datauploader/BankTransactionPredictor.jsx";



import TransactionTypeDistributionChart from "../components/bank-transaction/TransactionTypeDistributionChart.jsx";
import FraudulentVsNonFraudulentChart from "../components/bank-transaction/FraudulentVsNonFraudulentChart.jsx";
import PaymentMethodDistributionChart from "../components/bank-transaction/PaymentMethodDistributionChart.jsx";	
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart.jsx";



const BankTransactionPage = () => {
  const [rawData, setRawData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // get api data
  useEffect(() => {
    axios.get("/api/bank-trans/")
      .then((response) => {
        setRawData(response.data);
        setLoadingStats(false);
      })
      .catch((error) => {
        console.error("Error fetching bank transactions:", error);
        setLoadingStats(false);
      });
  }, []);

  // metrics from data
  const totalTransactions = rawData.length;
  const totalAmount = rawData.reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);
  const fraudulentTransactions = rawData.filter((tx) => tx.is_fraud);
  const fraudRate = totalTransactions > 0 ? (fraudulentTransactions.length / totalTransactions) * 100 : 0;
  const fraudProbability = totalTransactions > 0
    ? rawData.reduce((acc, tx) => acc + parseFloat(tx.fraud_probability || 0), 0) / totalTransactions
    : 0;

  // format currency 
  const formattedTotalAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Bank Transactions' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STAT CARDS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Total Transactions' 
            icon={Package} 
            value={loadingStats ? "Loading..." : totalTransactions} 
            color='#6366F1' 
          />
          <StatCard 
            name='Avg Fraud Probability' 
            icon={TrendingUp} 
            value={loadingStats ? "Loading..." : fraudProbability.toFixed(8)} 
            color='#10B981' 
          />
          <StatCard 
            name='Fraud Rate (%)' 
            icon={AlertTriangle} 
            value={loadingStats ? "Loading..." : fraudRate.toFixed(2)} 
            color='#F59E0B' 
          />
          <StatCard 
            name='Total Amount' 
            icon={DollarSign} 
            value={loadingStats ? "Loading..." : formattedTotalAmount} 
            color='#EF4444' 
          />
        </motion.div>

		{/* CHARTS */}
		<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

			<TransactionTypeDistributionChart />
			<FraudulentVsNonFraudulentChart />

		</div>
    <br/>
    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
      <BankTransactionPredictor/>
    </div>
		<br/>
		<div className='grid grid-cols-1 lg:grid-cols-1 gap-8 '>
			
			<BankTransactionsTable />

		</div>
        

        
		
      </main>
    </div>
  );
};

export default BankTransactionPage;
