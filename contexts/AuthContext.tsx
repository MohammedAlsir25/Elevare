import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types.ts';
import * as api from '../services/api.ts';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, pass: string): Promise<boolean> => {
       try {
            const { accessToken, refreshToken, user: loggedInUser } = await api.login(email, pass);
            
            // Store tokens for future API calls
            localStorage.setItem('elevare-token', accessToken);
            localStorage.setItem('elevare-refresh-token', refreshToken);
            
            setUser(loggedInUser);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('elevare-refresh-token');
        if (refreshToken) {
            try {
                await api.logout(refreshToken);
            } catch (error) {
                console.error("Logout API call failed, proceeding with client-side logout:", error);
            }
        }
        setUser(null);
        localStorage.removeItem('elevare-token');
        localStorage.removeItem('elevare-refresh-token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};