import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface StatementImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
}

const StatementImportModal: React.FC<StatementImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setParsedTransactions([]);
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                parseCsv(selectedFile);
            } else {
                setError('Please upload a valid CSV file.');
            }
        }
    };

    const parseCsv = (csvFile: File) => {
        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const rows = text.split('\n').slice(1); // Assuming header row
                const transactions: ParsedTransaction[] = rows
                    .map(row => row.split(','))
                    .filter(parts => parts.length >= 3)
                    .map(parts => ({
                        date: parts[0].trim(),
                        description: parts[1].trim(),
                        amount: parseFloat(parts[2].trim()),
                    }));
                setParsedTransactions(transactions);
            } catch (err) {
                setError('Failed to parse CSV file. Please check the format.');
                console.error(err);
            } finally {
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsParsing(false);
        };
        reader.readAsText(csvFile);
    };

    const handleImport = async () => {
        if (parsedTransactions.length === 0) {
            addNotification('No transactions to import.', 'error');
            return;
        }
        // In a real app, you would send this to the backend to be processed and added.
        console.log('Importing transactions:', parsedTransactions);
        addNotification(`${parsedTransactions.length} transactions imported successfully.`, 'success');
        onImportSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Import Bank Statement</h2>
                <div className="space-y-4 flex-grow overflow-y-auto">
                    <div>
                        <label htmlFor="statement-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload CSV File
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            The CSV should have columns in this order: Date, Description, Amount.
                        </p>
                        <input
                            type="file"
                            id="statement-file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-800 dark:file:text-gray-300 hover:file:bg-gray-300 dark:hover:file:bg-gray-600"
                        />
                         {error && <p className="text-accent-red text-sm mt-2">{error}</p>}
                    </div>

                    {isParsing && <p className="text-gray-500 dark:text-gray-400">Parsing file...</p>}
                    
                    {parsedTransactions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transaction Preview</h3>
                            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                        <tr>
                                            <th className="p-2 font-semibold">Date</th>
                                            <th className="p-2 font-semibold">Description</th>
                                            <th className="p-2 font-semibold text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedTransactions.map((tx, index) => (
                                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                                                <td className="p-2 whitespace-nowrap">{tx.date}</td>
                                                <td className="p-2">{tx.description}</td>
                                                <td className={`p-2 text-right font-semibold whitespace-nowrap ${tx.amount >= 0 ? 'text-accent-green' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                    <button 
                        type="button" 
                        onClick={handleImport} 
                        disabled={parsedTransactions.length === 0 || isParsing}
                        className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Import {parsedTransactions.length > 0 ? `${parsedTransactions.length} Transactions` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatementImportModal;