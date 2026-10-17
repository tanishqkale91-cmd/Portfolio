import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import WorkSection from './components/WorkSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import StackSection from './components/StackSection.jsx';
import ActivitySection from './components/ActivitySection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import usePrefersReducedMotion from './hooks/usePrefersReducedMotion.js';
import { useIsSmallLowPower, useWebGLSupported } from './hooks/useCapabilities.js';
import { scrollToTarget, startSmoothScroll } from './lib/smoothScroll.js';
import Loader from './components/Loader.jsx';

// The 3D section is code-split: never in the initial bundle.
const SpaceScene = lazy(() => import('./components/scene/SpaceScene.jsx'));

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [showLoader, setShowLoader] = useState(() => {
    try {
      return !sessionStorage.getItem('tanishq-portfolio-loaded');
    } catch { /* Storage may be disabled; show the intro for this visit. */ }
    return true;
  });
  const [introComplete, setIntroComplete] = useState(() => {
    try { return Boolean(sessionStorage.getItem('tanishq-portfolio-loaded')); }
    catch { return false; }
  });
  const finishLoading = useCallback(() => {
    try { sessionStorage.setItem('tanishq-portfolio-loaded', '1'); } catch { /* Keep the intro usable without storage. */ }
    setShowLoader(false);
  }, []);
  const finishLoaderExit = useCallback(() => setIntroComplete(true), []);

  // Lenis drives smooth scrolling and feeds GSAP's ticker, so ScrollTrigger
  // always reads the scroll position Lenis has written. Disabled entirely when
  // the user prefers reduced motion (native scrolling is then left alone).
  useEffect(() => startSmoothScroll({ enabled: !reducedMotion && introComplete }), [reducedMotion, introComplete]);
  useEffect(() => {
    document.documentElement.classList.toggle('scroll-locked', showLoader);
    return () => document.documentElement.classList.remove('scroll-locked');
  }, [showLoader]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion-active', reducedMotion);
    return () => document.documentElement.classList.remove('reduced-motion-active');
  }, [reducedMotion]);

  const webgl = useWebGLSupported();
  const smallLowPower = useIsSmallLowPower();

  // In-page anchors go through Lenis so scroll position and ScrollTrigger stay
  // in sync. Works for the header nav, the wordmark, the dialog's section link
  // and the skip link.
  useEffect(() => {
    const handleClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      // The skip link keeps native behaviour (instant jump + focus handling).
      if (target.id === 'main') return;

      event.preventDefault();
      const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      scrollToTarget(target, { smooth: !reducedMotion, offset: -(headerHeight + 24) });
      history.pushState(null, '', href);
      target.focus({ preventScroll: true });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [reducedMotion]);

  return (
    <>
      {!reducedMotion && webgl && !smallLowPower && <Suspense fallback={<div className="space-fallback" aria-hidden="true" />}><SpaceScene /></Suspense>}
      {(reducedMotion || !webgl || smallLowPower) && <div className="space-fallback" aria-hidden="true" />}
      <AnimatePresence onExitComplete={finishLoaderExit}>
        {showLoader ? <Loader key="intro-loader" onComplete={finishLoading} /> : null}
      </AnimatePresence>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        href="#main"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="site-main">
        <Hero loaderDone={introComplete} />
        <WorkSection />
        <AboutSection />
        <StackSection />
        <ActivitySection />
        <ContactSection sceneEnabled={!reducedMotion && webgl && !smallLowPower} />
      </main>

        <Footer sceneEnabled={!reducedMotion && webgl && !smallLowPower} />
    </>
  );
}
