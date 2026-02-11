'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { QueryService, FarmerQuery } from '@/services/queryService';

export default function FarmerQueriesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [queries, setQueries] = useState<FarmerQuery[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState<FarmerQuery | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

    useEffect(() => {
        if (user?.role === 'farmer') {
            loadQueries();
        }
    }, [user]);

    const loadQueries = () => {
        if (!user) return;
        const farmerQueries = QueryService.getFarmerQueries(user.id);
        setQueries(farmerQueries);
    };

    const filteredQueries = queries.filter(q =>
        statusFilter === 'all' || q.status === statusFilter
    );

    if (user?.role !== 'farmer') {
        return <div className="p-4">Access denied</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Queries</h1>
                            <p className="text-sm text-gray-600">Support & Help</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        New Query
                    </button>
                </div>

                {/* Filter */}
                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {['all', 'open', 'in-progress', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${statusFilter === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Queries List */}
            <div className="p-4 space-y-3">
                {filteredQueries.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">No queries found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-green-600 hover:underline"
                        >
                            Create your first query
                        </button>
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
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${query.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                                query.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                    query.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {query.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{query.description}</p>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
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

            {/* Create Modal */}
            {showCreateModal && (
                <CreateQueryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        loadQueries();
                        setShowCreateModal(false);
                    }}
                />
            )}

            {/* View Modal */}
            {selectedQuery && (
                <QueryDetailModal
                    query={selectedQuery}
                    onClose={() => setSelectedQuery(null)}
                    onUpdate={() => loadQueries()}
                />
            )}
        </div>
    );
}

function CreateQueryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        QueryService.createQuery(user.id, user.name, subject, description, priority);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Create New Query</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            placeholder="Brief description of your issue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            rows={4}
                            placeholder="Provide details about your query"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QueryDetailModal({ query, onClose, onUpdate }: { query: FarmerQuery; onClose: () => void; onUpdate: () => void }) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');

    const handleAddResponse = () => {
        if (!message.trim() || !user) return;

        QueryService.addResponse(query.id, user.id, user.name, user.role as 'farmer' | 'admin', message);
        setMessage('');
        onUpdate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                    <h2 className="text-xl font-bold">{query.subject}</h2>
                    <p className="text-sm text-gray-600 mt-1">{query.description}</p>
                    <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${query.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                query.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                            }`}>
                            {query.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${query.priority === 'high' ? 'bg-red-100 text-red-700' :
                                query.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {query.priority} priority
                        </span>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-3 mb-4">
                    <h3 className="font-semibold">Responses ({query.responses.length})</h3>
                    {query.responses.map((response) => (
                        <div key={response.id} className={`p-3 rounded-lg ${response.responderRole === 'admin' ? 'bg-blue-50' : 'bg-gray-50'
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        rows={3}
                        placeholder="Add a response..."
                    />
                    <div className="flex gap-3 mt-3">
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
