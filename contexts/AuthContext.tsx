import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types.ts';
import * as api from '../services/api.ts';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, pass: string, role: UserRole): Promise<boolean> => {
       try {
            // The role from the UI is for mock purposes; the backend determines the role from the DB.
            const { token, user: loggedInUser } = await api.login(email, pass);
            
            // In a real app, you would verify the token and get user details from it
            // or a separate /profile endpoint. Here we trust the login response.
            
            // Store token for future API calls
            localStorage.setItem('elevare-token', token);
            
            setUser(loggedInUser);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('elevare-token');
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