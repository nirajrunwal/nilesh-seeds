
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User } from '@/lib/mockData';
import { Sprout } from 'lucide-react';

export default function SignupPage() {
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        village: '',
        address: '',
        password: '' // Using phone as password by default but let's ask for it or auto-set
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `farmer_${Date.now()}`,
            role: 'farmer',
            name: formData.name,
            phone: formData.phone,
            village: formData.village,
            address: formData.address,
            username: formData.name.toLowerCase().replace(/\s/g, '_'),
            password: formData.phone // As per requirement: Password is Phone Number
        };
        register(newUser);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <Sprout className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Farmer Registration</h2>
                    <p className="text-green-700">किसान पंजीकरण</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name / पूरा नाम</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number / फोन नंबर</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            title="10 digit mobile number"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be your password.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Village / गाँव</label>
                        <input
                            name="village"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address / पता</label>
                        <input
                            name="address"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all"
                    >
                        Register / रजिस्टर करें
                    </button>
                </form>

                <div className="text-center text-sm">
                    <Link href="/" className="font-medium text-green-600 hover:text-green-500">
                        Back to Login / लॉगिन पर वापस जाएं
                    </Link>
                </div>
            </div>
        </div>
    );
}
