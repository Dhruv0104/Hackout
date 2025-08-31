import React, { useState, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useEffect } from 'react';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';
import PageLayout from '../../components/layout/PageLayout';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function LogViewer() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [logs, setLogs] = useState([]);
	const [milestoneInfo, setMilestoneInfo] = useState({});
	const toast = useRef(null);
	const navigate = useNavigate();

	const id = useParams('contractId');

	useEffect(() => {
		const loadMilestones = async () => {
			setLoading(true);
			const res = await fetchGet({
				pathName: `audit/fetch-milestone-logs/${id.contractId}`,
			});

			if (res && res.success !== false) {
				setMilestoneInfo({
					...milestoneInfo,
					description: res.data.milestones?.[0]?.description,
					amount: res.data.totalAmount * 380000,
				});
				setLogs(res.logs); // ✅ load milestone submissions
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

	async function handleAccept() {
		try {
			const res = await fetchPost({
				pathName: `audit/release`,
				body: JSON.stringify({
					contractId: id.contractId,
					milestoneIndex: 0,
				}),
			});

			if (res && res.success !== false) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Milestone accepted',
				});
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to accept milestone',
				});
			}
		} catch (err) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to accept milestone',
			});
		}
	}

	async function handleReject() {
		try {
			const id1 = localStorage.getItem('_id');
			const res = await fetchPost({
				pathName: `audit/reject`,
				body: JSON.stringify({
					subsidyId: id.contractId,
					auditorId: id1,
					reason: "Submitted Documents are not valid and doesn't match submitted details of production", // Replace with actual reason
				}),
			});

			if (res && res.success !== false) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Milestone rejected',
				});
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to reject milestone',
				});
			}
		} catch (err) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to reject milestone',
			});
		}
	}

	return (
		<PageLayout>
			<Toast ref={toast} />
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
					{logs.length > 0 &&
					milestoneInfo.description <= logs[logs.length - 1]?.description ? (
						<div className="flex gap-3 h-10">
							<Button
								label="Accept"
								className="p-button-success p-button-sm"
								onClick={handleAccept}
								disabled={true}
							/>
							<Button
								label="Reject"
								className="p-button-danger p-button-sm"
								onClick={handleReject}
								disabled={true}
							/>
						</div>
					) : (
						<div className="flex gap-3 h-10">
							<Button
								label="Accept"
								className="p-button-success p-button-sm"
								onClick={handleAccept}
							/>
							<Button
								label="Reject"
								className="p-button-danger p-button-sm"
								onClick={handleReject}
							/>
						</div>
					)}
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
