import React, { useState, useMemo } from 'react';
import { Employee, TimesheetEntry, TimesheetStatus, ExpenseClaim, ExpenseClaimStatus, SortConfig, Category } from '../types.ts';
import EmployeeModal from './EmployeeModal.tsx';
import TimesheetModal from './TimesheetModal.tsx';
import ExpenseClaimModal from './ExpenseClaimModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { EditIcon, DeleteIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

// --- Reusable Sortable Header Component ---
type SortableHeaderProps = {
    children: React.ReactNode;
    sortKey: string;
    requestSort: (key: string) => void;
    sortConfig: SortConfig | null;
};

const SortableHeader: React.FC<SortableHeaderProps> = ({ children, sortKey, requestSort, sortConfig }) => {
    const getSortIndicator = () => {
        if (!sortConfig || sortConfig.key !== sortKey) {
            return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
        }
        return <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
    };

    const sortDirection = sortConfig?.key === sortKey ? sortConfig.direction : 'none';

    return (
        <button 
            onClick={() => requestSort(sortKey)} 
            className="flex items-center group w-full text-left p-0 bg-transparent border-none"
            aria-label={`Sort by ${children} in ${sortDirection === 'ascending' ? 'descending' : 'ascending'} order`}
            aria-sort={sortDirection}
        >
            {children} {getSortIndicator()}
        </button>
    )
};

