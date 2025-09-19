import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "./components/common/Sidebar";
import AdminSidebar from "./components/common/AdminSidebar";

import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import BankTransactionPage from "./pages/BankTransactionPage";
import CreditCardPage from "./pages/CreditCardPage";
import SalesPage from "./pages/SalesPage";
import DepositFraudPage from "./pages/DepositFraudPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import DataUploaderPage from "./pages/DataUploaderPage";

import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ServerLogs from "./components/ServerLogs";
import AboutPage from "./pages/AboutPage";

import AIFraudInsights from "./pages/AIFraudInsights";

import APIendpointsPage from "./pages/APIendpointsPage";

import UserList from "./components/UserList";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // get user role when loading
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/api/current_user/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        setUserRole(response.data.role);
		console.log(response.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // If loading, show nothing or a loader
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        🔄 Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Conditional Sidebar Rendering */}
      {userRole === "framework_admin" ? <AdminSidebar /> : <Sidebar />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/bank-transactions" element={<BankTransactionPage />} />
        <Route path="/credit-cards" element={<CreditCardPage />} />
        <Route path="/deposit-fraud" element={<DepositFraudPage />} />

        <Route path="/device-monitoring" element={<SalesPage />} />
        <Route path="/data-upload" element={<DataUploaderPage />} />

        <Route path="/server-logs" element={<ServerLogs />} />
		<Route path="/users" element={<UserList />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/ai-insights" element={<AIFraudInsights/>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />


        <Route path="/api" element={<APIendpointsPage/>} />

      </Routes>
    </div>
  );
}

export default App;
