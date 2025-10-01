import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderLineItem, Contact, Product } from '../types.ts';

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (po: Omit<PurchaseOrder, 'id' | 'poNumber'> & { id?: string }) => void;
    po: PurchaseOrder | null;
    suppliers: Contact[];
    products: Product[];
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave, po, suppliers, products }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({
        supplierId: '',
        orderDate: today,
        expectedDate: today,
        status: PurchaseOrderStatus.DRAFT,
    });
    const [lineItems, setLineItems] = useState<Partial<PurchaseOrderLineItem>[]>([
        { productId: '', quantity: 1, unitCost: 0 }
    ]);
    
    useEffect(() => {
        if (po) {
            setFormData({
                supplierId: po.supplierId,
                orderDate: po.orderDate,
                expectedDate: po.expectedDate,
                status: po.status,
            });
            setLineItems(po.lineItems.map(li => ({ ...li })));
        } else {
            setFormData({
                supplierId: suppliers[0]?.id || '',
                orderDate: today,
                expectedDate: today,
                status: PurchaseOrderStatus.DRAFT,
            });
            setLineItems([{ productId: products[0]?.id || '', quantity: 1, unitCost: products[0]?.cost || 0 }]);
        }
    }, [po, isOpen, suppliers, products]);

    const totalCost = useMemo(() => {
        return lineItems.reduce((total, item) => total + (item.quantity || 0) * (item.unitCost || 0), 0);
    }, [lineItems]);

    if (!isOpen) return null;

    const handleLineItemChange = (index: number, field: keyof PurchaseOrderLineItem, value: string | number) => {
        const newItems = [...lineItems];
        (newItems[index] as any)[field] = value;
        // Auto-fill cost if product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) newItems[index].unitCost = product.cost;
        }
        setLineItems(newItems);
    };

    const addLineItem = () => setLineItems([...lineItems, { productId: '', quantity: 1, unitCost: 0 }]);
    const removeLineItem = (index: number) => lineItems.length > 1 && setLineItems(lineItems.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalLineItems = lineItems.map((li, index) => ({
            ...li,
            id: li.id || `poli${Date.now()}-${index}`,
        })) as PurchaseOrderLineItem[];

        onSave({ 
            id: po?.id,
            supplierId: formData.supplierId,
            orderDate: formData.orderDate,
            expectedDate: formData.expectedDate,
            status: formData.status,
            lineItems: finalLineItems, 
            totalCost
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">{po ? `Edit PO ${po.poNumber}` : 'Create Purchase Order'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                            <select name="supplierId" value={formData.supplierId} onChange={e => setFormData(p => ({...p, supplierId: e.target.value}))} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600">
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select name="status" value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as PurchaseOrderStatus}))} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600">
                                {Object.values(PurchaseOrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Date</label>
                            <input type="date" name="orderDate" value={formData.orderDate} onChange={e => setFormData(p => ({...p, orderDate: e.target.value}))} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Delivery</label>
                            <input type="date" name="expectedDate" value={formData.expectedDate} onChange={e => setFormData(p => ({...p, expectedDate: e.target.value}))} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">Products</h3>
                        {lineItems.map((item, index) => (
                             <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                    <select value={item.productId} onChange={e => handleLineItemChange(index, 'productId', e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600">
                                        <option value="">Select a product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2"><input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} required min="1" className="w-full bg-gray-50 dark:bg-gray-700 p-2 text-sm text-right rounded-md border border-gray-300 dark:border-gray-600" /></div>
                                <div className="col-span-2"><input type="number" value={item.unitCost} onChange={e => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value))} required min="0" step="0.01" className="w-full bg-gray-50 dark:bg-gray-700 p-2 text-sm text-right rounded-md border border-gray-300 dark:border-gray-600" /></div>
                                <div className="col-span-1 text-right self-center"><span className="text-sm text-gray-800 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((item.quantity || 0) * (item.unitCost || 0))}</span></div>
                                <div className="col-span-1 flex items-center justify-center"><button type="button" onClick={() => removeLineItem(index)} disabled={lineItems.length <= 1} className="text-gray-500 dark:text-gray-400 hover:text-accent-red disabled:text-gray-600 dark:disabled:text-gray-700 disabled:cursor-not-allowed">&times;</button></div>
                             </div>
                        ))}
                        <button type="button" onClick={addLineItem} className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">+ Add Product</button>
                    </div>

                    <div className="text-right pt-4">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Total Cost: </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost)}</span>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold">Save Purchase Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;