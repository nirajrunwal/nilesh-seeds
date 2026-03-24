'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import Link from 'next/link';
import { Users, FileText, Award, LogOut, Map as MapIcon, TrendingUp, UserCheck, Bell, MapPin, ChevronRight, Briefcase } from 'lucide-react';

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [stats, setStats] = useState({ assignedFarmers: 0, totalPrescriptions: 0, commission: 0 });
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
                if (previousFarmerCount > 0 && farmerCount > previousFarmerCount) {
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                }

                setStats({ assignedFarmers: farmerCount, totalPrescriptions: 0, commission: emp.commissionPoints });
                setPreviousFarmerCount(farmerCount);
            }
        };

        loadEmployeeData();
        const interval = setInterval(loadEmployeeData, 5000);
        return () => clearInterval(interval);
    }, [user, router, previousFarmerCount]);

    if (!user || user.role !== 'employee') return null;

    return (
        <div className="flex min-h-screen flex-col bg-[#F3F6F8] font-sans text-gray-800">
            {/* New Assignment Notification */}
            {showNotification && (
                <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/40 flex items-center gap-4 animate-bounce border border-green-400">
                    <div className="bg-white/20 p-2 rounded-full"><Bell className="h-6 w-6" /></div>
                    <span className="font-bold text-lg">New farmer assigned to you!</span>
                </div>
            )}

            {/* Advanced Header */}
            <header className="bg-gradient-to-r from-indigo-800 to-violet-700 pt-10 pb-8 px-6 text-white rounded-b-[2rem] shadow-lg shrink-0 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10"><Briefcase className="w-64 h-64" /></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">{t('employeeDashboard')}</h1>
                        <p className="text-indigo-200 font-medium text-sm mt-1">{t('myFarmers')} & Tasks</p>
                    </div>
                    <button onClick={() => { if (confirm(t('confirm') + ' ' + t('logout') + '?')) logout(); }} className="bg-white/10 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all backdrop-blur-md shadow-sm border border-white/10 group">
                        <LogOut className="h-6 w-6 text-white group-hover:text-white" />
                    </button>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 mt-4 flex items-center gap-4 relative z-10 w-fit">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center font-black text-2xl shadow-inner border border-white/20">{user.name[0]}</div>
                    <div>
                        <p className="text-sm font-semibold text-indigo-200">{t('welcome')},</p>
                        <p className="text-xl font-bold tracking-tight">{user.name}</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 -mt-6 relative z-20 space-y-6 max-w-5xl mx-auto w-full">
                
                {/* Advanced Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-50/50 hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><UserCheck className="w-24 h-24 text-indigo-600"/></div>
                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100"><UserCheck className="h-6 w-6 text-indigo-600" /></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('farmers')}</p>
                        </div>
                        <p className="text-4xl font-black text-gray-800 relative z-10">{stats.assignedFarmers}</p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50/50 hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><FileText className="w-24 h-24 text-emerald-600"/></div>
                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100"><FileText className="h-6 w-6 text-emerald-600" /></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('accountStatus')}</p>
                        </div>
                        <p className={`text-2xl font-black capitalize relative z-10 ${employee?.status === 'active' ? 'text-emerald-600' : 'text-gray-500'}`}>{t(employee?.status || 'active')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-5 shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative col-span-2 md:col-span-1 border border-purple-400 text-white cursor-pointer" onClick={() => router.push('/employee/commission')}>
                        <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform rotate-12"><Award className="w-24 h-24"/></div>
                        <div className="flex items-center gap-4 mb-2 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20"><Award className="h-6 w-6 text-white" /></div>
                            <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">{t('commission')}</p>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-4xl font-black drop-shadow-sm">₹{stats.commission.toLocaleString()}</p>
                            <ChevronRight className="w-6 h-6 text-white/70" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-xl font-black text-gray-800 mb-4 ml-2">{t('quickActions')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/employee/farmers" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform relative z-10">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('myFarmers')}</h3>
                            </div>
                        </Link>

                        <Link href="/employee/prescriptions" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform relative z-10">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('prescriptions')}</h3>
                            </div>
                        </Link>

                        <Link href="/employee/map" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform relative z-10">
                                <MapIcon className="h-8 w-8 text-teal-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('mapView')}</h3>
                            </div>
                        </Link>

                        <Link href="/employee/commission" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 group-hover:scale-110 transition-transform relative z-10">
                                <Award className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('earnings')}</h3>
                            </div>
                        </Link>

                        <Link href="/employee/location" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform relative z-10">
                                <MapPin className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('myLocation')}</h3>
                            </div>
                        </Link>

                        <Link href="/settings" className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform relative z-10">
                                <TrendingUp className="h-8 w-8 text-slate-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="font-bold text-gray-800">{t('settings')}</h3>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Profile Information Panel */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 opacity-5"><UserCheck className="w-48 h-48 text-gray-900" /></div>
                    <h2 className="text-xl font-black text-gray-800 mb-6 relative z-10">{t('profileDetails')}</h2>
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('fullName')}</span>
                            <span className="text-lg font-bold text-gray-800">{employee?.name}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('phoneNumber')}</span>
                            <span className="text-lg font-bold text-gray-800">{employee?.phone}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('emailAddress')}</span>
                            <span className="text-lg font-bold text-gray-800">{employee?.email || 'Not Provided'}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('accountStatus')}</span>
                            <span className={`text-lg font-black capitalize ${employee?.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>{t(employee?.status || 'active')}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
