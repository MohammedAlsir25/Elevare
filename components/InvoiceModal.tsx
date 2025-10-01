import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, InvoiceStatus, Contact, InvoiceLineItem, ContactType } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { DeleteIcon } from '../constants.tsx';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'> & { id?: string }) => void;
    invoice: Invoice | null;
    customers: Contact[];
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSave, invoice, customers }) => {
    const { isSubmitting } = useData();
    const today = new Date().toISOString().split('T')[0];
    const [customerId, setCustomerId] = useState('');
    const [issueDate, setIssueDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);
    const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT);
    const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>([
        { description: '', quantity: 1, unitPrice: 0 }
    ]);

    useEffect(() => {
        if (invoice) {
            setCustomerId(invoice.customer.id);
            setIssueDate(invoice.issueDate);
            setDueDate(invoice.dueDate);
            setStatus(invoice.status);
            setLineItems(invoice.lineItems.map(li => ({...li})));
        } else {
            // Reset for new invoice
            setCustomerId(customers.length > 0 ? customers[0].id : '');
            setIssueDate(today);
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            setDueDate(futureDate.toISOString().split('T')[0]);
            setStatus(InvoiceStatus.DRAFT);
            setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        }
    }, [invoice, isOpen, customers]);
    
    const totalAmount = useMemo(() => {
        return lineItems.reduce((total, item) => total + (item.quantity || 0) * (item.unitPrice || 0), 0);
    }, [lineItems]);

    if (!isOpen) return null;

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        const newItems = [...lineItems];
        (newItems[index] as any)[field] = value;
        newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
        setLineItems(newItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            const newItems = lineItems.filter((_, i) => i !== index);
            setLineItems(newItems);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === customerId)!;
        const finalLineItems = lineItems.map((li, index) => ({
            ...li,
            id: li.id || `li${Date.now()}-${index}`,
            total: (li.quantity || 0) * (li.unitPrice || 0)
        })) as InvoiceLineItem[];

        const invoiceData = {
            id: invoice?.id,
            customer,
            issueDate,
            dueDate,
            status,
            lineItems: finalLineItems,
            totalAmount
        };
        onSave(invoiceData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="invoice-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                <h2 id="invoice-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">{invoice ? `Edit Invoice ${invoice.invoiceNumber}` : 'Create New Invoice'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                             <select id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
                             </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as InvoiceStatus)} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                            <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200" />
                        </div>
                         <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                            <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200" />
                        </div>
                    </div>
                    {/* Line Items Section */}
                    <div className="space-y-2">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">Line Items</h3>
                         {lineItems.map((item, index) => (
                             <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
                                    <input type="text" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200" placeholder="Service or product" />
                                </div>
                                <div className="col-span-2">
                                     <label className="text-xs text-gray-500 dark:text-gray-400">Qty</label>
                                     <input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} required min="0" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200" />
                                </div>
                                <div className="col-span-2">
                                     <label className="text-xs text-gray-500 dark:text-gray-400">Unit Price</label>
                                     <input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value))} required min="0" step="0.01" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200" />
                                </div>
                                <div className="col-span-1 text-right self-end pb-1">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((item.quantity || 0) * (item.unitPrice || 0))}</span>
                                </div>
                                <div className="col-span-1 flex items-end justify-center pb-1">
                                    <button type="button" onClick={() => removeLineItem(index)} disabled={lineItems.length <= 1} className="text-gray-500 dark:text-gray-400 hover:text-accent-red disabled:text-gray-600 dark:disabled:text-gray-700 disabled:cursor-not-allowed">
                                        <DeleteIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                         ))}
                         <button type="button" onClick={addLineItem} className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">+ Add Line Item</button>
                    </div>
                    {/* Footer Section */}
                    <div className="text-right pt-4">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Total Amount: </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}</span>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-32 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                             {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Invoice'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceModal;
