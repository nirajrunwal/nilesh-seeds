'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, TrendingUp, Gift, History } from 'lucide-react';
import { LoyaltyService, LoyaltyTransaction } from '@/services/loyaltyService';

export default function FarmerLoyaltyPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);

    useEffect(() => {
        if (user?.role === 'farmer') {
            // Initialize if needed
            LoyaltyService.initializeFarmer(user.id, user.name);

            // Load data
            const loyalty = LoyaltyService.getFarmerLoyalty(user.id);
            setBalance(loyalty?.totalPoints || 0);
            setTransactions(LoyaltyService.getTransactionHistory(user.id, 50));
        }
    }, [user]);

    if (user?.role !== 'farmer') {
        return <div className="p-4">Access denied</div>;
    }

    const earnedTotal = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    const redeemedTotal = Math.abs(transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + t.points, 0));

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <button onClick={() => router.back()} className="mb-4 rounded-full p-2 hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                </button>

                <div className="text-center">
                    <Award className="mx-auto h-16 w-16 mb-4" />
                    <h1 className="text-3xl font-bold">Loyalty Points</h1>
                    <p className="text-purple-100 mt-2">वफादारी अंक</p>
                </div>

                {/* Balance Card */}
                <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <p className="text-purple-100 text-sm">Current Balance</p>
                    <p className="text-5xl font-bold mt-2">{balance}</p>
                    <p className="text-purple-100 text-lg">points</p>
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Earned</p>
                            <p className="text-2xl font-bold text-green-600">{earnedTotal}</p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Redeemed</p>
                            <p className="text-2xl font-bold text-orange-600">{redeemedTotal}</p>
                        </div>
                        <Gift className="h-10 w-10 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                            <Award className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400 mt-1">Start earning points with purchases!</p>
                        </div>
                    ) : (
                        transactions.map((txn) => (
                            <div key={txn.id} className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${txn.type === 'earned' ? 'bg-green-100 text-green-800' :
                                                    txn.type === 'redeemed' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {txn.type === 'earned' ? '+ ' : '- '}
                                                {Math.abs(txn.points)} pts
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(txn.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 mt-2">{txn.reason}</p>
                                        <p className="text-xs text-gray-500 mt-1">By: {txn.adminName}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Redemption Info */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-2">How to Use Points</h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                        <li>• Earn points with every purchase</li>
                        <li>• Redeem points for discounts on your next bill</li>
                        <li>• 1 point = ₹1 discount</li>
                        <li>• Contact admin to redeem your points</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
