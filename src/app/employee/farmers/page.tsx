'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { MockBackend, User } from '@/lib/mockData';
import { ArrowLeft, Users, MapPin, MessageCircle, Link as LinkIcon } from 'lucide-react';
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

    if (!employee) return (
        <div className="flex h-screen items-center justify-center bg-[#F3F6F8]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-800 font-bold">Loading Data...</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#F3F6F8] font-sans text-gray-800">
            {/* Advanced Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-800 to-violet-700 px-6 pt-10 pb-8 shadow-lg shrink-0 rounded-b-[2rem]">
                <div className="flex items-center gap-4 text-white">
                    <Link href="/employee" className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 shadow-sm">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight drop-shadow-sm flex items-center gap-2"><Users className="w-8 h-8 opacity-80"/> Assigned Farmers</h1>
                        <p className="text-indigo-200 text-sm font-medium mt-1">Manage farmers assigned to you</p>
                    </div>
                </div>
            </div>

            {/* Stats Row overlay */}
            <div className="px-6 -mt-6 relative z-10 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-500/10 border border-indigo-50 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-50 flex items-center justify-center shadow-inner border border-indigo-100">
                        <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Assigned</p>
                        <p className="text-4xl font-black text-indigo-900 drop-shadow-sm">{assignedFarmers.length}</p>
                    </div>
                </div>
            </div>

            {/* Farmers List */}
            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assignedFarmers.map((farmer) => (
                        <div key={farmer.id} className="relative rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                            
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 text-2xl font-black">
                                    {farmer.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-xl tracking-tight">{farmer.name}</h3>
                                    <p className="text-sm font-semibold text-gray-500 mt-0.5">{farmer.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
                                <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <MapPin className="h-5 w-5 text-indigo-400" />
                                    {farmer.village || 'No Village mentioned'}
                                </p>
                                {farmer.crops && (
                                    <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <span className="text-lg">🌾</span>
                                        {farmer.crops}
                                    </p>
                                )}
                            </div>

                            <div className="flex pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => window.open(`https://wa.me/918208640382?text=Hello%20Support,%20regarding%20assigned%20farmer%20${farmer.name}`, '_blank')}
                                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-bold text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <MessageCircle className="h-5 w-5" /> Message Support via WA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {assignedFarmers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100 mt-6 max-w-2xl mx-auto">
                        <Users className="h-24 w-24 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">No farmers assigned</h3>
                        <p className="text-gray-500 font-medium mt-2">Contact admin to get farmer assignments added to your account.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
