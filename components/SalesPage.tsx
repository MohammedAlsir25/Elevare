import React, { useState, useMemo } from 'react';
import { EyeIcon, EditIcon, DeleteIcon, DocumentDownloadIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { Invoice, InvoiceStatus, Contact, ContactType, SortConfig } from '../types.ts';
import InvoiceModal from './InvoiceModal.tsx';
import InvoicePrintView from './InvoicePrintView.tsx';
import SalesPipelineKanban from './SalesPipelineKanban.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { generateInvoicePdf } from '../services/pdfService.ts';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { usePagination } from '../hooks/usePagination.ts';
import Pagination from './Pagination.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

const statusColors: { [key in InvoiceStatus]: string } = {
    [InvoiceStatus.PAID]: 'bg-accent-green/20 text-accent-green',
    [InvoiceStatus.SENT]: 'bg-blue-500/20 text-blue-400',
    [InvoiceStatus.DRAFT]: 'bg-gray-500/20 text-gray-400',
    [InvoiceStatus.OVERDUE]: 'bg-accent-red/20 text-accent-red',
};

type Tab = 'invoices' | 'pipeline';

const SalesPage: React.FC = () => {
    const { loading, invoices, contacts, addInvoice, updateInvoice, deleteInvoice, updateContact } = useData();
    const { addNotification } = useNotification();
    const permissions = usePermissions();
    const { settings } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('invoices');

    const handleAddNew = () => {
        setEditingInvoice(null);
        setIsModalOpen(true);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleDelete = async (invoiceId: string) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice(invoiceId);
                addNotification('Invoice deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete invoice.', 'error');
                console.error(error);
            }
        }
    };

    const handleSave = async (invoice: Omit<Invoice, 'id' | 'invoiceNumber'> & { id?: string }) => {
        try {
            if (invoice.id) {
                await updateInvoice(invoice as Invoice);
                addNotification('Invoice updated.', 'success');
            } else {
                await addInvoice(invoice);
                addNotification('Invoice created.', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            addNotification('Failed to save invoice.', 'error');
            console.error(error);
        }
    };

    const handleUpdateContact = async (contact: Contact) => {
        try {
            await updateContact(contact);
            addNotification(`${contact.name}'s status updated.`, 'success');
        } catch (error) {
            addNotification('Failed to update contact status.', 'error');
            console.error(error);
        }
    };
    
    const customers = useMemo(() => contacts.filter(c => c.contactType.includes(ContactType.CUSTOMER)), [contacts]);
    
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => 
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);
    
    const { items: sortedInvoices, requestSort, sortConfig } = useSortableData(filteredInvoices);

    const {
        currentPageData: paginatedInvoices,
        currentPage,
        totalPages,
        goToPage,
    } = usePagination(sortedInvoices, 10);
    
    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
        }
        return <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
    };

    if (loading) return <PageWithTableSkeleton />;

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`${activeTab === 'invoices' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Invoices
                </button>
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`${activeTab === 'pipeline' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Sales Pipeline
                </button>
            </nav>
        </div>
    );
    
    const renderInvoicesContent = () => (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search by invoice # or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('invoiceNumber')} className="flex items-center group">Invoice #{getSortIndicator('invoiceNumber')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('customer.name')} className="flex items-center group">Customer{getSortIndicator('customer.name')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('issueDate')} className="flex items-center group">Issue Date{getSortIndicator('issueDate')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('dueDate')} className="flex items-center group">Due Date{getSortIndicator('dueDate')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><button onClick={() => requestSort('totalAmount')} className="flex items-center group w-full justify-end">Amount{getSortIndicator('totalAmount')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('status')} className="flex items-center group">Status{getSortIndicator('status')}</button></th>
                                <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInvoices.map(invoice => (
                                <tr key={invoice.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-medium text-brand-secondary">{invoice.invoiceNumber}</td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-900 dark:text-white">{invoice.customer.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer.company}</div>
                                    </td>
                                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{invoice.issueDate}</td>
                                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{invoice.dueDate}</td>
                                    <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount)}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center whitespace-nowrap">
                                        <button onClick={() => setViewingInvoice(invoice)} className="text-gray-500 dark:text-gray-400 hover:text-brand-secondary p-1" aria-label={`View invoice ${invoice.invoiceNumber}`}>
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={() => generateInvoicePdf(invoice, settings.company)}
                                            disabled={invoice.status === InvoiceStatus.DRAFT}
                                            className="text-gray-500 dark:text-gray-400 hover:text-brand-secondary p-1 ml-2 disabled:text-gray-600/50 dark:disabled:text-gray-600 disabled:cursor-not-allowed" 
                                            aria-label={`Download PDF for invoice ${invoice.invoiceNumber}`}>
                                            <DocumentDownloadIcon className="h-5 w-5" />
                                        </button>
                                        {permissions.canEditInvoices && (
                                            <>
                                                <button onClick={() => handleEdit(invoice)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1 ml-2" aria-label={`Edit invoice ${invoice.invoiceNumber}`}>
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(invoice.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2" aria-label={`Delete invoice ${invoice.invoiceNumber}`}>
                                                    <DeleteIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                             {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {filteredInvoices.length > 0 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                )}
            </div>
        </>
    );
    
    const renderPipelineContent = () => (
        <>
            <div className="sr-only">
              <h2>Sales Pipeline</h2>
              <p>This is a Kanban board. Use Tab to navigate between customer cards. Press Space or Enter to pick up a card. Use the left and right arrow keys to move the card to a different column, and press Enter to drop it. Press Escape to cancel the move.</p>
            </div>
            <SalesPipelineKanban contacts={contacts} onUpdateContact={handleUpdateContact} />
        </>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sales</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your pipeline, quotes, orders, and invoices.</p>
                </div>
                {activeTab === 'invoices' && permissions.canEditInvoices && (
                  <button onClick={handleAddNew} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                      Create Invoice
                  </button>
                )}
            </header>

            {renderTabs()}

            <div className="mt-4">
              {activeTab === 'invoices' ? renderInvoicesContent() : renderPipelineContent()}
            </div>
            
            {isModalOpen && (
                <InvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    invoice={editingInvoice}
                    customers={customers}
                />
            )} 

            {viewingInvoice && (
                <InvoicePrintView
                    invoice={viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                />
            )}
            
        </div>
    );
};

export default SalesPage;