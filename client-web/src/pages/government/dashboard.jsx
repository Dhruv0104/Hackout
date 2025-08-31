// GovernmentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import PageLayout from '../../components/layout/PageLayout';
import { Chart } from 'primereact/chart';
import { fetchGet } from '../../utils/fetch.utils';
import { FaFileContract, FaMoneyBillWave, FaUsers, FaClock } from 'react-icons/fa';
const ethToInr = 380000;

const GovernmentDashboard = () => {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetchGet({ pathName: 'government/dashboard' });
				if (res.success) {
					console.log('data: ', res.data);
					setDashboardData(res.data);
				}
			} catch (err) {
				console.error('Failed to fetch dashboard data:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<PageLayout>
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
						<p className="mt-3 text-primary">Loading...</p>
					</div>
				</div>
			</PageLayout>
		);
	}

	if (!dashboardData) {
		return (
			<PageLayout>
				<div className="p-6">
					<h1 className="text-2xl font-bold">No data available</h1>
				</div>
			</PageLayout>
		);
	}

	// --- Extract Metrics ---
	const { subsidyCount, producerCount, totalSubsidyCompleted, totalPendingAmount, charts } =
		dashboardData;

	const currencyFormat = (value) =>
		new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 2,
		}).format(Number(value) / 1e18);

	// --- Chart 1: Allocated vs Distributed per month ---
	const allocatedVsDistributed = {
		labels: charts.amountPerMonth.map((d) => `${d._id.month}/${d._id.year}`),
		datasets: [
			{
				label: 'Allocated (₹)',
				data: charts.amountPerMonth.map((d) => d.totalAllocated * ethToInr),
				borderColor: '#3B82F6',
				backgroundColor: 'rgba(59,130,246,0.5)',
			},
			{
				label: 'Distributed (₹)',
				data: charts.amountPerMonth.map((d) => d.totalDistributed * ethToInr),
				borderColor: '#EF4444',
				backgroundColor: 'rgba(239,68,68,0.5)',
			},
		],
	};

	// --- Chart 2: Status Distribution ---
	const statusDistribution = {
		labels: charts.statusDistribution.map((d) => d._id),
		datasets: [
			{
				data: charts.statusDistribution.map((d) => d.count),
				backgroundColor: ['#FFC107', '#4CAF50'],
			},
		],
	};

	// --- Chart 3: Subsidy Allocated per month (Line instead of Bar) ---
	const subsidyAllocated = {
		labels: charts.subsidyAllocatedPerMonth.map((d) => `${d._id.month}/${d._id.year}`),
		datasets: [
			{
				label: 'Subsidy Allocated',
				data: charts.subsidyAllocatedPerMonth.map((d) => d.totalAllocated),
				borderColor: '#42A5F5',
				tension: 0.4,
				fill: false,
			},
		],
	};

	// --- Chart 4: Producers applying per month (Bar) ---
	const producersPerMonth = {
		labels: charts.producersPerMonth.map((d) => `${d._id.month}/${d._id.year}`),
		datasets: [
			{
				label: 'Producers',
				data: charts.producersPerMonth.map((d) => d.count),
				backgroundColor: 'rgba(206,147,216,0.6)',
				borderColor: '#9C27B0',
				borderWidth: 1,
			},
		],
	};

	return (
		<PageLayout>
			<div className="p-6">
				<h1 className="text-3xl text-primary font-bold mb-8 text-center tracking-wide">
					Government Dashboard
				</h1>
				{/* Metric Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-green-100 to-green-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-green-700 rounded-full text-white shadow-md">
								<FaFileContract className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">
									Total Contracts
								</p>
								<h2 className="text-4xl font-extrabold text-green-800">
									{subsidyCount}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-blue-700 rounded-full text-white shadow-md">
								<FaUsers className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">Producers</p>
								<h2 className="text-4xl font-extrabold text-blue-800">
									{producerCount}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-purple-700 rounded-full text-white shadow-md">
								<FaMoneyBillWave className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">
									Completed Contracts
								</p>
								<h2 className="text-4xl font-extrabold text-purple-800">
									{totalSubsidyCompleted}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-yellow-700 rounded-full text-white shadow-md">
								<FaClock className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">
									Pending Amount
								</p>
								<h2 className="text-3xl font-extrabold text-yellow-800">
									₹
									{(parseFloat(totalPendingAmount) * ethToInr).toLocaleString(
										'en-IN',
										{ maximumFractionDigits: 2 }
									)}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-pink-100 to-pink-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-pink-700 rounded-full text-white shadow-md">
								<FaMoneyBillWave className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">Total Amount</p>
								<h2 className="text-3xl font-extrabold text-pink-800">
									₹
									{(
										parseFloat(dashboardData.currentAmount) * ethToInr
									).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl p-0 h-32 shadow-lg bg-gradient-to-br from-teal-100 to-teal-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-teal-700 rounded-full text-white shadow-md">
								<FaClock className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">
									Total Disbursed Amount
								</p>
								<h2 className="text-3xl font-extrabold text-teal-800">
									₹
									{(
										parseFloat(dashboardData.totalAmountDisbursed) * ethToInr
									).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
								</h2>
							</div>
						</div>
					</Card>
				</div>

				{/* Charts Section */}
				<div className="space-y-10">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
						<Card className="shadow rounded-2xl hover:shadow-xl transition p-0">
							<h3 className="text-lg px-2 font-semibold mb-4 text-primary">
								Allocated vs Distributed (Monthly)
							</h3>
							<Chart type="bar" data={allocatedVsDistributed} />
						</Card>

						<Card className="shadow rounded-2xl hover:shadow-xl transition">
							<h3 className="text-lg font-semibold mb-4 text-primary">
								Contract Status Distribution
							</h3>
							<div className="flex justify-center items-center w-full">
								<Chart
									type="pie"
									data={statusDistribution}
									className="!w-64 !h-64"
								/>
							</div>
						</Card>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
						<Card className="shadow rounded-2xl hover:shadow-xl transition">
							<h3 className="text-lg font-semibold mb-4 text-primary">
								Total Contract Allocated Per Month
							</h3>
							<Chart type="line" data={subsidyAllocated} />
						</Card>

						<Card className="shadow rounded-2xl hover:shadow-xl transition">
							<h3 className="text-lg font-semibold mb-4 text-primary">
								Producers Applying Per Month
							</h3>
							<Chart type="bar" data={producersPerMonth} />
						</Card>
					</div>
				</div>
			</div>
		</PageLayout>
	);
};

export default GovernmentDashboard;
