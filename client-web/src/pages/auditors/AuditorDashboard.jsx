import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
} from 'recharts';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';

const AuditorDashboard = ({ auditorId }) => {
	const [cards, setCards] = useState(null);
	const [graphs, setGraphs] = useState(null);

	useEffect(() => {
		async function loadData() {
			const id = localStorage.getItem('_id'); // auditor id
			const res = await fetchGet({ pathName: `audit/dashboard/${id}` });
			if (res?.success) {
				setCards(res.cards);
				setGraphs(res.graphs);
			}
		}
		loadData();
	}, []);

	if (!cards || !graphs) return <p className="p-6 text-gray-600">Loading dashboard...</p>;

	return (
		<PageLayout>
			<div className="p-8 bg-gray-50 min-h-screen">
				<h1 className="text-3xl text-primary font-bold mb-8 text-center tracking-wide">
					Auditor Dashboard
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
						<div className="flex items-center space-x-4">
							<FaMoneyBillWave className="text-blue-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Arrived</p>
								<h2 className="text-3xl font-bold text-blue-800">
									{cards.totalArrived.toLocaleString()}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-green-100 to-green-200">
						<div className="flex items-center space-x-4">
							<FaCheckCircle className="text-green-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Approved</p>
								<h2 className="text-3xl font-bold text-green-800">
									{cards.totalApproved.toLocaleString()}
								</h2>
							</div>
						</div>
					</Card>

					<Card className="rounded-2xl shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
						<div className="flex items-center space-x-4">
							<FaClock className="text-yellow-700 text-4xl" />
							<div>
								<p className="text-lg font-semibold">Total Pending</p>
								<h2 className="text-3xl font-bold text-yellow-800">
									{cards.totalPending.toLocaleString()}
								</h2>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Card className="rounded-2xl shadow-lg">
						<h3 className="text-xl font-bold mb-4">Audited Subsidy per Month</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={graphs.auditedPerMonth}>
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
						<h3 className="text-xl font-bold mb-4">Audited Subsidy Status per Month</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={graphs.statusPerMonth}>
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
			</div>
		</PageLayout>
	);
};

export default AuditorDashboard;
