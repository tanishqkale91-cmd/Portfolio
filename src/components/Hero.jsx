import { Suspense, lazy } from 'react';
import Keyboard from './Keyboard.jsx';
import Marquee from './Marquee.jsx';
import { HERO_LINES } from '../config/content.js';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';
import { useIsSmallLowPower, useWebGLSupported } from '../hooks/useCapabilities.js';

const HeroBackdrop = lazy(() => import('./scene/HeroBackdrop.jsx'));

/**
 * Hero: headline → sculptural keyboard → edge-to-edge marquee.
 * Spacing stays tight so the keyboard sits close to the headline and the whole
 * trio fits comfortably in a 1440×810 viewport.
 */
export default function Hero({ loaderDone = true }) {
  const reducedMotion = usePrefersReducedMotion();
  const webglSupported = useWebGLSupported();
  const lowPower = useIsSmallLowPower();
  return (
    <section
      id="top"
      className="hero-section"
      aria-labelledby="hero-title"
    >
      {!reducedMotion && webglSupported && !lowPower ? (
        <div className="hero-backdrop" aria-hidden="true"><Suspense fallback={null}><HeroBackdrop /></Suspense></div>
      ) : null}
      <div className="site-container relative z-10 pt-8 sm:pt-10">
        <h1
          id="hero-title"
          className="font-display font-black tracking-[-0.03em] text-ink"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)', lineHeight: 1.05 }}
        >
          {HERO_LINES.map((line, lineIndex) => (
            <span className="block" key={lineIndex}>
              {line.map((part, partIndex) =>
                part.emphasis ? (
                  <em
                    key={partIndex}
                    className="font-serif font-normal italic text-accent"
                  >
                    {part.text}
                  </em>
                ) : (
                  <span key={partIndex}>{part.text}</span>
                ),
              )}
            </span>
          ))}
        </h1>
      </div>

      <div className="site-container relative z-10 mt-6 sm:mt-7">
        <Keyboard enabled={loaderDone} />
      </div>

      <Marquee />
    </section>
  );
}
