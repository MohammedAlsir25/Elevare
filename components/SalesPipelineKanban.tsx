import React from 'react';
import { Contact, CustomerStatus } from '../types.ts';

interface SalesPipelineKanbanProps {
    contacts: Contact[];
    onUpdateContact: (contact: Contact) => void;
}

const statusColors: { [key in CustomerStatus]: { bg: string, text: string, border: string } } = {
    [CustomerStatus.LEAD]: { bg: 'bg-accent-yellow/10 dark:bg-accent-yellow/10', text: 'text-accent-yellow', border: 'border-accent-yellow' },
    [CustomerStatus.OPPORTUNITY]: { bg: 'bg-blue-500/10 dark:bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500' },
    [CustomerStatus.ACTIVE]: { bg: 'bg-accent-green/10 dark:bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green' },
    [CustomerStatus.INACTIVE]: { bg: 'bg-gray-500/10 dark:bg-gray-500/10', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-500' },
};

const SalesPipelineKanban: React.FC<SalesPipelineKanbanProps> = ({ contacts, onUpdateContact }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, contactId: string) => {
        e.dataTransfer.setData("contactId", contactId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: CustomerStatus) => {
        e.preventDefault();
        const contactId = e.dataTransfer.getData("contactId");
        const contact = contacts.find(c => c.id === contactId);
        if (contact && contact.status !== newStatus) {
            onUpdateContact({ ...contact, status: newStatus });
        }
        e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-700/50');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-gray-200', 'dark:bg-gray-700/50');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-700/50');
    };

    const pipelineStages: CustomerStatus[] = [CustomerStatus.LEAD, CustomerStatus.OPPORTUNITY, CustomerStatus.ACTIVE, CustomerStatus.INACTIVE];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {pipelineStages.map(stage => (
                <div 
                    key={stage}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors"
                    onDrop={(e) => handleDrop(e, stage)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <h3 className={`font-semibold mb-4 pb-2 border-b-2 ${statusColors[stage].border} ${statusColors[stage].text}`}>
                        {stage}
                    </h3>
                    <div className="space-y-4 min-h-[200px]">
                        {contacts.filter(c => c.status === stage).map(contact => (
                            <div
                                key={contact.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, contact.id)}
                                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing"
                            >
                                <p className="font-bold text-gray-900 dark:text-white">{contact.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{contact.company}</p>
                                <p className="text-xs text-brand-secondary mt-1">{contact.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SalesPipelineKanban;