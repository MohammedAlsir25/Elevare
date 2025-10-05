import React, { useState, useEffect } from 'react';
import { Product } from '../types.ts';
import { useModal } from '../hooks/useModal.ts';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
    product: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const modalRef = useModal(isOpen, onClose);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        price: 0,
        cost: 0,
        stock: 0,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description,
                price: product.price,
                cost: product.cost,
                stock: product.stock,
            });
        } else {
            setFormData({
                sku: '',
                name: '',
                description: '',
                price: 0,
                cost: 0,
                stock: 0,
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: product?.id, ...formData });
    };

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="product-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700">
                <h2 id="product-modal-title" className="text-2xl font-bold text-white mb-4">{product ? 'Edit' : 'Add'} Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-300">SKU (Stock Keeping Unit)</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-300">Cost</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} min="0" step="0.01" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                         <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-300">Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" step="1" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;