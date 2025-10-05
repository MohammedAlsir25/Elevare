import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';

const SettingsPage: React.FC = () => {
    const { settings, updateCompanySettings, toggleTheme, updateThemeColors } = useSettings();
    const { language, setLanguage, t } = useI18n();
    const [localSettings, setLocalSettings] = useState(settings.company);
    const [localColors, setLocalColors] = useState(settings.themeColors);
    const { addNotification } = useNotification();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalColors(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSaveChanges = () => {
        updateCompanySettings(localSettings);
        updateThemeColors(localColors);
        addNotification('Settings saved successfully!', 'success');
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Profile Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={localSettings.name}
                                onChange={handleInputChange}
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Address</label>
                            <textarea
                                name="address"
                                id="address"
                                rows={3}
                                value={localSettings.address}
                                onChange={handleInputChange}
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
                            <div className="mt-2 flex items-center gap-4">
                                {localSettings.logo && (
                                    <img src={localSettings.logo} alt="Company logo preview" className="h-16 w-16 rounded-md object-contain bg-white p-1" />
                                )}
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <label htmlFor="logo-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-md text-sm">
                                    {localSettings.logo ? 'Change Logo' : 'Upload Logo'}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={handleSaveChanges}
                            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Theme & Language Settings Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('settings.appearance')}</h2>
                     <div className="space-y-6">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('settings.theme')}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">{settings.theme === 'light' ? t('settings.light') : t('settings.dark')}</span>
                                     <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={settings.theme === 'dark'} onChange={toggleTheme} />
                                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                    </label>
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                 <span className="text-gray-700 dark:text-gray-300 font-medium">{t('settings.language')}</span>
                                 <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                 >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                 </select>
                             </div>
                         </div>
                         <div className="border-t border-gray-200 dark:border-gray-700"></div>
                         <div>
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Theme Colors</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="primary" className="text-gray-700 dark:text-gray-300 font-medium">Primary</label>
                                    <div className="flex items-center gap-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md">
                                        <input type="color" name="primary" id="primary" value={localColors.primary} onChange={handleColorChange} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent appearance-none" style={{'WebkitAppearance': 'none'}}/>
                                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{localColors.primary}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="secondary" className="text-gray-700 dark:text-gray-300 font-medium">Secondary</label>
                                    <div className="flex items-center gap-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md">
                                        <input type="color" name="secondary" id="secondary" value={localColors.secondary} onChange={handleColorChange} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent appearance-none" style={{'WebkitAppearance': 'none'}}/>
                                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{localColors.secondary}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
