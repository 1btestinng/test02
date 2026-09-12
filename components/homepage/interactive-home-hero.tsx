'use client';

import {useEffect, useRef} from 'react';
import styles from './interactive-home-hero.module.css';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  ampX: number;
  ampY: number;
  size: number;
  opacity: number;
  mass: number;
};

const PARTICLES: Particle[] = [
  {x: -150, y: -92, vx: 0, vy: 0, phase: .2, speed: .62, ampX: 15, ampY: 11, size: 5, opacity: .32, mass: 1},
  {x: 138, y: -76, vx: 0, vy: 0, phase: 1.1, speed: .48, ampX: 12, ampY: 18, size: 9, opacity: .24, mass: 1.2},
  {x: -196, y: -4, vx: 0, vy: 0, phase: 2.4, speed: .55, ampX: 20, ampY: 9, size: 4, opacity: .26, mass: .8},
  {x: 184, y: 22, vx: 0, vy: 0, phase: 3.2, speed: .42, ampX: 14, ampY: 17, size: 6, opacity: .28, mass: 1},
  {x: -137, y: 82, vx: 0, vy: 0, phase: 4.1, speed: .58, ampX: 17, ampY: 12, size: 12, opacity: .16, mass: 1.5},
  {x: 152, y: 98, vx: 0, vy: 0, phase: 5.2, speed: .5, ampX: 11, ampY: 16, size: 4, opacity: .3, mass: .8},
  {x: -70, y: -130, vx: 0, vy: 0, phase: .9, speed: .39, ampX: 9, ampY: 15, size: 3, opacity: .35, mass: .7},
  {x: 66, y: 128, vx: 0, vy: 0, phase: 2.9, speed: .45, ampX: 13, ampY: 8, size: 7, opacity: .2, mass: 1.1},
  {x: -218, y: 50, vx: 0, vy: 0, phase: 5.8, speed: .36, ampX: 12, ampY: 20, size: 3, opacity: .24, mass: .7},
  {x: 220, y: -42, vx: 0, vy: 0, phase: 4.7, speed: .52, ampX: 16, ampY: 10, size: 5, opacity: .22, mass: 1},
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function InteractiveHomeHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const textRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let last = performance.now();
    let active = true;
    const pointer = {x: 0, y: 0, inside: false};

    const updatePointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.x = event.clientX - (rect.left + rect.width / 2);
      pointer.y = event.clientY - (rect.top + rect.height / 2);
      pointer.inside = true;
    };

    const clearPointer = () => {
      pointer.inside = false;
    };

    root.addEventListener('pointermove', updatePointer, {passive: true});
    root.addEventListener('pointerleave', clearPointer, {passive: true});

    const render = (now: number) => {
      if (!active) return;
      const dt = clamp((now - last) / 16.67, .4, 1.8);
      last = now;
      const t = now / 1000;
      const rootRect = root.getBoundingClientRect();
      const mobile = rootRect.width < 700;
      const radius = mobile ? 135 : 185;
      const strength = mobile ? 2.8 : 3.8;

      PARTICLES.forEach((particle, index) => {
        const element = particleRefs.current[index];
        if (!element) return;

        const driftX = Math.sin(t * particle.speed + particle.phase) * particle.ampX;
        const driftY = Math.cos(t * particle.speed * .83 + particle.phase) * particle.ampY;
        let targetX = particle.x + driftX;
        let targetY = particle.y + driftY;

        if (pointer.inside) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const safeDistance = Math.max(distance, 1);
            const falloff = Math.pow(1 - distance / radius, 2);
            particle.vx += (dx / safeDistance) * falloff * strength / particle.mass;
            particle.vy += (dy / safeDistance) * falloff * strength / particle.mass;
          }
        }

        particle.vx *= Math.pow(.84, dt);
        particle.vy *= Math.pow(.84, dt);
        particle.vx = clamp(particle.vx, -7, 7);
        particle.vy = clamp(particle.vy, -7, 7);
        targetX += particle.vx * 8;
        targetY += particle.vy * 8;

        const maxX = Math.max(90, rootRect.width * .34);
        const maxY = Math.max(80, rootRect.height * .31);
        targetX = clamp(targetX, -maxX, maxX);
        targetY = clamp(targetY, -maxY, maxY);
        element.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      });

      textRefs.current.forEach((element, index) => {
        if (!element) return;
        const phase = [0, 1.7, 3.1][index] ?? 0;
        let x = Math.sin(t * (.18 + index * .025) + phase) * (index === 1 ? 2.5 : 1.7);
        let y = Math.cos(t * (.14 + index * .018) + phase) * (index === 0 ? 2 : 1.4);
        let scale = 1;

        if (pointer.inside) {
          const rect = element.getBoundingClientRect();
          const cx = rect.left + rect.width / 2 - (rootRect.left + rootRect.width / 2);
          const cy = rect.top + rect.height / 2 - (rootRect.top + rootRect.height / 2);
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const distance = Math.hypot(dx, dy);
          const escapeRadius = mobile ? 100 : 125;

          if (distance < escapeRadius) {
            const falloff = Math.pow(1 - distance / escapeRadius, 2);
            const safeDistance = Math.max(distance, 1);
            x += (dx / safeDistance) * falloff * (mobile ? 15 : 22);
            y += (dy / safeDistance) * falloff * (mobile ? 15 : 22);
            scale = 1 - falloff * .018;
          }
        }

        element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      });

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', updatePointer);
      root.removeEventListener('pointerleave', clearPointer);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.scene} aria-label="Koshary and Couscous homepage">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.signals} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.particles} aria-hidden="true">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            ref={(element) => { particleRefs.current[index] = element; }}
            className={styles.particle}
            style={{
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <section className={styles.message} aria-label="Koshary and Couscous statement">
        <p ref={(element) => { textRefs.current[0] = element; }} className={styles.identity}>
          The United States of North Africa
        </p>
        <h1 ref={(element) => { textRefs.current[1] = element; }}>
          We love koshary and couscous.
        </h1>
        <p ref={(element) => { textRefs.current[2] = element; }} className={styles.love}>
          We love you all.
        </p>
      </section>
    </div>
  );
}
