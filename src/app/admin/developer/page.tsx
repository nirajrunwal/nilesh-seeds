'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Download, Upload, Bug, Bell, Database, RefreshCw, Code, Package, Send } from 'lucide-react';
import { MockBackend } from '@/lib/mockData';
import { AppUpdateService } from '@/services/appUpdateService';
import APKUploadSection from '@/components/APKUploadSection';

export default function DeveloperSettings() {
    const { user } = useAuth();
    const router = useRouter();
    const [debugMode, setDebugMode] = useState(localStorage.getItem('ns_debug_mode') === 'true');

    // Icon management state
    const [iconPreview, setIconPreview] = useState(AppUpdateService.getCurrentIcon());
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconMandatory, setIconMandatory] = useState(true);

    // Version management state
    const [newVersion, setNewVersion] = useState('');
    const [changelog, setChangelog] = useState('');
    const [versionMandatory, setVersionMandatory] = useState(true);

    if (user?.role !== 'admin') {
        return <div className="p-4">Access denied</div>;
    }

    const handleClearAllData = () => {
        if (!confirm('⚠️ WARNING: This will delete ALL data including users, chats, locations, loyalty points, and queries. This cannot be undone. Are you absolutely sure?')) {
            return;
        }

        if (!confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
            return;
        }

        // Clear all localStorage data except session
        const session = localStorage.getItem('ns_session');
        localStorage.clear();
        if (session) localStorage.setItem('ns_session', session);

        // Reinitialize with default admin
        location.reload();
    };

    const handleExportData = () => {
        const data = {
            users: MockBackend.getUsers(),
            chats: JSON.parse(localStorage.getItem('ns_chats') || '[]'),
            locations: JSON.parse(localStorage.getItem('ns_locations') || '[]'),
            loyalty: JSON.parse(localStorage.getItem('ns_loyalty') || '[]'),
            queries: JSON.parse(localStorage.getItem('ns_queries') || '[]'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nilesh-seeds-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Database exported successfully!');
    };

    const handleImportData = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!confirm('This will replace ALL current data with the imported data. Continue?')) {
                    return;
                }

                // Import data
                if (data.users) localStorage.setItem('ns_users', JSON.stringify(data.users));
                if (data.chats) localStorage.setItem('ns_chats', JSON.stringify(data.chats));
                if (data.locations) localStorage.setItem('ns_locations', JSON.stringify(data.locations));
                if (data.loyalty) localStorage.setItem('ns_loyalty', JSON.stringify(data.loyalty));
                if (data.queries) localStorage.setItem('ns_queries', JSON.stringify(data.queries));

                alert('Data imported successfully! Refreshing...');
                location.reload();
            } catch (error) {
                alert('Error importing data: ' + error);
            }
        };

        input.click();
    };

    const handleTestNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Test Notification', {
                body: 'This is a test notification from Nilesh Seeds',
                icon: '/globe.svg'
            });
        } else {
            alert('Notifications not enabled. Please enable in browser settings.');
        }
    };

    const toggleDebugMode = () => {
        const newMode = !debugMode;
        setDebugMode(newMode);
        localStorage.setItem('ns_debug_mode', newMode.toString());
        alert(`Debug mode ${newMode ? 'enabled' : 'disabled'}. Refresh the page to apply.`);
    };

    const getStorageSize = () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    };

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file');
                return;
            }
            setIconFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setIconPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyAppIcon = () => {
        if (!iconPreview || !iconFile) {
            alert('No icon selected');
            return;
        }

        AppUpdateService.setAppIcon(iconPreview, iconMandatory, user?.name || 'Admin');
        AppUpdateService.updateManifest(iconPreview);

        alert(`App icon updated!${iconMandatory ? ' All users will see the new icon on next login.' : ''}`);
        setIconFile(null);
    };

    const publishVersion = () => {
        if (!newVersion.trim()) {
            alert('Please enter a version number');
            return;
        }
        if (!changelog.trim()) {
            alert('Please enter a changelog');
            return;
        }

        AppUpdateService.publishVersion(newVersion, changelog, versionMandatory, user?.name || 'Admin');

        alert(`Version ${newVersion} published!${versionMandatory ? ' All users will be prompted to update.' : ''}`);
        setNewVersion('');
        setChangelog('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/20">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Code className="h-6 w-6" />
                            Developer Settings
                        </h1>
                        <p className="text-gray-300 text-sm">Advanced application management</p>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto space-y-4">
                {/* System Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        System Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold">{MockBackend.getUsers().length}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Storage Used</p>
                            <p className="text-2xl font-bold">{getStorageSize()} KB</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Debug Mode</p>
                            <p className="text-2xl font-bold">{debugMode ? 'ON' : 'OFF'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">App Version</p>
                            <p className="text-2xl font-bold">{AppUpdateService.getCurrentVersion()}</p>
                        </div>
                    </div>
                </div>

                {/* App Icon Manager */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" />
                        App Icon Manager
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Current App Icon
                            </label>
                            <div className="border-2 border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                                <img
                                    src={iconPreview}
                                    alt="App Icon"
                                    className="w-24 h-24 mx-auto rounded-2xl shadow-md"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.ico'; }}
                                />
                                <p className="text-xs text-gray-500 mt-3">512 x 512 recommended</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Upload New Icon
                            </label>
                            <div className="space-y-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors bg-white">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconUpload}
                                        className="hidden"
                                        id="icon-upload"
                                    />
                                    <label htmlFor="icon-upload" className="cursor-pointer">
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">
                                            Click to upload
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG up to 2MB
                                        </p>
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="icon-mandatory"
                                        checked={iconMandatory}
                                        onChange={(e) => setIconMandatory(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="icon-mandatory" className="text-sm text-gray-700">
                                        Mandatory Update (Force all users)
                                    </label>
                                </div>
                                <button
                                    onClick={applyAppIcon}
                                    disabled={!iconFile}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Icon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Version Management */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Send className="h-5 w-5 text-green-600" />
                        Version Management
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Version Number *
                            </label>
                            <input
                                type="text"
                                value={newVersion}
                                onChange={(e) => setNewVersion(e.target.value)}
                                placeholder="e.g., 1.6.0"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Changelog / Release Notes *
                            </label>
                            <textarea
                                value={changelog}
                                onChange={(e) => setChangelog(e.target.value)}
                                rows={6}
                                placeholder="## What's New&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Bug Fixes&#10;- Fix 1"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none font-mono text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="version-mandatory"
                                checked={versionMandatory}
                                onChange={(e) => setVersionMandatory(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="version-mandatory" className="flex-1 text-sm text-gray-700">
                                <span className="font-medium">Mandatory Update</span>
                                <p className="text-xs text-gray-600">Force all users to update on next login</p>
                            </label>
                        </div>
                        <button
                            onClick={publishVersion}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <Send className="h-5 w-5" />
                            Publish Version
                        </button>
                    </div>
                </div>

                {/* APK Distribution */}
                <APKUploadSection userName={user?.name || 'Admin'} />

                {/* Data Management */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Data Management</h2>
                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Export Database</p>
                                <p className="text-sm opacity-75">Download all data as JSON backup</p>
                            </div>
                        </button>

                        <button
                            onClick={handleImportData}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                        >
                            <Upload className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Import Database</p>
                                <p className="text-sm opacity-75">Restore data from JSON backup</p>
                            </div>
                        </button>

                        <button
                            onClick={handleClearAllData}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Clear All Data</p>
                                <p className="text-sm opacity-75">⚠️ Permanently delete everything</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Testing Tools */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Bug className="h-5 w-5 text-orange-600" />
                        Testing & Debugging
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={toggleDebugMode}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${debugMode ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Code className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Debug Mode</p>
                                <p className="text-sm opacity-75">
                                    {debugMode ? 'Enabled - Console logs active' : 'Disabled - Normal operation'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={handleTestNotification}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Test Notification</p>
                                <p className="text-sm opacity-75">Send a test push notification</p>
                            </div>
                        </button>

                        <button
                            onClick={() => location.reload()}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                            <RefreshCw className="h-5 w-5" />
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Reload Application</p>
                                <p className="text-sm opacity-75">Refresh the page</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-red-800 mb-2">⚠️ Danger Zone</h2>
                    <p className="text-sm text-red-700 mb-4">
                        These actions are permanent and cannot be undone. Use with extreme caution.
                    </p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        <li>Always export data before clearing</li>
                        <li>Import operation replaces ALL existing data</li>
                        <li>Clear data removes everything except admin account</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
