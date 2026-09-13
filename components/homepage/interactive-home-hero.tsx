'use client';

import styles from './interactive-home-hero.module.css';

const ROUTES = [
  'M -6 36 C 18 18, 34 20, 49 31 S 78 56, 98 44 S 127 14, 174 24',
  'M -8 69 C 18 52, 42 57, 60 72 S 88 96, 108 78 S 139 46, 176 58',
  'M 4 17 C 25 31, 43 9, 63 21 S 90 50, 112 34 S 142 8, 174 18',
  'M 22 104 C 45 84, 63 87, 79 99 S 108 120, 128 100 S 151 77, 176 88',
  'M -12 88 C 15 74, 36 80, 55 92 S 86 110, 104 94 S 137 69, 178 76',
  'M 10 48 C 29 38, 48 42, 68 53 S 96 73, 119 58 S 149 37, 178 45',
  'M 0 118 C 23 99, 48 103, 66 114 S 97 132, 121 116 S 151 96, 180 106',
];

const CONTOURS = [
  'M -10 27 C 14 5, 43 10, 62 29 S 99 58, 127 38 S 156 7, 180 21',
  'M -14 42 C 12 23, 38 25, 58 43 S 95 72, 121 54 S 153 26, 180 39',
  'M -8 57 C 17 39, 41 41, 61 59 S 96 87, 123 69 S 154 45, 174 55',
  'M -5 73 C 19 54, 44 57, 64 74 S 99 101, 126 83 S 157 61, 178 70',
  'M 8 88 C 32 69, 55 72, 74 88 S 108 114, 136 95 S 160 76, 182 84',
  'M 14 103 C 38 84, 61 88, 80 103 S 114 128, 142 109 S 163 91, 184 99',
  'M 28 116 C 49 99, 70 101, 89 115 S 121 138, 149 120 S 169 105, 187 111',
  'M -20 12 C 8 1, 31 4, 50 16 S 84 38, 111 23 S 146 -2, 185 9',
];

const NODES = [
  {path:'route-a',duration:12,delay:-2},
  {path:'route-b',duration:17,delay:-8},
  {path:'route-c',duration:14,delay:-5},
  {path:'route-d',duration:20,delay:-13},
  {path:'route-e',duration:16,delay:-4},
  {path:'route-f',duration:19,delay:-11},
  {path:'route-g',duration:23,delay:-17},
];

export default function InteractiveHomeHero() {
  return (
    <div className={styles.scene} aria-label="North Africa Hub homepage">
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.atmosphereRing} />
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
            <circle
              key={index}
              r={index % 3 === 1 ? 1.35 : 1}
              className={`${styles.node} ${styles[`node${index + 1}`]}`}
            >
              <animateMotion
                dur={`${node.duration}s`}
                begin={`${node.delay}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
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
