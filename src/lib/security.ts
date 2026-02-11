// Security utilities for password hashing and encryption

import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

const SALT_ROUNDS = 10;
const ENCRYPTION_KEY = 'NS_SECRET_KEY_2024'; // In production, use env variable

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Encrypt sensitive data (AES-256)
 */
export function encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt encrypted data
 */
export function decrypt(encryptedData: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}

/**
 * Generate secure random token
 */
export function generateToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Encrypt object for storage
 */
export function encryptObject(obj: any): string {
    return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt object from storage
 */
export function decryptObject<T>(encryptedData: string): T | null {
    try {
        const decrypted = decrypt(encryptedData);
        return decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
        console.error('Object decryption failed:', error);
        return null;
    }
}

/**
 * Secure localStorage wrapper
 */
export const SecureStorage = {
    setItem(key: string, value: any): void {
        const encrypted = encryptObject(value);
        localStorage.setItem(key, encrypted);
    },

    getItem<T>(key: string): T | null {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return decryptObject<T>(encrypted);
    },

    removeItem(key: string): void {
        localStorage.removeItem(key);
    },

    clear(): void {
        localStorage.clear();
    }
};
