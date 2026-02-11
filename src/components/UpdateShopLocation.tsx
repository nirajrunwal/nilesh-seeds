'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Save, X, Check } from 'lucide-react';

export default function UpdateShopLocation({ onClose, onSave }: { onClose: () => void; onSave: (lat: number, lng: number) => void }) {
    const [latitude, setLatitude] = useState('21.0447');
    const [longitude, setLongitude] = useState('75.7846');
    const [address, setAddress] = useState('Bhusawal, Maharashtra 425201');

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toFixed(6));
                setLongitude(position.coords.longitude.toFixed(6));
            },
            (error) => {
                alert('Error getting location: ' + error.message);
            }
        );
    };

    const handleSave = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid coordinates');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Coordinates out of range');
            return;
        }

        // Save to localStorage
        localStorage.setItem('ns_shop_location', JSON.stringify({ lat, lng, address }));
        onSave(lat, lng);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="h-6 w-6" />
                            Update Shop Location
                        </h2>
                        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                        </label>
                        <input
                            type="text"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="21.0447"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                        </label>
                        <input
                            type="text"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="75.7846"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address (Optional)
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Shop address"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <button
                        onClick={handleGetCurrentLocation}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
                    >
                        <MapPin className="h-4 w-4" />
                        Use Current Location
                    </button>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            <strong>Preview:</strong> {latitude}, {longitude}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            This will update the shop marker on the map
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                            <Check className="h-4 w-4" />
                            Save Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
