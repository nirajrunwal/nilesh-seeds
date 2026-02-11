'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { FarmerService } from '@/services/farmerService';
import { MockBackend } from '@/lib/mockData';
import Link from 'next/link';
import { Users, MapPin, FileText, Award, LogOut, Map as MapIcon, TrendingUp, UserCheck, Bell } from 'lucide-react';

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [stats, setStats] = useState({
        assignedFarmers: 0,
        totalPrescriptions: 0,
        commission: 0
    });
    const [showNotification, setShowNotification] = useState(false);
    const [previousFarmerCount, setPreviousFarmerCount] = useState(0);

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/');
            return;
        }

        const loadEmployeeData = () => {
            const emp = EmployeeService.getEmployee(user.id);
            if (emp) {
                setEmployee(emp);
                const farmerCount = emp.assignedFarmers.length;

                // Check for new assignment
                if (previousFarmerCount > 0 && farmerCount > previousFarmerCount) {
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                }

                setStats({
                    assignedFarmers: farmerCount,
                    totalPrescriptions: 0,
                    commission: emp.commissionPoints
                });

                setPreviousFarmerCount(farmerCount);
            }
        };

        loadEmployeeData();

        // Real-time assignment sync: Poll every 5 seconds
        const interval = setInterval(loadEmployeeData, 5000);

        return () => clearInterval(interval);
    }, [user, router, previousFarmerCount]);

    if (!user || user.role !== 'employee') return null;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* New Assignment Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce">
                    <Bell className="h-5 w-5" />
                    <span className="font-semibold">New farmer assigned to you!</span>
                </div>
            )}

            {/* Header - Compact on Mobile */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 md:p-6 text-white shadow-lg flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Employee Dashboard</h1>
                        <p className="text-xs md:text-sm text-indigo-100 mt-1 hidden md:block">Welcome back, {user.name}!</p>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to logout?')) {
                                logout();
                            }
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </div>
            </div>

            {/* Stats Cards - 2x2 Grid on Mobile, 3 columns on Desktop */}
            <div className="p-3 md:p-6 bg-white border-b flex-shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 md:p-4 border border-green-200">
                        <div className="flex md:items-center gap-2 md:gap-3 flex-col md:flex-row">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-green-600 flex items-center justify-center mx-auto md:mx-0">
                                <UserCheck className="h-4 w-4 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs md:text-sm text-green-700 font-medium">Farmers</p>
                                <p className="text-xl md:text-2xl font-bold text-green-900">{stats.assignedFarmers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 md:p-4 border border-blue-200">
                        <div className="flex md:items-center gap-2 md:gap-3 flex-col md:flex-row">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto md:mx-0">
                                <FileText className="h-4 w-4 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs md:text-sm text-blue-700 font-medium">Status</p>
                                <p className="text-base md:text-2xl font-bold text-blue-900 capitalize">{employee?.status || 'Active'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 md:p-4 border border-purple-200 col-span-2 md:col-span-1">
                        <div className="flex md:items-center gap-2 md:gap-3 flex-col md:flex-row">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-600 flex items-center justify-center mx-auto md:mx-0">
                                <Award className="h-4 w-4 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs md:text-sm text-purple-700 font-medium">Commission</p>
                                <p className="text-xl md:text-2xl font-bold text-purple-900">₹{stats.commission.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Compact on Mobile */}
            <div className="flex-1 overflow-auto p-3 md:p-6">
                <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
                    {/* Quick Actions - 2 columns on mobile, 3 on desktop */}
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <Link
                                href="/employee/farmers"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-green-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                    <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">My Farmers</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">View & manage assigned farmers</p>
                            </Link>

                            <Link
                                href="/employee/prescriptions"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Prescriptions</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">Create & manage</p>
                            </Link>

                            <Link
                                href="/employee/map"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-indigo-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                    <MapIcon className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Map</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">View locations</p>
                            </Link>

                            <Link
                                href="/employee/commission"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    <Award className="h-6 w-6 md:h-8 md:w-8 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Commission</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">View earnings</p>
                            </Link>

                            <Link
                                href="/employee/location"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                    <MapPin className="h-6 w-6 md:h-8 md:w-8 text-orange-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Location</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">Tracking</p>
                            </Link>

                            <Link
                                href="/settings"
                                className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-white p-3 md:p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-gray-200"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Settings</h3>
                                <p className="text-xs text-gray-500 text-center hidden md:block">Preferences</p>
                            </Link>
                        </div>
                    </div>

                    {/* Employee Info - Hidden on small mobile, shown on larger screens */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hidden sm:block">
                        <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Employee Information</h2>
                        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                            <div className="flex justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Name</span>
                                <span className="text-sm font-semibold text-gray-900">{employee?.name}</span>
                            </div>
                            <div className="flex justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Phone</span>
                                <span className="text-sm font-semibold text-gray-900">{employee?.phone}</span>
                            </div>
                            <div className="flex justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Email</span>
                                <span className="text-sm font-semibold text-gray-900">{employee?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={`text-sm font-semibold capitalize ${employee?.status === 'active' ? 'text-green-600' :
                                    employee?.status === 'inactive' ? 'text-gray-600' : 'text-red-600'
                                    }`}>
                                    {employee?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
