import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsMobile } from '../../hooks/useCapabilities.js';
import { themeColor } from '../../lib/themeColor.js';

gsap.registerPlugin(ScrollTrigger);
const SECTIONS = ['top', 'work', 'about', 'stack', 'activity', 'contact'];

function makePoints(count, radius, seed = 1) {
  let value = seed;
  const random = () => { value = (value * 16807) % 2147483647; return (value - 1) / 2147483646; };
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    points[i * 3] = (random() - 0.5) * radius * 2;
    points[i * 3 + 1] = (random() - 0.5) * radius * 2;
    points[i * 3 + 2] = (random() - 0.5) * radius * 2;
  }
  return points;
}

function StarField() {
  const ref = useRef();
  const positions = useMemo(() => makePoints(760, 35), []);
  const stars = useMemo(() => Array.from({ length: positions.length / 3 }, (_, index) => ({
    x: positions[index * 3], y: positions[index * 3 + 1], z: positions[index * 3 + 2],
    size: 0.012 + ((positions[index * 3 + 2] + 35) / 70) * 0.035, phase: index * 0.37,
  })), [positions]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);
  useEffect(() => {
    stars.forEach((star, index) => { dummy.position.set(star.x, star.y, star.z); dummy.scale.setScalar(star.size); dummy.updateMatrix(); ref.current?.setMatrixAt(index, dummy.matrix); });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [stars, dummy]);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.0015;
    stars.forEach((star, index) => { dummy.position.set(star.x, star.y, star.z); dummy.scale.setScalar(star.size * (0.88 + 0.12 * Math.sin(elapsed.current * 0.7 + star.phase))); dummy.updateMatrix(); ref.current.setMatrixAt(index, dummy.matrix); });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[null, null, stars.length]}><sphereGeometry args={[1, 5, 5]} /><meshBasicMaterial color={themeColor('--star')} transparent opacity={0.7} /></instancedMesh>;
}

function Debris() {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const debris = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    x: Math.sin(i * 4.13) * 9, y: Math.cos(i * 2.71) * 6, z: -4 - ((i * 7) % 24), scale: 0.025 + (i % 5) * 0.012,
  })), []);
  useEffect(() => { debris.forEach((item, index) => { dummy.position.set(item.x, item.y, item.z); dummy.rotation.set(index * 0.5, index, index * 0.3); dummy.scale.setScalar(item.scale); dummy.updateMatrix(); ref.current?.setMatrixAt(index, dummy.matrix); }); if (ref.current) ref.current.instanceMatrix.needsUpdate = true; }, [debris, dummy]);
  return <instancedMesh ref={ref} args={[null, null, debris.length]}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={themeColor('--debris')} roughness={0.9} /></instancedMesh>;
}

function World({ rig, pointer }) {
  const root = useRef();
  useFrame((_, delta) => {
    if (!root.current) return;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, rig.current.x + pointer.current.x * 0.25, 3, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, rig.current.y + pointer.current.y * 0.16, 3, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, rig.current.z, 3, delta);
  });
  return <group ref={root}>
    <ambientLight intensity={0.8} />
    <directionalLight position={[3, 5, 6]} intensity={1.1} color={themeColor('--space-light')} />
    <StarField />
    <Float speed={0.15} rotationIntensity={0.04} floatIntensity={0.06}>
      <group position={[20, 0.25, -5]}>
        <mesh><sphereGeometry args={[1.35, 48, 32]} /><meshStandardMaterial color={themeColor('--planet')} roughness={0.95} metalness={0.05} /></mesh>
        <mesh rotation={[0.25, 0.1, -0.32]}><torusGeometry args={[2.05, 0.035, 8, 120]} /><meshStandardMaterial color={themeColor('--planet-ring')} roughness={0.8} /></mesh>
      </group>
    </Float>
    <Debris />
  </group>;
}

export default function SpaceScene() {
  const rig = useRef({ x: 0, y: 0, z: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');
  const mobile = useIsMobile();
  useEffect(() => {
    let context;
    let disposed = false;
    const setup = () => {
      context?.revert();
      context = gsap.context(() => {
        SECTIONS.forEach((id, index) => {
          const element = document.getElementById(id);
          if (!element) return;
          ScrollTrigger.create({ trigger: element, start: 'top bottom', end: 'bottom top', onUpdate: (self) => {
            const progress = index + self.progress;
            rig.current.x = Math.sin(progress * 1.1) * 1.8;
            rig.current.y = -progress * 0.32 + Math.cos(progress * 0.7) * 0.3;
            rig.current.z = -progress * 1.35;
          } });
        });
      });
      ScrollTrigger.refresh();
    };
    const pointerMove = (event) => { pointer.current.x = (event.clientX / innerWidth - 0.5) * 2; pointer.current.y = (event.clientY / innerHeight - 0.5) * -2; };
    setup();
    document.fonts?.ready.then(() => { if (!disposed) setup(); });
    const onVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    window.addEventListener('resize', setup); window.addEventListener('pointermove', pointerMove, { passive: true }); document.addEventListener('visibilitychange', onVisibility);
    return () => { disposed = true; context?.revert(); window.removeEventListener('resize', setup); window.removeEventListener('pointermove', pointerMove); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return <div className="space-canvas" aria-hidden="true"><Canvas frameloop={pageVisible ? 'always' : 'never'} camera={{ position: [0, 0, 9], fov: 48 }} dpr={mobile ? [1, 1.15] : [1, 1.75]} gl={{ antialias: true, alpha: true }}><fog attach="fog" args={[themeColor('--background'), 13, 36]} /><World rig={rig} pointer={pointer} /></Canvas></div>;
}
