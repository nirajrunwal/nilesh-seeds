
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockBackend, Message, User } from '@/lib/mockData';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Video, Phone, Paperclip, X } from 'lucide-react';

export default function ChatPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const partnerId = params.id as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [attachedImage, setAttachedImage] = useState<string>('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        // Resolve Partner Name
        if (partnerId === 'admin') {
            setPartnerName('Nilesh Seeds (Admin)');
        } else {
            const users = MockBackend.getUsers();
            const partner = users.find(u => u.id === partnerId);
            setPartnerName(partner ? partner.name : 'Unknown User');
        }

        // Poll Messages
        const fetchMessages = () => {
            // Logic: If I am admin, I chat with 'partnerId'. If I am farmer, I chat with 'admin' (based on URL logic)
            // Actually, URL param [id] is effectively "who I am talking to"
            // BUT for Farmer, they only talk to Admin. So link is /chat/admin
            // For Admin, they check /chat/farmer_123

            const targetId = partnerId === 'admin' ? 'admin_001' : partnerId;
            const msgs = MockBackend.getMessages(user.id, targetId);
            setMessages(msgs);

            // Mark messages as read
            MockBackend.markMessagesAsRead(user.id, targetId);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 1000);
        return () => clearInterval(interval);
    }, [user, partnerId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const targetId = partnerId === 'admin' ? 'admin_001' : partnerId;

        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            receiverId: targetId,
            text: inputText,
            timestamp: new Date().toISOString(),
            read: false
        };

        MockBackend.sendMessage(newMsg);
        setInputText('');

        // Optimistic update
        setMessages(prev => [...prev, newMsg]);
        setAttachedImage('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 bg-green-600 p-4 text-white shadow-md">
                <button onClick={() => router.back()} className="p-1 hover:bg-white/20 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-700 font-bold">
                    {partnerName[0]}
                </div>
                <div className="flex-1">
                    <h2 className="font-bold text-lg leading-tight">{partnerName}</h2>
                    <p className="text-xs opacity-90">Online</p>
                </div>
                {/* Call Buttons - WhatsApp Style */}
                <button
                    onClick={() => router.push(`/call/video?target=${partnerId === 'admin' ? 'admin_001' : partnerId}`)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Video Call"
                >
                    <Video className="h-5 w-5" />
                </button>
                <button
                    onClick={() => router.push(`/call/voice?target=${partnerId === 'admin' ? 'admin_001' : partnerId}`)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Voice Call"
                >
                    <Phone className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-green-100 text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                                }`}>
                                <p>{msg.text}</p>
                                <p className="text-[10px] opacity-60 text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Image Preview */}
            {attachedImage && (
                <div className="bg-white border-t p-3">
                    <div className="relative inline-block">
                        <img src={attachedImage} alt="Preview" className="h-24 rounded-lg" />
                        <button
                            onClick={() => setAttachedImage('')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="bg-white p-3 flex gap-2 shadow-inner">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                    <Paperclip className="h-5 w-5" />
                </label>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:border-green-500 focus:outline-none"
                />
                <button type="submit" disabled={!inputText.trim() && !attachedImage} className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="h-5 w-5 ml-0.5" />
                </button>
            </form>
        </div>
    );
}
