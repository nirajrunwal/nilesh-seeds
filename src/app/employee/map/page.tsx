'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const MapComponent = dynamic(() => import('../../admin/map/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Map...</div>,
});

export default function EmployeeMapPage() {
    return (
        <div className="flex flex-col h-screen">
            <div className="bg-white p-4 shadow-md z-10 flex items-center gap-4">
                <Link href="/employee" className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <h1 className="font-bold text-lg text-indigo-700">Assigned Farmers Map</h1>
                <p className="text-sm text-gray-600">View locations of your assigned farmers</p>
            </div>
            <div className="flex-1 relative z-0">
                <MapComponent />
            </div>
        </div>
    );
}
