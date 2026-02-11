
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MockBackend, LocationData, User } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix leaflet icon issue in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Shop Icon
const shopIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Temporary pin icon for shop location update
const tempPinIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Employee icon (indigo/violet)
const employeeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick, isUpdating }: { onMapClick: (lat: number, lng: number) => void; isUpdating: boolean }) {
    useMapEvents({
        click(e) {
            if (isUpdating) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

interface MapComponentProps {
    searchFarmer?: string | null;
    onUpdateShopLocation?: (lat: number, lng: number) => void;
}

export default function MapComponent({ searchFarmer, onUpdateShopLocation }: MapComponentProps = {}) {
    const { user } = useAuth();
    const [farmers, setFarmers] = useState<User[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [shopLocation, setShopLocation] = useState({ lat: 21.0447, lng: 75.7846, address: 'Bhusawal, Maharashtra 425201' });
    const [isUpdatingShop, setIsUpdatingShop] = useState(false);
    const [tempShopPin, setTempShopPin] = useState<{ lat: number; lng: number } | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([21.0447, 75.7846]);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        const updateData = () => {
            setFarmers(MockBackend.getUsers().filter(u => u.role === 'farmer'));
            setLocations(MockBackend.getAllLocations());

            // Load employees
            if (typeof window !== 'undefined') {
                try {
                    const { EmployeeService } = require('@/services/employeeService');
                    setEmployees(EmployeeService.getAllEmployees().filter((e: any) => e.status !== 'deleted'));
                } catch (e) {
                    // Employee service not available
                }
            }

            // Load shop location from localStorage
            const stored = localStorage.getItem('ns_shop_location');
            if (stored) {
                const parsed = JSON.parse(stored);
                setShopLocation(parsed);
                setMapCenter([parsed.lat, parsed.lng]);
            }
        };
        updateData();
        const interval = setInterval(updateData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Handle farmer search - pan to farmer location
    useEffect(() => {
        if (searchFarmer && searchFarmer.trim()) {
            const matchedFarmer = farmers.find(f =>
                f.name.toLowerCase().includes(searchFarmer.toLowerCase())
            );
            if (matchedFarmer) {
                const farmerLocation = locations.find(l => l.userId === matchedFarmer.id);
                if (farmerLocation) {
                    setMapCenter([farmerLocation.lat, farmerLocation.lng]);
                    setMapKey(prev => prev + 1); // Force map to re-center
                }
            }
        }
    }, [searchFarmer, farmers, locations]);

    const getFarmerName = (id: string) => farmers.find(f => f.id === id)?.name || 'Unknown Farmer';

    const handleMapClick = (lat: number, lng: number) => {
        setTempShopPin({ lat, lng });
    };

    const confirmShopLocation = () => {
        if (tempShopPin) {
            const newLocation = {
                lat: tempShopPin.lat,
                lng: tempShopPin.lng,
                address: shopLocation.address // Keep existing address or update separately
            };
            localStorage.setItem('ns_shop_location', JSON.stringify(newLocation));
            setShopLocation(newLocation);
            setTempShopPin(null);
            setIsUpdatingShop(false);
            if (onUpdateShopLocation) {
                onUpdateShopLocation(tempShopPin.lat, tempShopPin.lng);
            }
            alert('Shop location updated successfully!');
        }
    };

    const cancelShopUpdate = () => {
        setTempShopPin(null);
        setIsUpdatingShop(false);
    };

    return (
        <div className="relative w-full h-full">
            {/* Update Shop Location Button - Admin Only */}
            {user?.role === 'admin' && (
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    {!isUpdatingShop ? (
                        <button
                            onClick={() => setIsUpdatingShop(true)}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                        >
                            <MapPin className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-gray-700">Update Shop Location</span>
                        </button>
                    ) : (
                        <div className="bg-white p-4 rounded-lg shadow-xl">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Click on map to set new location</p>
                            {tempShopPin && (
                                <div className="mb-3 text-xs text-gray-600">
                                    <p>Lat: {tempShopPin.lat.toFixed(6)}</p>
                                    <p>Lng: {tempShopPin.lng.toFixed(6)}</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={confirmShopLocation}
                                    disabled={!tempShopPin}
                                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={cancelShopUpdate}
                                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={searchFarmer ? 15 : 13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onMapClick={handleMapClick} isUpdating={isUpdatingShop} />

                {/* Shop Marker */}
                <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon}>
                    <Popup>
                        <b>Nilesh Seeds (Shop)</b><br />{shopLocation.address}
                    </Popup>
                </Marker>

                {/* Temporary Shop Pin (gold marker) */}
                {tempShopPin && (
                    <Marker position={[tempShopPin.lat, tempShopPin.lng]} icon={tempPinIcon}>
                        <Popup>
                            <b>New Shop Location</b><br />
                            Click "Confirm" to update
                        </Popup>
                    </Marker>
                )}

                {/* Farmer Markers (Green) */}
                {locations.map((loc) => (
                    <Marker key={loc.userId} position={[loc.lat, loc.lng]} icon={icon}>
                        <Popup>
                            <b>{getFarmerName(loc.userId)}</b><br />
                            Role: Farmer<br />
                            Last seen: {new Date(loc.timestamp).toLocaleTimeString()}
                        </Popup>
                    </Marker>
                ))}

                {/* Employee Markers (Violet/Indigo) */}
                {employees.map((employee) => {
                    // Get employee location from locations array (assuming they're tracked similarly)
                    const empLocation = locations.find(l => l.userId === employee.id);
                    if (!empLocation) return null;

                    return (
                        <Marker key={employee.id} position={[empLocation.lat, empLocation.lng]} icon={employeeIcon}>
                            <Popup>
                                <b>{employee.name}</b><br />
                                Role: Employee<br />
                                Phone: {employee.phone}<br />
                                Last seen: {new Date(empLocation.timestamp).toLocaleTimeString()}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Map Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span>Shop Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Farmers ({locations.filter(l => {
                            const user = farmers.find(f => f.id === l.userId);
                            return user?.role === 'farmer';
                        }).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span>Employees ({employees.filter(e => locations.some(l => l.userId === e.id)).length})</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
