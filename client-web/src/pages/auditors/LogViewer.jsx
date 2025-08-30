import React, { useState, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useEffect } from 'react';
import { fetchGet } from '../../utils/fetch.utils';
import PageLayout from '../../components/layout/PageLayout';
import { useParams } from 'react-router-dom';

// Dummy Logs (progress %)
const dummyLogs = [
	{ id: 1, date: '2025-01-15', progress: 10, note: 'Initial setup started' },
	{ id: 2, date: '2025-01-22', progress: 30, note: 'Electrolyzer installation' },
	{ id: 3, date: '2025-02-01', progress: 50, note: 'Plant construction halfway' },
	{ id: 4, date: '2025-02-12', progress: 70, note: 'Test hydrogen production achieved' },
	{ id: 5, date: '2025-02-20', progress: 90, note: 'Final commissioning in progress' },
];

// Dummy Docs
const dummyDocs = [
	{ id: 1, name: 'Site Report.pdf', type: 'Report', submittedOn: '2025-01-10' },
	{ id: 2, name: 'Safety Certificate.pdf', type: 'Certificate', submittedOn: '2025-01-18' },
	{ id: 3, name: 'Production Data.xlsx', type: 'Data Sheet', submittedOn: '2025-02-05' },
];

export default function LogViewer() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [milestoneInfo, setMilestoneInfo] = useState({});
	const toast = useRef(null);

	const id = useParams('contractId');
	// console.log(id.contractId);

	useEffect(() => {
		const loadMilestones = async () => {
			setLoading(true);
			const res = await fetchGet({ pathName: `audit/fetch-milestone-logs/${id.contractId}` }); // ✅ Replace API

			if (res && res.success !== false) {
				setMilestoneInfo({
					...milestoneInfo,
					description: res.data.milestones[0].description,
					amount: res.data.totalAmount,
				});
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load ',
				});
			}
			setLoading(false);
		};
		loadMilestones();
	}, []);
	const progressBodyTemplate = (rowData) => (
		<Tag
			value={`${rowData.progress}%`}
			severity={
				rowData.progress < 40 ? 'warning' : rowData.progress < 80 ? 'info' : 'success'
			}
			className="px-3 py-1 text-sm font-semibold"
		/>
	);
	const docActionTemplate = (rowData) => (
		<Button
			label="View"
			icon="pi pi-eye"
			className="p-button-sm p-button-outlined p-button-primary"
			onClick={() => alert(`Previewing ${rowData.name}`)}
		/>
	);
	// const milestoneInfo = {
	// 	description: 'Hydrogen Plant Commissioning – Phase 1',
	// 	amount: 10000,
	// };

	return (
		<PageLayout>
			<div className="px-4 py-6">
				<h2 className="text-3xl font-bold text-primary mb-6">Contract Logs & Documents</h2>
				<div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
					<h3 className="text-xl font-semibold text-gray-800">
						Milestone: {milestoneInfo.description}
					</h3>
					<p className="text-lg font-medium text-primary mt-1">
						Amount: ₹{milestoneInfo.amount}
					</p>
				</div>
				<Card className="shadow-lg rounded-2xl">
					<TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
						{/* Logs Tab */}
						<TabPanel header="Progress Logs">
							<DataTable
								value={dummyLogs}
								stripedRows
								paginator
								rows={5}
								className="text-md"
								emptyMessage="No logs available."
							>
								<Column field="date" header="Date" sortable className="px-3 py-2" />
								<Column
									field="progress"
									header="Progress"
									body={progressBodyTemplate}
									sortable
								/>
								<Column field="note" header="Remarks" />
							</DataTable>
						</TabPanel>

						{/* Documents Tab */}
						<TabPanel header="Submitted Documents">
							<DataTable
								value={dummyDocs}
								stripedRows
								paginator
								rows={5}
								className="text-md"
								emptyMessage="No documents submitted."
							>
								<Column field="name" header="Document Name" sortable />
								<Column field="type" header="Type" sortable />
								<Column field="submittedOn" header="Submitted On" sortable />
								<Column header="Action" body={docActionTemplate} />
							</DataTable>
						</TabPanel>
					</TabView>
				</Card>
			</div>
		</PageLayout>
	);
}
