import React, { useState, useMemo } from 'react';
import { Product, PurchaseOrder, PurchaseOrderStatus, Contact, ContactType } from '../types.ts';
import ProductModal from './ProductModal.tsx';
import PurchaseOrderModal from './PurchaseOrderModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { usePagination } from '../hooks/usePagination.ts';
import Pagination from './Pagination.tsx';
import { EditIcon, DeleteIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

type Tab = 'products' | 'purchase-orders';

const InventoryPage: React.FC = () => {
    const { 
        loading, 
        products, 
        purchaseOrders, 
        contacts,
        addProduct, updateProduct, deleteProduct,
        addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
        receivePurchaseOrder,
    } = useData();
    const { addNotification } = useNotification();
    const permissions = usePermissions();

    const [activeTab, setActiveTab] = useState<Tab>('products');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isPOModalOpen, setPOModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

    // Product Handlers
    const handleSaveProduct = async (product: Omit<Product, 'id'> & { id?: string }) => {
        try {
            if (product.id) {
                await updateProduct(product as Product);
                addNotification('Product updated.', 'success');
            } else {
                await addProduct(product as Omit<Product, 'id'>);
                addNotification('Product added.', 'success');
            }
            setProductModalOpen(false);
        } catch (error) {
            addNotification('Failed to save product.', 'error');
            console.error(error);
        }
    };
    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteProduct(productId);
                addNotification('Product deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete product.', 'error');
                console.error(error);
            }
        }
    }
   
    // PO Handlers
    const handleSavePO = async (po: Omit<PurchaseOrder, 'id'| 'poNumber'> & { id?: string }) => {
        try {
            if (po.id) {
                await updatePurchaseOrder(po as PurchaseOrder);
                addNotification('Purchase Order updated.', 'success');
            } else {
                await addPurchaseOrder(po as Omit<PurchaseOrder, 'id' | 'poNumber'>);
                addNotification('Purchase Order created.', 'success');
            }
            setPOModalOpen(false);
        } catch (error) {
            addNotification('Failed to save purchase order.', 'error');
            console.error(error);
        }
    };
    const handleDeletePO = async (poId: string) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deletePurchaseOrder(poId);
                addNotification('Purchase Order deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete purchase order.', 'error');
                console.error(error);
            }
        }
    };
    const handleReceivePO = async (poId: string) => {
        if(window.confirm('Are you sure you want to mark this PO as received? This will update stock levels.')) {
            try {
                await receivePurchaseOrder(poId);
                addNotification('Purchase Order received and stock updated.', 'success');
            } catch (error) {
                addNotification('Failed to receive purchase order.', 'error');
                console.error(error);
            }
        }
    }
    
    const suppliers = useMemo(() => contacts.filter(c => c.contactType.includes(ContactType.SUPPLIER)), [contacts]);

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                 <button onClick={() => { setActiveTab('products'); setSearchTerm(''); }} className={`${activeTab === 'products' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Products</button>
                 <button onClick={() => { setActiveTab('purchase-orders'); setSearchTerm(''); }} className={`${activeTab === 'purchase-orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Purchase Orders</button>
            </nav>
        </div>
    );
    
    if (loading) return <PageWithTableSkeleton />;

    const ProductContent = () => {
        const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);
        const { items: sortedProducts, requestSort, sortConfig } = useSortableData(filteredProducts);
        const { currentPageData: paginatedProducts, currentPage: productCurrentPage, totalPages: productTotalPages, goToPage: productGoToPage } = usePagination(sortedProducts, 10);
        
        const getSortIndicator = (key: string) => {
            if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
            if (sortConfig.direction === 'ascending') return <ChevronUpIcon className="h-4 w-4 ml-1" />;
            return <ChevronDownIcon className="h-4 w-4 ml-1" />;
        };

        return (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('sku')} className="flex items-center group">SKU {getSortIndicator('sku')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('name')} className="flex items-center group">Product Name {getSortIndicator('name')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><button onClick={() => requestSort('price')} className="flex items-center group w-full justify-end">Price {getSortIndicator('price')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><button onClick={() => requestSort('cost')} className="flex items-center group w-full justify-end">Cost {getSortIndicator('cost')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center"><button onClick={() => requestSort('stock')} className="flex items-center group w-full justify-center">Stock {getSortIndicator('stock')}</button></th>
                                {permissions.canEditInventory && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map(product => (
                                <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-mono text-gray-500 dark:text-gray-400">{product.sku}</td>
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="p-3 text-right text-gray-800 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</td>
                                    <td className="p-3 text-right text-gray-500 dark:text-gray-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.cost)}</td>
                                    <td className="p-3 text-center font-semibold text-gray-900 dark:text-white">{product.stock}</td>
                                    {permissions.canEditInventory && (
                                        <td className="p-3 text-center">
                                            <button onClick={() => { setEditingProduct(product); setProductModalOpen(true); }} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={permissions.canEditInventory ? 6 : 5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length > 0 && (
                    <Pagination currentPage={productCurrentPage} totalPages={productTotalPages} onPageChange={productGoToPage} />
                )}
            </div>
        );
    }

    const PurchaseOrderContent = () => {
        const getSupplierName = (id: string) => contacts.find(c => c.id === id)?.name || 'Unknown';
        const filteredPOs = useMemo(() => purchaseOrders.filter(po => po.poNumber.toLowerCase().includes(searchTerm.toLowerCase())), [purchaseOrders, searchTerm]);
        const { items: sortedPOs, requestSort, sortConfig } = useSortableData(filteredPOs);
        const { currentPageData: paginatedPOs, currentPage: poCurrentPage, totalPages: poTotalPages, goToPage: poGoToPage } = usePagination(sortedPOs, 10);
        
        const statusColors: Record<PurchaseOrderStatus, string> = {
            [PurchaseOrderStatus.DRAFT]: 'bg-gray-500/20 text-gray-400',
            [PurchaseOrderStatus.ORDERED]: 'bg-accent-yellow/20 text-accent-yellow',
            [PurchaseOrderStatus.RECEIVED]: 'bg-accent-green/20 text-accent-green',
            [PurchaseOrderStatus.CANCELLED]: 'bg-accent-red/20 text-accent-red',
        };
        
        const getSortIndicator = (key: string) => {
            if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
            if (sortConfig.direction === 'ascending') return <ChevronUpIcon className="h-4 w-4 ml-1" />;
            return <ChevronDownIcon className="h-4 w-4 ml-1" />;
        };

        return (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                     <thead className="border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('poNumber')} className="flex items-center group">PO # {getSortIndicator('poNumber')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Supplier</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('orderDate')} className="flex items-center group">Order Date {getSortIndicator('orderDate')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right"><button onClick={() => requestSort('totalCost')} className="flex items-center group w-full justify-end">Total Cost {getSortIndicator('totalCost')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center"><button onClick={() => requestSort('status')} className="flex items-center group w-full justify-center">Status {getSortIndicator('status')}</button></th>
                            {permissions.canEditInventory && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPOs.map(po => (
                             <tr key={po.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 font-medium text-brand-secondary">{po.poNumber}</td>
                                <td className="p-3 text-gray-900 dark:text-white">{getSupplierName(po.supplierId)}</td>
                                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{po.orderDate}</td>
                                <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.totalCost)}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[po.status]}`}>{po.status}</span>
                                </td>
                                {permissions.canEditInventory && (
                                    <td className="p-3 text-center">
                                        {po.status === PurchaseOrderStatus.ORDERED && <button onClick={() => handleReceivePO(po.id)} className="text-accent-green hover:underline text-sm font-semibold">Receive</button>}
                                        <button onClick={() => { setEditingPO(po); setPOModalOpen(true); }} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1 ml-2"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeletePO(po.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                    </td>
                                )}
                             </tr>
                        ))}
                        {filteredPOs.length === 0 && (
                            <tr>
                                <td colSpan={permissions.canEditInventory ? 6 : 5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No purchase orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 {filteredPOs.length > 0 && (
                    <Pagination currentPage={poCurrentPage} totalPages={poTotalPages} onPageChange={poGoToPage} />
                )}
             </div>
        )
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage products and purchase orders.</p>
                </div>
                {permissions.canEditInventory && (
                    <button onClick={() => { activeTab === 'products' ? setProductModalOpen(true) : setPOModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                        {activeTab === 'products' ? 'Add Product' : 'Create Purchase Order'}
                    </button>
                )}
            </header>
            
            {renderTabs()}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                <input
                    type="text"
                    placeholder={activeTab === 'products' ? "Search by product name or SKU..." : "Search by PO number..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                />
            </div>
            
            <div className="mt-4">
                {activeTab === 'products' ? <ProductContent /> : <PurchaseOrderContent />}
            </div>

            {isProductModalOpen && <ProductModal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSave={handleSaveProduct} product={editingProduct} />}
            {isPOModalOpen && <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => setPOModalOpen(false)} onSave={handleSavePO} po={editingPO} suppliers={suppliers} products={products} />}
        </div>
    );
};

export default InventoryPage;
