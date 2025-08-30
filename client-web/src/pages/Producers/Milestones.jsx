import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useEffect } from 'react';
import { fetchGet } from '../../utils/fetch.utils';
import PageLayout from '../../components/layout/PageLayout';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function LogViewer() {
	const [loading, setLoading] = useState(true);
	const [logs, setLogs] = useState([]);
	const [milestoneInfo, setMilestoneInfo] = useState({});
	const toast = useRef(null);

	const { id } = useParams('id');
	const navigate = useNavigate();
	useEffect(() => {
		const loadMilestones = async () => {
			setLoading(true);
			const res = await fetchGet({
				pathName: `producer/fetch-milestones/${id}`,
			});

			if (res && res.success !== false) {
				setMilestoneInfo({
					...milestoneInfo,
					description: res.subsidy.milestones?.[0]?.description,
					amount: res.subsidy.totalAmount * 380000,
				});
				setLogs(res.data);
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load logs',
				});
			}
			setLoading(false);
		};
		loadMilestones();
	}, []);

	return (
		<PageLayout>
			<div className="px-4 py-6">
				<h2 className="text-3xl font-bold text-primary mb-6">
					<Button
						icon={<i className="pi pi-angle-left text-3xl text-primary" />}
						rounded
						text
						aria-label="Back"
						className="focus:outline-none focus:ring-0"
						onClick={() => navigate(-1)}
					/>
					Contract Logs & Documents
				</h2>
				<div className="mb-6 p-5 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4">
					<div>
						<h3 className="text-xl font-semibold text-gray-800">
							Milestone: {milestoneInfo.description}
						</h3>
						<p className="text-lg font-medium text-primary mt-1">
							Amount: ₹{milestoneInfo.amount}
						</p>
					</div>
				</div>
				<Card className="shadow-lg rounded-2xl">
					<DataTable
						value={logs}
						stripedRows
						paginator
						rows={5}
						className="text-md"
						emptyMessage="No logs available."
					>
						<Column
							field="createdAt"
							header="Date"
							body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
							sortable
						/>
						<Column field="description" header="Description" sortable />
						<Column
							field="status"
							header="Status"
							body={(rowData) => (
								<Tag
									value={rowData.status}
									severity={
										rowData.status === 'Verified'
											? 'success'
											: rowData.status === 'Rejected'
											? 'danger'
											: 'warning'
									}
									className="px-3 py-1 text-sm font-semibold"
								/>
							)}
							sortable
						/>
						<Column
							header="File"
							body={(rowData) =>
								rowData.file ? (
									<Button
										label="View File"
										icon="pi pi-eye"
										className="p-button-sm  p-button-primary"
										onClick={() => window.open(rowData.file, '_blank')}
									/>
								) : (
									<span className="text-gray-400">No File</span>
								)
							}
						/>
					</DataTable>
				</Card>
			</div>
		</PageLayout>
	);
}
