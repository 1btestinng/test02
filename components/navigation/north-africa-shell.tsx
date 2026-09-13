'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NORTH_AFRICA_SECTIONS} from '@/lib/north-africa';
import styles from './north-africa-shell.module.css';

const primaryNavigation = NORTH_AFRICA_SECTIONS.filter(section => section.group === 'primary');
const visionNavigation = NORTH_AFRICA_SECTIONS.find(section => section.id === 'vision');

export default function NorthAfricaShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href:string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event:KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={styles.frame}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.identity}>
            <Link href="/" className={styles.brand} aria-label="North Africa Hub home">
              <span className={styles.brandName}>NORTH AFRICA HUB</span>
              <span className={styles.tagline}>The United States of North Africa</span>
            </Link>
          </div>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {primaryNavigation.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navLink}${isActive(item.href) ? ` ${styles.active}` : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="north-africa-mobile-navigation"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen(value => !value)}
          >
            <span>{menuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>
        </div>

        <div className={`${styles.mobilePanel}${menuOpen ? ` ${styles.mobilePanelOpen}` : ''}`}>
          <nav id="north-africa-mobile-navigation" className={styles.mobileNav} aria-label="Mobile primary navigation">
            {primaryNavigation.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.mobileNavLink}${isActive(item.href) ? ` ${styles.active}` : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                <span className={styles.mobileArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.content}>{children}</main>

      {visionNavigation && (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <Link
              href={visionNavigation.href}
              className={`${styles.visionLink}${isActive(visionNavigation.href) ? ` ${styles.active}` : ''}`}
              aria-current={isActive(visionNavigation.href) ? 'page' : undefined}
            >
              <span>VISION</span>
              <span className={styles.visionArrow} aria-hidden="true">→</span>
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
