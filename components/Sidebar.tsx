import React, { useState, useMemo } from 'react';
import { SIDEBAR_LINKS, LogoutIcon, CogIcon } from '../constants.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { useCompany } from '../contexts/CompanyContext.tsx';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompany();
  const { t } = useI18n();

  const visibleLinks = useMemo(() => {
    return SIDEBAR_LINKS.filter(link => {
      const viewName = link.name.toLowerCase().replace(' ', '');
      const permissionKey = `canView${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
      // Special case for Admin
      if (link.name === 'Admin') {
        return permissions.canViewSettings;
      }
      return (permissions as any)[permissionKey] ?? true; // Default to true if no specific permission is set
    });
  }, [permissions]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${isOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
           <span className={`font-bold text-xl text-gray-800 dark:text-white ${!isOpen && 'hidden'}`}>Elevare</span>
           <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary" aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={isOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
           </button>
        </div>
        
        {/* Company Switcher */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <select 
                value={selectedCompanyId || ''} 
                onChange={e => setSelectedCompanyId(e.target.value)}
                className={`w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-medium text-gray-800 dark:text-white focus:ring-brand-primary ${!isOpen && 'hidden'}`}
                aria-label="Select Company"
            >
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul role="list" className="space-y-2">
            {visibleLinks.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => setActiveView(link.name)}
                  className={`w-full flex items-center p-2 text-base rounded-md transition-colors ${activeView === link.name ? 'bg-brand-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                  aria-current={activeView === link.name ? 'page' : undefined}
                >
                  <link.icon className="h-6 w-6" />
                  <span className={`ml-4 ${!isOpen && 'hidden'}`}>{t(`sidebar.${link.name.toLowerCase().replace(' ', '')}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`p-2 border-t border-gray-200 dark:border-gray-700`}>
            <div className={`p-2 ${!isOpen && 'hidden'}`}>
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100" alt="User" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>
            </div>
             <div className="mt-2 space-y-1">
                 {permissions.canViewSettings && (
                     <button
                        onClick={() => setActiveView('Settings')}
                        className={`w-full flex items-center p-2 text-base rounded-md transition-colors ${activeView === 'Settings' ? 'bg-brand-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                        aria-current={activeView === 'Settings' ? 'page' : undefined}
                      >
                        <CogIcon className="h-6 w-6" />
                        <span className={`ml-4 ${!isOpen && 'hidden'}`}>{t('sidebar.settings')}</span>
                    </button>
                 )}
                 <button
                    onClick={logout}
                    className="w-full flex items-center p-2 text-base rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  >
                    <LogoutIcon className="h-6 w-6" />
                    <span className={`ml-4 ${!isOpen && 'hidden'}`}>{t('sidebar.logout')}</span>
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;