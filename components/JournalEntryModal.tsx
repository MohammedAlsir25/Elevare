import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry, JournalEntryLine, Account } from '../types.ts';
import { DeleteIcon } from '../constants.tsx';

interface JournalEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<JournalEntry, 'id'> & { id?: string }) => void;
    entry: JournalEntry | null;
    accounts: Account[];
}

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ isOpen, onClose, onSave, entry, accounts }) => {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [ref, setRef] = useState('');
    const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
    ]);

    useEffect(() => {
        if (entry) {
            setDate(entry.date);
            setRef(entry.ref);
            setLines(entry.lines.map(l => ({...l})));
        } else {
            setDate(today);
            setRef('');
            setLines([
                { accountId: accounts[0]?.id || '', debit: 0, credit: 0 },
                { accountId: accounts[1]?.id || '', debit: 0, credit: 0 },
            ]);
        }
    }, [entry, isOpen, accounts]);

    const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
        const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
        return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit && totalDebit > 0 };
    }, [lines]);

    if (!isOpen) return null;

    const handleLineChange = (index: number, field: keyof JournalEntryLine, value: string | number) => {
        const newLines = [...lines];
        const line = newLines[index] as any;
        line[field] = value;
        
        // Ensure only one of debit or credit has a value
        if(field === 'debit' && Number(value) > 0) line.credit = 0;
        if(field === 'credit' && Number(value) > 0) line.debit = 0;

        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, { accountId: '', debit: 0, credit: 0 }]);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            alert("Debits and credits must be balanced.");
            return;
        }
        const finalLines = lines.map((l, i) => ({
            ...l,
            id: l.id || `jel${Date.now()}-${i}`,
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
        })) as JournalEntryLine[];

        onSave({ id: entry?.id, date, ref, lines: finalLines });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl border border-gray-700 max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4 flex-shrink-0">{entry ? 'Edit' : 'Add'} Journal Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div>
                            <label htmlFor="ref" className="block text-sm font-medium text-gray-300">Reference / Description</label>
                            <input type="text" id="ref" value={ref} onChange={e => setRef(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2"/>
                        </div>
                    </div>

                    {/* Lines */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-400 px-2">
                            <div className="col-span-6">Account</div>
                            <div className="col-span-2 text-right">Debit</div>
                            <div className="col-span-2 text-right">Credit</div>
                        </div>
                        {lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                    <select value={line.accountId} onChange={e => handleLineChange(index, 'accountId', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm">
                                        <option value="">Select Account</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <input type="number" value={line.debit || ''} onChange={e => handleLineChange(index, 'debit', parseFloat(e.target.value))} min="0" step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-right"/>
                                </div>
                                <div className="col-span-2">
                                    <input type="number" value={line.credit || ''} onChange={e => handleLineChange(index, 'credit', parseFloat(e.target.value))} min="0" step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-right"/>
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                    <button type="button" onClick={() => removeLine(index)} disabled={lines.length <= 2} className="text-gray-500 hover:text-accent-red disabled:text-gray-700 disabled:cursor-not-allowed">
                                         <DeleteIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addLine} className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">+ Add Line</button>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <div className="w-64">
                            <div className="flex justify-between text-gray-300">
                                <span>Total Debit:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebit)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Total Credit:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCredit)}</span>
                            </div>
                            <div className={`flex justify-between font-bold mt-1 p-1 rounded ${isBalanced ? 'text-accent-green bg-accent-green/10' : 'text-accent-red bg-accent-red/10'}`}>
                                <span>Difference:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebit - totalCredit)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" disabled={!isBalanced} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed">
                           {isBalanced ? 'Save Entry' : 'Totals must balance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JournalEntryModal;