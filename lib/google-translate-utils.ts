// lib/google-translate-utils.ts

import { useState, useEffect } from 'react';

export interface GoogleTranslateConfig {
  pageLanguage?: string;
  includedLanguages?: string;
  layout?: number;
  autoDisplay?: boolean;
  multilanguagePage?: boolean;
}

// Declare global types for Google Translate
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: any;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

// Comprehensive list of language codes supported by Google Translate
export const GOOGLE_TRANSLATE_LANGUAGES = {
  // Major Indian languages
  'hi': 'Hindi',
  'bn': 'Bengali',
  'te': 'Telugu', 
  'mr': 'Marathi',
  'ta': 'Tamil',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'ur': 'Urdu',
  'ne': 'Nepali',
  'si': 'Sinhala',
  
  // Southeast Asian languages
  'my': 'Myanmar (Burmese)',
  'th': 'Thai',
  'vi': 'Vietnamese', 
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'km': 'Khmer',
  'lo': 'Lao',
  
  // East Asian languages
  'zh': 'Chinese (Simplified)',
  'zh-tw': 'Chinese (Traditional)',
  'ja': 'Japanese',
  'ko': 'Korean',
  
  // European languages
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'el': 'Greek',
  'tr': 'Turkish',
  
  // Middle Eastern & African languages
  'ar': 'Arabic',
  'fa': 'Persian',
  'he': 'Hebrew',
  'am': 'Amharic',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  
  // Others
  'sq': 'Albanian',
  'az': 'Azerbaijani',
  'be': 'Belarusian',
  'bs': 'Bosnian',
  'ca': 'Catalan',
  'cy': 'Welsh',
  'eu': 'Basque',
  'ga': 'Irish',
  'is': 'Icelandic',
  'ka': 'Georgian',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mt': 'Maltese',
  'mn': 'Mongolian',
  'sr': 'Serbian',
  'tg': 'Tajik',
  'tk': 'Turkmen',
  'uz': 'Uzbek',
  'yi': 'Yiddish'
} as const;

// Default configuration for agricultural websites
export const DEFAULT_GOOGLE_TRANSLATE_CONFIG: GoogleTranslateConfig = {
  pageLanguage: 'en',
  includedLanguages: Object.keys(GOOGLE_TRANSLATE_LANGUAGES).join(','),
  layout: 1, // Simple layout
  autoDisplay: false,
  multilanguagePage: true
};

// Utility functions
export class GoogleTranslateManager {
  private static instance: GoogleTranslateManager;
  private isLoaded = false;
  private callbacks: (() => void)[] = [];
  private loadingPromise: Promise<void> | null = null;

  static getInstance(): GoogleTranslateManager {
    if (!GoogleTranslateManager.instance) {
      GoogleTranslateManager.instance = new GoogleTranslateManager();
    }
    return GoogleTranslateManager.instance;
  }

  // Load Google Translate script
  loadScript(config: GoogleTranslateConfig = DEFAULT_GOOGLE_TRANSLATE_CONFIG): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Google Translate can only be loaded in browser'));
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="translate.google.com"]');
        if (existingScript && window.google?.translate) {
          this.isLoaded = true;
          resolve();
          return;
        }

        // Set up the callback
        window.googleTranslateElementInit = () => {
          try {
            if (window.google?.translate?.TranslateElement) {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: config.pageLanguage || 'en',
                  includedLanguages: config.includedLanguages || Object.keys(GOOGLE_TRANSLATE_LANGUAGES).join(','),
                  layout: config.layout || 1,
                  autoDisplay: config.autoDisplay || false,
                  multilanguagePage: config.multilanguagePage || true
                },
                'google_translate_element'
              );
              
              this.isLoaded = true;
              this.callbacks.forEach(callback => {
                try {
                  callback();
                } catch (err) {
                  console.warn('Error in Google Translate callback:', err);
                }
              });
              this.callbacks = [];
              resolve();
            } else {
              reject(new Error('Google Translate API not available'));
            }
          } catch (error) {
            console.error('Error initializing Google Translate:', error);
            reject(error);
          }
        };

        // Load the script if it doesn't exist
        if (!existingScript) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          script.async = true;
          script.onerror = () => reject(new Error('Failed to load Google Translate script'));
          document.head.appendChild(script);
        }
      } catch (error) {
        reject(error);
      }
    });

    return this.loadingPromise;
  }

  // Get current translation language
  getCurrentLanguage(): string | null {
    if (typeof window === 'undefined') return null;
    
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    return selectElement ? selectElement.value : null;
  }

  // Check if translation is active
  isTranslationActive(): boolean {
    const currentLang = this.getCurrentLanguage();
    return currentLang !== '' && currentLang !== null;
  }

  // Reset to original language
  resetTranslation(): void {
    if (typeof window === 'undefined') return;
    
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = '';
      selectElement.dispatchEvent(new Event('change'));
    }
  }

  // Set specific language
  setLanguage(languageCode: string): void {
    if (typeof window === 'undefined') return;
    
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event('change'));
    }
  }

  // Add callback for when translation changes
  onTranslationChange(callback: (language: string | null) => void): (() => void) {
    if (typeof window === 'undefined') return () => {};

    let lastLang = this.getCurrentLanguage();
    
    const checkInterval = setInterval(() => {
      try {
        const currentLang = this.getCurrentLanguage();
        
        if (currentLang !== lastLang) {
          callback(currentLang);
          lastLang = currentLang;
        }
      } catch (error) {
        console.warn('Error checking translation change:', error);
      }
    }, 500);

    // Return cleanup function
    return () => clearInterval(checkInterval);
  }

  // Hide Google Translate banner
  hideBanner(): void {
    if (typeof window === 'undefined') return;

    const existingStyle = document.getElementById('google-translate-banner-style');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'google-translate-banner-style';
      style.textContent = `
        .goog-te-banner-frame.skiptranslate { 
          display: none !important; 
        }
        body { 
          top: 0px !important; 
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// React hook for Google Translate
export function useGoogleTranslate(config?: GoogleTranslateConfig) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const manager = GoogleTranslateManager.getInstance();

  useEffect(() => {
    let isMounted = true;

    manager.loadScript(config)
      .then(() => {
        if (isMounted) {
          setIsLoaded(true);
          setError(null);
          manager.hideBanner();
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load Google Translate');
          console.error('Google Translate load error:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [config, manager]);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;
    const cleanup = manager.onTranslationChange((language) => {
      if (isMounted) {
        setCurrentLanguage(language);
      }
    });
    
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [isLoaded, manager]);

  return {
    isLoaded,
    currentLanguage,
    error,
    isActive: isLoaded ? manager.isTranslationActive() : false,
    setLanguage: (lang: string) => manager.setLanguage(lang),
    resetTranslation: () => manager.resetTranslation()
  };
}