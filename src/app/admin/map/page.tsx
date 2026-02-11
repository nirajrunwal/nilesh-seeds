
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Map...</div>,
});

export default function MapPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setSelectedFarmer(query);
        } else {
            setSelectedFarmer(null);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="bg-white p-4 shadow-md z-10 flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <h1 className="font-bold text-lg">Live Farmer Tracking</h1>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search farmer by name..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    />
                </div>
            </div>
            <div className="flex-1 relative z-0">
                <MapComponent searchFarmer={selectedFarmer} />
            </div>
        </div>
    );
}
