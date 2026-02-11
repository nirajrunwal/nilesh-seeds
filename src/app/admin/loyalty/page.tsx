'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, TrendingUp, TrendingDown, Download, Plus, Minus, X } from 'lucide-react';
import { MockBackend } from '@/lib/mockData';
import { LoyaltyService, FarmerLoyalty } from '@/services/loyaltyService';

export default function LoyaltyDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loyaltyData, setLoyaltyData] = useState<FarmerLoyalty[]>([]);
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerLoyalty | null>(null);
    const [actionModal, setActionModal] = useState<'add' | 'redeem' | null>(null);
    const [points, setPoints] = useState('');
    const [reason, setReason] = useState('');

    // Load data
    useState(() => {
        if (user?.role === 'admin') {
            const farmers = MockBackend.getUsers().filter(u => u.role === 'farmer');

            // Initialize loyalty for all farmers
            farmers.forEach(f => {
                LoyaltyService.initializeFarmer(f.id, f.name);
            });

            setLoyaltyData(LoyaltyService.getAllLoyalty());
        }
    });

    const handleAddPoints = () => {
        if (!selectedFarmer || !user) return;

        const pointValue = parseInt(points);
        if (isNaN(pointValue) || pointValue <= 0) return;

        LoyaltyService.addPoints(
            selectedFarmer.farmerId,
            pointValue,
            reason || 'Points added by admin',
            user.id,
            user.name
        );

        setLoyaltyData(LoyaltyService.getAllLoyalty());
        setActionModal(null);
        setPoints('');
        setReason('');
    };

    const handleRedeemPoints = () => {
        if (!selectedFarmer || !user) return;

        const pointValue = parseInt(points);
        if (isNaN(pointValue) || pointValue <= 0) return;

        const success = LoyaltyService.redeemPoints(
            selectedFarmer.farmerId,
            pointValue,
            reason || 'Points redeemed',
            user.id,
            user.name
        );

        if (success) {
            setLoyaltyData(LoyaltyService.getAllLoyalty());
            setActionModal(null);
            setPoints('');
            setReason('');
        } else {
            alert('Insufficient points!');
        }
    };

    const exportCSV = () => {
        const csv = LoyaltyService.exportToCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loyalty-points-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (user?.role !== 'admin') {
        return <div className="p-4">Access denied</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Loyalty Points Dashboard</h1>
                            <p className="text-purple-100 text-sm">Manage farmer rewards</p>
                        </div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30 transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Farmers</p>
                            <p className="text-3xl font-bold text-gray-900">{loyaltyData.length}</p>
                        </div>
                        <Award className="h-12 w-12 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Points Issued</p>
                            <p className="text-3xl font-bold text-green-600">
                                {loyaltyData.reduce((sum, l) => sum + l.totalPoints, 0)}
                            </p>
                        </div>
                        <TrendingUp className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Points/Farmer</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {loyaltyData.length > 0
                                    ? Math.round(loyaltyData.reduce((sum, l) => sum + l.totalPoints, 0) / loyaltyData.length)
                                    : 0
                                }
                            </p>
                        </div>
                        <TrendingDown className="h-12 w-12 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Farmer List */}
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loyaltyData.map((loyalty) => (
                                <tr key={loyalty.farmerId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{loyalty.farmerName}</div>
                                        <div className="text-sm text-gray-500">{loyalty.farmerId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                            {loyalty.totalPoints} pts
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(loyalty.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedFarmer(loyalty);
                                                setActionModal('add');
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedFarmer(loyalty);
                                                setActionModal('redeem');
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 text-sm font-medium"
                                        >
                                            <Minus className="h-4 w-4" />
                                            Redeem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {actionModal && selectedFarmer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">
                                {actionModal === 'add' ? 'Add Points' : 'Redeem Points'}
                            </h3>
                            <button onClick={() => setActionModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Farmer: <span className="font-medium">{selectedFarmer.farmerName}</span>
                            <br />
                            Current Balance: <span className="font-medium text-purple-600">{selectedFarmer.totalPoints} points</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Enter points"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Purchase, discount, etc."
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActionModal(null)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={actionModal === 'add' ? handleAddPoints : handleRedeemPoints}
                                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white ${actionModal === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                                        }`}
                                >
                                    {actionModal === 'add' ? 'Add Points' : 'Redeem Points'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
