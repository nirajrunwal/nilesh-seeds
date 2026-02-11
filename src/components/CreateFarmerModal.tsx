'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Home, Lock } from 'lucide-react';
import { MockBackend, User as UserType } from '@/lib/mockData';
import { LoyaltyService } from '@/services/loyaltyService';

interface CreateFarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateFarmerModal({ isOpen, onClose, onSuccess }: CreateFarmerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        village: '',
        address: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate phone uniqueness
            const users = MockBackend.getUsers();
            if (users.find(u => u.phone === formData.phone)) {
                setError('Phone number already registered');
                setLoading(false);
                return;
            }

            // Create new farmer
            const newFarmer: UserType = {
                id: `farmer_${Date.now()}`,
                name: formData.name,
                phone: formData.phone,
                role: 'farmer',
                village: formData.village,
                address: formData.address,
                password: formData.password,
                status: 'active',
                createdAt: new Date().toISOString(),
                loyaltyPoints: 0
            };

            // Add to database
            MockBackend.addUser(newFarmer);

            // Initialize loyalty
            LoyaltyService.initializeFarmer(newFarmer.id, newFarmer.name);

            // Success
            setFormData({ name: '', phone: '', village: '', address: '', password: '' });
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to create farmer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Farmer</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="inline h-4 w-4 mr-1" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter farmer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="10-digit mobile number"
                            pattern="[0-9]{10}"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Village
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.village}
                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Village name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Home className="inline h-4 w-4 mr-1" />
                            Address
                        </label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Full address"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Lock className="inline h-4 w-4 mr-1" />
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Set password"
                            minLength={4}
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum 4 characters</p>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create Farmer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
