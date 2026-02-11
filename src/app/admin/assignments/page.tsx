'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FarmerService } from '@/services/farmerService';
import { EmployeeService } from '@/services/employeeService';

interface AssignmentData {
    employees: any[];
    farmers: any[];
    unassignedFarmers: any[];
}

export default function AssignmentsPage() {
    const router = useRouter();
    const [data, setData] = useState<AssignmentData>({
        employees: [],
        farmers: [],
        unassignedFarmers: []
    });
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allEmployees = EmployeeService.getAllEmployees();
        const allFarmers = FarmerService.getAllFarmers();
        const unassigned = allFarmers.filter(f => !f.assignedTo || f.assignedTo === '');

        setData({
            employees: allEmployees,
            farmers: allFarmers,
            unassignedFarmers: unassigned
        });
    };

    const assignFarmer = (farmerId: string, employeeId: string) => {
        FarmerService.assignFarmerToEmployee(farmerId, employeeId);
        loadData();
    };

    const unassignFarmer = (farmerId: string) => {
        FarmerService.unassignFarmer(farmerId);
        loadData();
    };

    const getEmployeeFarmers = (employeeId: string) => {
        return data.farmers.filter(f => f.assignedTo === employeeId);
    };

    const filteredFarmers = data.farmers.filter(farmer => {
        const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (farmer.village && farmer.village.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' ? true :
            filterStatus === 'assigned' ? farmer.assignedTo :
                !farmer.assignedTo;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Farmer-Employee Assignments
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Manage farmer assignments to employees</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Employees</p>
                                <p className="text-3xl font-bold text-gray-800">{data.employees.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Farmers</p>
                                <p className="text-3xl font-bold text-gray-800">{data.farmers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-600">Unassigned</p>
                                <p className="text-3xl font-bold text-amber-600">{data.unassignedFarmers.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Farmers</label>
                            <input
                                type="text"
                                placeholder="Search by name or village..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="all">All Farmers</option>
                                <option value="assigned">Assigned Only</option>
                                <option value="unassigned">Unassigned Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employees List */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Employees
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {data.employees.map(employee => {
                                const farmerCount = getEmployeeFarmers(employee.id).length;
                                const isSelected = selectedEmployee === employee.id;
                                return (
                                    <button
                                        key={employee.id}
                                        onClick={() => setSelectedEmployee(isSelected ? null : employee.id)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800">{employee.name}</p>
                                                <p className="text-sm text-gray-600">{employee.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                                                    {farmerCount}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">farmers</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Farmers Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {selectedEmployee
                                ? `Farmers assigned to ${data.employees.find(e => e.id === selectedEmployee)?.name}`
                                : 'All Farmers'}
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Farmer Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Village</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Employee</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {(selectedEmployee
                                        ? getEmployeeFarmers(selectedEmployee)
                                        : filteredFarmers
                                    ).map(farmer => {
                                        const assignedEmployee = data.employees.find(e => e.id === farmer.assignedTo);
                                        return (
                                            <tr key={farmer.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <span className="text-green-700 font-bold text-sm">
                                                                {farmer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{farmer.name}</p>
                                                            <p className="text-sm text-gray-500">{farmer.phone}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">{farmer.village || '-'}</td>
                                                <td className="px-4 py-3">
                                                    {assignedEmployee ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                            {assignedEmployee.name}
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={farmer.assignedTo || ''}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    assignFarmer(farmer.id, e.target.value);
                                                                } else {
                                                                    unassignFarmer(farmer.id);
                                                                }
                                                            }}
                                                            className="px-3 py-1 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                                                        >
                                                            <option value="">Unassign</option>
                                                            {data.employees.map(emp => (
                                                                <option key={emp.id} value={emp.id}>
                                                                    {emp.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredFarmers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No farmers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
