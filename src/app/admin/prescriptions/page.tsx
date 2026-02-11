'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PrescriptionService, Prescription } from '@/services/prescriptionService';
import { ArrowLeft, FileText, Plus, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

export default function PrescriptionsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0 });

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
        const all = PrescriptionService.getAllPrescriptions();
        setPrescriptions(all);
        setStats(PrescriptionService.getStats());
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const matchesSearch = p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = (prescription: Prescription) => {
        if (confirm(`Delete prescription for ${prescription.farmerName}?`)) {
            PrescriptionService.deletePrescription(prescription.id);
            loadData();
            alert('Prescription deleted successfully');
        }
    };

    const handleStatusChange = (prescription: Prescription, newStatus: 'active' | 'completed' | 'cancelled') => {
        PrescriptionService.updatePrescription(prescription.id, { status: newStatus });
        loadData();
    };

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-green-700">Prescriptions</h1>
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-white border-b px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active</p>
                        <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 font-medium">Completed</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.completed}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Cancelled</p>
                        <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="px-6 py-4 bg-white border-b">
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by farmer or employee name..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {filteredPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{prescription.farmerName}</h3>
                                        <p className="text-sm text-gray-600">
                                            By: {prescription.employeeName}
                                        </p>
                                        {prescription.farmerVillage && (
                                            <p className="text-sm text-gray-500">📍 {prescription.farmerVillage}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/prescriptions/${prescription.id}`}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Details
                                    </Link>
                                    <select
                                        value={prescription.status}
                                        onChange={(e) => handleStatusChange(prescription, e.target.value as any)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium border-2 ${prescription.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' :
                                            prescription.status === 'completed' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                'bg-red-100 text-red-700 border-red-300'
                                            }`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(prescription)}
                                        className="p-2 hover:bg-red-50 rounded-lg"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Products:</h4>
                                <div className="space-y-2">
                                    {prescription.products.map((product, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-900">{product.productName}</span>
                                            <span className="text-sm text-gray-600">
                                                {product.quantity} {product.unit}
                                            </span>
                                            {product.instructions && (
                                                <span className="text-sm text-gray-500 italic">
                                                    {product.instructions}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {prescription.notes && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Notes:</strong> {prescription.notes}
                                    </p>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                                <span>Created: {new Date(prescription.createdAt).toLocaleString()}</span>
                                <span>Updated: {new Date(prescription.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {filteredPrescriptions.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No prescriptions found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
