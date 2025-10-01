import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice } from '../types.ts';

interface CompanySettings {
    name: string;
    address: string;
    logo: string | null;
}

// FIX: Removed redundant 'declare module' for jspdf. The 'jspdf-autotable' import handles augmentation.
export const generateInvoicePdf = (invoice: Invoice, company: CompanySettings) => {
    const doc = new jsPDF();

    // Add company logo if it exists
    if (company.logo) {
        try {
            doc.addImage(company.logo, 'PNG', 14, 12, 40, 15);
        } catch(e) {
            console.error("Error adding logo to PDF:", e);
        }
    }

    // Company Details
    doc.setFontSize(20);
    doc.text(company.name, 150, 22);
    doc.setFontSize(10);
    doc.text(company.address.replace(/,/g, '\n'), 150, 30);
    
    // Header
    doc.setFontSize(28);
    doc.text('INVOICE', 14, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 200, 42);

    // Bill To & Dates
    doc.setFontSize(11);
    doc.text('BILL TO:', 14, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.customer.name, 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer.company, 14, 65);
    doc.text(invoice.customer.email, 14, 70);

    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 55);
    doc.text(`Issue Date: ${invoice.issueDate}`, 140, 60);
    doc.text(`Due Date: ${invoice.dueDate}`, 140, 65);

    // Line Items Table
    const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
    const tableRows: any[][] = [];

    invoice.lineItems.forEach(item => {
        const itemData = [
            item.description,
            item.quantity,
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice),
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total),
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'striped',
        headStyles: { fillColor: [42, 42, 42] },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, finalY + 15);
    doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount), 170, finalY + 15);

    // Footer
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 14, doc.internal.pageSize.height - 10);

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};