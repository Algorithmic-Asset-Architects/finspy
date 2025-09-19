import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, ShieldAlert, TrendingUp } from "lucide-react";
import SalesOverviewChart from "../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../components/sales/DailySalesTrend";
import ProductsTable from "../components/products/ProductsTable";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import DeviceMonitoringPrediction from "../components/datauploader/DeviceMonitoringPrediction.jsx";


// ---------------------------------------------------------------------------  


const salesStats = {
    totalDevicesMonitored: "1,234",
    averageFingerprintMatches: "567",
    fraudDetectionRate: "98.7%",
    fraudDetectionGrowth: "15.4%",
};

const SalesPage = () => {

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    // metrics
    const totalTransactions = transactions.length;
    const fraudulentTransactions = transactions.filter(tx => tx.is_fraud);
    const fraudRate = totalTransactions > 0 ? (fraudulentTransactions.length / totalTransactions) * 100 : 0;
    const averageFraudProbability = totalTransactions > 0 
      ? transactions.reduce((acc, tx) => acc + parseFloat(tx.fraud_probability || 0), 0) / totalTransactions 
      : 0;
  
    useEffect(() => {
      // raw data
      axios.get('/api/device-monitoring/')
        .then(response => {
          setTransactions(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching device monitoring data:', err);
          setError(err);
          setLoading(false);
        });
    }, []);
  
    if (loading) return <div>Loading data...</div>;
    if (error) return <div>Error loading data.</div>;

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Device Monitoring Dashboard' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* MONITORING STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Devices Monitored' icon={DollarSign} value={totalTransactions} color='#6366F1' />
                    <StatCard
                        name='Fraudulent Transactions'
                        icon={CreditCard}
                        value={fraudulentTransactions.length}
                        color='#10B981'
                    />
                    <StatCard
                        name='Fraud Rate (%)'
                        icon={TrendingUp}
                        value={fraudRate.toFixed(2)}
                        color='#F59E0B'
                    />
                    <StatCard name='Avg. Fraud Probability' icon={ShieldAlert} value={averageFraudProbability.toFixed(8)} color='#EF4444' />
                </motion.div>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>


                    <SalesByCategoryChart /> {/* changed for device OS distribution chart */}


                    <DailySalesTrend />

                </div>
                <SalesOverviewChart />
                {/* CHARTS */}
                <br>
                </br>
                <DeviceMonitoringPrediction/>
                <br>
                </br>
                <ProductsTable/>

            </main>
        </div>
    );
};
export default SalesPage;
