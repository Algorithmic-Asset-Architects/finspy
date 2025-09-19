import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const productPerformanceData = [
	{ name: "Transaction A", transaction: 4000, account: 2400, fraud: 2400 },
	{ name: "Transaction B", transaction: 3000, account: 1398, fraud: 2210 },
	{ name: "Transaction C", transaction: 2000, account: 9800, fraud: 2290 },
	{ name: "Transaction D", transaction: 2780, account: 3908, fraud: 2000 },
	{ name: "Transaction E", transaction: 1890, account: 4800, fraud: 2181 },
];

const ProductPerformance = () => {	
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>Transactions</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={productPerformanceData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='name' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Bar dataKey='transaction' fill='#8B5CF6' />
						<Bar dataKey='account' fill='#10B981' />
						<Bar dataKey='fraud' fill='#F59E0B' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default ProductPerformance;
