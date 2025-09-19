import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import ChannelPerformance from "../components/dashboard/ChannelPerformance";
import ProductPerformance from "../components/dashboard/ProductPerformance";
import OverallUserRetentionChart from "../components/dashboard/OverallUserRetentionChart";
import ChannelComparisonChart from "../components/dashboard/ChannelComparisonChart";
import AIPoweredInsights from "../components/dashboard/AIPoweredInsights";
import CustomerSegmentation from "../components/dashboard/CustomerSegmentation";

import RDSMetrics from "../components/RDSMetrics.jsx";

import APILogSummary from "../components/APILogSummary.jsx";
import APIResponseChart from "../components/APIResponseChart.jsx";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ServerLogs from "../components/ServerLogs.jsx";

const AdminDashboard = () => {
  // hold data 
  const [data, setData] = useState({
    bankData: [],
    deviceData: [],
    creditData: [],
    depositData: [],
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    overallFraudRate: 0,
    overallAvgFraudProbability: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    axios
      .all([
        axios.get("/api/bank-trans/"),
        axios.get("/api/device-monitoring/"),
        axios.get("/api/cred-card/"),
        axios.get("/api/dep-fraud/"),
      ])
      .then(
        axios.spread((bankRes, deviceRes, creditRes, depositRes) => {
          const bankData = bankRes.data;
          const deviceData = deviceRes.data;
          const creditData = creditRes.data;
          const depositData = depositRes.data;
          setData({ bankData, deviceData, creditData, depositData });

          // aggregate metrics
          const allData = [
            ...bankData,
            ...deviceData,
            ...creditData,
            ...depositData,
          ];
          const totalTransactions = allData.length;
          const totalRevenue = allData.reduce(
            (acc, tx) => acc + parseFloat(tx.amount || tx.amt || 0),
            0
          );
          const fraudCount = allData.filter((tx) => tx.is_fraud).length;
          const overallFraudRate =
            totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;
          const overallAvgFraudProbability =
            totalTransactions > 0
              ? allData.reduce(
                  (acc, tx) =>
                    acc + parseFloat(tx.fraud_probability || 0),
                  0
                ) / totalTransactions
              : 0;

          setStats({
            totalTransactions,
            overallFraudRate,
            overallAvgFraudProbability,
            totalRevenue,
          });
          setLoading(false);
        })
      )
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
  }, []);

  // currency 
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue);

  // radar data
  const radarData = [
    {
      subject: "Transactions",
      Bank: data.bankData.length,
      Device: data.deviceData.length,
      Credit: data.creditData.length,
      Deposit: data.depositData.length,
      fullMark: Math.max(
        data.bankData.length,
        data.deviceData.length,
        data.creditData.length,
        data.depositData.length,
        100
      ),
    },
    {
      subject: "Revenue",
      Bank: data.bankData.reduce(
        (acc, tx) => acc + parseFloat(tx.amount || tx.amt || 0),
        0
      ),
      Device: data.deviceData.reduce(
        (acc, tx) => acc + parseFloat(tx.amount || tx.amt || 0),
        0
      ),
      Credit: data.creditData.reduce(
        (acc, tx) => acc + parseFloat(tx.amount || tx.amt || 0),
        0
      ),
      Deposit: data.depositData.reduce(
        (acc, tx) => acc + parseFloat(tx.amount || tx.amt || 0),
        0
      ),
      fullMark: Math.max(stats.totalRevenue, 1000000),
    },
    {
      subject: "Fraud Rate (%)",
      Bank:
        data.bankData.length > 0
          ? (
              (data.bankData.filter((tx) => tx.is_fraud).length /
                data.bankData.length) *
              100
            ).toFixed(2)
          : 0,
      Device:
        data.deviceData.length > 0
          ? (
              (data.deviceData.filter((tx) => tx.is_fraud).length /
                data.deviceData.length) *
              100
            ).toFixed(2)
          : 0,
      Credit:
        data.creditData.length > 0
          ? (
              (data.creditData.filter((tx) => tx.is_fraud).length /
                data.creditData.length) *
              100
            ).toFixed(2)
          : 0,
      Deposit:
        data.depositData.length > 0
          ? (
              (data.depositData.filter((tx) => tx.is_fraud).length /
                data.depositData.length) *
              100
            ).toFixed(2)
          : 0,
      fullMark: 100,
    },
  ];

  // 
  const retentionData = [
    { period: "Week 1", retention: 100 },
    { period: "Week 2", retention: 85 },
    { period: "Week 3", retention: 80 },
    { period: "Week 4", retention: 75 },
    { period: "Week 5", retention: 70 },
    { period: "Week 6", retention: 68 },
    { period: "Week 7", retention: 65 },
    { period: "Week 8", retention: 63 },
  ];

  if (loading)
    return <div className="text-white p-4">Loading dashboard data...</div>;

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="FinSpy Admin Dashboard" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
       
        <APILogSummary/>
        <br>
            </br>
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
            value={stats.totalTransactions}
            color="#6366F1"
          />
          <StatCard
            name="Overall Fraud Rate"
            icon={AlertTriangle}
            value={stats.overallFraudRate.toFixed(2) + "%"}
            color="#F59E0B"
          />
          <StatCard
            name="Avg Fraud Probability"
            icon={TrendingUp}
            value={stats.overallAvgFraudProbability.toFixed(8)}
            color="#10B981"
          />
          <StatCard
            name="Total Revenue"
            icon={DollarSign}
            value={formattedRevenue}
            color="#EF4444"
          />
        </motion.div>
        <br>
        </br>
        <APIResponseChart/>
        <br>
        
        </br>
        <div className="mb-8">
          <AIPoweredInsights metrics={stats} />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChannelComparisonChart data={radarData} />
          <OverallUserRetentionChart data={retentionData} />
        </div>
        <br>
        </br>
        <ServerLogs/>
        

        {/* Additional dashboard components 
        <ChannelPerformance data={data} />
        <br></br>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          <RevenueChart data={data} />
          <ProductPerformance data={data} />
        </div>
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* If you have components for user retention and customer segmentation 
          <OverallUserRetentionChart  />
          <CustomerSegmentation  />
          */}
        </div>


      </main>
    </div>
  );
};

export default AdminDashboard;
