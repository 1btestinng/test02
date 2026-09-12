import Link from 'next/link';
import styles from './mobile-explore-nav.module.css';

const NAV_ITEMS = [
  {label:'History',href:'/history'},
  {label:'Markets',href:'/markets'},
  {label:'Travel',href:'/travel'},
  {label:'Culture',href:'/culture'},
  {label:'People',href:'/people'},
  {label:'Visions',href:'/vision'},
] as const;

export default function MobileExploreNav(){
  return (
    <nav className={styles.nav} aria-label="Explore North Africa Hub">
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.scroller}>
          <div className={styles.items}>
            {NAV_ITEMS.map((item)=>(
              <Link key={item.href} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <span className={styles.edge} aria-hidden="true">→</span>
      </div>
    </nav>
  );
}
