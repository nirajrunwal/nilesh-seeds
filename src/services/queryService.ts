// Farmer Query/Support System

export interface FarmerQuery {
    id: string;
    farmerId: string;
    farmerName: string;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    responses: QueryResponse[];
    attachments?: string[]; // Base64 images
}

export interface QueryResponse {
    id: string;
    queryId: string;
    responderId: string;
    responderName: string;
    responderRole: 'admin' | 'farmer';
    message: string;
    timestamp: string;
    attachments?: string[];
}

const QUERIES_KEY = 'ns_queries';

export class QueryService {

    /**
     * Get all queries
     */
    static getAllQueries(): FarmerQuery[] {
        const stored = localStorage.getItem(QUERIES_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get queries for specific farmer
     */
    static getFarmerQueries(farmerId: string): FarmerQuery[] {
        return this.getAllQueries().filter(q => q.farmerId === farmerId);
    }

    /**
     * Get open/pending queries (admin view)
     */
    static getPendingQueries(): FarmerQuery[] {
        return this.getAllQueries().filter(q => q.status === 'open' || q.status === 'in-progress');
    }

    /**
     * Create new query
     */
    static createQuery(
        farmerId: string,
        farmerName: string,
        subject: string,
        description: string,
        priority: 'low' | 'medium' | 'high' = 'medium',
        attachments?: string[]
    ): FarmerQuery {
        const query: FarmerQuery = {
            id: `query_${Date.now()}`,
            farmerId,
            farmerName,
            subject,
            description,
            status: 'open',
            priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: [],
            attachments
        };

        const all = this.getAllQueries();
        all.unshift(query);
        localStorage.setItem(QUERIES_KEY, JSON.stringify(all));

        return query;
    }

    /**
     * Add response to query
     */
    static addResponse(
        queryId: string,
        responderId: string,
        responderName: string,
        responderRole: 'admin' | 'farmer',
        message: string,
        attachments?: string[]
    ): boolean {
        const all = this.getAllQueries();
        const query = all.find(q => q.id === queryId);

        if (!query) return false;

        const response: QueryResponse = {
            id: `resp_${Date.now()}`,
            queryId,
            responderId,
            responderName,
            responderRole,
            message,
            timestamp: new Date().toISOString(),
            attachments
        };

        query.responses.push(response);
        query.updatedAt = new Date().toISOString();

        // Auto-update status if admin responds
        if (responderRole === 'admin' && query.status === 'open') {
            query.status = 'in-progress';
        }

        localStorage.setItem(QUERIES_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Update query status
     */
    static updateStatus(queryId: string, status: FarmerQuery['status']): boolean {
        const all = this.getAllQueries();
        const query = all.find(q => q.id === queryId);

        if (!query) return false;

        query.status = status;
        query.updatedAt = new Date().toISOString();

        localStorage.setItem(QUERIES_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Update priority
     */
    static updatePriority(queryId: string, priority: FarmerQuery['priority']): boolean {
        const all = this.getAllQueries();
        const query = all.find(q => q.id === queryId);

        if (!query) return false;

        query.priority = priority;
        query.updatedAt = new Date().toISOString();

        localStorage.setItem(QUERIES_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Get query by ID
     */
    static getQuery(queryId: string): FarmerQuery | null {
        return this.getAllQueries().find(q => q.id === queryId) || null;
    }

    /**
     * Delete query
     */
    static deleteQuery(queryId: string): boolean {
        const all = this.getAllQueries();
        const filtered = all.filter(q => q.id !== queryId);

        if (filtered.length === all.length) return false;

        localStorage.setItem(QUERIES_KEY, JSON.stringify(filtered));
        return true;
    }

    /**
     * Get unresolved count for farmer
     */
    static getUnresolvedCount(farmerId: string): number {
        return this.getFarmerQueries(farmerId).filter(
            q => q.status === 'open' || q.status === 'in-progress'
        ).length;
    }

    /**
     * Get statistics
     */
    static getStats() {
        const all = this.getAllQueries();

        return {
            total: all.length,
            open: all.filter(q => q.status === 'open').length,
            inProgress: all.filter(q => q.status === 'in-progress').length,
            resolved: all.filter(q => q.status === 'resolved').length,
            closed: all.filter(q => q.status === 'closed').length,
            highPriority: all.filter(q => q.priority === 'high' && (q.status === 'open' || q.status === 'in-progress')).length
        };
    }
}
