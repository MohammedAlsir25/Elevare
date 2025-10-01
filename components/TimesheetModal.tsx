import React, { useState, useEffect } from 'react';
import { TimesheetEntry, TimesheetStatus, Employee } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';

interface TimesheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<TimesheetEntry, 'id'> & { id?: string }) => void;
    entry: TimesheetEntry | null;
    employees: Employee[];
}

const TimesheetModal: React.FC<TimesheetModalProps> = ({ isOpen, onClose, onSave, entry, employees }) => {
    const { isSubmitting } = useData();
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        employeeId: '',
        date: today,
        hours: 8,
        description: '',
        status: TimesheetStatus.PENDING,
    });

    useEffect(() => {
        if (entry) {
            setFormData(entry);
        } else {
            setFormData({
                employeeId: employees[0]?.id || '',
                date: today,
                hours: 8,
                description: '',
                status: TimesheetStatus.PENDING,
            });
        }
    }, [entry, isOpen, employees]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: entry?.id, hours: Number(formData.hours) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{entry ? 'Edit' : 'Add'} Timesheet Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                        <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200">
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours Worked</label>
                            <input type="number" name="hours" value={formData.hours} onChange={handleChange} required min="0" step="0.25" className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description / Task</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-28 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// FIX: Add default export to make the component importable.
export default TimesheetModal;
