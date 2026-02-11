'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/admin/map/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Map...</div>,
});

export default function EmployeeLocationPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/');
            return;
        }
    }, [user, router]);

    if (!user || user.role !== 'employee') return null;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/employee" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-indigo-700">My Location Tracking</h1>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-2">📍 Field Coordination System</h2>
                    <p className="text-blue-100">
                        Your location helps us coordinate field visits and farmer assistance efficiently.
                        This ensures better service delivery and faster response times.
                    </p>
                    <div className="mt-4 flex gap-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">🔒 Secure</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Real-time</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">🎯 Accurate</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 p-6">
                <div className="h-full rounded-xl bg-white shadow-sm overflow-hidden">
                    <MapComponent />
                </div>
            </div>
        </div>
    );
}
