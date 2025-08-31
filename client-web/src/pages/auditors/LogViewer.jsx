import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';

const ETH_TO_INR = 380000;

export default function LogViewer() {
	const [logs, setLogs] = useState([]);
	const [milestoneInfo, setMilestoneInfo] = useState({});
	const [globalFilter, setGlobalFilter] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitLoading, setSubmitLoading] = useState(false);
	const toast = useRef(null);
	const navigate = useNavigate();
	const { contractId } = useParams();

	useEffect(() => {
		const loadMilestones = async () => {
			setLoading(true);
			const res = await fetchGet({ pathName: `audit/fetch-milestone-logs/${contractId}` });

			if (res && res.success !== false) {
				setMilestoneInfo({
					contractName: res.data.title,
					description: res.data.milestones?.[0]?.description,
					amount: res.data.totalAmount * ETH_TO_INR,
				});
				setLogs(res.logs);
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
	}, [contractId]);

	const handleAccept = async () => {
		setSubmitLoading(true);
		try {
			const res = await fetchPost({
				pathName: `audit/release`,
				body: JSON.stringify({ contractId, milestoneIndex: 0 }),
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
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to accept milestone',
			});
		} finally {
			setSubmitLoading(false);
		}
	};

	const handleReject = async () => {
		try {
			const auditorId = localStorage.getItem('_id');
			const res = await fetchPost({
				pathName: `audit/reject`,
				body: JSON.stringify({
					subsidyId: contractId,
					auditorId,
					reason: "Submitted Documents are not valid and doesn't match submitted details of production",
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
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to reject milestone',
			});
		}
	};

	const srNoTemplate = (rowData, { rowIndex }) => rowIndex + 1;

	const statusTemplate = (rowData) => {
		let statusClass =
			rowData.status === 'Verified'
				? 'bg-green-100 text-green-700'
				: rowData.status === 'Rejected'
				? 'bg-red-100 text-red-700'
				: 'bg-yellow-100 text-yellow-700';
		return (
			<span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
				{rowData.status}
			</span>
		);
	};

	const fileTemplate = (rowData) =>
		rowData.file ? (
			<Button
				label="View File"
				icon="pi pi-eye"
				className="p-button-sm p-button-primary"
				onClick={() => window.open(rowData.file, '_blank')}
			/>
		) : (
			<span className="text-gray-400">No File</span>
		);

	const customSortIcon = ({ sortOrder }) => (
		<span>
			{sortOrder === 1 ? (
				<ArrowDownNarrowWide className="text-white w-4 h-4" />
			) : sortOrder === -1 ? (
				<ArrowUpNarrowWide className="text-white w-4 h-4" />
			) : (
				<ArrowUpDown className="text-white w-4 h-4 my-auto ml-2" />
			)}
		</span>
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
					<p className="mt-3 text-primary">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<PageLayout>
			<Toast ref={toast} />
			{submitLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[0px] bg-black/10">
					<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
			)}
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

				<div className="mb-6 flex justify-between items-center bg-gray-50 border border-gray-300 rounded-lg p-4">
					<div className="flex gap-2">
						<div className="flex gap-2">
							<span className="font-medium text-gray-600">Contract Name:</span>
							<span className="font-semibold text-gray-800">
								{milestoneInfo.contractName || '-'}
							</span>
						</div>
						<div className="text-gray-500">|</div>
						<div className="flex gap-2">
							<span className="font-medium text-gray-600">Milestone:</span>
							<span className="font-semibold text-gray-800">
								{milestoneInfo.description || '-'}
							</span>
						</div>
						<div className="text-gray-500">|</div>
						<div className="flex gap-2">
							<span className="font-medium text-gray-600">Amount:</span>
							<span className="font-semibold text-primary">
								₹{milestoneInfo.amount || 0}
							</span>
						</div>
					</div>
					{logs[logs.length - 1]?.status === 'Verified' ||
					logs.length === 0 ||
					Number(milestoneInfo.description) >
						Number(logs[logs.length - 1]?.description) ? (
						<div className="flex gap-3 h-10">
							<Button
								label="Accept"
								className="p-button-success p-button-sm"
								onClick={handleAccept}
								disabled
							/>
							<Button
								label="Reject"
								className="p-button-danger p-button-sm"
								onClick={handleReject}
								disabled
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
				<div className="overflow-x-hidden">
					<DataTable
						value={logs}
						globalFilter={globalFilter}
						showGridlines
						emptyMessage="No logs available."
						tableStyle={{ borderCollapse: 'collapse' }}
						responsiveLayout="scroll"
						className="p-datatable-sm min-w-[700px]"
						stripedRows
						removableSort
						paginator
						paginatorClassName="bg-gray-50 border-gray-50"
						sortIcon={customSortIcon}
						rows={25}
						rowsPerPageOptions={[5, 10, 25, 50]}
					>
						<Column
							header="Sr No."
							body={srNoTemplate}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="createdAt"
							header="Date"
							sortable
							filter
							filterPlaceholder="Search by date"
							body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="description"
							header="Description"
							sortable
							filter
							filterPlaceholder="Search by description"
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="status"
							header="Status"
							sortable
							body={statusTemplate}
							bodyClassName="text-text text-md text-center border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							header="File"
							body={fileTemplate}
							bodyClassName="text-text text-md text-center border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
					</DataTable>
				</div>
			</div>
		</PageLayout>
	);
}
