'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrescriptionService, Prescription } from '@/services/prescriptionService';
import { FarmerService } from '@/services/farmerService';
import { EmployeeService } from '@/services/employeeService';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPrescriptionDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [farmer, setFarmer] = useState<any>(null);
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        if (id) {
            const presc = PrescriptionService.getPrescription(id);
            if (presc) {
                setPrescription(presc);
                
                // Load farmer details
                const farmerData = FarmerService.getFarmer(presc.farmerId);
                setFarmer(farmerData);
                
                // Load employee details
                const empData = EmployeeService.getEmployee(presc.employeeId);
                setEmployee(empData);
            }
            setLoading(false);
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading prescription...</p>
                </div>
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-700">Prescription not found</p>
                    <button
                        onClick={() => router.push('/admin/prescriptions')}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Prescriptions
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = prescription.products.reduce((sum, item) => {
        return sum + ((item.price || 0) * item.quantity);
    }, 0);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this prescription?')) {
            PrescriptionService.deletePrescription(prescription.id);
            router.push('/admin/prescriptions');
        }
    };

    const handleStatusChange = (newStatus: 'active' | 'completed' | 'cancelled') => {
        PrescriptionService.updatePrescription(prescription.id, { status: newStatus });
        setPrescription({ ...prescription, status: newStatus });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Prescription Details</h1>
                            <p className="text-gray-600">ID: {prescription.id}</p>
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {prescription.status.toUpperCase()}
                    </span>
                </div>

                {/* Farmer & Employee Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Farmer Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Farmer Information</h3>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700"><span className="font-semibold">Name:</span> {prescription.farmerName}</p>
                            {prescription.farmerVillage && (
                                <p className="text-gray-700"><span className="font-semibold">Village:</span> {prescription.farmerVillage}</p>
                            )}
                            {farmer && farmer.phone && (
                                <p className="text-gray-700"><span className="font-semibold">Phone:</span> {farmer.phone}</p>
                            )}
                            {farmer && farmer.location && (
                                <p className="text-gray-700">
                                    <span className="font-semibold">Location:</span> {farmer.location.lat.toFixed(4)}, {farmer.location.lng.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Created By</h3>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700"><span className="font-semibold">Employee:</span> {prescription.employeeName}</p>
                            <p className="text-gray-700"><span className="font-semibold">Created:</span> {new Date(prescription.createdAt).toLocaleString()}</p>
                            <p className="text-gray-700"><span className="font-semibold">Last Updated:</span> {new Date(prescription.updatedAt).toLocaleString()}</p>
                            {employee && employee.phone && (
                                <p className="text-gray-700"><span className="font-semibold">Contact:</span> {employee.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Products & Dosage
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size/Pack</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {prescription.products.map((product, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-800 font-medium">{product.productName}</td>
                                        <td className="px-4 py-3 text-gray-700">{product.quantity}</td>
                                        <td className="px-4 py-3 text-gray-700">{product.unit}</td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">{product.dosage || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">{product.size || '-'}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">
                                            {product.price ? `₹${product.price}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                            {product.price ? `₹${(product.price * product.quantity).toFixed(2)}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-right font-bold text-gray-800">Grand Total:</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">₹{totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Notes Section */}
                {prescription.notes && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Additional Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{prescription.notes}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-md p-6 flex flex-wrap gap-4">
                    <h3 className="w-full text-lg font-bold text-gray-800 mb-2">Actions</h3>
                    
                    {/* Status Change Buttons */}
                    {prescription.status === 'active' && (
                        <button
                            onClick={() => handleStatusChange('completed')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Completed
                        </button>
                    )}
                    
                    {prescription.status === 'completed' && (
                        <button
                            onClick={() => handleStatusChange('active')}
                            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Reactivate
                        </button>
                    )}

                    <button
                        onClick={() => router.push(`/admin/prescriptions/edit/${prescription.id}`)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}
