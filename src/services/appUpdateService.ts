// App Update Service - Manages app icons, version updates, and APK distribution
export interface AppIconUpdate {
    iconUrl: string;
    timestamp: string;
    mandatory: boolean;
    appliedBy: string;
}

export interface VersionUpdate {
    version: string;
    changelog: string;
    mandatory: boolean;
    timestamp: string;
    publishedBy: string;
}

export interface APKUpdate {
    id: string;
    version: string;
    releaseNotes: string;
    fileName: string;
    fileSize: number;
    fileUrl: string; // Base64 data URL or external URL
    uploadedAt: string;
    uploadedBy: string;
    mandatory: boolean;
    downloads: number;
}

export interface PendingUpdate {
    type: 'icon' | 'version' | 'both';
    iconUpdate?: AppIconUpdate;
    versionUpdate?: VersionUpdate;
}

export class AppUpdateService {
    private static ICON_KEY = 'ns_app_icon';
    private static ICON_HISTORY_KEY = 'ns_icon_history';
    private static VERSION_KEY = 'ns_app_version';
    private static VERSION_HISTORY_KEY = 'ns_version_history';
    private static USER_VERSION_KEY = 'ns_user_app_version';
    private static PENDING_UPDATES_KEY = 'ns_pending_updates';
    private static APK_KEY = 'ns_current_apk';
    private static APK_HISTORY_KEY = 'ns_apk_history';

    // Icon Management
    static getCurrentIcon(): string {
        return localStorage.getItem(this.ICON_KEY) || '/favicon.ico';
    }

    static setAppIcon(iconUrl: string, mandatory: boolean, appliedBy: string): void {
        const update: AppIconUpdate = {
            iconUrl,
            timestamp: new Date().toISOString(),
            mandatory,
            appliedBy
        };

        // Save current icon
        localStorage.setItem(this.ICON_KEY, iconUrl);

        // Add to history
        const history = this.getIconHistory();
        history.unshift(update);
        localStorage.setItem(this.ICON_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));

