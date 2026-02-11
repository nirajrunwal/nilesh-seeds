
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockBackend, LocationData } from '@/lib/mockData';

// Shop Coordinates - Nilesh Seeds, Bhusawal, Maharashtra 425201
// Source: https://maps.app.goo.gl/UtfRCGDX9wqDoyaQ9
const SHOP_LAT = 21.0447;
const SHOP_LNG = 75.7846;
const ALERT_RADIUS_METERS = 100;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default function LocationTracker() {
    const { user } = useAuth();
    const [permission, setPermission] = useState<PermissionState | 'unknown'>('unknown');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'farmer') return;

        if (!('geolocation' in navigator)) {
            setError('Geolocation not supported');
            return;
        }

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // 1. Send update to Backend
                const locData: LocationData = {
                    userId: user.id,
                    lat: latitude,
                    lng: longitude,
                    timestamp: new Date().toISOString()
                };
                MockBackend.updateLocation(locData);

                // 2. Check Proximity
                const distance = calculateDistance(latitude, longitude, SHOP_LAT, SHOP_LNG);
                console.log(`Distance to shop: ${distance.toFixed(1)}m`);

                if (distance <= ALERT_RADIUS_METERS) {
                    // Notify Backend
                    MockBackend.addAlert({
                        id: Date.now().toString(),
                        userId: user.id,
                        userName: user.name,
                        village: user.village || 'Unknown',
                        distance: distance,
                        timestamp: new Date().toISOString(),
                        acknowledged: false
                    });

                    // Play sound on Farmer device (Optional feedback)
                    // const audio = new Audio('/notification.mp3');
                    // audio.play().catch(e => console.log('Audio play failed', e));
                }
            },
            (err) => {
                console.error('Location Error:', err.message || 'Unknown error');
                setError(err.message || 'Location access denied');
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [user]);

    if (!user || user.role !== 'farmer') return null;

    return (
        <div className="hidden">
            {/* Background worker - invisible UI */}
        </div>
    );
}
