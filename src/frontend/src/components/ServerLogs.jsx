import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RefreshCw, Search, ChevronDown, ChevronUp } from "lucide-react";

const LOG_LEVELS = ["All", "DEBUG", "INFO", "WARNING", "ERROR"];

const ServerLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [logLevel, setLogLevel] = useState("All");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15; // pagination todo

  // get api logs - server logs 
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/server_logs/");
      setLogs(response.data.logs.reverse()); // newest first
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
    setLoading(false);
  };

  // auto refresh
  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // filter logs 
  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logLevel === "All" || log.includes(logLevel);
    const matchesQuery = log.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  // ** Pagination Logic **
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">🔍 Server Logs</h2>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-lg ${
            autoRefresh ? "bg-green-500" : "bg-gray-600"
          } text-white hover:bg-green-600 transition`}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
        </button>
      </div>

      {/* Filters Section */}
      <div className="mt-4 bg-gray-900 p-4 rounded-lg">
        <button
          className="flex items-center justify-between w-full text-white text-sm font-medium"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"} {showFilters ? <ChevronUp /> : <ChevronDown />}
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 pl-10 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="🔎 Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* Log Level Filter */}
            <select
              className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
            >
              {LOG_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Logs Display */}
      <div className="mt-4 h-96 overflow-y-auto bg-gray-900 rounded-lg p-4 border border-gray-700">
        {loading ? (
          <p className="text-gray-300">🔄 Loading logs...</p>
        ) : currentLogs.length === 0 ? (
          <p className="text-gray-400">No logs found.</p>
        ) : (
          <ul className="text-gray-300 space-y-2">
            {currentLogs.map((log, index) => (
              <li
                key={index}
                className={`p-2 rounded ${
                  log.includes("ERROR")
                    ? "bg-red-600 bg-opacity-20"
                    : log.includes("WARNING")
                    ? "bg-yellow-600 bg-opacity-20"
                    : log.includes("INFO")
                    ? "bg-blue-600 bg-opacity-20"
                    : "bg-gray-700 bg-opacity-20"
                }`}
              >
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              currentPage === 1 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ◀ Prev
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              currentPage === totalPages ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          onClick={fetchLogs}
        >
          <RefreshCw className="inline-block mr-2" size={18} />
          Refresh Logs
        </button>
      </div>
    </motion.div>
  );
};

export default ServerLogs;
