import React, { useState, useEffect } from 'react';
import { Contact, Invoice, InvoiceStatus } from '../types.ts';
import * as api from '../services/api.ts';
import { useModal } from '../hooks/useModal.ts';
import { useLocalizedDate } from '../hooks/useLocalizedDate.ts';

interface CustomerPortalPageProps {
    customer: Contact;
    onClose: () => void;
}

const statusColors: { [key in InvoiceStatus]: string } = {
    [InvoiceStatus.PAID]: 'bg-accent-green/20 text-accent-green',
    [InvoiceStatus.SENT]: 'bg-blue-500/20 text-blue-400',
    [InvoiceStatus.DRAFT]: 'bg-gray-500/20 text-gray-400',
    [InvoiceStatus.OVERDUE]: 'bg-accent-red/20 text-accent-red',
};


const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ customer, onClose }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useModal(true, onClose);
    const formatDate = useLocalizedDate();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const data = await api.getInvoicesForCustomer(customer.id);
                setInvoices(data);
            } catch (err) {
                setError("Could not load invoices for this customer.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [customer.id]);

    return (
        <div ref={modalRef} className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col" aria-modal="true" role="dialog" aria-labelledby="portal-title">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div>
                    <h1 id="portal-title" className="text-2xl font-bold text-gray-900 dark:text-white">Customer Portal</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {customer.name}</p>
                </div>
                <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">
                    Logout
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Invoices</h2>
                
                {loading && <p>Loading invoices...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Invoice #</th>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Issue Date</th>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Due Date</th>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Amount</th>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Status</th>
                                        <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(invoice => (
                                        <tr key={invoice.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                                            <td className="p-3 font-medium text-brand-secondary">{invoice.invoiceNumber}</td>
                                            <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.issueDate)}</td>
                                            <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.dueDate)}</td>
                                            <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE ? (
                                                    <button className="bg-brand-primary text-white px-3 py-1 text-sm rounded-md hover:bg-brand-primary/90">
                                                        Pay Now
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                )}
            </main>
        </div>
    );
};

export default CustomerPortalPage;