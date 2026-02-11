// Location History Service for 30-day tracking
// Captures location every hour, auto-deletes after 30 days

export interface LocationHistoryEntry {
    id: string;
    userId: string;
    userName: string;
    userRole: 'farmer' | 'employee';
    latitude: number;
    longitude: number;
    timestamp: string; // ISO string
    placeName?: string;
}

const STORAGE_KEY = 'ns_location_history';
const HOURS_30_DAYS = 30 * 24; // 720 hours

class LocationHistoryServiceClass {
    // Get all history
    getAllHistory(): LocationHistoryEntry[] {
        if (typeof window === 'undefined') return [];
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return this.cleanOldEntries(history);
    }

    // Get history for specific user
    getUserHistory(userId: string): LocationHistoryEntry[] {
        return this.getAllHistory().filter(entry => entry.userId === userId);
    }

    // Get history within date range
    getHistoryByDateRange(startDate: Date, endDate: Date): LocationHistoryEntry[] {
        const allHistory = this.getAllHistory();
        return allHistory.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }

    // Add location entry
    addEntry(
        userId: string,
        userName: string,
        userRole: 'farmer' | 'employee',
        latitude: number,
        longitude: number,
        placeName?: string
    ): void {
        const history = this.getAllHistory();

        const entry: LocationHistoryEntry = {
            id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            userName,
            userRole,
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
            placeName
        };

        history.push(entry);
        this.saveHistory(history);
    }

    // Clean entries older than 30 days
    private cleanOldEntries(history: LocationHistoryEntry[]): LocationHistoryEntry[] {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        return history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoffDate;
        });
    }

    // Save history to localStorage
    private saveHistory(history: LocationHistoryEntry[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    // Get statistics
    getStats() {
        const history = this.getAllHistory();
        const farmers = history.filter(h => h.userRole === 'farmer');
        const employees = history.filter(h => h.userRole === 'employee');

        return {
            total: history.length,
            farmers: farmers.length,
            employees: employees.length,
            uniqueUsers: new Set(history.map(h => h.userId)).size
        };
    }

    // Delete all history (admin function)
    clearAllHistory(): void {
        localStorage.setItem(STORAGE_KEY, '[]');
    }

    // Get last 24 hours
    getLast24Hours(): LocationHistoryEntry[] {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        return this.getAllHistory().filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoff;
        });
    }

    // Initialize hourly capture (call this on app start)
    startHourlyCapture(getCurrentLocation: () => Promise<{ lat: number; lng: number; userId: string; userName: string; userRole: 'farmer' | 'employee' } | null>): void {
        // Capture immediately
        this.captureLocation(getCurrentLocation);

        // Then every hour
        setInterval(() => {
            this.captureLocation(getCurrentLocation);
        }, 60 * 60 * 1000); // 1 hour
    }

    private async captureLocation(getCurrentLocation: () => Promise<{ lat: number; lng: number; userId: string; userName: string; userRole: 'farmer' | 'employee' } | null>): Promise<void> {
        try {
            const location = await getCurrentLocation();
            if (location) {
                this.addEntry(
                    location.userId,
                    location.userName,
                    location.userRole,
                    location.lat,
                    location.lng
                );
            }
        } catch (err) {
            console.error('Failed to capture location:', err);
        }
    }
}

export const LocationHistoryService = new LocationHistoryServiceClass();
