'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LocationHistoryService, LocationHistoryEntry } from '@/services/locationHistoryService';
import { ArrowLeft, Calendar, MapPin, Download, Trash2, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/admin/map/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Map...</div>,
});

export default function LocationHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [history, setHistory] = useState<LocationHistoryEntry[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<LocationHistoryEntry[]>([]);
    const [stats, setStats] = useState({ total: 0, farmers: 0, employees: 0, uniqueUsers: 0 });
    const [filterRole, setFilterRole] = useState<'all' | 'farmer' | 'employee'>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        loadData();
        const interval = setInterval(loadData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [user, router]);

    useEffect(() => {
        applyFilters();
    }, [history, filterRole, dateRange]);

    const loadData = () => {
        const allHistory = LocationHistoryService.getAllHistory();
        setHistory(allHistory);
        setStats(LocationHistoryService.getStats());
    };

    const applyFilters = () => {
        let filtered = [...history];

        // Filter by role
        if (filterRole !== 'all') {
            filtered = filtered.filter(h => h.userRole === filterRole);
        }

        // Filter by date range
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            filtered = filtered.filter(h => {
                const entryDate = new Date(h.timestamp);
                return entryDate >= start && entryDate <= end;
            });
        }

        setFilteredHistory(filtered);
    };

    const clearAllHistory = () => {
        if (confirm('Delete all location history? This cannot be undone.')) {
            LocationHistoryService.clearAllHistory();
            loadData();
            alert('All location history deleted');
        }
    };

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-green-700">30-Day Location History</h1>
                </div>
                <button
                    onClick={clearAllHistory}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                </button>
            </div>

            {/* Statistics */}
            <div className="bg-white border-b px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Entries</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.total.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Farmers</p>
                        <p className="text-2xl font-bold text-green-700">{stats.farmers.toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                        <p className="text-sm text-indigo-600 font-medium">Employees</p>
                        <p className="text-2xl font-bold text-indigo-700">{stats.employees.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Unique Users</p>
                        <p className="text-2xl font-bold text-purple-700">{stats.uniqueUsers}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-white border-b">
                <div className="flex flex-wrap gap-4">
                    {/* Role Filter */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as 'all' | 'farmer' | 'employee')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                        >
                            <option value="all">All Users</option>
                            <option value="farmer">Farmers Only</option>
                            <option value="employee">Employees Only</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Showing {filteredHistory.length.toLocaleString()} of {history.length.toLocaleString()} entries
                </p>
            </div>

            {/* Location History List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Location Timeline
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-auto">
                        {filteredHistory.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No location history found. Location data is captured hourly.
                            </p>
                        )}
                        {filteredHistory.slice(0, 100).map((entry) => (
                            <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${entry.userRole === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                                    }`}>
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900">{entry.userName}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${entry.userRole === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {entry.userRole}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {filteredHistory.length > 100 && (
                            <p className="text-sm text-center text-gray-500 py-2">
                                Showing first 100 entries. Use filters to narrow down results.
                            </p>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📍 Auto-Capture System</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Location captured every hour automatically</li>
                        <li>• History stored for 30 days</li>
                        <li>• Old entries auto-deleted after 30 days</li>
                        <li>• Tracks both farmers and employees</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
