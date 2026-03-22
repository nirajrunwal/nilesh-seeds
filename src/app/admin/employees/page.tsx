'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { Search, UserPlus, MapPin, Edit, Trash2, Ban, MessageCircle, Award, ArrowLeft, Plus, Minus, X, Users, Code, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function EmployeesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, blocked: 0, totalCommission: 0 });
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [commissionAmount, setCommissionAmount] = useState('');
    const [commissionReason, setCommissionReason] = useState('');
    const [commissionType, setCommissionType] = useState<'add' | 'subtract'>('add');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [user, router]);

    const loadData = () => {
        const allEmployees = EmployeeService.getAllEmployees().filter(e => e.status !== 'deleted');
        setEmployees(allEmployees);
        setStats(EmployeeService.getStats());
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm) ||
        (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (employee: Employee) => {
        if (confirm(`Delete ${employee.name}? This action cannot be undone.`)) {
            EmployeeService.deleteEmployee(employee.id);
            loadData();
            alert(`${employee.name} has been deleted`);
        }
    };

    const toggleStatus = (employee: Employee) => {
        const newStatus = employee.status === 'active' ? 'inactive' : 'active';
        const updated = { ...employee, status: newStatus };
        EmployeeService.updateEmployee(updated as Employee);
        loadData();
    };

    const openCommissionModal = (employee: Employee, type: 'add' | 'subtract') => {
        setSelectedEmployee(employee);
        setCommissionType(type);
        setCommissionAmount('');
        setCommissionReason('');
        setShowCommissionModal(true);
    };

    const handleCommissionSubmit = () => {
        if (!selectedEmployee || !commissionAmount || !commissionReason) {
            alert('Please fill in all fields');
            return;
        }

        const amount = parseInt(commissionAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (commissionType === 'add') {
            EmployeeService.addCommission(selectedEmployee.id, amount, commissionReason, user!.id);
        } else {
            EmployeeService.subtractCommission(selectedEmployee.id, amount, commissionReason, user!.id);
        }

        loadData();
        setShowCommissionModal(false);
        alert(`Commission ${commissionType === 'add' ? 'added' : 'subtracted'} successfully!`);
    };

    return (
        <div className="flex h-screen flex-col bg-[#F3F6F8] font-sans text-gray-800 overflow-hidden">
            {/* Advanced Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 shadow-lg shrink-0 rounded-b-3xl z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 shadow-sm text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-inner flex items-center justify-center border border-white/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Employee Hub</h1>
                            <p className="text-xs text-gray-400 font-medium">Manage team members & commission</p>
                        </div>
                    </div>
                </div>
                <Link
                    href="/admin/employees/add"
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 border border-indigo-400 hover:-translate-y-0.5 hover:shadow-xl transition-all"
                >
                    <UserPlus className="h-5 w-5" />
                    <span className="hidden sm:inline">Add Member</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="p-6 pb-2 space-y-6">
                    {/* Advanced Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-0">
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-50 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center"><Users className="w-6 h-6 text-indigo-600"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Total</p><p className="text-2xl font-black text-indigo-900 drop-shadow-sm">{stats.total}</p></div>
                        </div>
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center"><UserPlus className="w-6 h-6 text-emerald-600"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Active</p><p className="text-2xl font-black text-emerald-700 drop-shadow-sm">{stats.active}</p></div>
                        </div>
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center"><Calendar className="w-6 h-6 text-gray-500"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Inactive</p><p className="text-2xl font-black text-gray-700 drop-shadow-sm">{stats.inactive}</p></div>
                        </div>
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-50 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center"><Ban className="w-6 h-6 text-rose-600"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Blocked</p><p className="text-2xl font-black text-rose-700 drop-shadow-sm">{stats.blocked}</p></div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 shadow-lg shadow-indigo-500/30 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all text-white border border-indigo-400 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10"><Award className="w-24 h-24"/></div>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm relative z-10"><Award className="w-6 h-6 text-white"/></div>
                            <div className="relative z-10"><p className="text-xs font-bold text-indigo-200 uppercase tracking-widest leading-tight">Total payouts</p><p className="text-2xl font-black drop-shadow-md">₹{stats.totalCommission}</p></div>
                        </div>
                    </div>

                    {/* Advanced Search Bar */}
                    <div className="relative max-w-3xl mx-auto shadow-sm rounded-2xl group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="🔍 Type a name, email or phone to search..."
                            className="block w-full pl-11 pr-4 py-4 bg-white border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 font-bold text-[15px] transition-all shadow-sm"
                        />
                    </div>

                    {/* Employee Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-8">
                        {filteredEmployees.map((employee) => (
                            <div key={employee.id} className="relative rounded-[2rem] bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-violet-600"></div>

                                <div className="flex items-start justify-between mb-5 pl-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-black text-2xl shadow-inner border border-indigo-200">
                                            {employee.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg tracking-tight">{employee.name}</h3>
                                            <p className="text-xs font-bold text-gray-500">{employee.phone}</p>
                                        </div>
                                    </div>
                                    <div className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider ${employee.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        employee.status === 'inactive' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                            'bg-rose-100 text-rose-700 border border-rose-200'
                                        }`}>
                                        {employee.status}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-inner ml-2">
                                    {employee.email && <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">📧 {employee.email}</p>}
                                    {employee.village && <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">📍 {employee.village}</p>}
                                    <p className="text-sm font-bold text-indigo-700 flex items-center gap-2">👥 Assigned: {employee.assignedFarmers.length} farmers</p>
                                    <p className="text-sm font-black text-purple-700 flex items-center gap-2">💰 Commission: ₹{employee.commissionPoints}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 pl-2">
                                    <button
                                        onClick={() => window.open(`https://wa.me/918208640382?text=Hello%20Support,%20regarding%20employee%20${employee.name}`, '_blank')}
                                        className="flex-1 min-w-[140px] flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                    >
                                        <MessageCircle className="h-4 w-4" /> Message WA
                                    </button>

                                    <Link
                                        href={`/admin/employees/edit/${employee.id}`}
                                        className="w-12 flex justify-center items-center rounded-xl bg-gray-50 border border-gray-200 p-2.5 text-gray-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm" title="Edit"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                    
                                    <Link
                                        href={`/admin/employees/${employee.id}/location`}
                                        className="w-12 flex justify-center items-center rounded-xl bg-gray-50 border border-gray-200 p-2.5 text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 transition-colors shadow-sm" title="Location"
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </Link>

                                    <button
                                        onClick={() => openCommissionModal(employee, 'add')}
                                        className="w-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-purple-100 hover:border-purple-200 hover:text-purple-700 transition-colors shadow-sm text-gray-600"
                                        title="Manage Commission"
                                    >
                                        <Award className="h-5 w-5" />
                                    </button>
                                    
                                    <button
                                        onClick={() => toggleStatus(employee)}
                                        className={`w-12 rounded-xl border shadow-sm flex items-center justify-center p-2.5 transition-colors ${employee.status === 'active' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}
                                        title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                        <Ban className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee)}
                                        className="w-12 rounded-xl border border-red-200 bg-red-50 flex justify-center items-center hover:bg-red-100 text-red-600 transition-colors shadow-sm"
                                        title="Delete Employee"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                            <Users className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">No employees found</h3>
                            <Link
                                href="/admin/employees/add"
                                className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                <UserPlus className="h-5 w-5" />
                                Add your first employee
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Advanced Commission Management Modal */}
            {showCommissionModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowCommissionModal(false)}>
                    <div className="w-full max-w-md mx-4 bg-white rounded-[2rem] shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                        <div className="p-8 pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                                    <div className="bg-purple-100 p-2.5 rounded-xl"><Award className="w-6 h-6 text-purple-600"/></div>
                                    Commission
                                </h2>
                                <button onClick={() => setShowCommissionModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-sm font-bold text-gray-500 mb-1 tracking-widest uppercase">Target Member</p>
                                <p className="text-xl font-black text-gray-800">{selectedEmployee.name}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Current Payouts</span>
                                    <span className="text-lg font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">₹{selectedEmployee.commissionPoints}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 pt-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Transaction Type</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCommissionType('add')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-sm transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none ${commissionType === 'add' ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-green-500/30' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        <Plus className="h-5 w-5 group-active:scale-90" /> Grant
                                    </button>
                                    <button
                                        onClick={() => setCommissionType('subtract')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-sm transition-all focus:ring-2 focus:ring-red-400 focus:outline-none ${commissionType === 'subtract' ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/30' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        <Minus className="h-5 w-5 group-active:scale-90" /> Deduct
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Amount (₹) <span className="text-rose-500">*</span></label>
                                <input
                                    type="number"
                                    value={commissionAmount}
                                    onChange={(e) => setCommissionAmount(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-bold text-[15px] text-gray-900 transition-all shadow-sm outline-none bg-white"
                                    placeholder="e.g. 5000"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Reason <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={commissionReason}
                                    onChange={(e) => setCommissionReason(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-semibold text-[15px] text-gray-900 transition-all shadow-sm outline-none bg-white resize-none"
                                    placeholder="Reason for adjustment"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowCommissionModal(false)} className="flex-1 rounded-xl bg-gray-100 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button
                                    onClick={handleCommissionSubmit}
                                    className={`flex-[1.5] rounded-xl py-4 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 ${commissionType === 'add' ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-green-500/30 hover:shadow-green-500/50' : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50'}`}
                                >
                                    {commissionType === 'add' ? 'Confirm Addition' : 'Confirm Deduction'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
