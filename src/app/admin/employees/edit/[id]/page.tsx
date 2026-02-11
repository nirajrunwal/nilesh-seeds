'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { MockBackend, User } from '@/lib/mockData';
import { ArrowLeft, Save, UserPlus, X } from 'lucide-react';
import Link from 'next/link';

export default function EditEmployeePage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        village: '',
        address: '',
        status: 'active' as 'active' | 'inactive' | 'blocked'
    });
    const [allFarmers, setAllFarmers] = useState<User[]>([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

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
        setFormData({
            name: emp.name,
            phone: emp.phone,
            email: emp.email || '',
            password: emp.password,
            village: emp.village || '',
            address: emp.address || '',
            status: emp.status as 'active' | 'inactive' | 'blocked'
        });
        setSelectedFarmers(emp.assignedFarmers);

        // Load all farmers
        setAllFarmers(MockBackend.getUsers().filter(u => u.role === 'farmer'));
    }, [user, router, employeeId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee) return;

        const updated: Employee = {
            ...employee,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            village: formData.village,
            address: formData.address,
            status: formData.status,
            assignedFarmers: selectedFarmers
        };

        EmployeeService.updateEmployee(updated);
        alert('Employee updated successfully!');
        router.push('/admin/employees');
    };

    const toggleFarmerAssignment = (farmerId: string) => {
        if (selectedFarmers.includes(farmerId)) {
            setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
        } else {
            setSelectedFarmers([...selectedFarmers, farmerId]);
        }
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
                    <h1 className="text-xl font-bold text-green-700">Edit Employee</h1>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Main Form */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Village */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Village
                                </label>
                                <input
                                    type="text"
                                    value={formData.village}
                                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-6">
                                <Link
                                    href="/admin/employees"
                                    className="flex-1 rounded-lg border-2 border-gray-300 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                                >
                                    <Save className="h-5 w-5" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Assign Farmers Section */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Assigned Farmers</h3>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <UserPlus className="h-4 w-4" />
                                Assign Farmers
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {selectedFarmers.length} farmer(s) assigned
                        </p>
                        <div className="space-y-2 max-h-60 overflow-auto">
                            {selectedFarmers.map(farmerId => {
                                const farmer = allFarmers.find(f => f.id === farmerId);
                                return farmer ? (
                                    <div key={farmerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">{farmer.name}</span>
                                        <button
                                            onClick={() => toggleFarmerAssignment(farmerId)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : null;
                            })}
                            {selectedFarmers.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No farmers assigned yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Farmers Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAssignModal(false)}>
                    <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Assign Farmers</h2>
                                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-96 overflow-auto">
                            <div className="space-y-2">
                                {allFarmers.map(farmer => (
                                    <label
                                        key={farmer.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFarmers.includes(farmer.id)}
                                            onChange={() => toggleFarmerAssignment(farmer.id)}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{farmer.name}</p>
                                            <p className="text-sm text-gray-500">{farmer.village}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                            >
                                Done ({selectedFarmers.length} selected)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
