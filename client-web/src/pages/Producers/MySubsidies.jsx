import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageLayout from '../../components/layout/PageLayout';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { fetchGet } from '../../utils/fetch.utils';
const ETH_TO_INR = 380000;

export default function MySubsidies() {
	const [globalFilter, setGlobalFilter] = useState('');
	const [subsidies, setSubsidies] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchSubsidies = async () => {
			const id = localStorage.getItem('_id');
			const response = await fetchGet({ pathName: `producer/fetch-all-subsidies/${id}` });
			if (response.success) {
				setSubsidies(response.data);
			}
			console.log('subsidies:', response.data);
		};
		fetchSubsidies();
	}, []);

	const srNoTemplate = (rowData, { rowIndex }) => rowIndex + 1;

	const milestoneTemplate = (rowData) =>
		rowData.milestones && rowData.milestones.length > 0
			? rowData.milestones[0].description
			: '-';

	const amountTemplate = (rowData) =>
		rowData.milestones && rowData.milestones.length > 0
			? `₹${rowData.milestones[0].amount * ETH_TO_INR}`
			: '-';

	const statusTemplate = (rowData) => {
		let statusClass =
			rowData.status === 'Approved'
				? 'bg-green-100 text-green-700'
				: rowData.status === 'InProgress'
				? 'bg-yellow-100 text-yellow-700'
				: 'bg-red-100 text-red-700';

		return (
			<span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
				{rowData.status}
			</span>
		);
	};

	const actionTemplate = (rowData) => {
		if (rowData.status === 'InProgress') {
			return (
				<Button
					label="Submit Milestone"
					icon="pi pi-upload"
					className="p-button-sm p-button-success text-white"
					onClick={() => navigate(`/producer/milestone-form/${rowData._id}`)}
				/>
			);
		} else {
			return (
				<Button
					label="View"
					icon="pi pi-eye"
					className="p-button-sm p-button-outlined text-primary"
					onClick={() => alert(`Viewing subsidy: ${rowData.title}`)}
				/>
			);
		}
	};

	const customSortIcon = ({ sortOrder }) => {
		return (
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
	};

	return (
		<PageLayout>
			<div className="p-5">
				<div className="flex flex-row justify-between gap-4 items-start sm:items-center mb-5">
					<h2 className="text-3xl font-bold text-primary">My Subsidies</h2>
				</div>
				<div className="overflow-x-hidden">
					<DataTable
						value={subsidies}
						globalFilter={globalFilter}
						showGridlines
						emptyMessage="No subsidy found."
						tableStyle={{ borderCollapse: 'collapse' }}
						responsiveLayout="scroll"
						className="p-datatable-sm min-w-[700px] [&_.p-column-filter-menu-button]:text-white"
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
							field="title"
							header="Subsidy Name"
							sortable
							filter
							filterPlaceholder="Search by name"
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							header="Milestone"
							body={milestoneTemplate}
							sortable
							filter
							filterPlaceholder="Search by milestone"
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							header="Amount"
							body={amountTemplate}
							sortable
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
							header="Action"
							body={actionTemplate}
							exportable={false}
							bodyClassName="text-text text-md text-center border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
					</DataTable>
				</div>
			</div>
		</PageLayout>
	);
}
