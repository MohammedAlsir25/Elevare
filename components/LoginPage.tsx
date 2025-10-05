import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('admin@elevare.com');
    const [password, setPassword] = useState('password');
    const { login } = useAuth();
    const { t } = useI18n();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const success = await login(email, password);

        if (!success) {
            setError('Invalid credentials. Please check your email and password.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h1 className="text-3xl font-bold text-center text-white">{t('login.title')}</h1>
                <p className="text-center text-gray-400">{t('login.subtitle')}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">{t('login.email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-medium text-gray-300">{t('login.password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                        />
                    </div>
                    {error && <p className="text-sm text-accent-red text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </>
                        ) : (
                            t('login.loginButton')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;