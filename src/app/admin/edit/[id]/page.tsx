
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockBackend, User } from '@/lib/mockData';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditFarmerPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const users = MockBackend.getUsers();
        const found = users.find(u => u.id === params.id);
        if (found) {
            setUser(found);
        }
    }, [params.id]);

    const handleSave = () => {
        if (user) {
            MockBackend.updateUser(user);
            alert('Farmer Updated');
            router.back();
        }
    };

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full bg-white p-2 shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Edit Farmer: {user.name}</h1>
            </div>

            <div className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full rounded border p-2 mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Village</label>
                    <input
                        value={user.village || ''}
                        onChange={(e) => setUser({ ...user, village: e.target.value })}
                        className="w-full rounded border p-2 mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        className="w-full rounded border p-2 mt-1"
                    />
                </div>

                <div className="pt-4 border-t mt-4">
                    <label className="block text-sm font-bold text-yellow-700">Ledger Link (Personal)</label>
                    <input
                        value={user.ledgerLink || ''}
                        placeholder="https://ledgers.nileshseeds.com/farmer_123"
                        onChange={(e) => setUser({ ...user, ledgerLink: e.target.value })}
                        className="w-full rounded border border-yellow-300 bg-yellow-50 p-2 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Assign the unique Google Sheet or Web link here.</p>
                </div>

                <button onClick={handleSave} className="mt-6 w-full rounded bg-green-600 py-2 text-white font-bold">
                    Save Updates
                </button>
            </div>
        </div>
    );
}
