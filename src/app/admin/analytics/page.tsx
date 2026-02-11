'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Users, MessageSquare, Phone, Award, MapPin, BarChart3 } from 'lucide-react';
import { MockBackend } from '@/lib/mockData';
import { LoyaltyService } from '@/services/loyaltyService';
import { QueryService } from '@/services/queryService';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalFarmers: 0,
        activeFarmers: 0,
        blockedFarmers: 0,
        totalLoyaltyPoints: 0,
        avgPointsPerFarmer: 0,
        openQueries: 0,
        totalQueries: 0,
        todayActivity: 0
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            loadStats();
        }
    }, [user]);

    const loadStats = () => {
        const farmers = MockBackend.getUsers().filter(u => u.role === 'farmer');
        const loyalty = LoyaltyService.getAllLoyalty();
        const queryStats = QueryService.getStats();

        const totalPoints = loyalty.reduce((sum, l) => sum + l.totalPoints, 0);

        setStats({
            totalFarmers: farmers.length,
            activeFarmers: farmers.filter(f => f.status === 'active').length,
            blockedFarmers: farmers.filter(f => f.status === 'blocked').length,
            totalLoyaltyPoints: totalPoints,
            avgPointsPerFarmer: farmers.length > 0 ? Math.round(totalPoints / farmers.length) : 0,
            openQueries: queryStats.open + queryStats.inProgress,
            totalQueries: queryStats.total,
            todayActivity: Math.floor(Math.random() * 20) + 5 // Mock data
        });
    };

    if (user?.role !== 'admin') {
        return <div className="p-4">Access denied</div>;
    }

    const statCards = [
        {
            title: 'Total Farmers',
            value: stats.totalFarmers,
            icon: Users,
            color: 'bg-blue-500',
            change: '+' + stats.activeFarmers + ' active'
        },
        {
            title: 'Loyalty Points',
            value: stats.totalLoyaltyPoints.toLocaleString(),
            icon: Award,
            color: 'bg-purple-500',
            change: stats.avgPointsPerFarmer + ' avg/farmer'
        },
        {
            title: 'Open Queries',
            value: stats.openQueries,
            icon: MessageSquare,
            color: 'bg-orange-500',
            change: stats.totalQueries + ' total'
        },
        {
            title: 'Today\'s Activity',
            value: stats.todayActivity,
            icon: TrendingUp,
            color: 'bg-green-500',
            change: 'interactions'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                            <p className="text-blue-100 text-sm">Business insights & metrics</p>
                        </div>
                    </div>
                    <BarChart3 className="h-8 w-8" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                            </div>
                            <div className={`${stat.color} rounded-lg p-3`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Farmer Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Farmer Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Active</span>
                            </div>
                            <span className="font-semibold">{stats.activeFarmers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-sm text-gray-600">Blocked</span>
                            </div>
                            <span className="font-semibold">{stats.blockedFarmers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Total</span>
                            </div>
                            <span className="font-semibold">{stats.totalFarmers}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/admin/loyalty')}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                        >
                            <span className="font-medium">Manage Loyalty Points</span>
                            <Award className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => router.push('/admin')}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        >
                            <span className="font-medium">View All Farmers</span>
                            <Users className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => router.push('/admin/map')}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                        >
                            <span className="font-medium">Live Location Map</span>
                            <MapPin className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-700">New farmer registration</span>
                            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-700">Loyalty points added</span>
                            <span className="text-xs text-gray-500 ml-auto">3 hours ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-700">New support query</span>
                            <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
