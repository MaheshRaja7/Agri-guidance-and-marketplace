// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { useGoogleTranslate } from "@/lib/google-translate-utils";
import styles from './Header.module.css';
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialize Google Translate
  const { isLoaded, error } = useGoogleTranslate({
    pageLanguage: 'en',
    includedLanguages: 'hi,es,ta,te,bn,mr,gu,kn,ml,or,pa,ur,as,ne,si,my,th,vi,id,ms,tl,zh,ja,ko,ar,fa,tr,ru,fr,de,it,pt,nl,sv,da,no,fi,pl,cs,sk,hu,ro,bg,hr,sl,et,lv,lt,el,he,am,sw,zu,af',
    layout: 1,
    autoDisplay: false,
    multilanguagePage: true
  });

  // Get translation function
  const { t } = useLanguage();

  // Add custom styles for Google Translate widget
  useEffect(() => {
    if (isLoaded) {
      const existingStyle = document.getElementById('google-translate-custom-style');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'google-translate-custom-style';
        style.textContent = `
          .goog-te-banner-frame.skiptranslate { 
            display: none !important; 
          }
          .goog-te-gadget-simple {
            background-color: white !important;
            border: 2px solid #4CAF50 !important;
            padding: 8px 12px !important;
            font-size: 0.9rem !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
          }
          .goog-te-gadget-simple:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
            transform: translateY(-1px) !important;
          }
          .goog-te-gadget-icon {
            background: none !important;
            width: 20px !important;
            height: 20px !important;
            margin-right: 5px !important;
          }
          .goog-te-gadget-icon:before {
            content: "🌐" !important;
            font-size: 18px !important;
          }
          .goog-te-menu-frame {
            border: 2px solid #4CAF50 !important;
            border-radius: 8px !important;
            background: white !important;
          }
          .goog-te-menu-value span {
            color: inherit !important;
          }
          .goog-te-menu-value:hover {
            opacity: 0.85 !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [isLoaded]);

  const toggleMobileMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    if (onLogout) {
      try {
        onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.logo}>🌾 AgriGuide</div>

          <ul className={`${styles.navLinks} ${isMenuOpen ? styles.mobileOpen : ''}`}>
            <li>
              <a href="/" className={styles.navLink}>{t('home')}</a>
            </li>
            <li>
              <a href="/marketplace" className={styles.navLink}>{t('marketplace')}</a>
            </li>
            <li>
              <a href="/weather" className={styles.navLink}>{t('weather')}</a>
            </li>
            <li>
              <a href="/disease-detection" className={styles.navLink}>{t('diseaseDetection')}</a>
            </li>
            <li>
              <a href="/chat" className={styles.navLink}>{t('chat')}</a>
            </li>

            {user ? (
              <>
                <li>
                  <a href="/dashboard" className={styles.navLink}>{t('dashboard')}</a>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    {t('logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login" className={styles.navLink}>{t('login')}</a>
                </li>
                <li>
                  <a href="/register" className={styles.navLink}>{t('register')}</a>
                </li>
              </>
            )}
          </ul>

          <div className={styles.headerControls}>
            {/* Google Translate Widget Only */}
            <div className={styles.translateControls}>
              <div className={styles.googleTranslateWrapper}>
                <div id="google_translate_element" aria-label="Google Translate"></div>
                {!isLoaded && !error && (
                  <div className={styles.translateLoading}>
                      <span title="Loading Google Translate...">🌐 {t('loading')}</span>
                  </div>
                )}
                {error && (
                  <div className={styles.translateError} title={error}>
                      <span>⚠️ {t('error')}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              className={styles.mobileMenuToggle}
              onClick={toggleMobileMenu}
              aria-label={isMenuOpen ? `${t('close') || 'Close'} menu` : `${t('open') || 'Open'} menu`}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}