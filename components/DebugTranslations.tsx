// components/DebugTranslations.tsx
"use client";

import { translations } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DebugTranslations() {
  const { language, t } = useLanguage();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Translation Debug Info:</h4>
      <p><strong>Current Language:</strong> {language}</p>
      <p><strong>Translations Object:</strong> {translations ? '✅ Loaded' : '❌ Missing'}</p>
      <p><strong>Available Languages:</strong> {translations ? Object.keys(translations).join(', ') : 'None'}</p>
      <p><strong>Sample Translation (home):</strong> {t('home')}</p>
      <p><strong>English Fallback:</strong> {translations?.en?.home || 'Missing'}</p>
    </div>
  );
}