        // If mandatory, trigger update for all users
        if (mandatory) {
            this.triggerMandatoryIconUpdate(update);
        }
    }

    static getIconHistory(): AppIconUpdate[] {
        const history = localStorage.getItem(this.ICON_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    private static triggerMandatoryIconUpdate(update: AppIconUpdate): void {
        const pending = this.getPendingUpdates();
        pending.iconUpdate = update;
        pending.type = pending.versionUpdate ? 'both' : 'icon';
        localStorage.setItem(this.PENDING_UPDATES_KEY, JSON.stringify(pending));
    }

    // Version Management
    static getCurrentVersion(): string {
        return localStorage.getItem(this.VERSION_KEY) || '1.5.0';
    }

    static getUserVersion(): string {
        return localStorage.getItem(this.USER_VERSION_KEY) || '1.5.0';
    }

    static publishVersion(version: string, changelog: string, mandatory: boolean, publishedBy: string): void {
        const update: VersionUpdate = {
            version,
            changelog,
            mandatory,
            timestamp: new Date().toISOString(),
            publishedBy
        };

        // Save new version
        localStorage.setItem(this.VERSION_KEY, version);

        // Add to history
        const history = this.getVersionHistory();
        history.unshift(update);
        localStorage.setItem(this.VERSION_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));

        // If mandatory, trigger update for all users
        if (mandatory) {
            this.triggerMandatoryVersionUpdate(update);
        }
    }

    static getVersionHistory(): VersionUpdate[] {
        const history = localStorage.getItem(this.VERSION_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    private static triggerMandatoryVersionUpdate(update: VersionUpdate): void {
        const pending = this.getPendingUpdates();
        pending.versionUpdate = update;
        pending.type = pending.iconUpdate ? 'both' : 'version';
        localStorage.setItem(this.PENDING_UPDATES_KEY, JSON.stringify(pending));
    }

    // APK Management
    static async uploadAPK(
        file: File,
        version: string,
        releaseNotes: string,
        mandatory: boolean,
        uploadedBy: string
    ): Promise<APKUpdate> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const fileUrl = reader.result as string;

                const apkUpdate: APKUpdate = {
                    id: `apk_${Date.now()}`,
                    version,
                    releaseNotes,
                    fileName: file.name,
                    fileSize: file.size,
                    fileUrl, // Base64 data URL
                    uploadedAt: new Date().toISOString(),
                    uploadedBy,
                    mandatory,
                    downloads: 0
                };

                // Set as current APK
                localStorage.setItem(this.APK_KEY, JSON.stringify(apkUpdate));

                // Add to history
                const history = this.getAPKHistory();
                history.unshift(apkUpdate);
                localStorage.setItem(this.APK_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));

                resolve(apkUpdate);
            };

            reader.onerror = () => {
                reject(new Error('Failed to read APK file'));
            };

            reader.readAsDataURL(file);
        });
    }

    static getCurrentAPK(): APKUpdate | null {
        const apk = localStorage.getItem(this.APK_KEY);
        return apk ? JSON.parse(apk) : null;
    }

    static getAPKHistory(): APKUpdate[] {
        const history = localStorage.getItem(this.APK_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    static deleteAPK(id: string): boolean {
        try {
            // Remove from history
            const history = this.getAPKHistory().filter(apk => apk.id !== id);
            localStorage.setItem(this.APK_HISTORY_KEY, JSON.stringify(history));

            // If it's the current APK, clear it
            const currentAPK = this.getCurrentAPK();
            if (currentAPK && currentAPK.id === id) {
                localStorage.removeItem(this.APK_KEY);
            }

            return true;
        } catch {
            return false;
        }
    }

    static incrementAPKDownloads(id: string): void {
        const history = this.getAPKHistory();
        const apkIndex = history.findIndex(apk => apk.id === id);

        if (apkIndex !== -1) {
            history[apkIndex].downloads += 1;
            localStorage.setItem(this.APK_HISTORY_KEY, JSON.stringify(history));

            // Update current APK if it's the one being downloaded
            const currentAPK = this.getCurrentAPK();
            if (currentAPK && currentAPK.id === id) {
                currentAPK.downloads += 1;
                localStorage.setItem(this.APK_KEY, JSON.stringify(currentAPK));
            }
        }
    }

    static downloadAPK(apk: APKUpdate): void {
        // Increment download count
        this.incrementAPKDownloads(apk.id);

        // Trigger download
        const link = document.createElement('a');
        link.href = apk.fileUrl;
        link.download = apk.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Update Check
    static getPendingUpdates(): PendingUpdate {
        const pending = localStorage.getItem(this.PENDING_UPDATES_KEY);
        return pending ? JSON.parse(pending) : { type: 'version' };
    }

    static hasPendingUpdates(): boolean {
        const pending = this.getPendingUpdates();
        return !!(pending.iconUpdate || pending.versionUpdate);
    }

    static clearPendingUpdates(): void {
        localStorage.removeItem(this.PENDING_UPDATES_KEY);
    }

    static applyUpdates(): void {
        const pending = this.getPendingUpdates();

        // Update user's current version
        if (pending.versionUpdate) {
            localStorage.setItem(this.USER_VERSION_KEY, pending.versionUpdate.version);
        }

        // Clear pending updates
        this.clearPendingUpdates();

        // Reload app to apply changes
        window.location.reload();
    }

    // Update manifest.json dynamically (for PWA icon)
    static async updateManifest(iconUrl: string): Promise<void> {
        try {
            // In a real PWA, this would update the manifest file
            // For now, we'll update the link in the head
            const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
            if (manifestLink) {
                // Create updated manifest object
                const manifest = {
                    name: "Nilesh Seeds",
                    short_name: "NS",
                    icons: [
                        {
                            src: iconUrl,
                            sizes: "192x192",
                            type: "image/png"
                        },
                        {
                            src: iconUrl,
                            sizes: "512x512",
                            type: "image/png"
                        }
                    ],
                    theme_color: "#059669",
                    background_color: "#ffffff",
                    display: "standalone",
                    start_url: "/"
                };

                // Create blob URL for manifest
                const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                manifestLink.href = url;
            }

            // Update favicon
            const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
            if (favicon) {
                favicon.href = iconUrl;
            }
        } catch (error) {
            console.error('Error updating manifest:', error);
        }
    }

    // Check for updates on app load
    static checkForUpdates(): PendingUpdate | null {
        const currentVersion = this.getCurrentVersion();
        const userVersion = this.getUserVersion();
        const pending = this.getPendingUpdates();

        // Check if user is behind on version
        if (currentVersion !== userVersion) {
            const latestVersionUpdate = this.getVersionHistory()[0];
            if (latestVersionUpdate && latestVersionUpdate.mandatory) {
                return {
                    type: 'version',
                    versionUpdate: latestVersionUpdate
                };
            }
        }

        // Check for pending updates
        if (this.hasPendingUpdates()) {
            return pending;
        }

        return null;
    }
}
