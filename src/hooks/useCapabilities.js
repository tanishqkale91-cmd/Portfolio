import { useState } from 'react';

let webglProbe;

/** One-off capability probe: does this browser actually give us a WebGL context? */
export function useWebGLSupported() {
  const [supported] = useState(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('webgl') === 'off') return false;
    if (typeof webglProbe === 'boolean') return webglProbe;
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) return false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;
      webglProbe = true;
      return webglProbe;
    } catch {
      webglProbe = false;
      return false;
    }
  });
  return supported;
}

/**
 * "Small, low-power device" check used to choose the static fallback panel for
 * the 3D section: a small viewport combined with few cores or little memory.
 */
export function useIsSmallLowPower() {
  const [lowPower] = useState(() => {
    if (typeof window === 'undefined') return false;
    const small = window.innerWidth < 640;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memoryGb = navigator.deviceMemory ?? 8;
    return small && (cores <= 4 || memoryGb <= 2);
  });
  return lowPower;
}

/** True on touch-first / narrow viewports, used to cap canvas DPR. */
export function useIsMobile() {
  const [mobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });
  return mobile;
}
