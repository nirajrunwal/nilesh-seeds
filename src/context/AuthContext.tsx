
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, MockBackend } from '@/lib/mockData';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (credential: string, psw: string) => boolean;
    register: (user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Initialize mock DB
        MockBackend.init();

        // Check for existing session
        const session = localStorage.getItem('ns_session');
        if (session) {
            setUser(JSON.parse(session));
        }
        setIsLoading(false);
    }, []);

    const login = (credential: string, psw: string) => {
        const foundUser = MockBackend.login(credential, psw);
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('ns_session', JSON.stringify(foundUser));
            // Redirect based on role
            if (foundUser.role === 'admin') router.push('/admin');
            else if (foundUser.role === 'employee') router.push('/employee');
            else router.push('/farmer');
            return true;
        }
        return false;
    };

    const register = (newUser: User) => {
        MockBackend.addUser(newUser);
        // Auto login after register
        setUser(newUser);
        localStorage.setItem('ns_session', JSON.stringify(newUser));
        router.push('/farmer');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ns_session');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
