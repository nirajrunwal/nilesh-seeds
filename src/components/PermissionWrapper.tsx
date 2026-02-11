'use client';

import { useState, useEffect } from 'react';
import PermissionManager from '@/components/PermissionManager';

export default function PermissionWrapper({ children }: { children: React.ReactNode }) {
    const [permissionsComplete, setPermissionsComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we're on the login page - if so, skip permissions for now
        if (typeof window !== 'undefined') {
            const isLoginPage = window.location.pathname === '/';
            if (isLoginPage) {
                setPermissionsComplete(true);
                setLoading(false);
                return;
            }

            // Check if permissions were already granted
            const granted = localStorage.getItem('ns_permissions_granted');
            if (granted === 'true') {
                setPermissionsComplete(true);
            }
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!permissionsComplete) {
        return (
            <>
                {children}
                <PermissionManager onComplete={() => setPermissionsComplete(true)} />
            </>
        );
    }

    return <>{children}</>;
}
