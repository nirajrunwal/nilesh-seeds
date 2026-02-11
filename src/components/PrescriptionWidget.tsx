// Prescription Widget for Admin Dashboard
'use client';

import { useEffect, useState } from 'react';
import { PrescriptionService, Prescription } from '@/services/prescriptionService';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PrescriptionWidget() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0 });

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadData = () => {
        const all = PrescriptionService.getAllPrescriptions();
        // Get most recent 5
        const recent = all.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);

        setPrescriptions(recent);
        setStats(PrescriptionService.getStats());
    };

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        }
        if (diffHours > 0) {
            return `${diffHours}h ago`;
        }
        if (diffMins > 0) {
            return `${diffMins}m ago`;
        }
        return 'Just now';
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Prescriptions Overview
            </h2>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold">Total</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-semibold">Active</p>
                    <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-semibold">Completed</p>
                    <p className="text-2xl font-bold text-gray-700">{stats.completed}</p>
                </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Recent</h3>
                {prescriptions.length > 0 ? (
                    <>
                        {prescriptions.map((prescription) => (
                            <div
                                key={prescription.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                        {prescription.farmerName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        By {prescription.employeeName} • {getTimeAgo(prescription.createdAt)}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${prescription.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : prescription.status === 'completed'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {prescription.status}
                                </span>
                            </div>
                        ))}
                        <Link
                            href="/admin/prescriptions"
                            className="flex items-center justify-center gap-2 p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-semibold text-sm"
                        >
                            View All Prescriptions
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No prescriptions yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
