import { useEffect, useMemo, useRef, useState } from 'react';
import { STACK_GROUPS } from '../config/content.js';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';
import { useIsSmallLowPower, useWebGLSupported } from '../hooks/useCapabilities.js';
import { iconPaths } from './scene/stackIcons.js';

export default function StackSection() {
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsSmallLowPower();
  const webgl = useWebGLSupported();
  const flat = reducedMotion || lowPower || !webgl;
  const stageRef = useRef(null);
  const inViewRef = useRef(false);
  const [stageVisible, setStageVisible] = useState(false);
  useEffect(() => {
    if (flat) return undefined;
    const element = stageRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') { inViewRef.current = true; setStageVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => { inViewRef.current = entry.isIntersecting; setStageVisible(entry.isIntersecting && document.visibilityState !== 'hidden'); });
    observer.observe(element);
    return () => observer.disconnect();
  }, [flat]);
  useEffect(() => {
    const handleVisibility = () => setStageVisible(inViewRef.current && document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  useEffect(() => {
    if (flat) return undefined;
    const element = stageRef.current;
    if (!element) return undefined;
    const clear = () => element.querySelectorAll('.stack-tag').forEach((tag) => {
      tag.style.removeProperty('--parallax-x'); tag.style.removeProperty('--parallax-y');
    });
    const move = (event) => {
      const bounds = element.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      element.querySelectorAll('.stack-tag').forEach((tag, index) => {
        const strength = 2 + (index % 4) * 1.4;
        tag.style.setProperty('--parallax-x', `${x * strength}px`);
        tag.style.setProperty('--parallax-y', `${y * strength}px`);
      });
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', clear);
    return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', clear); };
  }, [flat]);
  const items = useMemo(() => STACK_GROUPS.flatMap((group) => group.items), []);
  return (
    <section id="stack" tabIndex={-1} aria-labelledby="stack-title" className="stack-section section-anchor py-20 md:py-28">
      <div className="site-container stack-live">
        <p className="eyebrow">//03 STACK</p>
        <h2 id="stack-title" className="heading-xl mt-3">Tools I work with.</h2>
        <p className="lede mt-5 max-w-2xl">A growing collection of languages, tools, and platforms I use while learning and building.</p>
        <div className={`stack-stage stack-grid mt-12${flat ? ' is-static' : ` is-floating${stageVisible ? ' is-active' : ''}`}`} ref={stageRef} role="group" aria-label="Technology stack">
          <div className="stack-dom-overlay">
            {STACK_GROUPS.map((group, groupIndex) => <div className={`stack-cluster stack-cluster--${groupIndex + 1}`} key={group.label}>
              <p className="stack-cluster-label">{group.label}</p>
              <ul className="stack-cluster__items">{group.items.map((item, itemIndex) => <li key={item}>
                <span className="stack-tag" style={{ '--tag-index': groupIndex * 8 + itemIndex }}>
                  {iconPaths[item] && <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPaths[item]} /></svg>}
                  <span>{item}</span>
                </span>
              </li>)}</ul>
            </div>)}
          </div>
        </div>
        {!flat && <ul className="stack-sr-list" aria-label="Full technology stack">{items.map((item) => <li key={item}>{item}</li>)}</ul>}
      </div>
    </section>
  );
}
