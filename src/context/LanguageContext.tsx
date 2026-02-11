
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'hi' | 'en' | 'mr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Common
        welcome: 'Welcome',
        logout: 'Logout',
        menu: 'Menu',
        language: 'Language',
        settings: 'Settings',
        search: 'Search',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        back: 'Back',
        loading: 'Loading...',

        // Dashboard
        dashboard: 'Dashboard',
        adminDashboard: 'Admin Dashboard',
        employeeDashboard: 'Employee Dashboard',
        farmerDashboard: 'Farmer Dashboard',

        // Weather
        weather: 'Weather',
        temperature: 'Temperature',
        humidity: 'Humidity',
        forecast: 'Forecast',
        currentLocation: 'Current Location',
        partlyCloudy: 'Partly Cloudy',
        sunny: 'Sunny',
        rainy: 'Rainy',
        cloudy: 'Cloudy',

        // Communication
        chat: 'Chat',
        video: 'Video Call',
        call: 'Voice Call',
        voiceCall: 'Voice Call',
        videoCall: 'Video Call',

        // Farmer Features
        ledger: 'Ledger',
        myProfile: 'My Profile',
        profile: 'Profile',
        commission: 'Commission',
        prescriptions: 'Prescriptions',
        myPrescriptions: 'My Prescriptions',
        location: 'Location',
        myLocation: 'My Location',

        // Prescriptions
        prescriptionDetails: 'Prescription Details',
        productName: 'Product Name',
        quantity: 'Quantity',
        unit: 'Unit',
        dosage: 'Dosage',
        size: 'Size/Pack',
        price: 'Price',
        total: 'Total',
        instructions: 'Instructions',
        notes: 'Notes',
        createdBy: 'Created By',
        createdOn: 'Created On',
        newPrescription: 'New Prescription',
        createPrescription: 'Create Prescription',
        viewPrescriptions: 'View Prescriptions',

        // Admin
        mapView: 'Map View',
        searchFarmer: 'Search Farmer by Name...',
        live: 'Live',
        offline: 'Offline',
        farmers: 'Farmers',
        employees: 'Employees',
        locationHistory: 'Location History',
        developer: 'Developer Options',

        // Employee
        assignedFarmers: 'Assigned Farmers',
        myFarmers: 'My Farmers',

        // Status
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        completed: 'Completed',

        // Units
        kg: 'kg',
        liters: 'liters',
        bags: 'bags',
        bottles: 'bottles',
        packets: 'packets',

        // Notifications
        newPrescriptionAlert: 'New Prescription',
        prescriptionCreated: 'Prescription created successfully',
    },
    hi: {
        // Common
        welcome: 'स्वागत है',
        logout: 'लॉग आउट',
        menu: 'मेन्यू',
        language: 'भाषा',
        settings: 'सेटिंग्स',
        search: 'खोजें',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        add: 'जोड़ें',
        back: 'वापस',
        loading: 'लोड हो रहा है...',

        // Dashboard
        dashboard: 'डैशबोर्ड',
        adminDashboard: 'एडमिन डैशबोर्ड',
        employeeDashboard: 'कर्मचारी डैशबोर्ड',
        farmerDashboard: 'किसान डैशबोर्ड',

        // Weather
        weather: 'मौसम',
        temperature: 'तापमान',
        humidity: 'नमी',
        forecast: 'पूर्वानुमान',
        currentLocation: 'वर्तमान स्थान',
        partlyCloudy: 'आंशिक रूप से बादल',
        sunny: 'धूप',
        rainy: 'बारिश',
        cloudy: 'बादल',

        // Communication
        chat: 'चैट',
        video: 'वीडियो कॉल',
        call: 'वॉइस कॉल',
        voiceCall: 'वॉइस कॉल',
        videoCall: 'वीडियो कॉल',

        // Farmer Features
        ledger: 'खाता',
        myProfile: 'मेरी प्रोफाइल',
        profile: 'प्रोफाइल',
        commission: 'कमीशन',
        prescriptions: 'प्रिस्क्रिप्शन',
        myPrescriptions: 'मेरे प्रिस्क्रिप्शन',
        location: 'स्थान',
        myLocation: 'मेरा स्थान',

        // Prescriptions
        prescriptionDetails: 'प्रिस्क्रिप्शन विवरण',
        productName: 'उत्पाद का नाम',
        quantity: 'मात्रा',
        unit: 'इकाई',
        dosage: 'खुराक',
        size: 'आकार/पैक',
        price: 'मूल्य',
        total: 'कुल',
        instructions: 'निर्देश',
        notes: 'टिप्पणियाँ',
        createdBy: 'द्वारा बनाया',
        createdOn: 'बनाया गया',
        newPrescription: 'नया प्रिस्क्रिप्शन',
        createPrescription: 'प्रिस्क्रिप्शन बनाएं',
        viewPrescriptions: 'प्रिस्क्रिप्शन देखें',

        // Admin
        mapView: 'मानचित्र',
        searchFarmer: 'किसान का नाम खोजें...',
        live: 'लाइव',
        offline: 'ऑफलाइन',
        farmers: 'किसान',
        employees: 'कर्मचारी',
        locationHistory: 'स्थान इतिहास',
        developer: 'डेवलपर विकल्प',

        // Employee
        assignedFarmers: 'सौंपे गए किसान',
        myFarmers: 'मेरे किसान',

        // Status
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        pending: 'लंबित',
        completed: 'पूर्ण',

        //Units
        kg: 'किलो',
        liters: 'लीटर',
        bags: 'बैग',
        bottles: 'बोतल',
        packets: 'पैकेट',

        // Notifications
        newPrescriptionAlert: 'नया प्रिस्क्रिप्शन',
        prescriptionCreated: 'प्रिस्क्रिप्शन सफलतापूर्वक बनाया गया',
    },
    mr: {
        // Common
        welcome: 'स्वागत आहे',
        logout: 'लॉग आउट',
        menu: 'मेनू',
        language: 'भाषा',
        settings: 'सेटिंग्ज',
        search: 'शोधा',
        save: 'जतन करा',
        cancel: 'रद्द करा',
        confirm: 'पुष्टी करा',
        delete: 'हटवा',
        edit: 'संपादित करा',
        add: 'जोडा',
        back: 'मागे',
        loading: 'लोड होत आहे...',

        // Dashboard
        dashboard: 'डॅशबोर्ड',
        adminDashboard: 'अडमिन डॅशबोर्ड',
        employeeDashboard: 'कर्मचारी डॅशबोर्ड',
        farmerDashboard: 'शेतकरी डॅशबोर्ड',

        // Weather
        weather: 'हवामान',
        temperature: 'तापमान',
        humidity: 'आर्द्रता',
        forecast: 'अंदाज',
        currentLocation: 'सध्याचे स्थान',
        partlyCloudy: 'ढगाळ वातावरण',
        sunny: 'सनी',
        rainy: 'पाऊस',
        cloudy: 'ढगाळ',

        // Communication
        chat: 'चॅट',
        video: 'व्हिडिओ कॉल',
        call: 'व्हॉइस कॉल',
        voiceCall: 'व्हॉइस कॉल',
        videoCall: 'व्हिडिओ कॉल',

        // Farmer Features
        ledger: 'खाते',
        myProfile: 'माझी प्रोफाइल',
        profile: 'प्रोफाइल',
        commission: 'कमिशन',
        prescriptions: 'प्रिस्क्रिप्शन',
        myPrescriptions: 'माझे प्रिस्क्रिप्शन',
        location: 'स्थान',
        myLocation: 'माझे स्थान',

        // Prescriptions
        prescriptionDetails: 'प्रिस्क्रिप्शन तपशील',
        productName: 'उत्पादनाचे नाव',
        quantity: 'प्रमाण',
        unit: 'युनिट',
        dosage: 'डोस',
        size: 'आकार/पॅक',
        price: 'किंमत',
        total: 'एकूण',
        instructions: 'सूचना',
        notes: 'नोट्स',
        createdBy: 'तयार केले',
        createdOn: 'तारीख',
        newPrescription: 'नवीन प्रिस्क्रिप्शन',
        createPrescription: 'प्रिस्क्रिप्शन तयार करा',
        viewPrescriptions: 'प्रिस्क्रिप्शन पहा',

        // Admin
        mapView: 'नकाशा',
        searchFarmer: 'शेतकऱ्याचे नाव शोधा...',
        live: 'लाइव्ह',
        offline: 'ऑफलाइन',
        farmers: 'शेतकरी',
        employees: 'कर्मचारी',
        locationHistory: 'स्थान इतिहास',
        developer: 'डेव्हलपर पर्याय',

        // Employee
        assignedFarmers: 'नियुक्त शेतकरी',
        myFarmers: 'माझे शेतकरी',

        // Status
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        pending: 'प्रलंबित',
        completed: 'पूर्ण',

        // Units
        kg: 'किलो',
        liters: 'लिटर',
        bags: 'पिशव्या',
        bottles: 'बाटल्या',
        packets: 'पॅकेट',

        // Notifications
        newPrescriptionAlert: 'नवीन प्रिस्क्रिप्शन',
        prescriptionCreated: 'प्रिस्क्रिप्शन यशस्वीरित्या तयार केले',
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'hi',
    setLanguage: () => { },
    t: (k) => k,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>('hi');

    useEffect(() => {
        const saved = localStorage.getItem('ns_lang') as Language;
        if (saved) setLanguage(saved);
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('ns_lang', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
