// Loyalty Points Data Models and Management

export interface LoyaltyTransaction {
    id: string;
    farmerId: string;
    points: number; // Positive = earned, Negative = redeemed
    reason: string;
    type: 'earned' | 'redeemed' | 'adjusted';
    date: string;
    adminId: string;
    adminName: string;
}

export interface FarmerLoyalty {
    farmerId: string;
    farmerName: string;
    totalPoints: number;
    transactions: LoyaltyTransaction[];
    lastUpdated: string;
}

const LOYALTY_KEY = 'ns_loyalty';

export class LoyaltyService {

    /**
     * Get all farmers with loyalty data
     */
    static getAllLoyalty(): FarmerLoyalty[] {
        const stored = localStorage.getItem(LOYALTY_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get loyalty data for specific farmer
     */
    static getFarmerLoyalty(farmerId: string): FarmerLoyalty | null {
        const all = this.getAllLoyalty();
        return all.find(l => l.farmerId === farmerId) || null;
    }

    /**
     * Initialize loyalty for new farmer
     */
    static initializeFarmer(farmerId: string, farmerName: string): void {
        const all = this.getAllLoyalty();

        if (!all.find(l => l.farmerId === farmerId)) {
            all.push({
                farmerId,
                farmerName,
                totalPoints: 0,
                transactions: [],
                lastUpdated: new Date().toISOString()
            });

            localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
        }
    }

    /**
     * Add points to farmer
     */
    static addPoints(
        farmerId: string,
        points: number,
        reason: string,
        adminId: string,
        adminName: string
    ): boolean {
        const all = this.getAllLoyalty();
        const farmerLoyalty = all.find(l => l.farmerId === farmerId);

        if (!farmerLoyalty) return false;

        const transaction: LoyaltyTransaction = {
            id: `txn_${Date.now()}`,
            farmerId,
            points,
            reason,
            type: 'earned',
            date: new Date().toISOString(),
            adminId,
            adminName
        };

        farmerLoyalty.totalPoints += points;
        farmerLoyalty.transactions.unshift(transaction);
        farmerLoyalty.lastUpdated = new Date().toISOString();

        localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Redeem points from farmer
     */
    static redeemPoints(
        farmerId: string,
        points: number,
        reason: string,
        adminId: string,
        adminName: string
    ): boolean {
        const all = this.getAllLoyalty();
        const farmerLoyalty = all.find(l => l.farmerId === farmerId);

        if (!farmerLoyalty || farmerLoyalty.totalPoints < points) {
            return false; // Insufficient points
        }

        const transaction: LoyaltyTransaction = {
            id: `txn_${Date.now()}`,
            farmerId,
            points: -points,
            reason,
            type: 'redeemed',
            date: new Date().toISOString(),
            adminId,
            adminName
        };

        farmerLoyalty.totalPoints -= points;
        farmerLoyalty.transactions.unshift(transaction);
        farmerLoyalty.lastUpdated = new Date().toISOString();

        localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Adjust points (admin override)
     */
    static adjustPoints(
        farmerId: string,
        points: number,
        reason: string,
        adminId: string,
        adminName: string
    ): boolean {
        const all = this.getAllLoyalty();
        const farmerLoyalty = all.find(l => l.farmerId === farmerId);

        if (!farmerLoyalty) return false;

        const transaction: LoyaltyTransaction = {
            id: `txn_${Date.now()}`,
            farmerId,
            points,
            reason,
            type: 'adjusted',
            date: new Date().toISOString(),
            adminId,
            adminName
        };

        farmerLoyalty.totalPoints += points;
        farmerLoyalty.transactions.unshift(transaction);
        farmerLoyalty.lastUpdated = new Date().toISOString();

        localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Delete transaction (void)
     */
    static deleteTransaction(farmerId: string, transactionId: string): boolean {
        const all = this.getAllLoyalty();
        const farmerLoyalty = all.find(l => l.farmerId === farmerId);

        if (!farmerLoyalty) return false;

        const txnIndex = farmerLoyalty.transactions.findIndex(t => t.id === transactionId);
        if (txnIndex === -1) return false;

        const transaction = farmerLoyalty.transactions[txnIndex];

        // Reverse the point change
        farmerLoyalty.totalPoints -= transaction.points;

        // Remove transaction
        farmerLoyalty.transactions.splice(txnIndex, 1);
        farmerLoyalty.lastUpdated = new Date().toISOString();

        localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Get transaction history for farmer
     */
    static getTransactionHistory(farmerId: string, limit = 50): LoyaltyTransaction[] {
        const loyalty = this.getFarmerLoyalty(farmerId);
        return loyalty ? loyalty.transactions.slice(0, limit) : [];
    }

    /**
     * Export loyalty data as CSV
     */
    static exportToCSV(): string {
        const all = this.getAllLoyalty();

        let csv = 'Farmer Name,Farmer ID,Total Points,Last Updated\n';
        all.forEach(l => {
            csv += `${l.farmerName},${l.farmerId},${l.totalPoints},${l.lastUpdated}\n`;
        });

        return csv;
    }
}
