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

export default function AllMilestones() {
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
				pathName: `government/fetch-milestones/${id}`,
			});
			console.log(res);

			if (res && res.success !== false) {
				setMilestoneInfo({
					...milestoneInfo,
					contractName: res.subsidy.title,
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
				</div>
				<div className="overflow-x-hidden">
					<DataTable
						value={logs}
						globalFilter={undefined} // add globalFilter if you want search
						showGridlines
						emptyMessage="No logs available."
						tableStyle={{ borderCollapse: 'collapse' }}
						responsiveLayout="scroll"
						className="p-datatable-sm min-w-[700px]"
						stripedRows
						removableSort
						paginator
						paginatorClassName="bg-gray-50 border-gray-50"
						rows={25}
						rowsPerPageOptions={[5, 10, 25, 50]}
						sortIcon={
							<span>
								<i className="pi pi-sort-alt" />
							</span>
						}
					>
						<Column
							header="Sr No."
							body={(rowData, { rowIndex }) => rowIndex + 1}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="createdAt"
							header="Date"
							sortable
							body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="description"
							header="Description"
							sortable
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="status"
							header="Status"
							sortable
							body={(rowData) => {
								let statusClass =
									rowData.status === 'Verified'
										? 'bg-green-100 text-green-700'
										: rowData.status === 'Rejected'
										? 'bg-red-100 text-red-700'
										: 'bg-yellow-100 text-yellow-700';
								return (
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
									>
										{rowData.status}
									</span>
								);
							}}
							bodyClassName="text-text text-md text-center border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							header="File"
							body={(rowData) =>
								rowData.file ? (
									<Button
										label="View File"
										icon="pi pi-eye"
										className="p-button-sm p-button-primary"
										onClick={() => window.open(rowData.file, '_blank')}
									/>
								) : (
									<span className="text-gray-400">No File</span>
								)
							}
							bodyClassName="text-text text-md text-center border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
					</DataTable>
				</div>
			</div>
		</PageLayout>
	);
}
