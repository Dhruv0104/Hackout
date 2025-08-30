import React, { useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide, Eye } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';

export default function VerifyMilestones() {
	// const dummyContracts = [
	// 	{
	// 		_id: '1',
	// 		contractName: 'Contract A',
	// 		projectName: 'Project Alpha',
	// 		companyName: 'Company X',
	// 		producerName: 'Producer 1',
	// 		totalAmount: 50000,
	// 		status: 'Pending',
	// 		milestone: 'Milestone 1',
	// 		subsidyAmount: 10000,
	// 	},
	// 	{
	// 		_id: '2',
	// 		contractName: 'Contract B',
	// 		projectName: 'Project Beta',
	// 		companyName: 'Company Y',
	// 		producerName: 'Producer 2',
	// 		totalAmount: 75000,
	// 		status: 'Approved',
	// 		milestone: 'Milestone 2',
	// 		subsidyAmount: 15000,
	// 	},
	// 	{
	// 		_id: '3',
	// 		contractName: 'Contract C',
	// 		projectName: 'Project Gamma',
	// 		companyName: 'Company Z',
	// 		producerName: 'Producer 3',
	// 		totalAmount: 60000,
	// 		status: 'Rejected',
	// 		milestone: 'Milestone 3',
	// 		subsidyAmount: 12000,
	// 	},
	// ];
	const [contracts, setContracts] = useState([]);

	const [filters, setFilters] = useState({
		'projectName': { value: null, matchMode: FilterMatchMode.CONTAINS },
		'companyName': { value: null, matchMode: FilterMatchMode.CONTAINS },
	});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const toast = useRef(null);

	// For modal
	const [selectedContract, setSelectedContract] = useState(null);
	const [isContractModalVisible, setIsContractModalVisible] = useState(false);
	const navigate = useNavigate();

	const handleViewContract = (_id) => {
		navigate(`/auditor/log-viewer/${_id}`);
		// navigate(`/auditor/log-viewer`); // ✅ Adjusted path
	};

	useEffect(() => {
		loadContracts();
	}, []);

	const loadContracts = async () => {
		setLoading(true);
		const res = await fetchGet({ pathName: 'audit/fetch-all-subsidies' }); // ✅ Replace API
		console.log(res.data);
		if (res && res.success !== false) {
			const parsedContracts = (res.data || res).map((contract, index) => ({
				...contract,
				serialNo: index + 1,
			}));
			setContracts(parsedContracts);
		} else {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to load contracts',
			});
		}
		setLoading(false);
	};

	const onGlobalFilterChange = (e) => setGlobalFilterValue(e.target.value);

	const clearFilters = () => {
		setFilters({
			'projectName': { value: null, matchMode: FilterMatchMode.CONTAINS },
			'companyName': { value: null, matchMode: FilterMatchMode.CONTAINS },
		});
		setGlobalFilterValue('');
	};

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

	const serialNoFilterTemplate = (options) => (
		<div className="flex gap-2">
			<InputNumber
				value={options.value ? options.value[0] : null}
				onChange={(e) =>
					options.filterCallback(
						[e.value, options.value ? options.value[1] : null],
						options.index
					)
				}
				placeholder="From"
				className="p-column-filter"
				useGrouping={false}
			/>
			<InputNumber
				value={options.value ? options.value[1] : null}
				onChange={(e) =>
					options.filterCallback(
						[options.value ? options.value[0] : null, e.value],
						options.index
					)
				}
				placeholder="To"
				className="p-column-filter"
				useGrouping={false}
			/>
		</div>
	);
	// Accept Handler → remove row
	const handleAccept = (rowData) => {
		setContracts((prevContracts) =>
			prevContracts.filter((contract) => contract._id !== rowData._id)
		);

		toast.current.show({
			severity: 'success',
			summary: 'Milestone Accepted',
			detail: `${rowData.projectName} milestone accepted.`,
		});
	};

	// Reject Handler → remove row
	const handleReject = (rowData) => {
		setContracts((prevContracts) =>
			prevContracts.filter((contract) => contract._id !== rowData._id)
		);

		toast.current.show({
			severity: 'warn',
			summary: 'Milestone Rejected',
			detail: `${rowData.projectName} milestone rejected.`,
		});
	};

	// Action Column with Eye Icon
	const actionTemplate = (rowData) => (
		<Button
			icon={<Eye className="w-4 h-4" />}
			className="p-button-rounded p-button-text text-primary"
			tooltip="View Details"
			onClick={() => {
				setSelectedContract(rowData);
				setIsContractModalVisible(true);
			}}
		/>
	);
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
	return (
		<PageLayout>
			<Toast ref={toast} />

			{/* Header */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 my-4 px-3">
				<h2 className="text-2xl lg:text-3xl font-bold text-primary">Verify Milestones</h2>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
					<InputText
						value={globalFilterValue}
						onChange={onGlobalFilterChange}
						placeholder="Search Project or Company"
						className="w-full sm:w-60"
					/>
					<Button
						icon="pi pi-filter-slash"
						rounded
						outlined
						onClick={clearFilters}
						className="text-primary border-primary"
						tooltip="Clear Filters"
						tooltipOptions={{ position: 'bottom' }}
					/>
				</div>
			</div>

			{/* Data Table */}
			<div className="w-full overflow-x-hidden px-3">
				<DataTable
					value={contracts}
					dataKey="id"
					// loading={loading}
					filters={filters}
					globalFilter={globalFilterValue}
					filterDisplay="menu"
					onFilter={(e) => setFilters(e.filters)}
					globalFilterFields={['projectName', 'companyName']}
					emptyMessage="No contracts found."
					stripedRows
					removableSort
					paginator
					sortIcon={customSortIcon}
					rows={rowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
					first={currentPage * rowsPerPage}
					onPage={(e) => {
						setCurrentPage(e.page);
						setRowsPerPage(e.rows);
					}}
				>
					<Column
						field="contractName"
						header="Contract Name"
						sortable
						filter
						filterPlaceholder="Search Contract"
						bodyClassName="text-md border border-gray-300 px-3 py-2"
						headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
					/>
					<Column
						field="companyName"
						header="Company Name"
						sortable
						filter
						filterPlaceholder="Search Company"
						bodyClassName="text-md border border-gray-300 px-3 py-2"
						headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
					/>

					<Column
						field="totalAmount"
						header="Total Amount"
						sortable
						body={(rowData) => `₹${rowData.totalAmount}`}
						bodyClassName="text-md border border-gray-300 text-center"
						headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
					/>
					<Column
						field="status"
						header="Milestone Status"
						sortable
						body={statusTemplate}
						bodyClassName="text-md border border-gray-300 text-center"
						headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
					/>
					<Column
						header="Action"
						align={'center'}
						body={(rowData) => (
							<div className="flex gap-2 justify-center">
								<Button
									label="View"
									className="p-button-primary p-button-sm"
									onClick={() => {
										setSelectedContract(rowData);
										handleViewContract(rowData.id);
									}}
								/>
								<Button
									label="Accept"
									className="p-button-success p-button-sm"
									onClick={() => handleAccept(rowData)}
								/>
								<Button
									label="Reject"
									className="p-button-danger p-button-sm"
									onClick={() => {
										handleReject(rowData);
									}}
								/>
							</div>
						)}
						bodyClassName="text-center border border-gray-300"
						headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
					/>
				</DataTable>
				{/* Contract Details Modal */}
				<Dialog
					header="Contract Details"
					visible={isContractModalVisible}
					style={{ width: '50vw', maxWidth: '700px' }}
					modal
					onHide={() => setIsContractModalVisible(false)}
				>
					{selectedContract ? (
						<div className="space-y-2 text-gray-800">
							<p>
								<strong>Project:</strong> {selectedContract.projectName}
							</p>
							<p>
								<strong>Company:</strong> {selectedContract.companyName}
							</p>
							<p>
								<strong>Milestone:</strong> {selectedContract.milestone}
							</p>
							<p>
								<strong>Subsidy Amount:</strong> ${selectedContract.subsidyAmount}
							</p>
							<p>
								<strong>Status:</strong> {selectedContract.status}
							</p>
						</div>
					) : (
						<p>No contract selected</p>
					)}
				</Dialog>
			</div>
		</PageLayout>
	);
}
