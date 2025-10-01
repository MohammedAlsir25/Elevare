import React, { useState, useMemo } from 'react';
import { Contact, CustomerStatus, ContactType, SortConfig } from '../types.ts';
import ContactModal from './ContactModal.tsx';
import CustomerPortalPage from './CustomerPortalPage.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { ExternalLinkIcon, EditIcon, DeleteIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { usePagination } from '../hooks/usePagination.ts';
import Pagination from './Pagination.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

const statusColors: { [key in CustomerStatus]: string } = {
    [CustomerStatus.ACTIVE]: 'bg-accent-green/20 text-accent-green',
    [CustomerStatus.LEAD]: 'bg-accent-yellow/20 text-accent-yellow',
    [CustomerStatus.OPPORTUNITY]: 'bg-blue-500/20 text-blue-400',
    [CustomerStatus.INACTIVE]: 'bg-gray-500/20 text-gray-400',
};


const ContactsPage: React.FC = () => {
    const { loading, contacts, addContact, updateContact, deleteContact } = useData();
    
    const permissions = usePermissions();
    const { addNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
    const [viewingPortalFor, setViewingPortalFor] = useState<Contact | null>(null);

    const handleAddNew = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleDelete = async (contactId: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await deleteContact(contactId);
                addNotification('Contact deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete contact.', 'error');
                console.error(error);
            }
        }
    };

    const handleSave = async (contact: Omit<Contact, 'id' | 'dateAdded'> & { id?: string }) => {
        try {
            if (contact.id) {
                await updateContact(contact as Contact);
                addNotification('Contact updated.', 'success');
            } else {
                await addContact(contact);
                addNotification('Contact added.', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            addNotification('Failed to save contact.', 'error');
            console.error(error);
        }
    };
    
    const filteredContacts = useMemo(() => {
        return contacts.filter(c => {
            const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typeFilter === 'all' || c.contactType.includes(typeFilter);
            return searchMatch && typeMatch;
        });
    }, [contacts, searchTerm, typeFilter]);
    
    const { items: sortedContacts, requestSort, sortConfig } = useSortableData(filteredContacts);

    const {
        currentPageData: paginatedContacts,
        currentPage,
        totalPages,
        goToPage,
    } = usePagination(sortedContacts, 10);

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
        }
        return <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
    };

    if (loading) return <PageWithTableSkeleton />;

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customers, suppliers, and leads.</p>
                </div>
                {permissions.canEditContacts && (
                    <button onClick={handleAddNew} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                        Add Contact
                    </button>
                )}
            </header>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search by name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow md:flex-grow-0 w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                />
                 <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ContactType | 'all')}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                >
                    <option value="all">All Contact Types</option>
                    <option value={ContactType.CUSTOMER}>Customers</option>
                    <option value={ContactType.SUPPLIER}>Suppliers</option>
                    <option value={ContactType.LEAD}>Leads</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <button onClick={() => requestSort('name')} className="flex items-center group">Contact {getSortIndicator('name')}</button>
                                </th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <button onClick={() => requestSort('email')} className="flex items-center group">Contact Info {getSortIndicator('email')}</button>
                                </th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Type(s)</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <button onClick={() => requestSort('status')} className="flex items-center group">Status {getSortIndicator('status')}</button>
                                </th>
                                {permissions.canEditContacts && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContacts.map(contact => (
                                <tr key={contact.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3">
                                        <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{contact.company}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-sm text-gray-800 dark:text-gray-300">{contact.email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</div>
                                    </td>
                                     <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.contactType.map(type => (
                                                <span key={type} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[contact.status]}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    {permissions.canEditContacts && (
                                        <td className="p-3 text-center whitespace-nowrap">
                                            {contact.contactType.includes(ContactType.CUSTOMER) && (
                                                <button onClick={() => setViewingPortalFor(contact)} className="text-gray-500 dark:text-gray-400 hover:text-brand-secondary p-1" aria-label={`View portal for ${contact.name}`}>
                                                    <ExternalLinkIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(contact)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1 ml-2" aria-label={`Edit contact ${contact.name}`}>
                                                <EditIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(contact.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2" aria-label={`Delete contact ${contact.name}`}>
                                                <DeleteIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredContacts.length === 0 && (
                                <tr>
                                    <td colSpan={permissions.canEditContacts ? 5 : 4} className="text-center py-8 text-gray-500">
                                        No contacts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {filteredContacts.length > 0 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            {isModalOpen && (
                <ContactModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    contact={editingContact}
                />
            )}
            {viewingPortalFor && (
                <CustomerPortalPage
                    customer={viewingPortalFor}
                    onClose={() => setViewingPortalFor(null)}
                />
            )}
        </div>
    );
};

export default ContactsPage;
