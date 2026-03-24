
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/mockData';
import { SupabaseService } from '@/services/supabaseService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (credential: string, psw: string) => Promise<boolean>;
    register: (user: User) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const session = localStorage.getItem('ns_session');
        if (session) {
            setUser(JSON.parse(session));
        }
        setIsLoading(false);
    }, []);

    const login = async (credential: string, psw: string): Promise<boolean> => {
        setIsLoading(true);
        const foundUser = await SupabaseService.login(credential, psw);
        
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('ns_session', JSON.stringify(foundUser));
            // Redirect based on role
            if (foundUser.role === 'admin') router.push('/admin');
            else if (foundUser.role === 'employee') router.push('/employee');
            else router.push('/farmer');
            setIsLoading(false);
            return true;
        }
        setIsLoading(false);
        return false;
    };

    const register = async (newUser: User) => {
        setIsLoading(true);
        const createdUser = await SupabaseService.addUser(newUser);
        
        if (createdUser) {
            setUser(createdUser as any);
            localStorage.setItem('ns_session', JSON.stringify(createdUser));
            router.push('/farmer');
        } else {
            alert('Failed to register user to Supabase Cloud.');
        }
        setIsLoading(false);
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
