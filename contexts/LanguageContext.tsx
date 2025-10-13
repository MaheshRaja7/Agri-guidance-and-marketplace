// contexts/LanguageContext.tsx
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Import the translations directly to ensure they're available
import { translations, type Language, type TranslationKey } from "@/lib/translations";

// Fallback translations in case of import issues
const fallbackTranslations = {
  en: {
    home: "Home",
    weather: "Weather", 
    marketplace: "Marketplace",
    chat: "AI Chat",
    diseaseDetection: "Disease Detection",
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    logout: "Logout",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  }
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isGoogleTranslateActive: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [isGoogleTranslateActive, setIsGoogleTranslateActive] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage (client-only)
    const saved = (typeof window !== "undefined"
      ? (localStorage.getItem("language") as Language | null)
      : null) as Language | null;

    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  // Monitor Google Translate activity
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkGoogleTranslate = () => {
      // Check if Google Translate has been activated
      const translateElement = document.querySelector('.goog-te-combo');
      const isActive = translateElement && 
        (translateElement as HTMLSelectElement).value !== '';
      
      setIsGoogleTranslateActive(!!isActive);
    };

    // Check initially
    checkGoogleTranslate();

    // Monitor changes
    const observer = new MutationObserver(checkGoogleTranslate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Also listen for select changes on Google Translate
    const interval = setInterval(checkGoogleTranslate, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem("language", lang);
    } catch {
      // ignore localStorage errors
    }

    // Reset Google Translate to default when switching custom language
    if (typeof window !== "undefined") {
      const googleTranslateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleTranslateSelect && googleTranslateSelect.value !== '') {
        googleTranslateSelect.value = '';
        googleTranslateSelect.dispatchEvent(new Event('change'));
      }
    }
  };

  // SAFE FALLBACK: never crash if a language or key is missing
  const t = (key: TranslationKey): string => {
    // Use fallback if translations is undefined or empty
    const safeTranslations = translations || fallbackTranslations;
    
    // Ensure we have the English fallback
    const englishSet = safeTranslations.en || fallbackTranslations.en;
    
    // Get the language set with fallback to English
    const langSet = safeTranslations[language] || englishSet;
    
    // Return the translation with multiple fallbacks
    return langSet?.[key] || englishSet?.[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t,
      isGoogleTranslateActive 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}