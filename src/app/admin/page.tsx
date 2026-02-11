'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockBackend, User, LocationData, ProximityAlert } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, MessageCircle, Video, Search, Edit, Notebook, LogOut, Phone, Globe, Settings as SettingsIcon, UserPlus, Award, Ban, Trash2, AlertTriangle, BarChart3, HelpCircle, Send, Code, Key, Menu, X, Users } from 'lucide-react';
import Link from 'next/link';
import CreateFarmerModal from '@/components/CreateFarmerModal';
import PrescriptionWidget from '@/components/PrescriptionWidget';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [farmers, setFarmers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [alerts, setAlerts] = useState<ProximityAlert[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [farmerToDelete, setFarmerToDelete] = useState<User | null>(null);
    const [farmerToBlock, setFarmerToBlock] = useState<User | null>(null);

    useEffect(() => {
        // Poll for updates (Mock Realtime) - Optimized from 2s to 10s
        const interval = setInterval(() => {
            const allUsers = MockBackend.getUsers().filter(u => u.role === 'farmer');
            setFarmers(allUsers);
            setLocations(MockBackend.getAllLocations());

            // Check for new alerts
            const currentAlerts = MockBackend.getAlerts();
            // Filter only unacknowledged
            const newAlerts = currentAlerts.filter(a => !a.acknowledged);

            // If we have more/new alerts than before, play sound
            if (newAlerts.length > alerts.length) {
                try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.5);
                } catch (e) { console.error('Audio failed', e); }
            }
            setAlerts(newAlerts);

        }, 10000); // Optimized: 2s -> 10s

        return () => clearInterval(interval);
    }, [alerts.length]);

    const handleAcknowledge = (id: string) => {
        MockBackend.acknowledgeAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const filteredFarmers = farmers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLocationStatus = (userId: string) => {
        const loc = locations.find(l => l.userId === userId);
        if (!loc) return 'Unknown';
        // Simple timestamp check (if < 5 mins ago => Online)
        const diff = new Date().getTime() - new Date(loc.timestamp).getTime();
        return diff < 5 * 60 * 1000 ? t('live') : t('offline');
    };

    const getFarmerNote = (userId: string) => {
        return farmers.find(f => f.id === userId)?.adminNotes || 'No notes found.';
    };

    const handleBlockFarmer = (farmer: User) => {
        const newStatus: 'active' | 'blocked' = farmer.status === 'active' ? 'blocked' : 'active';
        const updatedFarmer: User = { ...farmer, status: newStatus };
        MockBackend.updateUser(updatedFarmer);
        setFarmers(prev => prev.map(f => f.id === farmer.id ? updatedFarmer : f));
        setFarmerToBlock(null);
    };

    const handleDeleteFarmer = (farmer: User) => {
        // Soft delete by setting status
        const updatedFarmer: User = { ...farmer, status: 'deleted' };
        MockBackend.updateUser(updatedFarmer);
        // Remove from current view immediately
        const updatedList = farmers.filter(f => f.id !== farmer.id);
        setFarmers(updatedList);
        setFarmerToDelete(null);
        // Show success message
        alert(`${farmer.name} has been deleted successfully`);
    };

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Alerts Overlay */}
            {alerts.length > 0 && (
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                    {alerts.map(alert => (
                        <div key={alert.id} className="w-80 animate-bounce rounded-lg bg-red-600 p-4 text-white shadow-xl">
                            <div className="flex items-start justify-between">
                                <h3 className="font-bold">🚨 Proximity Alert!</h3>
                                <button onClick={() => handleAcknowledge(alert.id)} className="text-white hover:text-gray-200">
                                    X
                                </button>
                            </div>
                            <p className="mt-1 text-sm font-semibold">{alert.userName} is nearby ({Math.round(alert.distance)}m)</p>
                            <p className="text-xs opacity-90">Village: {alert.village}</p>
                            <div className="mt-2 text-xs bg-white/20 p-2 rounded">
                                <strong>Admin Note:</strong> {getFarmerNote(alert.userId)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simplified Admin Header with Hamburger */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <h1 className="text-xl font-bold text-green-700">{t('adminDashboard')}</h1>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Hamburger Menu Overlay - Redesigned */}
            {showMenu && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMenu(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold">Admin Menu</h2>
                                <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-white/20 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-green-100">System Settings & Tools</p>
                        </div>

                        <div className="p-4 space-y-1">
                            {/* Language Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    <Globe className="h-4 w-4" />
                                    <span>Language</span>
                                </div>
                                <button
                                    onClick={() => { setLanguage('en'); setShowMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${language === 'en' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">🇬🇧</span>
                                    <span className="font-medium">English</span>
                                </button>
                                <button
                                    onClick={() => { setLanguage('hi'); setShowMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${language === 'hi' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">🇮🇳</span>
                                    <span className="font-medium">हिंदी (Hindi)</span>
                                </button>
                                <button
                                    onClick={() => { setLanguage('mr'); setShowMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${language === 'mr' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">🇮🇳</span>
                                    <span className="font-medium">मराठी (Marathi)</span>
                                </button>
                            </div>

                            <div className="border-t my-3"></div>

                            {/* Settings Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    <SettingsIcon className="h-4 w-4" />
                                    <span>Settings</span>
                                </div>
                                <Link
                                    href="/settings"
                                    onClick={() => setShowMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                                    <div className="flex-1">
                                        <div className="font-medium">Profile Settings</div>
                                        <div className="text-xs text-gray-500">Update your profile</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/change-password"
                                    onClick={() => setShowMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Key className="h-5 w-5 text-gray-600" />
                                    <div className="flex-1">
                                        <div className="font-medium">Change Password</div>
                                        <div className="text-xs text-gray-500">Update security</div>
                                    </div>
                                </Link>
                            </div>

                            <div className="border-t my-3"></div>

                            {/* Management Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Management</span>
                                </div>
                                <Link
                                    href="/admin/assignments"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="font-semibold">Farmer Assignments</span>
                                </Link>
                            </div>

                            <div className="border-t my-3"></div>

                            {/* Developer Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    <Code className="h-4 w-4" />
                                    <span>Developer</span>
                                </div>
                                <Link
                                    href="/admin/developer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className="font-semibold">Developer Options</span>
                                </Link>
                            </div>

                            <div className="border-t my-3"></div>

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to logout?')) {
                                        logout();
                                        setShowMenu(false);
                                    }
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-semibold">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Tiles */}
            <div className="bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">New Farmer</span>
                    </button>

                    <Link
                        href="/admin/analytics"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Analytics</span>
                    </Link>

                    <Link
                        href="/admin/queries"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Queries</span>
                        {/* Unread badge - will implement */}
                    </Link>

                    <Link
                        href="/admin/broadcast"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Send className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Broadcast</span>
                    </Link>

                    <Link
                        href="/admin/map"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Map View</span>
                    </Link>

                    <Link
                        href="/admin/location-history"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Location History</span>
                    </Link>

                    <Link
                        href="/admin/loyalty"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Loyalty</span>
                    </Link>

                    <Link
                        href="/admin/employees"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Employees</span>
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-white border-t">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search farmers by name, village, or phone..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Farmers */}
                    <div>
                        <div className="space-y-4">
                            {filteredFarmers.map((farmer) => {
                                const status = getLocationStatus(farmer.id);
                                return (
                                    <div key={farmer.id} className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg">
                                                    {farmer.name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                                                    <p className="text-sm text-gray-500">{farmer.village}</p>
                                                </div>
                                            </div>
                                            <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${status === t('live') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {status}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                            <Link href={`/chat/${farmer.id}`} className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                                                <MessageCircle className="h-4 w-4" /> Chat
                                            </Link>
                                            <Link href={`/call/video?target=${farmer.id}`} className="flex justify-center items-center rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 hover:text-purple-600">
                                                <Video className="h-4 w-4" />
                                            </Link>
                                            <Link href={`/call/voice?target=${farmer.id}`} className="flex justify-center items-center rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 hover:text-orange-600">
                                                <Phone className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    const loc = locations.find(l => l.userId === farmer.id);
                                                    if (loc) {
                                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
                                                    } else {
                                                        alert('Location not available for this farmer');
                                                    }
                                                }}
                                                className="flex justify-center items-center rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                                                title="Get Directions"
                                            >
                                                🧭
                                            </button>
                                            <button onClick={() => window.open(farmer.ledgerLink || '', '_blank')} title="Ledger" className={`flex justify-center items-center rounded-lg p-2 ${farmer.ledgerLink ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}>
                                                <Notebook className="h-4 w-4" />
                                            </button>
                                            <Link href={`/admin/edit/${farmer.id}`} className="flex justify-center items-center rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => setFarmerToBlock(farmer)}
                                                className={`flex justify-center items-center rounded-lg p-2 ${farmer.status === 'blocked' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                                                title={farmer.status === 'blocked' ? 'Unblock' : 'Block'}
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setFarmerToDelete(farmer)}
                                                className="flex justify-center items-center rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div >
                                );
                            })}
                        </div >
                    </div >

                    {/* Right Column: Prescription Widget */}
                    < div >
                        <PrescriptionWidget />
                    </div >
                </div >
            </div >

            {/* Create Farmer Modal */}
            < CreateFarmerModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    // Refresh farmer list
                    const allUsers = MockBackend.getUsers().filter(u => u.role === 'farmer');
                    setFarmers(allUsers);
                    setShowCreateModal(false);
                }}
            />

            {/* Block Confirmation Modal */}
            {
                farmerToBlock && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setFarmerToBlock(null)}>
                        <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-full bg-orange-100 p-3">
                                    <Ban className="h-6 w-6 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold">
                                    {farmerToBlock.status === 'active' ? 'Block' : 'Unblock'} Farmer
                                </h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to {farmerToBlock.status === 'active' ? 'block' : 'unblock'} <strong>{farmerToBlock.name}</strong>?
                                {farmerToBlock.status === 'active' && ' They will not be able to login or access the system.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFarmerToBlock(null)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleBlockFarmer(farmerToBlock)}
                                    className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white ${farmerToBlock.status === 'active'
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {farmerToBlock.status === 'active' ? 'Block' : 'Unblock'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                farmerToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setFarmerToDelete(null)}>
                        <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-full bg-red-100 p-3">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-red-600">Delete Farmer</h2>
                            </div>
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete <strong>{farmerToDelete.name}</strong>?
                            </p>
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-6">
                                <p className="text-sm text-red-800">
                                    <strong>Warning:</strong> This action will:
                                </p>
                                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                    <li>Remove them from the active farmers list</li>
                                    <li>Disable their login access</li>
                                    <li>Preserve their data for records</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFarmerToDelete(null)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteFarmer(farmerToDelete)}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                                >
                                    Delete Farmer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
