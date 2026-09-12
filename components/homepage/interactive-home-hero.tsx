'use client';

import styles from './interactive-home-hero.module.css';

const ROUTES = [
  'M 4 39 C 16 23, 30 20, 45 28 S 72 52, 92 43 S 124 15, 148 23',
  'M 12 72 C 29 58, 44 62, 58 75 S 84 94, 103 76 S 128 48, 151 55',
  'M 8 19 C 28 31, 43 11, 61 20 S 87 48, 108 35 S 132 10, 156 18',
  'M 28 96 C 44 82, 59 86, 72 96 S 101 116, 119 96 S 138 74, 157 82',
];

const CONTOURS = [
  'M -8 30 C 17 8, 43 12, 61 31 S 98 58, 126 39 S 154 8, 174 22',
  'M -12 47 C 13 28, 37 29, 57 47 S 94 77, 119 58 S 151 30, 176 43',
  'M -6 64 C 18 45, 40 47, 59 64 S 94 91, 121 73 S 151 50, 170 60',
  'M 18 111 C 40 90, 62 93, 79 109 S 112 133, 139 111 S 158 88, 177 97',
];

const NODES = [
  {cx:45, cy:28, path:'route-a'},
  {cx:103, cy:76, path:'route-b'},
  {cx:108, cy:35, path:'route-c'},
];

export default function InteractiveHomeHero() {
  return (
    <div className={styles.scene} aria-label="North Africa Hub homepage">
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.atmosphereRing} />
        <span className={styles.atmosphereRing} />
      </div>

      <div className={styles.terrain} aria-hidden="true">
        <svg viewBox="0 0 168 128" preserveAspectRatio="none" role="presentation">
          {CONTOURS.map((path, index) => (
            <path key={path} d={path} className={`${styles.contour} ${styles[`contour${index + 1}`]}`} />
          ))}
        </svg>
      </div>

      <div className={styles.routes} aria-hidden="true">
        <svg viewBox="0 0 168 128" preserveAspectRatio="none" role="presentation">
          {ROUTES.map((path, index) => (
            <path
              key={path}
              id={`route-${String.fromCharCode(97 + index)}`}
              d={path}
              pathLength="1"
              className={`${styles.route} ${styles[`route${index + 1}`]}`}
            />
          ))}
          {NODES.map((node, index) => (
            <circle key={index} r={index === 1 ? 1.1 : .8} className={`${styles.node} ${styles[`node${index + 1}`]}`}>
              <animateMotion dur={`${34 + index * 11}s`} begin={`${index * 7}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#${node.path}`} />
              </animateMotion>
            </circle>
          ))}
        </svg>
      </div>

      <div className={styles.microEvents} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className={styles.message} aria-label="North Africa Hub statement">
        <p className={styles.identity}>The United States of North Africa</p>
        <h1>We love koshary and couscous.</h1>
        <p className={styles.love}>We love you all.</p>
      </section>
    </div>
  );
}
