'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { MockBackend, User } from '@/lib/mockData';
import { ArrowLeft, Users, MapPin, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeFarmersPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [assignedFarmers, setAssignedFarmers] = useState<User[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/');
            return;
        }

        const emp = EmployeeService.getEmployee(user.id);
        if (!emp) {
            alert('Employee data not found');
            router.push('/');
            return;
        }

        setEmployee(emp);

        // Load assigned farmers
        const allFarmers = MockBackend.getUsers().filter(u => u.role === 'farmer');
        const assigned = allFarmers.filter(f => emp.assignedFarmers.includes(f.id));
        setAssignedFarmers(assigned);
    }, [user, router]);

    if (!employee) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/employee" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-indigo-700">My Assigned Farmers</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white border-b px-6 py-4">
                <div className="bg-indigo-50 rounded-lg p-4 inline-block">
                    <p className="text-sm text-indigo-600 font-medium">Total Assigned</p>
                    <p className="text-2xl font-bold text-indigo-700">{assignedFarmers.length}</p>
                </div>
            </div>

            {/* Farmers List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignedFarmers.map((farmer) => (
                        <div key={farmer.id} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg">
                                    {farmer.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                                    <p className="text-sm text-gray-500">{farmer.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {farmer.village}
                                </p>
                                {farmer.crops && (
                                    <p>🌾 {farmer.crops}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <Link
                                    href={`/chat/${farmer.id}`}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Chat
                                </Link>
                                <Link
                                    href={`/call/voice?target=${farmer.id}`}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                >
                                    <Phone className="h-4 w-4" />
                                    Call
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {assignedFarmers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No farmers assigned yet</p>
                        <p className="text-sm text-gray-400 mt-2">Contact admin to get farmer assignments</p>
                    </div>
                )}
            </div>
        </div>
    );
}
