'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, CheckSquare, Square } from 'lucide-react';
import { MockBackend, User, Message } from '@/lib/mockData';

export default function BroadcastPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [farmers, setFarmers] = useState<User[]>([]);
    const [selectedFarmers, setSelectedFarmers] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            const allFarmers = MockBackend.getUsers().filter(u => u.role === 'farmer' && u.status === 'active');
            setFarmers(allFarmers);
        }
    }, [user]);

    const toggleFarmer = (farmerId: string) => {
        const newSelected = new Set(selectedFarmers);
        if (newSelected.has(farmerId)) {
            newSelected.delete(farmerId);
        } else {
            newSelected.add(farmerId);
        }
        setSelectedFarmers(newSelected);
    };

    const selectAll = () => {
        if (selectedFarmers.size === farmers.length) {
            setSelectedFarmers(new Set());
        } else {
            setSelectedFarmers(new Set(farmers.map(f => f.id)));
        }
    };

    const handleSend = async () => {
        if (!message.trim() || selectedFarmers.size === 0 || !user) return;

        setSending(true);

        // Send message to each selected farmer
        selectedFarmers.forEach(farmerId => {
            const newMsg: Message = {
                id: `${Date.now()}_${farmerId}`,
                senderId: user.id,
                receiverId: farmerId,
                text: message,
                timestamp: new Date().toISOString(),
                read: false
            };
            MockBackend.sendMessage(newMsg);
        });

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSending(false);
        alert(`Message sent to ${selectedFarmers.size} farmers successfully!`);
        setMessage('');
        setSelectedFarmers(new Set());
    };

    if (user?.role !== 'admin') {
        return <div className="p-4">Access denied</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Broadcast Message</h1>
                        <p className="text-blue-100 text-sm">Send message to multiple farmers</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Total Farmers</p>
                        <p className="text-2xl font-bold">{farmers.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Selected</p>
                        <p className="text-2xl font-bold">{selectedFarmers.size}</p>
                    </div>
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your broadcast message here..."
                    className="w-full rounded-lg border border-gray-300 p-3 h-32 resize-none focus:border-blue-500 focus:outline-none"
                />
                <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">{message.length} characters</p>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || selectedFarmers.size === 0 || sending}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                        {sending ? 'Sending...' : `Send to ${selectedFarmers.size} Farmers`}
                    </button>
                </div>
            </div>

            {/* Farmer Selection */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Select Farmers</h2>
                    <button
                        onClick={selectAll}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        {selectedFarmers.size === farmers.length ? (
                            <>
                                <CheckSquare className="h-4 w-4" />
                                Deselect All
                            </>
                        ) : (
                            <>
                                <Square className="h-4 w-4" />
                                Select All
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-2">
                    {farmers.map(farmer => {
                        const isSelected = selectedFarmers.has(farmer.id);
                        return (
                            <div
                                key={farmer.id}
                                onClick={() => toggleFarmer(farmer.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                                    }`}
                            >
                                <div className={`h-6 w-6 rounded flex items-center justify-center border-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                    }`}>
                                    {isSelected && (
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
                                    {farmer.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                                    <p className="text-sm text-gray-500">{farmer.village || 'No village'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {farmers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No active farmers found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
