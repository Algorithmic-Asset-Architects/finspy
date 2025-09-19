import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CreditCardTransactionTrend = () => {
	const [transactionData, setTransactionData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);


	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				const response = await axios.get("/api/cred-card/");
				

				if (!Array.isArray(response.data)) {
					throw new Error("Unexpected API response format");
				}

				const transactions = response.data;


				const aggregatedData = transactions.reduce((acc, transaction) => {
					const date = new Date(transaction.trans_date_trans_time);
					const month = date.toLocaleString("default", { month: "short" });

					const existingMonth = acc.find((entry) => entry.month === month);
					if (existingMonth) {
						existingMonth.amount += parseFloat(transaction.amt || 0);
					} else {
						acc.push({ month, amount: parseFloat(transaction.amt || 0) });
					}

					return acc;
				}, []);


				const orderedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				aggregatedData.sort((a, b) => orderedMonths.indexOf(a.month) - orderedMonths.indexOf(b.month));

				setTransactionData(aggregatedData);
			} catch (err) {
				console.error("Error fetching credit card transactions:", err);
				setError("Failed to load transaction data.");
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, []);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>Credit Card Transaction Trend</h2>

			{loading && <p className="text-gray-400">🔄 Loading transactions...</p>}
			{error && <p className="text-red-500">{error}</p>}

			{!loading && !error && transactionData.length > 0 && (
				<div style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<LineChart data={transactionData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
							<XAxis dataKey='month' stroke='#9CA3AF' />
							<YAxis stroke='#9CA3AF' />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(31, 41, 55, 0.8)",
									borderColor: "#4B5563",
								}}
								itemStyle={{ color: "#E5E7EB" }}
							/>
							<Legend />
							<Line type='monotone' dataKey='amount' stroke='#8B5CF6' strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}

			{!loading && !error && transactionData.length === 0 && <p className="text-gray-400">No transactions found.</p>}
		</motion.div>
	);
};

export default CreditCardTransactionTrend;
