import React from 'react';
import { Invoice } from '../types.ts';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { useModal } from '../hooks/useModal.ts';
import { useLocalizedDate } from '../hooks/useLocalizedDate.ts';

interface InvoicePrintViewProps {
    invoice: Invoice;
    onClose: () => void;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, onClose }) => {
    const { settings } = useSettings();
    const modalRef = useModal(true, onClose); // Hook is active as long as component is mounted
    const companySettings = settings.company;
    const formatDate = useLocalizedDate();

    const handlePrint = () => {
        const printContent = document.getElementById('printable-invoice');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printHtml = printContent.innerHTML;
            
            // Temporarily replace body content with invoice for printing
            document.body.innerHTML = `
                <html>
                    <head>
                        <title>Invoice ${invoice.invoiceNumber}</title>
                         <script src="https://cdn.tailwindcss.com"></script>
                         <style>
                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                                .no-print { display: none !important; }
                            }
                         </style>
                    </head>
                    <body class="bg-white text-black">${printHtml}</body>
                </html>
            `;
            
            window.print();
            
            // Restore original content
            document.body.innerHTML = originalContents;
            // Re-attach event listeners if necessary, though for this app structure it might not be needed.
            // A full SPA would require re-hydrating the React app. For this modal, closing it is sufficient.
            onClose(); 
        }
    };


    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
                <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                     <h2 className="text-xl font-bold text-white">Invoice Preview</h2>
                     <div>
                        <button onClick={handlePrint} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold mr-2">
                            Print
                        </button>
                        <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold">
                            Close
                        </button>
                     </div>
                </div>

                <div id="printable-invoice" className="p-8 overflow-y-auto bg-white text-gray-900 flex-grow">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 border-b">
                        <div>
                            {companySettings.logo && <img src={companySettings.logo} alt="Company Logo" className="h-16 max-w-xs mb-4 object-contain"/>}
                            <h1 className="text-2xl font-bold">{companySettings.name}</h1>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{companySettings.address}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold uppercase text-gray-700">Invoice</h2>
                            <p className="text-sm"># {invoice.invoiceNumber}</p>
                        </div>
                    </div>

                    {/* Bill To & Dates */}
                    <div className="flex justify-between mt-8">
                        <div>
                            <p className="font-bold text-gray-600">BILL TO</p>
                            <p className="font-bold text-lg">{invoice.customer.name}</p>
                            <p>{invoice.customer.company}</p>
                            <p>{invoice.customer.email}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="font-bold text-gray-600">Issue Date: </span>
                                <span>{formatDate(invoice.issueDate)}</span>
                            </div>
                            <div>
                                <span className="font-bold text-gray-600">Due Date: </span>
                                <span>{formatDate(invoice.dueDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mt-8">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-sm font-semibold">Description</th>
                                    <th className="p-3 text-sm font-semibold text-center">Quantity</th>
                                    <th className="p-3 text-sm font-semibold text-right">Unit Price</th>
                                    <th className="p-3 text-sm font-semibold text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}</td>
                                        <td className="p-3 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-xs">
                           <div className="flex justify-between py-2 border-b">
                                <span className="font-semibold text-gray-600">Subtotal</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount)}</span>
                           </div>
                           <div className="flex justify-between py-2 bg-gray-100 px-2 rounded-b-lg">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount)}</span>
                           </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoicePrintView;