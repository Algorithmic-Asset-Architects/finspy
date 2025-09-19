import { BarChart2, DollarSign, Menu, Settings, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
  { name: "Client Dashboard", icon: BarChart2, color: "#6366f1", href: "/" },
  { name: "Bank Transactions", icon: Icons.ListPlus, color: "#6EE7B7", href: "/bank-transactions" },
  { name: "Credit Cards", icon: Icons.CreditCard, color: "#6EE7B7", href: "/credit-cards" },
  { name: "Device Monitoring", icon: Icons.MonitorCheck, color: "#6EAAA7", href: "/device-monitoring" },
  { name: "Deposit Fraud", icon: Icons.AlertOctagon, color: "#6EE7B7", href: "/deposit-fraud" },
  { name: "Data Upload", icon: Icons.UploadCloud, color: "#67E7EE", href: "/data-upload" },
  { name: "AI Insights", icon: Icons.Brain, color: "#6EE7B7", href: "/ai-insights" },
];

const AUTH_ITEMS = [
  { name: "Login", icon: Icons.UserCheck, color: "#67E7EE", href: "/login" },
  { name: "Signup", icon: Icons.UserPlus, color: "#67E7EE", href: "/signup" },
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("authToken")));
  }, []);

  const itemsToDisplay = isLoggedIn ? SIDEBAR_ITEMS : AUTH_ITEMS;

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        <nav className="mt-8 flex-grow">
          {itemsToDisplay.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-4 whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
