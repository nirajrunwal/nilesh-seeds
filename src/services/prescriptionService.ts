// Prescription Management Service

import { NotificationService } from './notificationService';

export interface PrescriptionItem {
    productName: string;
    quantity: number;
    unit: string; // kg, liters, bags, etc.
    dosage?: string; // "50ml per acre", etc.
    size?: string; // "500ml bottle", "1kg pack"
    price?: number; // Optional price per item
    instructions?: string;
}

export interface Prescription {
    id: string;
    farmerId: string;
    farmerName: string;
    farmerVillage?: string;
    employeeId: string;
    employeeName: string;
    products: PrescriptionItem[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'completed' | 'cancelled';
}

const PRESCRIPTIONS_KEY = 'ns_prescriptions';

export class PrescriptionService {
    /**
     * Get all prescriptions
     */
    static getAllPrescriptions(): Prescription[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get prescription by ID
     */
    static getPrescription(id: string): Prescription | null {
        return this.getAllPrescriptions().find(p => p.id === id) || null;
    }

    /**
     * Get prescriptions for a farmer
     */
    static getFarmerPrescriptions(farmerId: string): Prescription[] {
        return this.getAllPrescriptions().filter(p => p.farmerId === farmerId);
    }

    /**
     * Get prescriptions by employee
     */
    static getEmployeePrescriptions(employeeId: string): Prescription[] {
        return this.getAllPrescriptions().filter(p => p.employeeId === employeeId);
    }

    /**
     * Create prescription
     */
    static createPrescription(
        farmerId: string,
        farmerName: string,
        employeeId: string,
        employeeName: string,
        products: PrescriptionItem[],
        notes?: string,
        farmerVillage?: string
    ): Prescription {
        const prescription: Prescription = {
            id: `presc_${Date.now()}`,
            farmerId,
            farmerName,
            farmerVillage,
            employeeId,
            employeeName,
            products,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };

        const all = this.getAllPrescriptions();
        all.unshift(prescription);
        localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(all));

        // Notify farmer and admin
        NotificationService.notifyPrescriptionCreated(
            farmerId,
            farmerName,
            employeeName,
            prescription.id
        );

        return prescription;
    }

    /**
     * Update prescription
     */
    static updatePrescription(id: string, updates: Partial<Prescription>): boolean {
        const all = this.getAllPrescriptions();
        const index = all.findIndex(p => p.id === id);

        if (index === -1) return false;

        all[index] = {
            ...all[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Delete prescription
     */
    static deletePrescription(id: string): boolean {
        const all = this.getAllPrescriptions();
        const filtered = all.filter(p => p.id !== id);

        if (filtered.length === all.length) return false;

        localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(filtered));
        return true;
    }

    /**
     * Get statistics
     */
    static getStats() {
        const all = this.getAllPrescriptions();

        return {
            total: all.length,
            active: all.filter(p => p.status === 'active').length,
            completed: all.filter(p => p.status === 'completed').length,
            cancelled: all.filter(p => p.status === 'cancelled').length,
            byMonth: this.getMonthlyStats()
        };
    }

    /**
     * Get monthly statistics
     */
    private static getMonthlyStats() {
        const all = this.getAllPrescriptions();
        const monthCounts: { [key: string]: number } = {};

        all.forEach(p => {
            const month = new Date(p.createdAt).toISOString().slice(0, 7); // YYYY-MM
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        return monthCounts;
    }
}
