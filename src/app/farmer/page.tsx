'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LocationTracker from '@/components/LocationTracker';
import { MockBackend } from '@/lib/mockData';
import { WeatherService, WeatherDetails } from '@/services/weatherService';
import { CloudSun, MessageCircle, Video, Phone, Notebook, LogOut, Settings, Menu, X, Globe, User as UserIcon, Wind, Droplets, CloudRain, Calendar, Award, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDashboard() {
    const { user, logout } = useAuth();
    const { t, setLanguage } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [weatherModalOpen, setWeatherModalOpen] = useState(false);
    const [weatherData, setWeatherData] = useState<WeatherDetails | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    if (!user) return null;

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const count = MockBackend.getUnreadCount(user.id);
            setUnreadCount(count);
        }, 1000);
        return () => clearInterval(interval);
    }, [user.id]);

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
        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const tiles = [
        { name: t('weather'), icon: CloudSun, color: 'bg-blue-100 text-blue-600', href: '#weather' },
        {
            name: t('chat'),
            icon: MessageCircle,
            color: 'bg-green-100 text-green-600',
            href: `/chat/admin`,
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        { name: 'Loyalty Points', icon: Award, color: 'bg-yellow-100 text-yellow-600', href: '/farmer/loyalty' },
        { name: 'Support', icon: HelpCircle, color: 'bg-red-100 text-red-600', href: '/farmer/queries' },
    ];

    const openLedger = () => {
        if (user.ledgerLink) {
            window.open(user.ledgerLink, '_blank');
        } else {
            alert('Ledger link not assigned yet. Please contact Admin.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative overflow-x-hidden">
            <LocationTracker />

            {/* Header */}
            <header className="bg-green-600 p-4 text-white shadow-md z-10 sticky top-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Nilesh Seeds</h1>
                        <p className="text-xs opacity-90">{t('welcome')}, {user.name}</p>
                    </div>
                    <button onClick={() => setMenuOpen(true)} className="p-2 -mr-2 rounded-full hover:bg-white/20">
                        <Menu className="h-7 w-7" />
                    </button>
                </div>
            </header>

            {/* Sidebar / Hamburger Menu */}
            {menuOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform translate-x-0">
                        <div className="h-full flex flex-col">
                            <div className="p-5 bg-green-600 text-white flex justify-between items-center">
                                <h2 className="font-bold text-lg">{t('menu')}</h2>
                                <button onClick={() => setMenuOpen(false)}><X className="h-6 w-6" /></button>
                            </div>

                            <div className="p-4 flex flex-col flex-1 gap-2">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 text-xl font-bold rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 leading-tight">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.phone}</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
                                        <UserIcon className="h-5 w-5 text-gray-500" /> {t('profile')}
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
                                        <Settings className="h-5 w-5 text-gray-500" /> {t('settings')}
                                    </Link>

                                    {/* Language Options */}
                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                                            <Globe className="h-5 w-5 text-gray-500" /> {t('language')}
                                        </div>
                                        <div className="flex gap-2 pl-7">
                                            <button onClick={() => setLanguage('hi')} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hindi</button>
                                            <button onClick={() => setLanguage('en')} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">English</button>
                                            <button onClick={() => setLanguage('mr')} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Marathi</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button onClick={logout} className="flex w-full items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                                    <LogOut className="h-5 w-5" /> {t('logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Grid */}
            <main className="p-4 space-y-6">

                {/* Weather Preview - Real-time */}
                <div
                    onClick={() => setWeatherModalOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">{t('currentLocation')}</p>
                            <h2 className="text-3xl font-bold">
                                {weatherData?.current ? `${weatherData.current.temperature}°C` : 'Loading...'}
                            </h2>
                            <p className="font-medium">
                                {weatherData?.current?.description || t('partlyCloudy')}
                            </p>
                            {weatherData?.current && (
                                <div className="flex gap-4 mt-2 text-sm opacity-90">
                                    <div className="flex items-center gap-1">
                                        <Wind className="h-4 w-4" />
                                        {weatherData.current.windSpeed} m/s
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Droplets className="h-4 w-4" />
                                        {weatherData.current.humidity}%
                                    </div>
                                </div>
                            )}
                        </div>
                        <CloudSun className="h-12 w-12" />
                    </div>
                    <p className="text-xs mt-2 opacity-75">Tap for details →</p>
                </div>

                {/* Weather Detail Modal */}
                {weatherModalOpen && weatherData && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setWeatherModalOpen(false)} />
                        <div className="fixed inset-x-4 top-20 bottom-20 bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-400 p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold">Weather Details</h3>
                                    <button onClick={() => setWeatherModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Current Weather */}
                                <div>
                                    <h4 className="font-bold text-lg mb-3">Current Conditions</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Temperature</p>
                                            <p className="text-xl font-bold">{weatherData.current.temperature}°C</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Feels Like</p>
                                            <p className="text-xl font-bold">{weatherData.current.feelsLike}°C</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Humidity</p>
                                            <p className="text-xl font-bold">{weatherData.current.humidity}%</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Wind Speed</p>
                                            <p className="text-xl font-bold">{weatherData.current.windSpeed} m/s</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {weatherData.alerts.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-lg mb-3">Weather Alerts</h4>
                                        <div className="space-y-2">
                                            {weatherData.alerts.map((alert, idx) => (
                                                <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                                                    <p className="text-sm text-orange-900">{alert}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 7-Day Forecast */}
                                {weatherData.forecast.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            7-Day Forecast
                                        </h4>
                                        <div className="space-y-2">
                                            {weatherData.forecast.map((day, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{day.date}</p>
                                                        <p className="text-sm text-gray-600">{day.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1 text-blue-600">
                                                            <CloudRain className="h-4 w-4" />
                                                            <span className="text-sm">{day.precipitation}%</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold">{day.tempMax}°</span>
                                                            <span className="text-gray-500"> / {day.tempMin}°</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Farming Suggestions */}
                                {weatherData.farmingSuggestions.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-lg mb-3">Farming Suggestions</h4>
                                        <div className="space-y-2">
                                            {weatherData.farmingSuggestions.map((suggestion, idx) => (
                                                <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                                    <p className="text-sm text-green-900">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Action Tiles */}
                <div className="grid grid-cols-2 gap-4">
                    {tiles.map((tile) => (
                        <Link
                            key={tile.name}
                            href={tile.href}
                            className={`relative aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl p-4 shadow-sm transition-transform active:scale-95 ${tile.color} bg-white`}
                        >
                            {tile.badge && (
                                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md animate-pulse">
                                    {tile.badge}
                                </div>
                            )}
                            <tile.icon className="h-8 w-8" />
                            <span className="font-semibold text-sm text-center leading-tight">{tile.name}</span>
                        </Link>
                    ))}

                    {/* Ledger Tile Special Case */}
                    <button
                        onClick={openLedger}
                        className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-transform active:scale-95 border-2 border-yellow-100"
                    >
                        <Notebook className="h-8 w-8 text-yellow-600" />
                        <span className="font-semibold text-sm text-gray-700">{t('ledger')}</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
