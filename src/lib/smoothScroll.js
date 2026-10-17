import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let detachTicker = null;

/**
 * Starts Lenis smooth scrolling and drives it from GSAP's ticker, so
 * ScrollTrigger always reads the scroll position Lenis has written.
 * Returns a cleanup function. With `enabled: false` (reduced motion) we leave
 * native browser scrolling completely alone.
 */
export function startSmoothScroll({ enabled = true } = {}) {
  stopSmoothScroll();
  if (!enabled) return stopSmoothScroll;

  lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  detachTicker = () => gsap.ticker.remove(tick);

  return stopSmoothScroll;
}

/** Stops and disposes the Lenis instance (safe to call repeatedly). */
export function stopSmoothScroll() {
  if (detachTicker) {
    detachTicker();
    detachTicker = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

/** Recalculates pin and trigger positions before a scripted in-page jump. */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

/** Scrolls an anchor target into view, below the sticky header. */
export function scrollToTarget(target, { smooth = true, offset = 0 } = {}) {
  if (!target) return;
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  if (lenis) {
    const nativeScroll = window.scrollY;
    if (Math.abs(lenis.animatedScroll - nativeScroll) > 1) {
      lenis.scrollTo(nativeScroll, { immediate: true, force: true });
    }
    // Lenis subtracts both scroll-margin and root scroll-padding when resolving
    // an element target. Compensate so the requested offset remains the final
    // visual gap below the sticky header.
    const targetStyle = getComputedStyle(element);
    const rootStyle = getComputedStyle(document.documentElement);
    const scrollMargin = Number.parseFloat(targetStyle.scrollMarginTop) || 0;
    const scrollPadding = Number.parseFloat(rootStyle.scrollPaddingTop) || 0;
    lenis.scrollTo(typeof target === 'string' ? target : element, {
      offset: offset + scrollMargin + scrollPadding,
      duration: smooth ? 1 : 0,
      onComplete: () => {
        const desiredTop = -offset;
        const correction = element.getBoundingClientRect().top - desiredTop;
        if (Math.abs(correction) > 1) {
          lenis.scrollTo(window.scrollY + correction, { immediate: true, force: true });
        }
      },
    });
    return;
  }
  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}

/** Freezes page scrolling while a modal dialog is open, and restores it after. */
export function setScrollLocked(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
    return;
  }
  document.documentElement.classList.toggle('scroll-locked', locked);
}
