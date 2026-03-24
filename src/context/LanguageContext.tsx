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

        // New UI Translations
        whatsappSupport: 'WhatsApp Support',
        loyaltyPoints: 'Loyalty Points',
        supportTickets: 'Support Tickets',
        ledger: 'Ledger/Khata',
        myProfile: 'My Profile',
        profile: 'Profile',
        commission: 'Commission',
        earnings: 'Earnings',
        prescriptions: 'Prescriptions',
        myPrescriptions: 'My Prescriptions',
        location: 'Location',
        myLocation: 'My Location',
        quickActions: 'Quick Actions',
        profileDetails: 'Profile Details',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        emailAddress: 'Email Address',
        accountStatus: 'Account Status',
        totalAssigned: 'Total Assigned',
        trackCommission: 'Track Commission',
        gpsTracking: 'GPS Tracking',
        preferences: 'Preferences',
        yourTotalLoyaltyPoints: 'Your Total Loyalty Points',

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
        totLoyalty: 'Tot. Loyalty',
        locationHistory: 'Location History',
        developer: 'Developer Options',
        newFarmer: 'New Farmer',
        analytics: 'Analytics',
        queries: 'Queries',
        broadcast: 'Broadcast',
        messageViaWhatsapp: 'Message via WhatsApp',

        // Employee
        assignedFarmers: 'Assigned Farmers',
        myFarmers: 'My Farmers',
        totalFarmers: 'Total Farmers',
        
        // Status
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        completed: 'Completed',
        blocked: 'Blocked',

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
        weather: 'मौसम जानकारी',
        temperature: 'तापमान',
        humidity: 'नमी',
        forecast: 'पूर्वानुमान',
        currentLocation: 'वर्तमान स्थान',
        partlyCloudy: 'आंशिक रूप से बादल',
        sunny: 'धूप',
        rainy: 'बारिश',
        cloudy: 'बादल',

        // New UI Translations
        whatsappSupport: 'WhatsApp सहायता',
        loyaltyPoints: 'लॉयल्टी प्वॉइंट्स',
        supportTickets: 'सहायता टिकट',
        ledger: 'खाता / बही',
        myProfile: 'मेरी प्रोफाइल',
        profile: 'प्रोफाइल',
        commission: 'कमीशन',
        earnings: 'कमाई',
        prescriptions: 'प्रिस्क्रिप्शन / दवा पर्ची',
        myPrescriptions: 'मेरे प्रिस्क्रिप्शन',
        location: 'स्थान',
        myLocation: 'मेरा स्थान',
        quickActions: 'त्वरित कार्य',
        profileDetails: 'प्रोफाइल विवरण',
        fullName: 'पूरा नाम',
        phoneNumber: 'फ़ोन नंबर',
        emailAddress: 'ईमेल पता',
        accountStatus: 'खाता स्थिति',
        totalAssigned: 'कुल नियुक्त',
        trackCommission: 'कमीशन पर नज़र रखें',
        gpsTracking: 'जीपीएस ट्रैकिंग',
        preferences: 'वरीयताएँ',
        yourTotalLoyaltyPoints: 'आपके कुल लॉयल्टी प्वॉइंट्स',

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
        createdBy: 'द्वारा बनाया गया',
        createdOn: 'बनाने की तिथि',
        newPrescription: 'नया प्रिस्क्रिप्शन',
        createPrescription: 'प्रिस्क्रिप्शन बनाएं',
        viewPrescriptions: 'प्रिस्क्रिप्शन देखें',

        // Admin
        mapView: 'मानचित्र',
        searchFarmer: 'किसान का नाम खोजें...',
        live: 'ऑनलाइन (लाइव)',
        offline: 'ऑफलाइन',
        farmers: 'किसान',
        employees: 'कर्मचारी',
        totLoyalty: 'कुल लॉयल्टी',
        locationHistory: 'स्थान का इतिहास',
        developer: 'डेवलपर विकल्प',
        newFarmer: 'नया किसान',
        analytics: 'एनालिटिक्स',
        queries: 'प्रश्न',
        broadcast: 'संदेश प्रसारण',
        messageViaWhatsapp: 'WhatsApp के माध्यम से संदेश भेजें',

        // Employee
        assignedFarmers: 'सौंपे गए किसान',
        myFarmers: 'मेरे किसान',
        totalFarmers: 'कुल किसान',

        // Status
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        pending: 'लंबित',
        completed: 'पूर्ण',
        blocked: 'अवरुद्ध',

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
        save: 'सेव्ह करा',
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
        weather: 'हवामान माहिती',
        temperature: 'तापमान',
        humidity: 'आर्द्रता',
        forecast: 'अंदाज',
        currentLocation: 'सध्याचे स्थान',
        partlyCloudy: 'अंशतः ढगाळ',
        sunny: 'ऊन',
        rainy: 'पाऊस',
        cloudy: 'ढगाळ',

        // New UI Translations
        whatsappSupport: 'WhatsApp सपोर्ट',
        loyaltyPoints: 'लॉयल्टी पॉईंट्स',
        supportTickets: 'मदत तिकीट',
        ledger: 'खाते / नोंदवही',
        myProfile: 'माझी प्रोफाइल',
        profile: 'प्रोफाइल',
        commission: 'कमिशन',
        earnings: 'कमाई',
        prescriptions: 'प्रिस्क्रिप्शन / औषधांची चिठ्ठी',
        myPrescriptions: 'माझे प्रिस्क्रिप्शन',
        location: 'स्थान',
        myLocation: 'माझे स्थान',
        quickActions: 'जलद कृती',
        profileDetails: 'प्रोफाइल तपशील',
        fullName: 'पूर्ण नाव',
        phoneNumber: 'फोन नंबर',
        emailAddress: 'ईमेल पत्ता',
        accountStatus: 'खाते स्थिती',
        totalAssigned: 'एकूण नियुक्त',
        trackCommission: 'कमिशन मागोवा घ्या',
        gpsTracking: 'जीपीएस ट्रॅकिंग',
        preferences: 'प्राधान्ये',
        yourTotalLoyaltyPoints: 'तुमचे एकूण लॉयल्टी पॉईंट्स',

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
        notes: 'नोंदी',
        createdBy: 'तयार केले',
        createdOn: 'तारीख',
        newPrescription: 'नवीन प्रिस्क्रिप्शन',
        createPrescription: 'प्रिस्क्रिप्शन तयार करा',
        viewPrescriptions: 'प्रिस्क्रिप्शन पहा',

        // Admin
        mapView: 'नकाशा',
        searchFarmer: 'शेतकऱ्याचे नाव शोधा...',
        live: 'लाईव्ह (ऑनलाईन)',
        offline: 'ऑफलाईन',
        farmers: 'शेतकरी',
        employees: 'कर्मचारी',
        totLoyalty: 'एकूण लॉयल्टी',
        locationHistory: 'स्थान इतिहास',
        developer: 'डेव्हेलपर पर्याय',
        newFarmer: 'नवीन शेतकरी',
        analytics: 'अॅनालिटिक्स',
        queries: 'प्रश्न',
        broadcast: 'संदेश पाठवा',
        messageViaWhatsapp: 'WhatsApp द्वारे संदेश पाठवा',

        // Employee
        assignedFarmers: 'नियुक्त शेतकरी',
        myFarmers: 'माझे शेतकरी',
        totalFarmers: 'एकूण शेतकरी',

        // Status
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        pending: 'प्रलंबित',
        completed: 'पूर्ण',
        blocked: 'ब्लॉक केलेले',

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
    language: 'en',
    setLanguage: () => { },
    t: (k) => k,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');

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
