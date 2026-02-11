'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { LocationHistoryService } from '@/services/locationHistoryService';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/admin/map/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Map...</div>,
});

export default function EmployeeLocationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [locationHistory, setLocationHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        const emp = EmployeeService.getEmployee(employeeId);
        if (!emp) {
            alert('Employee not found');
            router.push('/admin/employees');
            return;
        }

        setEmployee(emp);
        loadLocationHistory();

        const interval = setInterval(loadLocationHistory, 5000);
        return () => clearInterval(interval);
    }, [user, router, employeeId]);

    const loadLocationHistory = () => {
        const history = LocationHistoryService.getFarmerHistory(employeeId);
        setLocationHistory(history);
    };

    if (!employee) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/employees" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-green-700">Employee Location</h1>
                        <p className="text-sm text-gray-600">{employee.name}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-6">
                {/* Map View */}
                <div className="flex-1 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="h-full">
                        <MapComponent />
                    </div>
                </div>

                {/* Location History */}
                <div className="w-full lg:w-96 rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Location History
                    </h3>
                    <div className="space-y-3 max-h-[600px] overflow-auto">
                        {locationHistory.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No location history available yet
                            </p>
                        )}
                        {locationHistory.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-2 mb-1">
                                    <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {entry.placeName || 'Unknown Location'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