// --- Employee Table Component ---
interface EmployeeContentProps {
    employees: Employee[];
    searchTerm: string;
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => void;
}
const EmployeeContent: React.FC<EmployeeContentProps> = ({ employees, searchTerm, permissions, onEdit, onDelete }) => {
    const filteredEmployees = useMemo(() => employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())), [employees, searchTerm]);
    const { items: sortedEmployees, requestSort, sortConfig } = useSortableData(filteredEmployees);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="name" requestSort={requestSort} sortConfig={sortConfig}>Employee</SortableHeader></th>
                            <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="department" requestSort={requestSort} sortConfig={sortConfig}>Department</SortableHeader></th>
                            <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="email" requestSort={requestSort} sortConfig={sortConfig}>Contact</SortableHeader></th>
                            <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="joiningDate" requestSort={requestSort} sortConfig={sortConfig}>Joining Date</SortableHeader></th>
                            <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><SortableHeader sortKey="salary" requestSort={requestSort} sortConfig={sortConfig}>Salary</SortableHeader></th>
                            {permissions.canEditHr && <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEmployees.map(employee => (
                            <tr key={employee.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{employee.employeeId} - {employee.role}</div>
                                </td>
                                <td className="p-3 text-sm text-gray-800 dark:text-gray-300">{employee.department}</td>
                                <td className="p-3">
                                    <div className="text-sm text-gray-800 dark:text-gray-300">{employee.email}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{employee.phone}</div>
                                </td>
                                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{employee.joiningDate}</td>
                                <td className="p-3 text-sm text-gray-800 dark:text-gray-300 font-semibold text-right">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(employee.salary)}
                                </td>
                                {permissions.canEditHr && (
                                    <td className="p-3 text-center">
                                        <button onClick={() => onEdit(employee)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => onDelete(employee.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

// --- Timesheet Table Component ---
interface TimesheetContentProps {
    timesheets: TimesheetEntry[];
    employees: Employee[];
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (entry: TimesheetEntry) => void;
    onDelete: (id: string) => void;
}
const TimesheetContent: React.FC<TimesheetContentProps> = ({ timesheets, employees, permissions, onEdit, onDelete }) => {
    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
    const { items: sortedTimesheets, requestSort, sortConfig } = useSortableData(timesheets);
    const statusColors: Record<TimesheetStatus, string> = {
        [TimesheetStatus.PENDING]: 'bg-accent-yellow/20 text-accent-yellow',
        [TimesheetStatus.APPROVED]: 'bg-accent-green/20 text-accent-green',
    };
    return (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="employeeId" requestSort={requestSort} sortConfig={sortConfig}>Employee</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="date" requestSort={requestSort} sortConfig={sortConfig}>Date</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="description" requestSort={requestSort} sortConfig={sortConfig}>Task</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><SortableHeader sortKey="hours" requestSort={requestSort} sortConfig={sortConfig}>Hours</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center"><SortableHeader sortKey="status" requestSort={requestSort} sortConfig={sortConfig}>Status</SortableHeader></th>
                        {permissions.canEditHr && <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedTimesheets.map(ts => (
                        <tr key={ts.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3 font-medium text-gray-900 dark:text-white">{getEmployeeName(ts.employeeId)}</td>
                            <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{ts.date}</td>
                             <td className="p-3 text-sm text-gray-800 dark:text-gray-300">{ts.description}</td>
                            <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">{ts.hours.toFixed(2)}</td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ts.status]}`}>{ts.status}</span>
                            </td>
                            {permissions.canEditHr && (
                                <td className="p-3 text-center">
                                     <button onClick={() => onEdit(ts)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                     <button onClick={() => onDelete(ts.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

// --- Expense Claim Table Component ---
interface ExpenseClaimContentProps {
    expenseClaims: ExpenseClaim[];
    employees: Employee[];
    categories: Category[];
    permissions: ReturnType<typeof usePermissions>;
    onApprove: (id: string) => void;
    onReject: (claim: ExpenseClaim) => void;
}
const ExpenseClaimContent: React.FC<ExpenseClaimContentProps> = ({ expenseClaims, employees, categories, permissions, onApprove, onReject }) => {
     const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
     const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
     const { items: sortedClaims, requestSort, sortConfig } = useSortableData(expenseClaims);
     const statusColors: Record<ExpenseClaimStatus, string> = {
        [ExpenseClaimStatus.PENDING]: 'bg-accent-yellow/20 text-accent-yellow',
        [ExpenseClaimStatus.APPROVED]: 'bg-accent-green/20 text-accent-green',
        [ExpenseClaimStatus.REJECTED]: 'bg-accent-red/20 text-accent-red',
    };
     return (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="employeeId" requestSort={requestSort} sortConfig={sortConfig}>Employee</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="date" requestSort={requestSort} sortConfig={sortConfig}>Date</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="description" requestSort={requestSort} sortConfig={sortConfig}>Description</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><SortableHeader sortKey="categoryId" requestSort={requestSort} sortConfig={sortConfig}>Category</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><SortableHeader sortKey="amount" requestSort={requestSort} sortConfig={sortConfig}>Amount</SortableHeader></th>
                        <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center"><SortableHeader sortKey="status" requestSort={requestSort} sortConfig={sortConfig}>Status</SortableHeader></th>
                        {permissions.canApproveClaims && <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedClaims.map(claim => (
                        <tr key={claim.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3 font-medium text-gray-900 dark:text-white">{getEmployeeName(claim.employeeId)}</td>
                            <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{claim.date}</td>
                            <td className="p-3 text-sm text-gray-800 dark:text-gray-300">{claim.description}</td>
                            <td className="p-3 text-sm text-gray-800 dark:text-gray-300">{getCategoryName(claim.categoryId)}</td>
                            <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(claim.amount)}</td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[claim.status]}`}>{claim.status}</span>
                            </td>
                            {permissions.canApproveClaims && (
                                <td className="p-3 text-center">
                                    {claim.status === ExpenseClaimStatus.PENDING && (
                                        <>
                                            <button onClick={() => onApprove(claim.id)} className="text-accent-green hover:underline text-sm font-semibold">Approve</button>
                                            <button onClick={() => onReject(claim)} className="text-accent-red hover:underline text-sm font-semibold ml-4">Reject</button>
                                        </>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};


// --- Main Page Component ---
type Tab = 'employees' | 'timesheets' | 'claims';

const HrPage: React.FC = () => {
    const { 
        loading, 
        employees, 
        timesheets, 
        expenseClaims, 
        categories,
        addEmployee, updateEmployee, deleteEmployee,
        addTimesheet, updateTimesheet, deleteTimesheet,
        addExpenseClaim, updateExpenseClaim, approveExpenseClaim,
    } = useData();
    const { addNotification } = useNotification();
    const permissions = usePermissions();
    
    const [activeTab, setActiveTab] = useState<Tab>('employees');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isTimesheetModalOpen, setTimesheetModalOpen] = useState(false);
    const [editingTimesheet, setEditingTimesheet] = useState<TimesheetEntry | null>(null);
    const [isClaimModalOpen, setClaimModalOpen] = useState(false);
    const [editingClaim, setEditingClaim] = useState<ExpenseClaim | null>(null);

    // Employee Handlers
    const handleSaveEmployee = async (employee: Omit<Employee, 'id' | 'employeeId'> & { id?: string }) => {
        try {
            if (employee.id) {
                await updateEmployee(employee as Employee);
                addNotification('Employee updated.', 'success');
            } else {
                await addEmployee(employee);
                addNotification('Employee added.', 'success');
            }
            setEmployeeModalOpen(false);
        } catch (error) {
            addNotification('Failed to save employee.', 'error');
            console.error(error);
        }
    };
    const handleDeleteEmployee = async (employeeId: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteEmployee(employeeId);
                addNotification('Employee deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete employee.', 'error');
                console.error(error);
            }
        }
    };

    // Timesheet Handlers
     const handleSaveTimesheet = async (entry: Omit<TimesheetEntry, 'id'> & { id?: string }) => {
        try {
            if (entry.id) {
                await updateTimesheet(entry as TimesheetEntry);
                addNotification('Timesheet updated.', 'success');
            } else {
                await addTimesheet(entry as Omit<TimesheetEntry, 'id'>);
                addNotification('Timesheet added.', 'success');
            }
            setTimesheetModalOpen(false);
        } catch (error) {
            addNotification('Failed to save timesheet.', 'error');
            console.error(error);
        }
    };
     const handleDeleteTimesheet = async (tsId: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteTimesheet(tsId);
                addNotification('Timesheet deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete timesheet.', 'error');
                console.error(error);
            }
        }
    };

    // Expense Claim Handlers
     const handleSaveClaim = async (claim: Omit<ExpenseClaim, 'id'> & { id?: string }) => {
        try {
            if (claim.id) {
                await updateExpenseClaim(claim as ExpenseClaim);
                addNotification('Claim updated.', 'success');
            } else {
                await addExpenseClaim(claim as Omit<ExpenseClaim, 'id'>);
                addNotification('Claim submitted.', 'success');
            }
            setClaimModalOpen(false);
        } catch (error) {
            addNotification('Failed to save claim.', 'error');
            console.error(error);
        }
    };

    const handleApproveClaim = async (claimId: string) => {
        if(window.confirm('Are you sure you want to approve this claim? This will create a transaction.')) {
            try {
                await approveExpenseClaim(claimId);
                addNotification('Claim approved and transaction created.', 'success');
            } catch (error) {
                addNotification('Failed to approve claim.', 'error');
                console.error(error);
            }
        }
    };

    const handleRejectClaim = async (claim: ExpenseClaim) => {
        if(window.confirm('Are you sure you want to reject this claim?')) {
            try {
                await updateExpenseClaim({ ...claim, status: ExpenseClaimStatus.REJECTED });
                addNotification('Claim rejected.', 'success');
            } catch (error) {
                addNotification('Failed to reject claim.', 'error');
                console.error(error);
            }
        }
    };
    
    // Render logic
    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {(['employees', 'timesheets', 'claims'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                        className={`${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    if (loading) return <PageWithTableSkeleton />;

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Human Resources</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage employees, timesheets, and expense claims.</p>
                </div>
                 {permissions.canEditHr && (
                     <button 
                        onClick={() => {
                            if (activeTab === 'employees') { setEditingEmployee(null); setEmployeeModalOpen(true); }
                            if (activeTab === 'timesheets') { setEditingTimesheet(null); setTimesheetModalOpen(true); }
                            if (activeTab === 'claims') { setEditingClaim(null); setClaimModalOpen(true); }
                        }} 
                        className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg"
                    >
                        {activeTab === 'employees' ? 'Add Employee' : activeTab === 'timesheets' ? 'Add Timesheet' : 'Submit Claim'}
                    </button>
                 )}
            </header>

            {renderTabs()}
            
            {activeTab === 'employees' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                    />
                </div>
            )}
            
            <div className="mt-4">
                {activeTab === 'employees' && 
                    <EmployeeContent 
                        employees={employees}
                        searchTerm={searchTerm}
                        permissions={permissions}
                        onEdit={(emp) => { setEditingEmployee(emp); setEmployeeModalOpen(true); }}
                        onDelete={handleDeleteEmployee}
                    />}
                {activeTab === 'timesheets' && 
                    <TimesheetContent 
                        timesheets={timesheets}
                        employees={employees}
                        permissions={permissions}
                        onEdit={(ts) => { setEditingTimesheet(ts); setTimesheetModalOpen(true); }}
                        onDelete={handleDeleteTimesheet}
                    />}
                {activeTab === 'claims' && 
                    <ExpenseClaimContent 
                        expenseClaims={expenseClaims}
                        employees={employees}
                        categories={categories}
                        permissions={permissions}
                        onApprove={handleApproveClaim}
                        onReject={handleRejectClaim}
                    />}
            </div>
            
            {isEmployeeModalOpen && <EmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setEmployeeModalOpen(false)} onSave={handleSaveEmployee} employee={editingEmployee} />}
            {isTimesheetModalOpen && <TimesheetModal isOpen={isTimesheetModalOpen} onClose={() => setTimesheetModalOpen(false)} onSave={handleSaveTimesheet} entry={editingTimesheet} employees={employees} />}
            {isClaimModalOpen && <ExpenseClaimModal isOpen={isClaimModalOpen} onClose={() => setClaimModalOpen(false)} onSave={handleSaveClaim} claim={editingClaim} employees={employees} />}
        </div>
    );
};

export default HrPage;