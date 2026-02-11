// APK Upload Section Component for Developer Options
'use client';

import { useState } from 'react';
import { Package, Download, Trash2 } from 'lucide-react';
import { AppUpdateService, APKUpdate } from '@/services/appUpdateService';

interface APKUploadSectionProps {
    userName: string;
}

export default function APKUploadSection({ userName }: APKUploadSectionProps) {
    const [apkFile, setApkFile] = useState<File | null>(null);
    const [apkVersion, setApkVersion] = useState('');
    const [releaseNotes, setReleaseNotes] = useState('');
    const [apkMandatory, setApkMandatory] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentAPK, setCurrentAPK] = useState<APKUpdate | null>(AppUpdateService.getCurrentAPK());
    const [apkHistory, setApkHistory] = useState<APKUpdate[]>(AppUpdateService.getAPKHistory());

    const handleAPKFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setApkFile(file);
        }
    };

    const handleAPKUpload = async () => {
        if (!apkFile) {
            alert('Please select an APK file');
            return;
        }
        if (!apkVersion.trim()) {
            alert('Please enter a version number');
            return;
        }
        if (!releaseNotes.trim()) {
            alert('Please enter release notes');
            return;
        }

        setUploading(true);
        try {
            const uploaded = await AppUpdateService.uploadAPK(
                apkFile,
                apkVersion,
                releaseNotes,
                apkMandatory,
                userName
            );

            setCurrentAPK(uploaded);
            setApkHistory(AppUpdateService.getAPKHistory());

            alert(`APK v${apkVersion} uploaded successfully!${apkMandatory ? ' Mandatory update enforced.' : ''}`);

            // Reset form
            setApkFile(null);
            setApkVersion('');
            setReleaseNotes('');
            (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
        } catch (error) {
            console.error('APK upload failed:', error);
            alert('Failed to upload APK. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadAPK = (apk: APKUpdate) => {
        AppUpdateService.downloadAPK(apk);
    };

    const handleDeleteAPK = (id: string) => {
        if (confirm('Delete this APK version?')) {
            AppUpdateService.deleteAPK(id);
            setCurrentAPK(AppUpdateService.getCurrentAPK());
            setApkHistory(AppUpdateService.getAPKHistory());
            alert('APK deleted successfully');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                APK Distribution
            </h2>

            {/* Current APK Info */}
            {currentAPK && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-sm text-gray-600">Current Version</p>
                            <p className="text-2xl font-bold text-purple-700">{currentAPK.version}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Downloads</p>
                            <p className="text-2xl font-bold text-indigo-700">{currentAPK.downloads}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{formatFileSize(currentAPK.fileSize)}</p>
                    {currentAPK.mandatory && (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            Mandatory Update
                        </span>
                    )}
                </div>
            )}

            {/* Upload New APK */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">Upload New APK</h3>
                <div className="space-y-4">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            APK File
                        </label>
                        <input
                            type="file"
                            accept=".apk,application/vnd.android.package-archive"
                            onChange={handleAPKFileChange}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                        {apkFile && (
                            <p className="text-sm text-gray-600 mt-2">
                                Selected: {apkFile.name} ({formatFileSize(apkFile.size)})
                            </p>
                        )}
                    </div>

                    {/* Version */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Version Number
                        </label>
                        <input
                            type="text"
                            value={apkVersion}
                            onChange={(e) => setApkVersion(e.target.value)}
                            placeholder="e.g., 1.0.6"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Release Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Release Notes
                        </label>
                        <textarea
                            value={releaseNotes}
                            onChange={(e) => setReleaseNotes(e.target.value)}
                            rows={4}
                            placeholder="• Bug fixes&#10;• Performance improvements&#10;• New features"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Mandatory Update Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="apk-mandatory"
                            checked={apkMandatory}
                            onChange={(e) => setApkMandatory(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label htmlFor="apk-mandatory" className="text-sm text-gray-700">
                            Mandatory Update (Force all users to install)
                        </label>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleAPKUpload}
                        disabled={uploading}
                        className={`w-full py-3 bg-purple-600 text-white rounded-lg font-semibold transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload & Publish APK'}
                    </button>
                </div>
            </div>

            {/* APK History */}
            {apkHistory.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3">APK History</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {apkHistory.map((apk) => (
                            <div
                                key={apk.id}
                                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">v{apk.version}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(apk.uploadedAt).toLocaleDateString()} • {formatFileSize(apk.fileSize)} • {apk.downloads} downloads
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadAPK(apk)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAPK(apk.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
