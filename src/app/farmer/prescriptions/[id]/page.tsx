'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrescriptionService, Prescription } from '@/services/prescriptionService';
import { useLanguage } from '@/context/LanguageContext';

export default function FarmerPrescriptionDetail() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        if (id) {
            const presc = PrescriptionService.getPrescription(id);
            setPrescription(presc);
            setLoading(false);
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700 text-lg">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <p className="text-xl text-gray-700 mb-4">{t('prescriptionDetails')} {t('notFound')}</p>
                    <button
                        onClick={() => router.push('/farmer/prescriptions')}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-lg font-semibold"
                    >
                        {t('back')}
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = prescription.products.reduce((sum, item) => {
        return sum + ((item.price || 0) * item.quantity);
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 hover:bg-white rounded-xl transition-colors shadow-md bg-white/50"
                    >
                        <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{t('prescriptionDetails')}</h1>
                        <p className="text-gray-600 text-sm mt-1">{new Date(prescription.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}</p>
                    </div>

                    {/* Status Badge - Large for visibility */}
                    <span className={`px-4 py-2 rounded-full text-base font-bold ${prescription.status === 'active' ? 'bg-green-500 text-white' :
                            prescription.status === 'completed' ? 'bg-blue-500 text-white' :
                                'bg-gray-400 text-white'
                        }`}>
                        {prescription.status.toUpperCase()}
                    </span>
                </div>

                {/* Created By Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{t('createdBy')}</h3>
                            <p className="text-gray-600">{prescription.employeeName}</p>
                        </div>
                    </div>
                </div>

                {/* Products Section - Mobile Optimized */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {t('productName')}
                    </h3>

                    {/* Product Cards - Better for mobile */}
                    <div className="space-y-4">
                        {prescription.products.map((product, index) => (
                            <div key={index} className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 transition-colors bg-gradient-to-br from-white to-gray-50">
                                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">{index + 1}</span>
                                    {product.productName}
                                </h4>

                                <div className="grid grid-cols-2 gap-3 text-base">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-gray-600 text-sm mb-1">{t('quantity')}</p>
                                        <p className="font-bold text-gray-800 text-lg">{product.quantity} {product.unit}</p>
                                    </div>

                                    {product.dosage && (
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">{t('dosage')}</p>
                                            <p className="font-semibold text-gray-800">{product.dosage}</p>
                                        </div>
                                    )}

                                    {product.size && (
                                        <div className="bg-amber-50 p-3 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">{t('size')}</p>
                                            <p className="font-semibold text-gray-800">{product.size}</p>
                                        </div>
                                    )}

                                    {product.price && (
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">{t('price')}</p>
                                            <p className="font-bold text-green-700 text-lg">₹{product.price}</p>
                                        </div>
                                    )}
                                </div>

                                {product.instructions && (
                                    <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                        <p className="text-sm text-gray-600 mb-1 font-semibold">{t('instructions')}:</p>
                                        <p className="text-gray-800 leading-relaxed">{product.instructions}</p>
                                    </div>
                                )}

                                {product.price && (
                                    <div className="mt-3 pt-3 border-t-2 border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-semibold">{t('total')}:</span>
                                            <span className="text-xl font-bold text-green-600">₹{(product.price * product.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Grand Total */}
                    {totalAmount > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold">{t('total')}:</span>
                                <span className="text-3xl font-bold">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                {prescription.notes && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {t('notes')}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed bg-blue-50 p-4 rounded-xl">{prescription.notes}</p>
                    </div>
                )}

                {/* Action Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <button
                        onClick={() => window.print()}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-lg font-bold flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        {t('save')} / Print
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                    }
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
