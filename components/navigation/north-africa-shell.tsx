'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NORTH_AFRICA_SECTIONS} from '@/lib/north-africa';
import styles from './north-africa-shell.module.css';

const primaryNavigation = NORTH_AFRICA_SECTIONS.filter(section => section.group === 'primary');
const visionNavigation = NORTH_AFRICA_SECTIONS.find(section => section.id === 'vision');

export default function NorthAfricaShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();

  const isActive = (href:string) => pathname === href || pathname.startsWith(`${href}/`);

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

          <nav className={styles.mobileNav} aria-label="Primary navigation">
            <div className={styles.mobileNavScroller}>
              {primaryNavigation.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${styles.mobileNavLink}${isActive(item.href) ? ` ${styles.active}` : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
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
