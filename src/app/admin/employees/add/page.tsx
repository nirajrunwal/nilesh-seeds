'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService } from '@/services/employeeService';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddEmployeePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        village: '',
        address: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.password) {
            alert('Please fill in required fields: name, phone, and password');
            return;
        }

        if (!user) return;

        EmployeeService.createEmployee(
            formData.name,
            formData.phone,
            formData.password,
            user.id,
            formData.email,
            formData.village,
            formData.address
        );

        alert(`Employee ${formData.name} created successfully!`);
        router.push('/admin/employees');
    };

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/employees" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-green-700">Add New Employee</h1>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
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
                                placeholder="Enter employee name"
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
                                placeholder="Enter phone number"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                placeholder="Enter email address"
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
                                placeholder="Create password"
                                required
                            />
                        </div>

                        {/* Village */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Village (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.village}
                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                placeholder="Enter village name"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address (Optional)
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                placeholder="Enter full address"
                            />
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
                                Create Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
