'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Key, Save, Eye, EyeOff } from 'lucide-react';
import { MockBackend } from '@/lib/mockData';
import { hashPassword } from '@/lib/security';

export default function ChangePasswordPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        // Validate current password
        if (user.password !== currentPassword) {
            alert('Current password is incorrect');
            return;
        }

        // Validate new password
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        // Update password
        const updatedUser = { ...user, password: newPassword };
        MockBackend.updateUser(updatedUser);

        // Update session
        localStorage.setItem('ns_session', JSON.stringify(updatedUser));

        alert('Password changed successfully! Please login again.');
        logout();
        router.push('/');
    };

    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Change Password</h1>
                        <p className="text-green-100 text-sm">Update your account password</p>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-md mx-auto">
                <form onSubmit={handleChangePassword} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Key className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-bold">{user.name}</h2>
                            <p className="text-sm text-gray-600">{user.role === 'admin' ? 'Administrator' : 'Farmer'}</p>
                        </div>
                    </div>

                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
                                placeholder="Enter new password (min 6 chars)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium mb-1">Password Requirements:</p>
                        <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                            <li>Minimum 6 characters</li>
                            <li>Must match confirmation</li>
                            <li>Different from current password</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                            <Save className="h-4 w-4" />
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
