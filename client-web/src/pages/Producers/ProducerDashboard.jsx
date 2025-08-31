import React, { useEffect, useState } from 'react';
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
	LineChart,
	Line,
	CartesianGrid,
} from 'recharts';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FaFileContract, FaMoneyBillWave, FaUsers, FaClock } from 'react-icons/fa';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';

const COLORS = ['#FFC107', '#4CAF50', '#F44336'];

const ProducerDashboard = ({ producerId }) => {
	const [cards, setCards] = useState(null);
	const [graphs, setGraphs] = useState(null);

	useEffect(() => {
		async function loadData() {
			const producerId = localStorage.getItem('_id');
			const res = await fetchGet({ pathName: `producer/dashboard/${producerId}` });
			if (res?.success) {
				const factor = 380000;

				// Scale card values
				const scaledCards = {
					...res.cards,
					totalReceived: res.cards.totalReceived * factor,
				};

				// Scale graph values
				const scaledGraphs = {
					subsidyApplyArr: res.graphs.subsidyApplyArr.map((d) => ({
						...d,
						total: d.total * factor,
					})),
					statusArr: res.graphs.statusArr, // assuming counts only
					amountTrackArr: res.graphs.amountTrackArr.map((d) => ({
						...d,
						released: d.released * factor,
					})),
				};

				setCards(scaledCards);
				setGraphs(scaledGraphs);
			}
		}
		loadData();
	}, [producerId]);

	// const handleExportExcel = () => {
	// 	const data = [
	// 		{ Metric: "Total Contracts", Value: cards.totalContracts },
	// 		{ Metric: "Total Subsidy Applied", Value: cards.totalSubsidyApplied },
	// 		{ Metric: "Total Pending", Value: cards.totalPending },
	// 		{ Metric: "Total Received", Value: cards.totalReceived },
	// 	];

	// 	const ws = XLSX.utils.json_to_sheet(data);
	// 	const wb = XLSX.utils.book_new();
	// 	XLSX.utils.book_append_sheet(wb, ws, "Dashboard");

	// 	const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
	// 	saveAs(new Blob([wbout], { type: "application/octet-stream" }), "ProducerDashboard.xlsx");
	// };

	if (!cards || !graphs) return <p className="p-6 text-gray-600">Loading dashboard...</p>;

	return (
		<PageLayout>
			<div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
				<h1 className="text-3xl text-primary font-bold mb-8 text-center tracking-wide">
					Producer Dashboard
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
					<Card
						className="rounded-2xl p-0 w-72 h-32 shadow-lg bg-gradient-to-br from-green-100 to-green-200 
													 transition-transform transform hover:shadow-xl duration-300"
					>
						<div className="flex items-center space-x-4">
							<div className="p-4 bg-green-700 rounded-full text-white shadow-md">
								<FaFileContract className="text-3xl" />
							</div>
							<div>
								<p className="text-base font-medium text-gray-700">
									Total Contracts
								</p>
								<h2 className="text-4xl font-extrabold text-green-800">
									{cards.totalContracts}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<FaMoneyBillWave className="text-blue-700 text-4xl" />
							<div>
								<p className="text-base font-semibold">Total Approved Subsidy</p>
								<h2 className="text-3xl font-bold text-blue-800">
									{cards.totalSubsidyApproved}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<FaClock className="text-yellow-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Pending Subsidy</p>
								<h2 className="text-3xl font-bold text-yellow-800">
									{cards.totalSubsidyPending}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-100 to-purple-200 transition-transform transform hover:shadow-xl duration-300">
						<div className="flex items-center space-x-4">
							<FaUsers className="text-purple-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Received</p>
								<h2 className="text-3xl font-bold text-purple-800">
									₹{cards.totalReceived.toLocaleString()}
								</h2>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Subsidy Applied per Month</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={graphs.subsidyApplyArr}>
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="total"
									stroke="#4CAF50"
									strokeWidth={3}
								/>
							</LineChart>
						</ResponsiveContainer>
					</Card>

					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Subsidy Status per Month</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={graphs.statusArr}>
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="Created" stackId="a" fill="#FFC107" />
								<Bar dataKey="Funded" stackId="a" fill="#2196F3" />
								<Bar dataKey="InProgress" stackId="a" fill="#FF9800" />
								<Bar dataKey="Completed" stackId="a" fill="#4CAF50" />
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-10">
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Amount Released per Month</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={graphs.amountTrackArr}>
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="released"
									stroke="#673AB7"
									strokeWidth={3}
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
