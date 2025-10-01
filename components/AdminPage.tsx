import React, { useState, useMemo } from 'react';
import { AdminUser, UserRole } from '../types.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { useData } from '../contexts/DataContext.tsx';
import UserModal from './UserModal.tsx';
import { usePagination } from '../hooks/usePagination.ts';
import Pagination from './Pagination.tsx';
import { DeleteIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

const AdminPage: React.FC = () => {
    const { loading, users, addUser, updateUser, deleteUser } = useData();
    const { addNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    const { items: sortedUsers, requestSort, sortConfig } = useSortableData(filteredUsers);

    const {
        currentPageData: paginatedUsers,
        currentPage,
        totalPages,
        goToPage,
    } = usePagination(sortedUsers, 10);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            try {
                await updateUser({ ...user, role: newRole });
                addNotification(`User role updated.`, 'success');
            } catch (error) {
                addNotification('Failed to update role.', 'error');
                console.error(error);
            }
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                addNotification('User deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete user.', 'error');
                console.error(error);
            }
        }
    };

    const handleSaveUser = async (user: Omit<AdminUser, 'id' | 'lastLogin' | 'companyId'>) => {
        try {
            await addUser(user);
            addNotification('User added successfully.', 'success');
            setIsModalOpen(false);
        } catch (error) {
            addNotification('Failed to add user.', 'error');
            console.error(error);
        }
    };

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
        if (sortConfig.direction === 'ascending') return <ChevronUpIcon className="h-4 w-4 ml-1" />;
        return <ChevronDownIcon className="h-4 w-4 ml-1" />;
    };

    if (loading) return <PageWithTableSkeleton />;
    
    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and permissions for the current company.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                    Add User
                </button>
            </header>

             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('name')} className="flex items-center group">User {getSortIndicator('name')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('role')} className="flex items-center group">Role {getSortIndicator('role')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('lastLogin')} className="flex items-center group">Last Login {getSortIndicator('lastLogin')}</button></th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3">
                                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                        >
                                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{user.lastLogin}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2">
                                            <DeleteIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {filteredUsers.length > 0 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                )}
            </div>
            {isModalOpen && <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
        </div>
    );
};

export default AdminPage;
