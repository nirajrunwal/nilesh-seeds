'use client';

import { useState, useEffect } from 'react';
import { Camera, Mic, MapPin, Bell, Image as ImageIcon, Users, Check, X } from 'lucide-react';

interface Permission {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    required: boolean;
    granted: boolean;
    permission: 'camera' | 'microphone' | 'geolocation' | 'notifications' | 'storage';
}

export default function PermissionManager({ onComplete }: { onComplete: () => void }) {
    const [permissions, setPermissions] = useState<Permission[]>([
        {
            name: 'Camera',
            description: 'Required for video calls',
            icon: Camera,
            required: false,
            granted: false,
            permission: 'camera'
        },
        {
            name: 'Microphone',
            description: 'Required for voice and video calls',
            icon: Mic,
            required: false,
            granted: false,
            permission: 'microphone'
        },
        {
            name: 'Location',
            description: 'Required for tracking and proximity alerts',
            icon: MapPin,
            required: true,
            granted: false,
            permission: 'geolocation'
        },
        {
            name: 'Notifications',
            description: 'Required for message and call alerts',
            icon: Bell,
            required: true,
            granted: false,
            permission: 'notifications'
        }
    ]);

    const [currentStep, setCurrentStep] = useState(0);
    const [showModal, setShowModal] = useState(true);

    useEffect(() => {
        // Check if permissions were already granted in previous session
        const permissionsGranted = localStorage.getItem('ns_permissions_granted');
        if (permissionsGranted === 'true') {
            setShowModal(false);
            onComplete();
        }
    }, [onComplete]);

    const requestPermission = async (perm: Permission) => {
        try {
            switch (perm.permission) {
                case 'camera':
                case 'microphone': {
                    const constraints: MediaStreamConstraints = {};
                    if (perm.permission === 'camera') constraints.video = true;
                    if (perm.permission === 'microphone') constraints.audio = true;

                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    stream.getTracks().forEach(track => track.stop()); // Stop immediately
                    return true;
                }

                case 'geolocation': {
                    return new Promise<boolean>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                            () => resolve(true),
                            () => resolve(false)
                        );
                    });
                }

                case 'notifications': {
                    if ('Notification' in window) {
                        const result = await Notification.requestPermission();
                        return result === 'granted';
                    }
                    return false;
                }

                default:
                    return false;
            }
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    };

    const handleRequest = async (index: number) => {
        const permission = permissions[index];
        const granted = await requestPermission(permission);

        const updated = [...permissions];
        updated[index] = { ...permission, granted };
        setPermissions(updated);

        if (granted) {
            // Move to next permission
            if (index < permissions.length - 1) {
                setCurrentStep(index + 1);
            } else {
                // All done
                handleComplete();
            }
        }
    };

    const handleSkip = () => {
        const permission = permissions[currentStep];
        if (!permission.required) {
            if (currentStep < permissions.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                handleComplete();
            }
        }
    };

    const handleComplete = () => {
        // Save that permissions dialog was shown
        localStorage.setItem('ns_permissions_granted', 'true');
        setShowModal(false);
        onComplete();

        // Start location tracking if granted
        const locationPerm = permissions.find(p => p.permission === 'geolocation');
        if (locationPerm?.granted) {
            startLocationTracking();
        }
    };

    const startLocationTracking = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    // Store location in localStorage for tracking
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem('ns_current_location', JSON.stringify(locationData));
                },
                (error) => console.error('Location tracking error:', error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 27000
                }
            );
        }
    };

    if (!showModal) return null;

    const currentPermission = permissions[currentStep];
    const Icon = currentPermission.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">App Permissions</h2>
                    <p className="text-sm text-green-100">
                        We need your permission to provide the best experience
                    </p>
                    <div className="mt-4 flex gap-2">
                        {permissions.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded ${index < currentStep ? 'bg-white' :
                                        index === currentStep ? 'bg-white/60' :
                                            'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Icon className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{currentPermission.name}</h3>
                        <p className="text-gray-600">{currentPermission.description}</p>
                        {currentPermission.required && (
                            <p className="text-sm text-red-600 mt-2 font-medium">⚠️ Required Permission</p>
                        )}
                    </div>

                    {/* Permission Status */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Status:</span>
                            <span className={`text-sm font-semibold ${currentPermission.granted ? 'text-green-600' : 'text-gray-400'}`}>
                                {currentPermission.granted ? '✓ Granted' : 'Not granted'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleRequest(currentStep)}
                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                            <Check className="h-5 w-5" />
                            Allow {currentPermission.name}
                        </button>

                        {!currentPermission.required && (
                            <button
                                onClick={handleSkip}
                                className="w-full rounded-lg border-2 border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Skip for Now
                            </button>
                        )}
                    </div>

                    {/* Step indicator */}
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Step {currentStep + 1} of {permissions.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
