import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import PageLayout from '../../components/layout/PageLayout';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';

export default function MySubsidies() {
	const [globalFilter, setGlobalFilter] = useState('');
	const [subsidies] = useState([
		{
			id: 1,
			name: 'Mangrove Plantation',
			milestone: 'Phase 1 Completed',
			amount: '₹50,000',
			status: 'Approved',
		},
		{
			id: 2,
			name: 'Coral Reef Restoration',
			milestone: 'Pending Verification',
			amount: '₹75,000',
			status: 'Pending',
		},
		{
			id: 3,
			name: 'Seaweed Cultivation',
			milestone: '50% Complete',
			amount: '₹40,000',
			status: 'Pending',
		},
	]);

	const statusTemplate = (rowData) => {
		let statusClass =
			rowData.status === 'Approved'
				? 'bg-green-100 text-green-700'
				: rowData.status === 'Pending'
				? 'bg-yellow-100 text-yellow-700'
				: 'bg-red-100 text-red-700';

		return (
			<span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
				{rowData.status}
			</span>
		);
	};

	const viewButtonTemplate = (rowData) => {
		return (
			<Button
				label="View"
				icon="pi pi-eye"
				className="p-button-sm p-button-outlined text-primary text-center self-center"
				onClick={() => alert(`Viewing subsidy: ${rowData.name}`)}
			/>
		);
	};

	const customSortIcon = ({ sortOrder }) => {
		return (
			<span className="">
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
							field="id"
							header="Sr No."
							sortable
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300 p-5"
						/>
						<Column
							field="name"
							header="Subsidy Name"
							sortable
							filter
							filterPlaceholder="Search by name"
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="milestone"
							header="Milestone"
							sortable
							filter
							filterPlaceholder="Search by milestone"
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="amount"
							header="Amount"
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
							body={viewButtonTemplate}
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
