// ContractsTable.jsx
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { FilterMatchMode } from 'primereact/api';

const CONTRACT_STATUS = ['Pending', 'Active', 'Completed'];

function ActiveContractsTable() {
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    contractName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    producerName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    totalAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
    milestoneDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
    milestoneAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
    deployedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getContracts();
  }, []);

  const getContracts = async () => {
    try {
      const res = await fetchGet({ pathName: 'contracts' });
      const data = res.data || [];
      const parsed = data.map((contract, index) => ({
        ...contract,
        serialNo: data.length - index,
        deployedAt: contract.deployedAt ? new Date(contract.deployedAt) : null,
        milestoneDescription: contract.milestones[0]?.description || '-',
        milestoneAmount: contract.milestones[0]?.amount || 0,
      })).reverse();
      setContracts(parsed);
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load contracts',
      });
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({
      ...prev,
      contractName: { value, matchMode: FilterMatchMode.CONTAINS },
      producerName: { value, matchMode: FilterMatchMode.CONTAINS },
      milestoneDescription: { value, matchMode: FilterMatchMode.CONTAINS },
    }));
  };

  const dateFilterTemplate = (options) => (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      dateFormat="dd/mm/yy"
      placeholder="Select Date"
      className="p-column-filter"
      showButtonBar
    />
  );

  const clearFilters = () => {
    setFilters({
      contractName: { value: null, matchMode: FilterMatchMode.CONTAINS },
      producerName: { value: null, matchMode: FilterMatchMode.CONTAINS },
      status: { value: null, matchMode: FilterMatchMode.EQUALS },
      totalAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
      milestoneDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
      milestoneAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
      deployedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
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

  return (
    <PageLayout>
      <Toast ref={toast} />
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-primary">Contracts</h2>
          <div className="flex gap-2">
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search contracts"
              className="w-60"
            />
            <Button
              icon="pi pi-filter-slash"
              rounded
              outlined
              onClick={clearFilters}
              className="text-primary border-primary"
              tooltip="Clear filter"
              tooltipOptions={{ position: 'bottom' }}
            />
          </div>
        </div>

        <DataTable
          value={contracts}
          dataKey="_id"
          loading={loading}
          filters={filters}
          filterDisplay="menu"
          onFilter={(e) => setFilters(e.filters)}
          globalFilterFields={['contractName', 'producerName', 'milestoneDescription']}
          emptyMessage="No contracts found."
          tableStyle={{ borderCollapse: 'collapse' }}
          className="p-datatable-sm min-w-[900px] [&_.p-column-filter-menu-button]:text-white"
          stripedRows
          removableSort
          paginator
          paginatorClassName="bg-gray-50 border-gray-50"
          sortIcon={customSortIcon}
          rows={25}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column
            field="serialNo"
            header="Sr. No."
            sortable
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="contractName"
            header="Contract Name"
            sortable
            filter
            filterPlaceholder="Search Contract"
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="producerName"
            header="Producer"
            sortable
            filter
            filterPlaceholder="Search Producer"
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="status"
            header="Status"
            sortable
            filter
            filterElement={
              <Dropdown
                options={CONTRACT_STATUS}
                placeholder="Select Status"
                className="p-column-filter"
              />
            }
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="totalAmount"
            header="Total Subsidy (₹)"
            sortable
            filter
            filterPlaceholder="Enter Amount"
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="milestoneDescription"
            header="Milestone Description"
            sortable
            filter
            filterPlaceholder="Search Milestone"
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="milestoneAmount"
            header="Milestone Amount (₹)"
            sortable
            filter
            filterPlaceholder="Enter Amount"
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            field="deployedAt"
            header="Deployed Date"
            sortable
            filter
            dataType="date"
            filterElement={dateFilterTemplate}
            body={(row) => row.deployedAt ? row.deployedAt.toLocaleDateString('en-GB') : '-'}
            bodyClassName="text-text border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
          <Column
            header="Actions"
            body={(row) => (
              <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-primary"
                onClick={() => navigate(`/contracts/${row._id}`)}
                tooltip="View Details"
                tooltipOptions={{ position: 'top' }}
              />
            )}
            bodyClassName="text-center border px-3 py-2"
            headerClassName="bg-primary-border text-white font-semibold border"
          />
        </DataTable>
      </div>
    </PageLayout>
  );
}

export default ActiveContractsTable;
