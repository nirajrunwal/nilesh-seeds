'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { Search, UserPlus, MapPin, Edit, Trash2, Ban, MessageCircle, Award, ArrowLeft, Plus, Minus, X } from 'lucide-react';
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
        e.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-green-700">Employee Management</h1>
                </div>
                <Link
                    href="/admin/employees/add"
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                </Link>
            </div>

            {/* Statistics */}
            <div className="bg-white border-b px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active</p>
                        <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 font-medium">Inactive</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Blocked</p>
                        <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Total Commission</p>
                        <p className="text-2xl font-bold text-purple-700">₹{stats.totalCommission.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 py-4 bg-white border-b">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search employees by name, phone, or email..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
                                        {employee.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                        <p className="text-sm text-gray-500">{employee.phone}</p>
                                    </div>
                                </div>
                                <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-700' :
                                    employee.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {employee.status}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                {employee.email && <p>📧 {employee.email}</p>}
                                {employee.village && <p>📍 {employee.village}</p>}
                                <p>👥 Assigned: {employee.assignedFarmers.length} farmers</p>
                                <p className="font-semibold text-purple-600">💰 Commission: ₹{employee.commissionPoints.toLocaleString()}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                <Link
                                    href={`/admin/employees/edit/${employee.id}`}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Link>
                                <Link
                                    href={`/admin/employees/${employee.id}/location`}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </Link>
                                <Link
                                    href={`/chat/${employee.id}`}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-purple-50 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Chat
                                </Link>
                                <button
                                    onClick={() => openCommissionModal(employee, 'add')}
                                    className="p-2 rounded-lg hover:bg-green-50"
                                    title="Add Commission"
                                >
                                    <Award className="h-4 w-4 text-green-600" />
                                </button>
                                <button
                                    onClick={() => toggleStatus(employee)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                    title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                    <Ban className={`h-4 w-4 ${employee.status === 'active' ? 'text-orange-600' : 'text-green-600'}`} />
                                </button>
                                <button
                                    onClick={() => handleDelete(employee)}
                                    className="p-2 rounded-lg hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No employees found</p>
                        <Link
                            href="/admin/employees/add"
                            className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium"
                        >
                            <UserPlus className="h-5 w-5" />
                            Add your first employee
                        </Link>
                    </div>
                )}
            </div>

            {/* Commission Management Modal */}
            {showCommissionModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCommissionModal(false)}>
                    <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {commissionType === 'add' ? 'Add' : 'Subtract'} Commission
                                </h2>
                                <button onClick={() => setShowCommissionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Employee: <strong>{selectedEmployee.name}</strong>
                            </p>
                            <p className="text-sm text-gray-600">
                                Current Commission: <strong>₹{selectedEmployee.commissionPoints.toLocaleString()}</strong>
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCommissionType('add')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-medium ${commissionType === 'add' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setCommissionType('subtract')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-medium ${commissionType === 'subtract' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <Minus className="h-4 w-4" />
                                        Subtract
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={commissionAmount}
                                    onChange={(e) => setCommissionAmount(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Enter amount"
                                    min="0"
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={commissionReason}
                                    onChange={(e) => setCommissionReason(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Why are you adding/subtracting commission?"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setShowCommissionModal(false)}
                                    className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCommissionSubmit}
                                    className={`flex-1 rounded-lg py-3 font-semibold text-white ${commissionType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {commissionType === 'add' ? 'Add Commission' : 'Subtract Commission'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
