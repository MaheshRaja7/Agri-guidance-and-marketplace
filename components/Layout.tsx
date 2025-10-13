// app/layout.tsx or components/Layout.tsx
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

// Inner component that uses the language context
function LayoutContent({ children, user, onLogout }: LayoutProps) {
  const { isGoogleTranslateActive } = useLanguage();

  return (
    <>
      <Head>
        {/* Meta tags for Google Translate */}
        <meta name="google-translate-customization" content="YOUR_CUSTOMIZATION_ID" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        
        {/* Preconnect to Google services for faster loading */}
        <link rel="preconnect" href="https://translate.google.com" />
        <link rel="preconnect" href="https://translate.googleapis.com" />
        
        {/* Add the Google Translate styles */}
        <link rel="stylesheet" href="/styles/google-translate.css" />
      </Head>

      <div className={`app ${isGoogleTranslateActive ? 'google-translate-active' : ''}`}>
        <Header user={user} onLogout={onLogout} />
        
        <main className="main-content">
          {children}
        </main>

        {/* Language status indicator */}
        {isGoogleTranslateActive && (
          <div className="language-status active">
            <span>🌐</span>
            Google Translate is active
          </div>
        )}

        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 AgriGuide. All rights reserved.</p>
            <div className="footer-links">
              <span className="translation-info">
                Interface available in multiple languages. 
                Use Google Translate for additional language support.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Main layout component with provider
export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <LanguageProvider>
      <LayoutContent user={user} onLogout={onLogout}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}

// Alternative: If you're using this in a Next.js app directory, use this structure:
// app/layout.tsx
export function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-translate-customization" content="YOUR_CUSTOMIZATION_ID" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="preconnect" href="https://translate.google.com" />
        <link rel="preconnect" href="https://translate.googleapis.com" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}