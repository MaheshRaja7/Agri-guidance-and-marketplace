"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";

export function ClientLanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const LANG_STORAGE_KEY = "googleTranslateLang";
    const DEFAULT_LANG = "en";

    const getCookieValue = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const setCookie = (name: string, value: string) => {
      // Set both with and without domain so it works on localhost and deployed domains.
      document.cookie = `${name}=${value};path=/;`; 
      document.cookie = `${name}=${value};path=/;domain=${window.location.hostname};`;
    };

    const setGoogleTranslateCookie = (lang: string) => {
      const normalized = lang || DEFAULT_LANG;
      setCookie('googtrans', `/en/${normalized}`);
    };

    const getSavedLanguage = () => {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored) return stored;

      const cookieValue = getCookieValue('googtrans');
      if (cookieValue) {
        const parts = cookieValue.split('/');
        if (parts.length >= 3) return parts[2];
      }

      return DEFAULT_LANG;
    };

    const saveLanguage = (lang: string) => {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      setGoogleTranslateCookie(lang);
    };

    const applyLanguageToWidget = (lang: string) => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        }
      }
    };

    const attachLanguageListener = () => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (!combo) return;
      if ((combo as any).__languageListenerAttached) return;

      combo.addEventListener('change', () => {
        const selected = combo.value;
        saveLanguage(selected);
      });
      (combo as any).__languageListenerAttached = true;
    };

    const initTranslateWidget = () => {
      const element = document.getElementById('google_translate_element');
      if (!element) {
        setTimeout(initTranslateWidget, 250);
        return;
      }

      const google = (window as any).google;
      if (google && google.translate && google.translate.TranslateElement) {
        const targetLang = getSavedLanguage();
        setGoogleTranslateCookie(targetLang);

        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages:
            'hi,es,ta,te,bn,mr,gu,kn,ml,or,pa,ur,as,ne,si,my,th,vi,id,ms,tl,zh,ja,ko,ar,fa,tr,ru,fr,de,it,pt,nl,sv,da,no,fi,pl,cs,sk,hu,ro,bg,hr,sl,et,lv,lt,el,he,am,sw,zu,af',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true,
        }, 'google_translate_element');

        // Sometimes the widget takes a moment to build the select element, so re-apply after a short delay.
        setTimeout(() => {
          applyLanguageToWidget(targetLang);
          attachLanguageListener();
        }, 500);

        // Observe DOM for widget creation (Next.js route changes can re-render it)
        const observer = new MutationObserver(() => {
          attachLanguageListener();
          applyLanguageToWidget(getSavedLanguage());
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    // Load Google Translate script (only once)
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    // Define the global init callback (only once)
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = initTranslateWidget;
    }

    // Add styling for the widget
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0px !important; }
      .goog-te-gadget-simple {
        background-color: white !important;
        border: 1px solid #4CAF50 !important;
        padding: 4px 8px !important;
        font-size: 0.8rem !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        border-radius: 4px !important;
        min-width: auto !important;
        height: auto !important;
      }
      .goog-te-gadget-simple:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        transform: translateY(-1px) !important;
      }
      .goog-te-menu-frame {
        border: 1px solid #4CAF50 !important;
        border-radius: 4px !important;
        background: white !important;
        z-index: 1000 !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
      }
      .goog-te-menu-value span {
        color: inherit !important;
        font-size: 0.9rem !important;
      }
      .goog-te-menu-value:hover {
        opacity: 0.85 !important;
      }
    `;
    document.head.appendChild(style);

    // Keep auth token/user in sync between cookie and localStorage (used by other components)
    const storedToken = localStorage.getItem('token');
    const cookieToken = getCookieValue('token');

    if (!storedToken && cookieToken) {
      localStorage.setItem('token', cookieToken);
      // Fetch verified user and store it for other components
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${cookieToken}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, []);

  return <LanguageProvider>{children}</LanguageProvider>;
}