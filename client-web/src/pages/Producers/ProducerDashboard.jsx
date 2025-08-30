// GovernmentDashboard.jsx
import React, { useState } from 'react';
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Legend,
	AreaChart,
	Area,
	CartesianGrid,
	LineChart,
	Line,
} from 'recharts';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FaFileContract, FaMoneyBillWave, FaUsers, FaClock } from 'react-icons/fa';
import PageLayout from '../../components/layout/PageLayout';

const COLORS = ['#FFC107', '#4CAF50', '#F44336']; // Pending, Completed, Failed

// Mock Data
const contractsMock = [
	{
		id: 1,
		name: 'Green Hydrogen Q1',
		producer: 'Producer 1',
		totalAmount: 100000,
		status: 'Pending',
		milestones: [
			{ description: 'Setup plant', amount: 50000, verified: false },
			{ description: 'Production start', amount: 50000, verified: false },
		],
	},
	{
		id: 2,
		name: 'Blue Carbon Project',
		producer: 'Producer 2',
		totalAmount: 80000,
		status: 'Completed',
		milestones: [{ description: 'Initial survey', amount: 80000, verified: true }],
	},
	{
		id: 3,
		name: 'Solar Panel Initiative',
		producer: 'Producer 3',
		totalAmount: 120000,
		status: 'Pending',
		milestones: [
			{ description: 'Panels installed', amount: 60000, verified: false },
			{ description: 'Testing', amount: 60000, verified: false },
		],
	},
	{
		id: 4,
		name: 'Wind Energy Project',
		producer: 'Producer 4',
		totalAmount: 90000,
		status: 'Pending',
		milestones: [
			{ description: 'Installation', amount: 45000, verified: false },
			{ description: 'Testing', amount: 45000, verified: false },
		],
	},
	{
		id: 5,
		name: 'Biofuel Initiative',
		producer: 'Producer 5',
		totalAmount: 70000,
		status: 'Completed',
		milestones: [{ description: 'Setup', amount: 70000, verified: true }],
	},
];

const milestoneData = [
	{ month: 'Jan', completedMilestones: 5, totalMilestones: 10 },
	{ month: 'Feb', completedMilestones: 8, totalMilestones: 12 },
	{ month: 'Mar', completedMilestones: 10, totalMilestones: 12 },
	{ month: 'Apr', completedMilestones: 12, totalMilestones: 15 },
	{ month: 'May', completedMilestones: 14, totalMilestones: 15 },
];

const subsidyData = [
	{ month: 'Jan', deployed: 50000, approved: 100000 },
	{ month: 'Feb', deployed: 80000, approved: 120000 },
	{ month: 'Mar', deployed: 100000, approved: 120000 },
	{ month: 'Apr', deployed: 120000, approved: 150000 },
	{ month: 'May', deployed: 140000, approved: 150000 },
];

const ProducerDashboard = () => {
	const [contracts] = useState(contractsMock);

	// Summary metrics
	const totalContracts = contracts.length;
	const totalSubsidy = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
	const producersCount = new Set(contracts.map((c) => c.producer)).size;
	const pendingContracts = contracts.filter((c) => c.status === 'Pending').length;
	const completedContracts = contracts.filter((c) => c.status === 'Completed').length;

	// Pie chart data
	const pieData = [
		{ name: 'Pending', value: pendingContracts },
		{ name: 'Completed', value: completedContracts },
		{ name: 'Failed', value: 0 },
	];

	// Horizontal Bar Chart for Top Producers
	const topN = 5;
	const sorted = [...contracts].sort((a, b) => b.totalAmount - a.totalAmount);
	const topProducers = sorted.slice(0, topN);
	const othersTotal = sorted.slice(topN).reduce((sum, c) => sum + c.totalAmount, 0);
	const barData = [
		...topProducers.map((c) => ({
			producer: c.producer,
			subsidy: c.totalAmount,
		})),
		...(othersTotal > 0 ? [{ producer: 'Others', subsidy: othersTotal }] : []),
	];

	return (
		<PageLayout>
			<div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
						Government Dashboard
					</h1>
					<Button
						label="Export Report"
						icon="pi pi-download"
						className="p-button-sm p-button-success shadow-md"
					/>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-green-100 to-green-200">
						<div className="flex items-center space-x-4">
							<FaFileContract className="text-green-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Contracts</p>
								<h2 className="text-3xl font-bold text-green-800">
									{totalContracts}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
						<div className="flex items-center space-x-4">
							<FaMoneyBillWave className="text-blue-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Subsidy</p>
								<h2 className="text-3xl font-bold text-blue-800">
									₹{totalSubsidy.toLocaleString()}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
						<div className="flex items-center space-x-4">
							<FaUsers className="text-purple-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Producers Involved</p>
								<h2 className="text-3xl font-bold text-purple-800">
									{producersCount}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
						<div className="flex items-center space-x-4">
							<FaClock className="text-yellow-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Pending Contracts</p>
								<h2 className="text-3xl font-bold text-yellow-800">
									{pendingContracts}
								</h2>
							</div>
						</div>
					</Card>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					{/* Pie Chart */}
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Contracts Status</h3>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={90}
									label
								>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</Card>

					{/* Bar Chart */}
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Top Producers Subsidy</h3>
						<ResponsiveContainer
							width="100%"
							height={Math.max(50 * barData.length, 300)}
						>
							<BarChart
								layout="vertical"
								data={barData}
								margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
							>
								<XAxis type="number" />
								<YAxis dataKey="producer" type="category" width={120} />
								<Tooltip />
								<Legend />
								<Bar dataKey="subsidy" fill="#4CAF50" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</div>

				{/* Milestone & Subsidy Trend */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Milestone Completion</h3>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={milestoneData}>
								<defs>
									<linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
										<stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis dataKey="month" />
								<YAxis />
								<CartesianGrid strokeDasharray="3 3" />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="completedMilestones"
									stroke="#4CAF50"
									fillOpacity={1}
									fill="url(#colorCompleted)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</Card>

					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Subsidy Utilization</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={subsidyData}>
								<XAxis dataKey="month" />
								<YAxis />
								<CartesianGrid strokeDasharray="3 3" />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="deployed"
									stroke="#4CAF50"
									strokeWidth={3}
									dot={{ r: 5 }}
								/>
								<Line
									type="monotone"
									dataKey="approved"
									stroke="#FFC107"
									strokeWidth={3}
									dot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</Card>
				</div>
			</div>
		</PageLayout>
	);
};

export default ProducerDashboard;
