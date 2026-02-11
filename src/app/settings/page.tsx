
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { MockBackend } from '@/lib/mockData';
import PhotoUpload from '@/components/PhotoUpload';

export default function SettingsPage() {
    const { user, login } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        village: user?.village || '',
        profilePhoto: user?.profilePhoto || ''
    });

    const handleSave = () => {
        if (!user) return;
        const updatedUser = { ...user, ...formData };
        MockBackend.updateUser(updatedUser);
        // Refresh session hack
        localStorage.setItem('ns_session', JSON.stringify(updatedUser));
        alert('Profile Updated');
        router.back();
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full bg-white p-2 shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Settings / सेटिंग्स</h1>
            </div>

            <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Edit Profile</h2>

                {/* Profile Photo */}
                <PhotoUpload
                    currentPhoto={formData.profilePhoto}
                    onUpload={(photo) => setFormData({ ...formData, profilePhoto: photo })}
                    label="Profile Photo"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                    />
                </div>

                {user.role === 'farmer' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Village</label>
                            <input
                                value={formData.village}
                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                            />
                        </div>
                    </>
                )}

                <button onClick={handleSave} className="mt-4 flex w-full justify-center items-center gap-2 rounded-lg bg-green-600 py-3 text-white font-semibold">
                    <Save className="h-5 w-5" /> Save Changes
                </button>
            </div>
        </div>
    );
}
