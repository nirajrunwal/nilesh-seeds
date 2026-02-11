// Farmer Data Service

export interface Farmer {
    id: string;
    name: string;
    username: string;
    email?: string;
    phone: string;
    village?: string;
    assignedTo?: string; // Employee ID
    location?: {
        lat: number;
        lng: number;
        lastUpdated?: string;
    };
    status: 'active' | 'inactive' | 'blocked';
    createdAt: string;
}

const FARMERS_KEY = 'ns_users';

export class FarmerService {
    /**
     * Get all farmers
     */
    static getAllFarmers(): Farmer[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(FARMERS_KEY);
        if (!stored) return [];

        try {
            const users = JSON.parse(stored);
            return users.filter((u: any) => u.role === 'farmer');
        } catch {
            return [];
        }
    }

    /**
     * Get farmer by ID
     */
    static getFarmer(id: string): Farmer | null {
        return this.getAllFarmers().find(f => f.id === id) || null;
    }

    /**
     * Get farmers assigned to a specific employee
     */
    static getFarmersByEmployee(employeeId: string): Farmer[] {
        return this.getAllFarmers().filter(f => f.assignedTo === employeeId);
    }

    /**
     * Get unassigned farmers
     */
    static getUnassignedFarmers(): Farmer[] {
        return this.getAllFarmers().filter(f => !f.assignedTo || f.assignedTo === '');
    }

    /**
     * Assign a farmer to an employee
     */
    static assignFarmerToEmployee(farmerId: string, employeeId: string): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const stored = localStorage.getItem(FARMERS_KEY);
            if (!stored) return false;

            const users = JSON.parse(stored);
            const farmerIndex = users.findIndex((u: any) => u.id === farmerId && u.role === 'farmer');

            if (farmerIndex === -1) return false;

            users[farmerIndex].assignedTo = employeeId;
            localStorage.setItem(FARMERS_KEY, JSON.stringify(users));

            return true;
        } catch (error) {
            console.error('Error assigning farmer:', error);
            return false;
        }
    }

    /**
     * Unassign a farmer from their current employee
     */
    static unassignFarmer(farmerId: string): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const stored = localStorage.getItem(FARMERS_KEY);
            if (!stored) return false;

            const users = JSON.parse(stored);
            const farmerIndex = users.findIndex((u: any) => u.id === farmerId && u.role === 'farmer');

            if (farmerIndex === -1) return false;

            users[farmerIndex].assignedTo = '';
            localStorage.setItem(FARMERS_KEY, JSON.stringify(users));

            return true;
        } catch (error) {
            console.error('Error unassigning farmer:', error);
            return false;
        }
    }

    /**
     * Update farmer information
     */
    static updateFarmer(farmerId: string, updates: Partial<Farmer>): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const stored = localStorage.getItem(FARMERS_KEY);
            if (!stored) return false;

            const users = JSON.parse(stored);
            const farmerIndex = users.findIndex((u: any) => u.id === farmerId && u.role === 'farmer');

            if (farmerIndex === -1) return false;

            users[farmerIndex] = { ...users[farmerIndex], ...updates };
            localStorage.setItem(FARMERS_KEY, JSON.stringify(users));

            return true;
        } catch (error) {
            console.error('Error updating farmer:', error);
            return false;
        }
    }

    /**
     * Get assignment statistics
     */
    static getAssignmentStats() {
        const allFarmers = this.getAllFarmers();
        const assigned = allFarmers.filter(f => f.assignedTo && f.assignedTo !== '');
        const unassigned = allFarmers.filter(f => !f.assignedTo || f.assignedTo === '');

        return {
            total: allFarmers.length,
            assigned: assigned.length,
            unassigned: unassigned.length,
            assignmentRate: allFarmers.length > 0
                ? ((assigned.length / allFarmers.length) * 100).toFixed(1)
                : '0'
        };
    }
}
