import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { KEYS } from '../config/keyboard.js';

const MIN_DISPLAY_MS = 1200;
const MAX_DISPLAY_MS = 2300;
const PROGRESS_DURATION_MS = 1650;

/** Session intro: bounded progress animation so loading failures never block the page. */
export default function Loader({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const meter = { value: 0 };
    const startedAt = performance.now();
    let finishTimer;
    let finalTween;
    let progressComplete = false;
    let fontsComplete = false;
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(finishTimer);
      window.clearTimeout(maxTimer);
      setProgress(100);
      onComplete();
    };
    const completeProgress = () => {
      if (!progressComplete || !fontsComplete || completed) return;
      finalTween = gsap.to(meter, {
        value: 100,
        duration: reduceMotion ? 0.04 : 0.16,
        ease: 'none',
        onUpdate: () => setProgress(Math.round(meter.value)),
        onComplete: () => {
          finishTimer = window.setTimeout(finish, Math.max(0, MIN_DISPLAY_MS - (performance.now() - startedAt)));
        },
      });
    };
    const progressTween = gsap.to(meter, {
      value: 95,
      duration: reduceMotion ? 0.08 : PROGRESS_DURATION_MS / 1000,
      ease: 'power2.inOut',
      onUpdate: () => setProgress(Math.round(meter.value)),
      onComplete: () => { progressComplete = true; completeProgress(); },
    });
    const maxTimer = window.setTimeout(finish, reduceMotion ? 120 : MAX_DISPLAY_MS);
    (document.fonts?.ready ?? Promise.resolve()).then(() => { fontsComplete = true; completeProgress(); }, () => { fontsComplete = true; completeProgress(); });
    return () => { progressTween.kill(); finalTween?.kill(); window.clearTimeout(finishTimer); window.clearTimeout(maxTimer); };
  }, [onComplete, reduceMotion]);

  return (
      <motion.div className="loader" role="status" aria-live="polite" aria-label="Loading portfolio"
        initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ y: '-100%', transition: { duration: reduceMotion ? 0.12 : 0.65, ease: [0.76, 0, 0.24, 1] } }}>
        <div className="loader__inner">
          <p className="loader__brand">tanishq<span style={{ color: 'var(--accent)' }}>.</span></p>
          <div className="loader__keys" aria-hidden="true">
            {KEYS.map((key, index) => <span key={key.id} className="loader__key" style={{ '--face': key.face, '--base': key.base, '--pressed': progress >= (index + 1) * 10 ? 1 : 0 }} />)}
          </div>
          <div className="loader__line" style={{ transform: `scaleX(${progress / 100})` }} />
          <p className="loader__count">{String(progress).padStart(3, '0')}</p>
        </div>
        <span className="sr-only">Loading</span>
      </motion.div>
  );
}
