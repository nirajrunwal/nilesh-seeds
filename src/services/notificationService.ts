// Notification Service for Chat and Call Alerts

export class NotificationService {
    private static hasPermission = false;
    private static audioContext: AudioContext | null = null;

    // Request notification permission
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.hasPermission = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
            return this.hasPermission;
        }

        return false;
    }

    // Show browser notification
    static showNotification(title: string, options?: NotificationOptions) {
        if (this.hasPermission && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/globe.svg',
                badge: '/globe.svg',
                ...options
            });

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);

            return notification;
        }
        return null;
    }

    // Show new message notification
    static notifyNewMessage(senderName: string, message: string) {
        this.showNotification(`New message from ${senderName}`, {
            body: message,
            tag: 'chat-notification',
            requireInteraction: false
        });

        this.playMessageSound();
    }

    // Show incoming call notification
    static notifyIncomingCall(callerName: string, callType: 'video' | 'voice') {
        this.showNotification(`Incoming ${callType} call`, {
            body: `${callerName} is calling...`,
            tag: 'call-notification',
            requireInteraction: true
        });

        this.playRingtone();
    }

    // Play message sound
    static playMessageSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } catch (error) {
            console.error('Audio playback failed:', error);
        }
    }

    // Play ringtone (repeating)
    private static ringtoneInterval: NodeJS.Timeout | null = null;

    static playRingtone() {
        this.stopRingtone(); // Clear any existing ringtone

        const playRing = () => {
            try {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                }

                const ctx = this.audioContext;
                const oscillator1 = ctx.createOscillator();
                const oscillator2 = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator1.frequency.value = 440;
                oscillator2.frequency.value = 554;
                oscillator1.type = 'sine';
                oscillator2.type = 'sine';

                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

                oscillator1.start(ctx.currentTime);
                oscillator2.start(ctx.currentTime);
                oscillator1.stop(ctx.currentTime + 0.8);
                oscillator2.stop(ctx.currentTime + 0.8);
            } catch (error) {
                console.error('Ringtone playback failed:', error);
            }
        };

        playRing(); // Play immediately
        this.ringtoneInterval = setInterval(playRing, 2000); // Repeat every 2 seconds
    }

    static stopRingtone() {
        if (this.ringtoneInterval) {
            clearInterval(this.ringtoneInterval);
            this.ringtoneInterval = null;
        }
    }

    // Show toast notification (in-app)
    static showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
                type === 'warning' ? 'bg-orange-500 text-white' :
                    'bg-blue-500 text-white'
            }`;
        toast.textContent = message;
        toast.style.animation = 'slideIn 0.3s ease-out';

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // In-app notification storage
    private static NOTIFICATIONS_KEY = 'ns_in_app_notifications';

    static getInAppNotifications(userId: string): any[] {
        try {
            const all = JSON.parse(localStorage.getItem(this.NOTIFICATIONS_KEY) || '[]');
            return all.filter((n: any) => n.targetUserId === userId);
        } catch {
            return [];
        }
    }

    static getUnreadCount(userId: string): number {
        return this.getInAppNotifications(userId).filter((n: any) => !n.read).length;
    }

    static createInAppNotification(notification: {
        targetUserId: string;
        type: string;
        title: string;
        message: string;
        actionUrl?: string;
        prescriptionId?: string;
    }): void {
        try {
            const all = JSON.parse(localStorage.getItem(this.NOTIFICATIONS_KEY) || '[]');
            const newNotif = {
                id: `notif_${Date.now()}`,
                ...notification,
                read: false,
                createdAt: new Date().toISOString()
            };
            all.unshift(newNotif);
            localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(all.slice(0, 100)));

            // Show toast
            this.showToast(notification.title, 'info');
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    }

    static markAsRead(notificationId: string): void {
        try {
            const all = JSON.parse(localStorage.getItem(this.NOTIFICATIONS_KEY) || '[]');
            const notif = all.find((n: any) => n.id === notificationId);
            if (notif) {
                notif.read = true;
                localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(all));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }

    // Helper: Create prescription notification
    static notifyPrescriptionCreated(
        farmerId: string,
        farmerName: string,
        employeeName: string,
        prescriptionId: string
    ): void {
        // Notify farmer
        this.createInAppNotification({
            targetUserId: farmerId,
            type: 'prescription',
            title: 'New Prescription',
            message: `${employeeName} has created a new prescription for you`,
            prescriptionId,
            actionUrl: '/farmer/prescriptions'
        });

        // Notify admin
        this.createInAppNotification({
            targetUserId: 'admin_nilesh',
            type: 'prescription',
            title: 'New Prescription Created',
            message: `${employeeName} created prescription for ${farmerName}`,
            prescriptionId,
            actionUrl: '/admin/prescriptions'
        });

        // Show browser notification
        this.showNotification('New Prescription', {
            body: `${employeeName} created prescription for ${farmerName}`
        });
    }

    // Helper: Create commission notification
    static notifyCommissionUpdated(
        employeeId: string,
        amount: number,
        type: 'add' | 'subtract',
        reason: string
    ): void {
        this.createInAppNotification({
            targetUserId: employeeId,
            type: 'commission',
            title: type === 'add' ? 'Commission Awarded' : 'Commission Deducted',
            message: `₹${Math.abs(amount)} ${type === 'add' ? 'added' : 'deducted'}. Reason: ${reason}`,
            actionUrl: '/employee/commission'
        });
    }
}

// Initialize notification permission on first import
if (typeof window !== 'undefined') {
    NotificationService.requestPermission();
}
