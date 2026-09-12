'use client';

import {useEffect,useState} from 'react';
import styles from './mode-switcher.module.css';

type World = 'matrix' | 'atlas';

const STORAGE_KEY = 'north-africa-hub-mode';

function readWorld(): World {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'atlas' || stored === 'matrix') return stored;
    return window.localStorage.getItem('egystocks-theme') === 'light' ? 'atlas' : 'matrix';
  } catch {
    return 'matrix';
  }
}

function setWorld(world: World) {
  document.documentElement.dataset.theme = world;
  try {
    window.localStorage.setItem(STORAGE_KEY, world);
    window.localStorage.setItem('egystocks-theme', world === 'matrix' ? 'dark' : 'light');
  } catch {
    // Theme state still applies for the current session if storage is unavailable.
  }
}

export default function ModeSwitcher() {
  const [world,setWorldState] = useState<World>('matrix');

  useEffect(() => {
    const sync = () => setWorldState(readWorld());
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const next: World = world === 'matrix' ? 'atlas' : 'matrix';

  function switchWorld() {
    setWorld(next);
    setWorldState(next);
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={switchWorld}
        aria-label={`Switch to ${next === 'atlas' ? 'Atlas' : 'Matrix'}`}
        title={`Switch to ${next === 'atlas' ? 'Atlas' : 'Matrix'}`}
      >
        <span className={styles.instrument} aria-hidden="true">
          <svg viewBox="0 0 36 36" fill="none">
            <circle className={styles.outer} cx="18" cy="18" r="15.25" />
            <circle className={styles.inner} cx="18" cy="18" r="9.5" />
            {world === 'matrix' ? (
              <>
                <path className={styles.matrixLine} d="M18 8.5v19M8.5 18h19" />
                <circle className={styles.matrixPoint} cx="18" cy="18" r="2.1" />
                <path className={styles.matrixTrace} d="M12 12l6 6 6-6M12 24l6-6 6 6" />
              </>
            ) : (
              <>
                <path className={styles.atlasLine} d="M9.5 21.5c3.4-5.6 7.4-7.5 11.2-6.2 2.4.8 4.2.2 5.8-2.2" />
                <path className={styles.atlasLine} d="M10.5 24.5c3.2-2.4 6.4-2.5 9.2-.5 2 1.4 3.7 1.1 5.8-.9" />
                <circle className={styles.atlasPoint} cx="25.8" cy="12.9" r="1.5" />
              </>
            )}
            <path className={styles.tick} d="M18 2.8v3M33.2 18h-3M18 33.2v-3M2.8 18h3" />
          </svg>
        </span>
        <span className={styles.caption}>{world === 'matrix' ? 'Matrix' : 'Atlas'}</span>
      </button>
    </div>
  );
}
