'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SupabaseService } from '@/services/supabaseService';
import { MockBackend, User, LocationData, ProximityAlert } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Search, Edit, Notebook, LogOut, Globe, Settings as SettingsIcon, UserPlus, Award, Ban, Trash2, AlertTriangle, BarChart3, HelpCircle, Send, Code, Key, Menu, X, Users, MessageCircle, Map as MapIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CreateFarmerModal from '@/components/CreateFarmerModal';
import PrescriptionWidget from '@/components/PrescriptionWidget';
import { LoyaltyService } from '@/services/loyaltyService';

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
    const [totalLoyalty, setTotalLoyalty] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const allUsers = await SupabaseService.getUsers();
            setFarmers(allUsers.filter(u => u.role === 'farmer'));
            setLocations(await SupabaseService.getAllLocations());

            const currentAlerts = MockBackend.getAlerts();
            const newAlerts = currentAlerts.filter(a => !a.acknowledged);

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
        };

        const interval = setInterval(fetchData, 10000); 

        // Initial setup
        fetchData();

        // Get total loyalty across all
        const allLoyalty = LoyaltyService.getAllLoyalty();
        setTotalLoyalty(allLoyalty.reduce((acc, curr) => acc + curr.totalPoints, 0));

        return () => clearInterval(interval);
    }, [alerts.length]);

    const handleAcknowledge = (id: string) => {
        MockBackend.acknowledgeAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const filteredFarmers = farmers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.phone.includes(searchTerm) || (f.village && f.village.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getLocationStatus = (userId: string) => {
        const loc = locations.find(l => l.userId === userId);
        if (!loc) return 'Unknown';
        const diff = new Date().getTime() - new Date(loc.timestamp).getTime();
        return diff < 5 * 60 * 1000 ? t('live') : t('offline');
    };

    const getFarmerNote = (userId: string) => {
        return farmers.find(f => f.id === userId)?.adminNotes || 'No notes found.';
    };

    const handleBlockFarmer = async (farmer: User) => {
        const newStatus: 'active' | 'blocked' = farmer.status === 'active' ? 'blocked' : 'active';
        const updatedFarmer: User = { ...farmer, status: newStatus };
        await SupabaseService.updateUser(updatedFarmer);
        setFarmers(prev => prev.map(f => f.id === farmer.id ? updatedFarmer : f));
        setFarmerToBlock(null);
    };

    const handleDeleteFarmer = async (farmer: User) => {
        const updatedFarmer: User = { ...farmer, status: 'deleted' };
        await SupabaseService.updateUser(updatedFarmer);
        const updatedList = farmers.filter(f => f.id !== farmer.id);
        setFarmers(updatedList);
        setFarmerToDelete(null);
        alert(`${farmer.name} has been deleted successfully`);
    };

    return (
        <div className="flex h-screen flex-col bg-[#F3F6F8] font-sans text-gray-800 overflow-hidden">
            {/* Alerts Overlay */}
            {alerts.length > 0 && (
                <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
                    {alerts.map(alert => (
                        <div key={alert.id} className="w-80 animate-bounce rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-5 text-white shadow-2xl shadow-red-500/40 border border-red-400">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-extrabold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Proximity Alert!</h3>
                                <button onClick={() => handleAcknowledge(alert.id)} className="text-white hover:bg-white/20 p-1 rounded-full backdrop-blur-sm transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="mt-1 text-sm font-semibold">{alert.userName} is nearby <span className="text-red-100">({Math.round(alert.distance)}m)</span></p>
                            <p className="text-xs font-medium opacity-80 mt-1">Village: {alert.village}</p>
                            <div className="mt-3 text-xs bg-black/20 p-2.5 rounded-lg border border-white/10 shadow-inner">
                                <strong className="text-red-100">Admin Note:</strong> {getFarmerNote(alert.userId)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Advanced Admin Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-xl shadow-md flex items-center justify-center">
                        <Users className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">{t('adminDashboard')}</h1>
                        <p className="text-xs text-gray-400 font-medium">System Overview & Management</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 backdrop-blur-md shadow-sm"
                >
                    <Menu className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Hamburger Menu Overlay */}
            {showMenu && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowMenu(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-80 bg-[#FAFCFB] shadow-2xl overflow-y-auto flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shrink-0 relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-10"><Code className="w-40 h-40"/></div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h2 className="text-2xl font-black shrink-0 tracking-tight">Admin Menu</h2>
                                <button onClick={() => setShowMenu(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10 backdrop-blur-md">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm font-medium text-gray-300 relative z-10">System Settings & Tools</p>
                        </div>

                        <div className="p-5 flex-1 space-y-5">
                            {/* Language Section */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                                    <Globe className="h-5 w-5 text-blue-500" /> {t('language')}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => { setLanguage('en'); setShowMenu(false); }} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold ${language === 'en' ? 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                                        <span className="text-xl drop-shadow-sm">🇬🇧</span> English
                                    </button>
                                    <button onClick={() => { setLanguage('hi'); setShowMenu(false); }} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold ${language === 'hi' ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                                        <span className="text-xl drop-shadow-sm">🇮🇳</span> हिंदी (Hindi)
                                    </button>
                                    <button onClick={() => { setLanguage('mr'); setShowMenu(false); }} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold ${language === 'mr' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                                        <span className="text-xl drop-shadow-sm">🇮🇳</span> मराठी (Marathi)
                                    </button>
                                </div>
                            </div>
                            
                            {/* Detailed Setup link group */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                                    <SettingsIcon className="h-5 w-5 text-gray-500" /> Admin Options
                                </div>
                                <Link href="/admin/assignments" className="flex items-center gap-4 p-3 font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all" onClick={() => setShowMenu(false)}>
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Users className="w-4 h-4"/></div> Farmer Assignments
                                </Link>
                                <Link href="/admin/developer" className="flex items-center gap-4 p-3 font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all mt-1" onClick={() => setShowMenu(false)}>
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Code className="w-4 h-4"/></div> Developer Tools
                                </Link>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-200 bg-gray-50 shrink-0">
                            <button
                                onClick={() => { if (confirm('Are you sure you want to logout?')) { logout(); setShowMenu(false); } }}
                                className="w-full flex justify-center items-center gap-3 p-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold shadow-sm"
                            >
                                <LogOut className="h-5 w-5" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main scrollable area */}
            <div className="flex-1 overflow-auto">
                {/* Advanced Action Tiles */}
                <div className="px-6 py-6 pb-2">
                    {/* Top Stats Overview Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/60 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex justify-center items-center border border-green-100"><Users className="text-green-600 w-6 h-6"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Farmers</p><p className="text-2xl font-black text-gray-800">{farmers.length}</p></div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/60 flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => window.location.href='/admin/loyalty'}>
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex justify-center items-center border border-amber-100"><Award className="text-amber-500 w-6 h-6"/></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tot. Loyalty</p><p className="text-2xl font-black text-gray-800">{totalLoyalty}</p></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        <button onClick={() => setShowCreateModal(true)} className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><UserPlus className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">New Farmer</span>
                        </button>
                        <Link href="/admin/analytics" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><BarChart3 className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Analytics</span>
                        </Link>
                        <Link href="/admin/queries" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><HelpCircle className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Queries</span>
                        </Link>
                        <Link href="/admin/broadcast" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Send className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Broadcast</span>
                        </Link>
                        <Link href="/admin/map" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><MapPin className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Map View</span>
                        </Link>
                        <Link href="/admin/loyalty" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Award className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Loyalty</span>
                        </Link>
                        <Link href="/admin/employees" className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Users className="h-6 w-6 text-white drop-shadow-md" /></div>
                            <span className="text-xs font-bold text-gray-700 tracking-tight text-center">Employees</span>
                        </Link>
                    </div>
                </div>

                {/* Search Bar - Advanced UI */}
                <div className="px-6 py-2 sticky top-0 z-20">
                    <div className="relative max-w-2xl mx-auto shadow-md rounded-2xl group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="🔍 Search farmers by name, phone, or village..."
                            className="block w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 font-medium text-[15px] shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column: Farmers List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-black text-gray-800 ml-1 mb-2">Registered Farmers</h2>
                            {filteredFarmers.map((farmer) => {
                                const status = getLocationStatus(farmer.id);
                                return (
                                    <div key={farmer.id} className="relative rounded-[2rem] bg-white p-5 shadow-sm border border-gray-100/50 hover:shadow-xl transition-all overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                                        
                                        <div className="flex items-start justify-between pl-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 font-black text-2xl shadow-inner border border-green-200/50">
                                                    {farmer.name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-lg tracking-tight">{farmer.name}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md"><MapPin className="w-3 h-3"/> {farmer.village || 'No Village'}</p>
                                                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">📞 {farmer.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${status === t('live') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                {status}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-gray-50 pl-2">
                                            {/* Removed Chat/Call -> Replaced with WhatsApp Direct */}
                                            <button 
                                                onClick={() => window.open(`https://wa.me/918208640382?text=Hello%20Admin,%20regarding%20farmer%20${farmer.name}`, '_blank')}
                                                className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-2.5 text-sm font-bold text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-green-400 focus:outline-none"
                                            >
                                                <MessageCircle className="h-4 w-4" /> Message via WhatsApp
                                            </button>
                                            
                                            <button onClick={() => {
                                                    const loc = locations.find(l => l.userId === farmer.id);
                                                    if (loc) window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
                                                    else alert('Location not available for this farmer');
                                            }} className="flex justify-center items-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm" title="Get Directions">
                                                <MapIcon className="h-5 w-5" />
                                            </button>

                                            <button onClick={() => window.open(farmer.ledgerLink || '', '_blank')} title="Ledger" className={`flex justify-center items-center rounded-xl border ${farmer.ledgerLink ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'} p-2.5 shadow-sm transition-colors`}>
                                                <Notebook className="h-5 w-5" />
                                            </button>

                                            <Link href={`/admin/edit/${farmer.id}`} className="flex justify-center items-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                                                <Edit className="h-5 w-5" />
                                            </Link>

                                            <button onClick={() => setFarmerToBlock(farmer)} className={`flex justify-center items-center rounded-xl border shadow-sm p-2.5 transition-colors ${farmer.status === 'blocked' ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'}`} title={farmer.status === 'blocked' ? 'Unblock' : 'Block'}>
                                                <Ban className="h-5 w-5" />
                                            </button>

                                            <button onClick={() => setFarmerToDelete(farmer)} className="flex justify-center items-center rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition-colors shadow-sm" title="Delete">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column: Prescription Widget */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <PrescriptionWidget />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals remain mostly structurally similar but stylized */}
            <CreateFarmerModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={async () => {
                    const allUsers = await SupabaseService.getUsers();
                    setFarmers(allUsers.filter(u => u.role === 'farmer'));
                    setShowCreateModal(false);
                }}
            />

            {farmerToBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={() => setFarmerToBlock(null)}>
                    <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="rounded-2xl bg-orange-100 p-4 shrink-0"><Ban className="h-8 w-8 text-orange-600" /></div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{farmerToBlock.status === 'active' ? 'Block' : 'Unblock'} Farmer</h2>
                        </div>
                        <p className="text-gray-600 mb-8 font-medium">Are you sure you want to {farmerToBlock.status === 'active' ? 'block' : 'unblock'} <strong className="text-gray-900">{farmerToBlock.name}</strong>? {farmerToBlock.status === 'active' && ' They will not be able to login or access the system.'}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setFarmerToBlock(null)} className="flex-1 rounded-xl bg-gray-100 px-4 py-3.5 font-bold text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={() => handleBlockFarmer(farmerToBlock)} className={`flex-1 rounded-xl px-4 py-3.5 font-bold text-white shadow-md transition-all ${farmerToBlock.status === 'active' ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-red-500/30 hover:shadow-lg hover:-translate-y-0.5' : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30 hover:shadow-lg hover:-translate-y-0.5'}`}>
                                {farmerToBlock.status === 'active' ? 'Yes, Block' : 'Yes, Unblock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {farmerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={() => setFarmerToDelete(null)}>
                    <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="rounded-2xl bg-red-100 p-4 shrink-0"><AlertTriangle className="h-8 w-8 text-red-600" /></div>
                            <h2 className="text-2xl font-black text-red-600 tracking-tight">Delete Farmer</h2>
                        </div>
                        <p className="text-gray-600 mb-4 font-medium">Are you sure you want to delete <strong className="text-gray-900">{farmerToDelete.name}</strong>?</p>
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-8 shadow-inner">
                            <p className="text-sm text-red-800 font-bold mb-2">Warning: This action will:</p>
                            <ul className="text-sm text-red-700/80 font-medium list-disc list-inside space-y-1">
                                <li>Remove them from active farmers list</li>
                                <li>Disable their login access</li>
                            </ul>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setFarmerToDelete(null)} className="flex-1 rounded-xl bg-gray-100 px-4 py-3.5 font-bold text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={() => handleDeleteFarmer(farmerToDelete)} className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3.5 font-bold text-white shadow-md shadow-red-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
