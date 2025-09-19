import Header from "../components/common/Header";

import OverviewCards from "../components/dashboard/OverviewCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import ChannelPerformance from "../components/dashboard/ChannelPerformance";
import ProductPerformance from "../components/dashboard/ProductPerformance";
// import UserRetention from "../components/dashboard/UserRetention";
import CustomerSegmentation from "../components/dashboard/CustomerSegmentation";
import AIPoweredInsights from "../components/dashboard/AIPoweredInsights";

const AnalyticsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title={"FinSpy Client Dashboard"} />
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<OverviewCards />
				<RevenueChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<ChannelPerformance />
					<ProductPerformance />
					<UserRetention />
					<CustomerSegmentation />
				</div>

				<AIPoweredInsights />
			</main>
		</div>
	);
};
export default AnalyticsPage;
