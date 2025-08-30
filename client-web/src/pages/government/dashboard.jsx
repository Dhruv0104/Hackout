// GovernmentDashboard.jsx
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
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
	// ...more mock data for testing
];

// Mock charts data
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

const GovernmentDashboard = () => {
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

	// Milestone expandable template
	const milestoneBodyTemplate = (rowData) => (
		<div className="ml-4">
			<h4 className="font-semibold mb-2">Milestones</h4>
			<ul className="list-disc pl-5">
				{rowData.milestones.map((m, idx) => (
					<li key={idx}>
						{m.description} - ₹{m.amount} -{' '}
						{m.verified ? (
							<span className="text-green-600 font-semibold">Verified</span>
						) : (
							<span className="text-yellow-600 font-semibold">Pending</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);

	return (
		<PageLayout>
			<div className="p-6">
				<h1 className="text-3xl text-primary font-bold mb-6">Government Dashboard</h1>

				{/* Summary Cards */}
				{/* Summary Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Card 1 */}
					<div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br from-orange-100 to-orange-200">
						<h2 className="text-xl text-black font-bold mt-3">Total Contracts</h2>
						<p className="text-3xl text-orange-600 font-extrabold mt-2">
							{totalContracts}
						</p>

						{/* Abstract Shape */}
						<div className="absolute right-[-30px] bottom-[-30px] w-40 h-40 bg-orange-300/60 rounded-full blur-3xl"></div>
					</div>

					{/* Card 2 */}
					<div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
						<h2 className="text-xl text-black font-bold mt-3">
							Total Subsidy Allocated
						</h2>
						<p className="text-3xl text-purple-600 font-extrabold mt-2">
							₹{totalSubsidy.toLocaleString()}
						</p>

						<div className="absolute left-[-20px] top-[-20px] w-36 h-36 bg-purple-300/60 rounded-full blur-3xl"></div>
					</div>

					{/* Card 3 */}
					<div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br from-green-100 to-green-200">
						<h2 className="text-xl texblack font-bold mt-3">Producers Involved</h2>
						<p className="text-3xl text-teal-600 font-extrabold mt-2">
							{producersCount}
						</p>

						<div className="absolute right-[-40px] top-[-10px] w-32 h-40 bg-green-300/60 rotate-45 blur-3xl"></div>
					</div>

					{/* Card 4 */}
					<div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br from-pink-100 to-pink-200">
						<h2 className="text-xl texblack font-bold mt-3">Pending Contracts</h2>
						<p className="text-3xl text-pink-600 font-extrabold mt-2 text-pink-600">
							{pendingContracts}
						</p>

						<div className="absolute left-1/2 bottom-[-30px] w-28 h-40 bg-pink-300/60 skew-y-12 blur-3xl"></div>
					</div>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-2 gap-6 mb-8">
					{/* Pie Chart */}
					<Card className="shadow-md bg-white" title="Contracts Status">
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={80}
									fill="#8884d8"
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

					{/* Horizontal Bar Chart */}
					<Card className="shadow-md bg-white" title="Top Producers Subsidy">
						<div
							style={{
								height: Math.max(50 * barData.length, 250),
								overflowY: 'auto',
							}}
						>
							<ResponsiveContainer
								width="100%"
								height={Math.max(50 * barData.length, 250)}
							>
								<BarChart
									layout="vertical"
									data={barData}
									margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
								>
									<XAxis type="number" />
									<YAxis dataKey="producer" type="category" width={120} />
									<Tooltip />
									<Legend />
									<Bar dataKey="subsidy" fill="#4CAF50" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</Card>
				</div>

				{/* Milestone Completion & Subsidy Trend */}
				<div className="grid grid-cols-2 gap-6 mb-8">
					{/* Milestone Completion Over Time */}
					<Card className="shadow-md bg-white" title="Milestone Completion Over Time">
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart
								data={milestoneData}
								margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
							>
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
									name="Completed Milestones"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</Card>

					{/* Subsidy Utilization Trend */}
					<Card className="shadow-md bg-white" title="Subsidy Utilization Trend">
						<ResponsiveContainer width="100%" height={300}>
							<LineChart
								data={subsidyData}
								margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
							>
								<XAxis dataKey="month" />
								<YAxis />
								<CartesianGrid strokeDasharray="3 3" />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="deployed"
									stroke="#4CAF50"
									strokeWidth={2}
									name="Deployed Subsidy"
								/>
								<Line
									type="monotone"
									dataKey="approved"
									stroke="#FFC107"
									strokeWidth={2}
									name="Approved Subsidy"
								/>
							</LineChart>
						</ResponsiveContainer>
					</Card>
				</div>

				{/* Contracts Table
        <Card className="shadow-md bg-white" title="Contracts List">
          <DataTable
            value={contracts}
            expandableRows
            rowExpansionTemplate={milestoneBodyTemplate}
            className="p-datatable-gridlines"
          >
            <Column expander style={{ width: "3em" }} />
            <Column field="name" header="Contract Name" />
            <Column field="producer" header="Producer" />
            <Column
              field="totalAmount"
              header="Total Amount"
              body={(row) => `₹${row.totalAmount}`}
            />
            <Column
              field="status"
              header="Status"
              body={(row) => (
                <span
                  className={`px-2 py-1 rounded-full font-semibold ${
                    row.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {row.status}
                </span>
              )}
            />
            <Column
              header="Actions"
              body={(row) => <Button label="View" className="p-button-sm p-button-info" />}
            />
          </DataTable>
        </Card> */}
			</div>
		</PageLayout>
	);
};

export default GovernmentDashboard;
