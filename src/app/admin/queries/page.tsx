'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Search, AlertCircle } from 'lucide-react';
import { QueryService, FarmerQuery } from '@/services/queryService';

export default function AdminQueriesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [queries, setQueries] = useState<FarmerQuery[]>([]);
    const [selectedQuery, setSelectedQuery] = useState<FarmerQuery | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    useEffect(() => {
        if (user?.role === 'admin') {
            loadQueries();
        }
    }, [user]);

    const loadQueries = () => {
        const allQueries = QueryService.getAllQueries();
        setQueries(allQueries);
    };

    const filteredQueries = queries.filter(q => {
        if (statusFilter !== 'all' && q.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && q.priority !== priorityFilter) return false;
        return true;
    });

    const stats = QueryService.getStats();

    if (user?.role !== 'admin') {
        return <div className="p-4">Access denied</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Support Queries</h1>
                            <p className="text-green-100 text-sm">Manage farmer queries</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-green-100">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-green-100">Open</p>
                        <p className="text-2xl font-bold">{stats.open}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-green-100">In Progress</p>
                        <p className="text-2xl font-bold">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-sm text-green-100">High Priority</p>
                        <p className="text-2xl font-bold">{stats.highPriority}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <div className="flex gap-2">
                        {(['all', 'open', 'in-progress', 'resolved'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${statusFilter === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="border-l border-gray-300 mx-2"></div>
                    <div className="flex gap-2">
                        {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                            <button
                                key={priority}
                                onClick={() => setPriorityFilter(priority)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${priorityFilter === priority
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Queries List */}
            <div className="p-4 space-y-3">
                {filteredQueries.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No queries found</p>
                    </div>
                ) : (
                    filteredQueries.map((query) => (
                        <div
                            key={query.id}
                            onClick={() => setSelectedQuery(query)}
                            className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${query.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                            query.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                query.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {query.status}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${query.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            query.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {query.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{query.farmerName}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{query.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{query.responses.length} responses</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Query Detail Modal */}
            {selectedQuery && (
                <QueryDetailModal
                    query={selectedQuery}
                    onClose={() => setSelectedQuery(null)}
                    onUpdate={() => {
                        loadQueries();
                        setSelectedQuery(null);
                    }}
                />
            )}
        </div>
    );
}

function QueryDetailModal({ query, onClose, onUpdate }: {
    query: FarmerQuery;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(query.status);

    const handleAddResponse = () => {
        if (!message.trim() || !user) return;

        QueryService.addResponse(query.id, user.id, user.name, 'admin', message);
        setMessage('');
        onUpdate();
    };

    const handleStatusChange = (newStatus: FarmerQuery['status']) => {
        QueryService.updateStatus(query.id, newStatus);
        setStatus(newStatus);
        onUpdate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <h2 className="text-xl font-bold">{query.subject}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{query.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">Farmer: <strong>{query.farmerName}</strong></span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{new Date(query.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Status Update */}
                    <div className="flex gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value as FarmerQuery['status'])}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-3 mb-4 max-h-96 overflow-y-auto">
                    <h3 className="font-semibold">Responses ({query.responses.length})</h3>
                    {query.responses.map((response) => (
                        <div key={response.id} className={`p-3 rounded-lg ${response.responderRole === 'admin' ? 'bg-green-50 ml-8' : 'bg-gray-50 mr-8'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{response.responderName}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(response.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm">{response.message}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
                        rows={3}
                        placeholder="Type your response..."
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleAddResponse}
                            disabled={!message.trim()}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            Send Response
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
