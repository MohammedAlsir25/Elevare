import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string, role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, pass: string, role: UserRole) => {
        console.log(`Logging in as ${role}`);
        // In a real app, you'd verify credentials against a backend
        const mockUser: User = {
            id: 'user1',
            name: `${role} User`,
            email: `${role.toLowerCase()}@elevare.com`,
            role: role
        };
        setUser(mockUser);
    };

    const logout = () => {
        setUser(null);
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