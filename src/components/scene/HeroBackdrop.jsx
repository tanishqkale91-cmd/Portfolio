import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { themeColor } from '../../lib/themeColor.js';

const CAPS = [
  { p: [-3.8, 0.3, -1.8], c: '--debris', s: [0.9, 0.72, 0.3], r: [0.2, 0.2, -0.2] },
  { p: [-2.3, -0.8, -2.5], c: '--accent', s: [0.7, 0.7, 0.3], r: [-0.2, 0.5, 0.2] },
  { p: [2.7, 0.9, -2.2], c: '--planet-ring', s: [0.82, 0.74, 0.34], r: [0.2, -0.25, 0.2] },
  { p: [4, -0.4, -2.7], c: '--star', s: [0.72, 0.78, 0.3], r: [-0.3, 0.25, -0.16] },
  { p: [-4.7, -1.1, -2.8], c: '--debris', s: [0.72, 0.68, 0.3], r: [0.1, -0.3, 0.2] },
  { p: [3.5, -1.3, -1.8], c: '--accent', s: [0.88, 0.7, 0.3], r: [0.18, 0.4, 0.2] },
];

function FloatingCaps() {
  const group = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const elapsed = useRef(0);
  useEffect(() => {
    const move = (event) => { pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2; pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  useFrame((_, delta) => {
    if (!group.current) return;
    elapsed.current += delta;
    const t = elapsed.current;
    group.current.rotation.y += (pointer.current.x * 0.035 + Math.sin(t * 0.17) * 0.012 - group.current.rotation.y) * 0.025;
    group.current.rotation.x += (-pointer.current.y * 0.025 - group.current.rotation.x) * 0.025;
    group.current.position.y = Math.sin(t * 0.42) * 0.06;
  });
  return <group ref={group}>
    {CAPS.map((cap, index) => <mesh key={index} position={cap.p} rotation={cap.r}>
      <boxGeometry args={cap.s} />
      <meshStandardMaterial color={themeColor(cap.c)} roughness={0.42} metalness={0.08} />
    </mesh>)}
  </group>;
}

/** Decorative parallax only. Its canvas never receives input or sits above the DOM keyboard. */
export default function HeroBackdrop() {
  const hostRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');
  useEffect(() => {
    const host = hostRef.current;
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (host && observer) observer.observe(host);
    else setVisible(true);
    const onVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return <div className="hero-backdrop__canvas" ref={hostRef}>
    <Canvas frameloop={visible && pageVisible ? 'always' : 'demand'} camera={{ position: [0, 0, 9], fov: 44 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 5, 4]} intensity={1.3} color={themeColor('--space-light')} />
      <FloatingCaps />
    </Canvas>
  </div>;
}
