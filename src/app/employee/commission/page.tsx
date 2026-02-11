'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmployeeService, Employee } from '@/services/employeeService';
import { ArrowLeft, Award, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeCommissionPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/');
            return;
        }

        const emp = EmployeeService.getEmployee(user.id);
        if (!emp) {
            alert('Employee data not found');
            router.push('/');
            return;
        }

        setEmployee(emp);
        loadTransactions();

        const interval = setInterval(loadTransactions, 5000);
        return () => clearInterval(interval);
    }, [user, router]);

    const loadTransactions = () => {
        if (user) {
            const history = EmployeeService.getEmployeeCommissionHistory(user.id);
            setTransactions(history);
        }
    };

    if (!employee) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/employee" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-indigo-700">My Commission Points</h1>
                </div>
            </div>

            {/* Commission Balance */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="h-8 w-8" />
                    <h2 className="text-lg font-medium opacity-90">Total Commission</h2>
                </div>
                <p className="text-5xl font-bold">₹{employee.commissionPoints.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-2">
                    Keep earning commission by creating prescriptions and helping farmers!
                </p>
            </div>

            {/* Transaction History */}
            <div className="flex-1 overflow-auto p-6">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Transaction History
                    </h3>
                    <div className="space-y-3">
                        {transactions.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No transactions yet. Start creating prescriptions to earn points!
                            </p>
                        )}
                        {transactions.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {transaction.type === 'add' ? (
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                                        )}
                                        <p className={`font-semibold ${transaction.type === 'add' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {transaction.type === 'add' ? '+' : '-'}{transaction.points} points
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600">{transaction.reason}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(transaction.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Balance</p>
                                    <p className="text-lg font-bold text-gray-900">{transaction.balance}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
