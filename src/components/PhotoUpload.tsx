'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import Image from 'next/image';

interface PhotoUploadProps {
    currentPhoto?: string;
    onUpload: (photoBase64: string) => void;
    label?: string;
}

export default function PhotoUpload({ currentPhoto, onUpload, label = "Profile Photo" }: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }

        setUploading(true);

        try {
            // Compress and convert to base64
            const compressedBase64 = await compressImage(file);
            setPreview(compressedBase64);
            onUpload(compressedBase64);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target?.result as string;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize to max 400x400 while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 400;

                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx?.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressed = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressed);
                };

                img.onerror = reject;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="relative h-24 w-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100">
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={handleRemove}
                                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload"
                    />
                    <label
                        htmlFor="photo-upload"
                        className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                {preview ? 'Change Photo' : 'Upload Photo'}
                            </>
                        )}
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                        JPG, PNG or GIF. Max 2MB. Will be resized to 400x400.
                    </p>
                </div>
            </div>
        </div>
    );
}
