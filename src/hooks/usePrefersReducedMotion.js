import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const devReduced = () => import.meta.env.DEV && new URLSearchParams(window.location.search).get('reduced') === '1';

/**
 * Tracks the user's reduced-motion preference, live.
 * Used to disable the automatic key sequence, smooth scrolling and the 3D scene.
 */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && (devReduced() || (typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches))
      ? true
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event) => setReduced(devReduced() || event.matches);
    setReduced(devReduced() || mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
