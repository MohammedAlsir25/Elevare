import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../types.ts';

export const usePermissions = () => {
    const { user } = useAuth();

    if (!user) {
        // Default permissions for a non-logged-in user (shouldn't happen in AuthenticatedApp)
        return {
            canViewDashboard: false,
            canViewAnalytics: false,
            canViewTransactions: false,
            canEditTransactions: false,
            canViewWallets: false,
            canEditWallets: false,
            canViewBudgets: false,
            canEditBudgets: false,
            canViewContacts: false,
            canEditContacts: false,
            canViewSales: false,
            canEditInvoices: false,
            canViewAccounting: false,
            canEditAccounting: false,
            canViewInventory: false,
            canEditInventory: false,
            canViewHr: false,
            canEditHr: false,
            canApproveClaims: false,
            canViewReports: false,
            canViewSettings: false,
            canEditSettings: false,
            canViewFinancialWidgets: false,
        };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isAccountant = user.role === UserRole.ACCOUNTANT;
    const isHrManager = user.role === UserRole.HR_MANAGER;
    const isEmployee = user.role === UserRole.EMPLOYEE;
    const isViewer = user.role === UserRole.VIEWER;

    return {
        // Page View permissions
        canViewDashboard: true,
        canViewAnalytics: isAdmin || isAccountant,
        canViewTransactions: true,
        canViewWallets: true,
        canViewBudgets: isAdmin || isAccountant || isEmployee,
        canViewContacts: isAdmin || isAccountant || isHrManager,
        canViewSales: isAdmin || isAccountant,
        canViewAccounting: isAdmin || isAccountant,
        canViewInventory: isAdmin || isAccountant,
        canViewHr: isAdmin || isAccountant || isHrManager,
        canViewReports: isAdmin || isAccountant,
        canViewSettings: isAdmin,

        // Component/Widget View permissions
        canViewFinancialWidgets: isAdmin || isAccountant,

        // Edit permissions
        canEditTransactions: isAdmin || isAccountant,
        canEditWallets: isAdmin,
        canEditBudgets: isAdmin || isAccountant,
        canEditContacts: isAdmin,
        canEditInvoices: isAdmin || isAccountant,
        canEditAccounting: isAdmin || isAccountant,
        canEditInventory: isAdmin,
        canEditHr: isAdmin || isHrManager,
        canApproveClaims: isAdmin || isAccountant || isHrManager,
        canEditSettings: isAdmin,
    };
};