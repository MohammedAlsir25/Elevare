import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { DashboardLayout } from '../types.ts';
import { useModal } from '../hooks/useModal.ts';

interface CustomizeDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateDashboardLayout } = useSettings();
    const modalRef = useModal(isOpen, onClose);
    const [localLayout, setLocalLayout] = useState<DashboardLayout>(settings.dashboardLayout);

    if (!isOpen) return null;
    
    const handleToggle = (widget: keyof DashboardLayout) => {
        setLocalLayout(prev => ({...prev, [widget]: !prev[widget]}));
    };
    
    const handleSave = () => {
        updateDashboardLayout(localLayout);
        onClose();
    };
    
    const widgetNames: { key: keyof DashboardLayout; name: string }[] = [
        { key: 'netWorth', name: 'Net Worth Card' },
        { key: 'income', name: 'Income Card' },
        { key: 'expenses', name: 'Expenses Card' },
        { key: 'transactions', name: 'Transactions Table' },
        { key: 'categoryChart', name: 'Expense Breakdown Chart' },
        { key: 'aiAssistant', name: 'AI Assistant' },
    ];

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="custom-dashboard-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h2 id="custom-dashboard-title" className="text-2xl font-bold text-white mb-4">Customize Dashboard</h2>
                <p className="text-gray-400 mb-6">Select the widgets you want to see on your dashboard.</p>
                
                <div className="space-y-4">
                    {widgetNames.map(({ key, name }) => (
                        <label key={key} htmlFor={key} className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer">
                            <span className="text-gray-200 font-medium">{name}</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id={key}
                                    checked={localLayout[key]} 
                                    onChange={() => handleToggle(key)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold">Save Layout</button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeDashboardModal;