// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from './Header.module.css';
import { useLanguage } from "@/contexts/LanguageContext";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartCount } from "@/lib/cart";

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
  currentLanguage?: string;
  onLanguageChange?: any;
}

export default function Header({ user: propUser, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(propUser);
  const router = useRouter();

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user from local storage", e);
        }
      }
    }

    const refreshCart = () => setCartCount(getCartCount());
    refreshCart();

    // Update cart count when other tabs update localStorage
    window.addEventListener("storage", refreshCart);
    // Update cart count when cart helper dispatches change event
    window.addEventListener("cart-changed", refreshCart);

    return () => {
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("cart-changed", refreshCart);
    };
  }, [propUser]);

  // Get translation function
  const { t } = useLanguage();

  const toggleMobileMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Remove auth cookie used by middleware for protected routes
    document.cookie = "token=; path=/; max-age=0";

    setUser(null);
    if (onLogout) {
      try {
        onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    router.push("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.logo} onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
            <Image
              src="/images/logo.svg"
              alt="AgriGuide logo"
              width={160}
              height={40}
              priority
            />
          </div>

          <ul className={`${styles.navLinks} ${isMenuOpen ? styles.mobileOpen : ''}`}>
            <li>
              <Link href="/" className={styles.navLink}>{t('home')}</Link>
            </li>

            <li>
              <Link href="/marketplace" className={styles.navLink}>{t('marketplace')}</Link>
            </li>

            {/* Farmer Specific Links */}
            {user && user.userType === 'farmer' && (
              <li>
                <Link href="/farmer/dashboard" className={styles.navLink}>Dashboard</Link>
              </li>
            )}

            {/* Customer Specific Links */}
            {user && user.userType === 'customer' && (
              <li>
                <Link href="/customer/dashboard" className={styles.navLink}>My Orders</Link>
              </li>
            )}

            <li>
              <Link href="/weather" className={styles.navLink}>{t('weather')}</Link>
            </li>
            <li>
              <Link href="/disease-detection" className={styles.navLink}>{t('diseaseDetection')}</Link>
            </li>
            <li>
              <Link href="/chat" className={styles.navLink}>{t('chat')}</Link>
            </li>
            {(!user || user.userType !== 'farmer') && (
              <li>
                <Link href="/cart" className={styles.navLink}>
                  <ShoppingCart className="inline-block mr-1" />
                  {t('cart') || 'Cart'}
                  {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                </Link>
              </li>
            )}

            {user ? (
              <>
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
                  <Link href="/login" className={styles.navLink}>{t('login')}</Link>
                </li>
                <li>
                  <Link href="/register" className={styles.navLink}>{t('register')}</Link>
                </li>
              </>
            )}
          </ul>

          <div className={styles.headerControls}>
            <div className={styles.translateControls}>
            <span className={styles.translateLabel}>Select Language</span>
            <div id="google_translate_element" className={styles.googleTranslateWrapper} aria-label="Google Translate"></div>
            <span className={styles.translatePowered}>Powered by Google</span>

            <button
              className={styles.mobileMenuToggle}
              onClick={toggleMobileMenu}
              aria-label={isMenuOpen ? `${t('close' as any) || 'Close'} menu` : `${t('open' as any) || 'Open'} menu`}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        </nav>
      </div>
    </header>
  );
}