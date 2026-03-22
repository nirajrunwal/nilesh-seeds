'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LocationTracker from '@/components/LocationTracker';
import { WeatherService, WeatherDetails } from '@/services/weatherService';
import { LoyaltyService } from '@/services/loyaltyService';
import { CloudSun, MessageCircle, Notebook, LogOut, Settings, Menu, X, Globe, User as UserIcon, Wind, Droplets, CloudRain, Calendar, Award, HelpCircle, ChevronRight, Sprout } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDashboard() {
    const { user, logout } = useAuth();
    const { t, setLanguage } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [weatherModalOpen, setWeatherModalOpen] = useState(false);
    const [weatherData, setWeatherData] = useState<WeatherDetails | null>(null);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);

    useEffect(() => {
        if (user) {
            const loyalty = LoyaltyService.getFarmerLoyalty(user.id);
            setLoyaltyPoints(loyalty?.totalPoints || 0);
        }
    }, [user]);

    // Fetch weather data
    useEffect(() => {
        const fetchWeather = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const details = await WeatherService.getWeatherDetails(latitude, longitude);
                        setWeatherData(details || WeatherService.getMockWeather());
                    },
                    () => {
                        // Fallback to mock weather if location denied
                        setWeatherData(WeatherService.getMockWeather());
                    }
                );
            } else {
                setWeatherData(WeatherService.getMockWeather());
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!user) return null;

    const tiles = [
        { name: t('weather'), icon: CloudSun, color: 'from-sky-400 to-blue-600 shadow-blue-500/40', href: '#weather', action: () => setWeatherModalOpen(true) },
        {
            name: 'WhatsApp Support',
            icon: MessageCircle,
            color: 'from-emerald-400 to-green-600 shadow-green-500/40',
            href: `https://wa.me/918208640382`,
            action: () => window.open('https://wa.me/918208640382', '_blank')
        },
        { name: 'Loyalty Points', icon: Award, color: 'from-amber-400 to-orange-500 shadow-orange-500/40', href: '/farmer/loyalty', action: null },
        { name: 'Support Tickets', icon: HelpCircle, color: 'from-rose-400 to-red-500 shadow-red-500/40', href: '/farmer/queries', action: null },
    ];

    const openLedger = () => {
        if (user.ledgerLink) {
            window.open(user.ledgerLink, '_blank');
        } else {
            alert('Ledger link not assigned yet. Please contact Admin.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7F6] pb-20 relative overflow-x-hidden font-sans text-gray-800">
            <LocationTracker />

            {/* Advanced Header */}
            <header className="bg-gradient-to-r from-teal-800 to-emerald-700 pt-12 pb-6 px-6 text-white rounded-b-3xl shadow-xl z-10 sticky top-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <Sprout className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">Nilesh Seeds</h1>
                    </div>
                    <button onClick={() => setMenuOpen(true)} className="p-2 backdrop-blur-md bg-white/10 rounded-xl hover:bg-white/20 transition-all shadow-sm">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex flex-col gap-1">
                    <p className="text-emerald-100/80 font-medium text-sm drop-shadow-sm">{t('welcome')} back,</p>
                    <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-md">{user.name}</h2>
                </div>
            </header>

            {/* Enhanced Sidebar / Hamburger Menu */}
            {menuOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out transform translate-x-0 border-l border-white">
                        <div className="h-full flex flex-col">
                            <div className="p-6 bg-gradient-to-r from-teal-800 to-emerald-700 text-white flex justify-between items-center shadow-md">
                                <h2 className="font-bold text-xl">{t('menu')}</h2>
                                <button onClick={() => setMenuOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="p-5 flex flex-col flex-1 gap-4 overflow-y-auto">
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner border border-gray-200/60">
                                    <div className="h-12 w-12 text-xl font-black rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-tight text-lg">{user.name}</p>
                                        <p className="text-xs font-semibold text-gray-500">{user.phone}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    <Link href="/settings" className="flex items-center gap-4 p-3 font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                                        <UserIcon className="h-5 w-5 opacity-70" /> {t('profile')}
                                        <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-4 p-3 font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                                        <Settings className="h-5 w-5 opacity-70" /> {t('settings')}
                                        <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                                    </Link>

                                    {/* Language Options */}
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-2">
                                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                                            <Globe className="h-5 w-5 text-emerald-600" /> {t('language')}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setLanguage('hi')} className="flex-1 text-sm font-semibold bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">Hindi</button>
                                            <button onClick={() => setLanguage('en')} className="flex-1 text-sm font-semibold bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">English</button>
                                            <button onClick={() => setLanguage('mr')} className="flex-1 text-sm font-semibold bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">Marathi</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-200 bg-gray-50/80">
                                <button onClick={logout} className="flex w-full items-center justify-center gap-3 p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold shadow-sm transition-all border border-red-100">
                                    <LogOut className="h-5 w-5" /> {t('logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <main className="p-6 px-5 space-y-6 mt-[-1.5rem] relative z-20">
                
                {/* Loyalty Points Banner */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden flex justify-between items-center group cursor-pointer hover:scale-[1.01] transition-transform">
                    <div className="absolute -right-4 -top-8 opacity-20 transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
                        <Award className="w-32 h-32" />
                    </div>
                    <div className="z-10">
                        <h3 className="text-orange-50 font-medium text-sm mb-1">Your Total Loyalty Points</h3>
                        <p className="text-4xl font-black drop-shadow-md">{loyaltyPoints}</p>
                    </div>
                    <Link href="/farmer/loyalty" className="z-10 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-colors shadow-sm">
                        <ChevronRight className="h-6 w-6 text-white" />
                    </Link>
                </div>

                {/* Weather Preview - Advanced Glass Card */}
                <div
                    onClick={() => setWeatherModalOpen(true)}
                    className="rounded-3xl bg-white p-6 shadow-xl shadow-gray-200/50 cursor-pointer hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
                >
                    <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <CloudSun className="w-48 h-48" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">{t('currentLocation')}</p>
                            <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-sky-400 drop-shadow-sm">
                                {weatherData?.current ? `${weatherData.current.temperature}°` : '--°'}
                            </h2>
                            <p className="font-semibold text-gray-600 mt-1 capitalize text-lg">
                                {weatherData?.current?.description || t('partlyCloudy')}
                            </p>
                            {weatherData?.current && (
                                <div className="flex gap-4 mt-4 text-sm font-semibold text-gray-500">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Wind className="h-4 w-4 text-blue-400" />
                                        {weatherData.current.windSpeed} m/s
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Droplets className="h-4 w-4 text-blue-400" />
                                        {weatherData.current.humidity}%
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-sky-50 flex items-center justify-center shadow-inner">
                            <CloudSun className="h-10 w-10 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Advanced Action Tiles Grid */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 ml-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {tiles.map((tile) => {
                            const Comp = tile.action ? 'button' : Link;
                            return (
                                <Comp
                                    key={tile.name}
                                    href={!tile.action ? tile.href : undefined}
                                    onClick={tile.action ? tile.action : undefined}
                                    className={`relative flex flex-col items-center justify-center gap-4 rounded-[2rem] p-6 shadow-lg bg-gradient-to-br ${tile.color} text-white transition-all hover:scale-105 active:scale-95 group overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                                        <tile.icon className="h-8 w-8 text-white drop-shadow-md" />
                                    </div>
                                    <span className="font-bold text-sm text-center leading-tight drop-shadow-sm">{tile.name}</span>
                                </Comp>
                            );
                        })}

                        {/* Ledger Tile */}
                        <button
                            onClick={openLedger}
                            className="relative flex flex-col items-center justify-center gap-4 rounded-[2rem] p-6 shadow-lg bg-white border border-gray-100 text-gray-800 transition-all hover:scale-105 active:scale-95 group overflow-hidden hover:border-teal-200 hover:shadow-teal-100"
                        >
                            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                                <Notebook className="h-8 w-8 text-teal-600 drop-shadow-sm" />
                            </div>
                            <span className="font-bold text-sm text-center leading-tight">{t('ledger')}</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Weather Detail Modal */}
            {weatherModalOpen && weatherData && (
                <>
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => setWeatherModalOpen(false)} />
                    <div className="fixed inset-x-4 top-20 bottom-16 bg-[#F4F7F6] rounded-[2rem] shadow-2xl z-50 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-blue-600 to-sky-400 p-6 text-white shrink-0 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 opacity-20">
                                <CloudSun className="w-40 h-40" />
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="text-2xl font-black drop-shadow-md">Weather Info</h3>
                                    <p className="text-blue-100 text-sm font-medium mt-1">Detailed 7-day forecast</p>
                                </div>
                                <button onClick={() => setWeatherModalOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors shadow-sm">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-6 flex-1">
                            {/* Current Weather Grid */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Wind className="w-5 h-5 text-blue-500" /> Current Stats
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Temperature</p>
                                        <p className="text-2xl font-black text-gray-800">{weatherData.current.temperature}°C</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Feels Like</p>
                                        <p className="text-2xl font-black text-gray-800">{weatherData.current.feelsLike}°C</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Humidity</p>
                                        <p className="text-2xl font-black text-blue-600">{weatherData.current.humidity}%</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Wind</p>
                                        <p className="text-2xl font-black text-teal-600">{weatherData.current.windSpeed} <span className="text-sm">m/s</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Farming Suggestions */}
                            {weatherData.farmingSuggestions.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Sprout className="w-5 h-5 text-emerald-500" /> Farming Suggestions
                                    </h4>
                                    <div className="space-y-3">
                                        {weatherData.farmingSuggestions.map((suggestion, idx) => (
                                            <div key={idx} className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm flex items-start gap-3">
                                                <div className="bg-emerald-100 p-1.5 rounded-full shrink-0">
                                                    <Sprout className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <p className="text-sm font-semibold text-emerald-900 leading-relaxed">{suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 7-Day Forecast */}
                            {weatherData.forecast.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-indigo-500" /> 7-Day Forecast
                                    </h4>
                                    <div className="space-y-3">
                                        {weatherData.forecast.map((day, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-lg tracking-tight">{day.date}</p>
                                                    <p className="text-xs font-semibold text-gray-500 mt-0.5 capitalize">{day.description}</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                                                        <CloudRain className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-bold text-blue-700">{day.precipitation}%</span>
                                                    </div>
                                                    <div className="text-right flex flex-col">
                                                        <span className="font-black text-gray-800">{day.tempMax}°</span>
                                                        <span className="text-xs font-bold text-gray-400">{day.tempMin}°</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alerts */}
                            {weatherData.alerts.length > 0 && (
                                <div className="pb-4">
                                    <h4 className="font-bold text-gray-800 mb-3 block">⚠️ Alerts</h4>
                                    <div className="space-y-2">
                                        {weatherData.alerts.map((alert, idx) => (
                                            <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm">
                                                <p className="text-sm font-bold text-red-700">{alert}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
