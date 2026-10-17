import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsMobile } from '../../hooks/useCapabilities.js';
import { KEYS } from '../../config/keyboard.js';
import { themeColor } from '../../lib/themeColor.js';

gsap.registerPlugin(ScrollTrigger);
const SECTIONS = ['top', 'work', 'about', 'experience', 'stack', 'activity', 'contact', 'footer'];

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

function StarField({ rig }) {
  const ref = useRef();
  const positions = useMemo(() => makePoints(760, 35), []);
  const stars = useMemo(() => Array.from({ length: positions.length / 3 }, (_, index) => ({
    x: positions[index * 3], y: positions[index * 3 + 1], z: positions[index * 3 + 2],
    size: 0.012 + ((positions[index * 3 + 2] + 35) / 70) * 0.035,
  })), [positions]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    stars.forEach((star, index) => { dummy.position.set(star.x, star.y, star.z); dummy.scale.setScalar(star.size); dummy.updateMatrix(); ref.current?.setMatrixAt(index, dummy.matrix); });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [stars, dummy]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const section = Math.floor(rig.current.progress || 0);
    ref.current.count = section === 3 ? 420 : stars.length;
    ref.current.rotation.y += delta * 0.0015;
  });
  return <instancedMesh ref={ref} args={[null, null, stars.length]}><sphereGeometry args={[1, 5, 5]} /><meshBasicMaterial color={themeColor('--star')} transparent opacity={0.7} /></instancedMesh>;
}

function Debris({ rig }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const debris = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    x: Math.sin(i * 4.13) * 9, y: Math.cos(i * 2.71) * 6, z: -4 - ((i * 7) % 24), scale: 0.025 + (i % 5) * 0.012,
  })), []);
  useEffect(() => { debris.forEach((item, index) => { dummy.position.set(item.x, item.y, item.z); dummy.rotation.set(index * 0.5, index, index * 0.3); dummy.scale.setScalar(item.scale); dummy.updateMatrix(); ref.current?.setMatrixAt(index, dummy.matrix); }); if (ref.current) ref.current.instanceMatrix.needsUpdate = true; }, [debris, dummy]);
  useFrame(() => {
    if (ref.current) ref.current.count = Math.floor(rig.current.progress || 0) === 3 ? 12 : debris.length;
  });
  return <instancedMesh ref={ref} args={[null, null, debris.length]}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={themeColor('--debris')} roughness={0.9} /></instancedMesh>;
}

function ContactArrival({ rig, pointer }) {
  const group = useRef();
  const key = useRef();
  const orbitGroup = useRef();
  const shardMesh = useRef();
  const pulseRing = useRef();
  const pulseTimer = useRef(0);
  const activationTimer = useRef(0);
  const previousPulse = useRef(0);
  const wasActive = useRef(false);
  const { camera } = useThree();
  const shards = useMemo(() => Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    return { x: Math.cos(angle) * (1.25 + (index % 3) * 0.2), y: Math.sin(angle) * (0.95 + (index % 2) * 0.18), z: (index % 3) * 0.08, color: KEYS[index].face };
  }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const shardColors = useMemo(() => shards.map((shard) => new THREE.Color(shard.color)), [shards]);
  useEffect(() => {
    const mesh = shardMesh.current;
    if (!mesh) return;
    shards.forEach((shard, index) => {
      dummy.position.set(shard.x, shard.y, shard.z);
      dummy.rotation.set(index * 0.19, index * 0.28, index * 0.34);
      dummy.scale.setScalar(0.075 + (index % 3) * 0.012);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, shardColors[index]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy, shardColors, shards]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = document.getElementById('contact-stage-target');
    const box = target?.getBoundingClientRect();
    const inView = Boolean(box && box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight);
    if (!inView) {
      group.current.scale.setScalar(0.001);
      return;
    }
    const depth = 6.5;
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
    const centerNdc = new THREE.Vector3(((box.left + box.width / 2) / innerWidth) * 2 - 1, 1 - ((box.top + box.height / 2) / innerHeight) * 2, 0.5).unproject(camera);
    const ray = centerNdc.sub(camera.position).normalize();
    const center = camera.position.clone().addScaledVector(ray, depth / -ray.z);
    const root = rig.current.root;
    group.current.position.set(center.x - root.x, center.y - root.y, center.z - root.z);
    const scale = (box.height / innerHeight * visibleHeight) / 3.8;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, scale, 5, delta));
    const email = document.querySelector('[data-contact-email]');
    const active = Boolean(email?.matches(':hover, :focus-visible'));
    if (active && !wasActive.current) pulseTimer.current = 0.85;
    wasActive.current = active;
    if (key.current) {
      const pulse = email ? Number(email.dataset.pulse || 0) : 0;
      if (pulse > previousPulse.current) {
        previousPulse.current = pulse;
        pulseTimer.current = 0.85;
        activationTimer.current = 0.42;
      }
      activationTimer.current = Math.max(0, activationTimer.current - delta);
      const activated = activationTimer.current > 0.2;
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, active || activated ? -0.16 : 0, 8, delta);
      key.current.rotation.y = THREE.MathUtils.damp(key.current.rotation.y, pointer.current.x * 0.12, 3, delta);
      key.current.rotation.x = THREE.MathUtils.damp(key.current.rotation.x, -pointer.current.y * 0.08, 3, delta);
    }
    if (pulseRing.current) {
      pulseTimer.current = Math.max(0, pulseTimer.current - delta);
      const phase = 1 - pulseTimer.current / 0.85;
      pulseRing.current.visible = pulseTimer.current > 0;
      pulseRing.current.scale.setScalar(1 + phase * 0.5);
      pulseRing.current.material.opacity = Math.max(0, 0.72 * (1 - phase));
    }
    if (orbitGroup.current) orbitGroup.current.rotation.z += delta * 0.018;
    if (orbitGroup.current) orbitGroup.current.rotation.x = THREE.MathUtils.damp(orbitGroup.current.rotation.x, pointer.current.y * 0.025, 2, delta);
  });
  return <group ref={group} scale={0.001}>
    <ambientLight intensity={0.9} />
    <directionalLight position={[2, 4, 5]} intensity={1.4} color={themeColor('--space-light')} />
    <group ref={orbitGroup}>
      <mesh rotation={[0.32, 0.15, 0.18]}><torusGeometry args={[1.55, 0.008, 5, 100]} /><meshBasicMaterial color={themeColor('--planet-ring')} /></mesh>
      <mesh rotation={[-0.22, 0.38, -0.3]}><torusGeometry args={[1.9, 0.007, 5, 100]} /><meshBasicMaterial color={themeColor('--border')} /></mesh>
      <mesh ref={pulseRing} rotation={[0.32, 0.15, 0.18]} visible={false}><torusGeometry args={[1.48, 0.008, 5, 100]} /><meshBasicMaterial color={themeColor('--accent')} transparent opacity={0} /></mesh>
      <instancedMesh ref={shardMesh} args={[null, null, 10]}>
        <boxGeometry args={[0.25, 0.2, 0.2]} /><meshStandardMaterial roughness={0.6} metalness={0.03} />
      </instancedMesh>
    </group>
    <group ref={key} position={[0.1, 0, 0.25]}>
      <mesh><boxGeometry args={[1.45, 2.05, 0.42]} /><meshStandardMaterial color={themeColor('--key-enter-base')} roughness={0.62} /></mesh>
      <mesh position={[0, 0.18, 0.23]}><boxGeometry args={[1.24, 1.61, 0.08]} /><meshStandardMaterial color={themeColor('--key-outline')} roughness={0.7} /></mesh>
      <mesh position={[0, 0.2, 0.285]}><boxGeometry args={[1.13, 1.49, 0.045]} /><meshStandardMaterial color={themeColor('--key-enter-face')} roughness={0.55} /></mesh>
      <group position={[0.05, -0.02, 0.315]}>
        <mesh position={[0.24, 0.08, 0]}><boxGeometry args={[0.08, 0.54, 0.018]} /><meshBasicMaterial color={themeColor('--key-outline')} /></mesh>
        <mesh position={[-0.01, -0.19, 0]}><boxGeometry args={[0.58, 0.08, 0.018]} /><meshBasicMaterial color={themeColor('--key-outline')} /></mesh>
        <mesh position={[-0.17, -0.08, 0]} rotation={[0, 0, -0.72]}><boxGeometry args={[0.3, 0.08, 0.018]} /><meshBasicMaterial color={themeColor('--key-outline')} /></mesh>
        <mesh position={[-0.17, -0.3, 0]} rotation={[0, 0, 0.72]}><boxGeometry args={[0.3, 0.08, 0.018]} /><meshBasicMaterial color={themeColor('--key-outline')} /></mesh>
      </group>
    </group>
  </group>;
}

function FooterHorizon({ rig, camera }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (!group.current) return;
    const visible = (rig.current.progress || 0) >= 7;
    const root = rig.current.root;
    const targetScale = visible ? 1 : 0.001;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, targetScale, 1.8, delta));
    group.current.position.set(camera.position.x - root.x, camera.position.y - 47 - root.y, camera.position.z - 39 - root.z);
  });
  return <group ref={group} scale={0.001}>
    <mesh><sphereGeometry args={[54, 48, 24]} /><meshBasicMaterial color={themeColor('--horizon')} /></mesh>
    <mesh position={[0, 1.1, 0]} rotation={[0.04, 0, 0]}><torusGeometry args={[53.95, 0.025, 5, 128]} /><meshBasicMaterial color={themeColor('--horizon-limb')} /></mesh>
  </group>;
}

function World({ rig, pointer }) {
  const root = useRef();
  const build = useRef();
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!root.current) return;
    rig.current.root = root.current.position;
    const progress = rig.current.progress || 0;
    const section = Math.min(7, Math.floor(progress));
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, rig.current.x + pointer.current.x * 0.25, 3, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, rig.current.y + pointer.current.y * 0.16, 3, delta);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, rig.current.z, 3, delta);
    const cameraZ = [9, 8.5, 7.8, 7.1, 8.2, 9, 8.1, 8.5][section];
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.12, 2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -progress * 0.05 + pointer.current.y * 0.08, 2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraZ, 2, delta);
    camera.lookAt(0, 0, -1.5);
    if (build.current) {
      const visibility = section === 1 ? 1 : section === 2 ? 0.18 : 0;
      build.current.scale.setScalar(THREE.MathUtils.damp(build.current.scale.x, visibility || 0.001, 2.4, delta));
      build.current.rotation.y = THREE.MathUtils.damp(build.current.rotation.y, pointer.current.x * 0.06 + progress * 0.05, 2, delta);
    }
  });
  return <group ref={root}>
    <ambientLight intensity={0.8} />
    <directionalLight position={[3, 5, 6]} intensity={1.1} color={themeColor('--space-light')} />
    <StarField rig={rig} />
    <Float speed={0.15} rotationIntensity={0.04} floatIntensity={0.06}>
      <group position={[20, 0.25, -5]}>
        <mesh><sphereGeometry args={[1.35, 48, 32]} /><meshStandardMaterial color={themeColor('--planet')} roughness={0.95} metalness={0.05} /></mesh>
        <mesh rotation={[0.25, 0.1, -0.32]}><torusGeometry args={[2.05, 0.035, 8, 120]} /><meshStandardMaterial color={themeColor('--planet-ring')} roughness={0.8} /></mesh>
      </group>
    </Float>
    <Debris rig={rig} />
    <group ref={build} position={[-5.2, 0, -2.4]} scale={0.001}>
      {[0, 1, 2, 3].map((layer) => <mesh key={layer} position={[layer * 0.05, layer * 0.18, -layer * 0.14]} rotation={[0.08, 0.18, 0.02]}>
        <boxGeometry args={[1.7 - layer * 0.1, 0.13, 1.15 - layer * 0.08]} />
        <meshStandardMaterial color={themeColor('--debris')} roughness={0.85} transparent opacity={0.62} />
      </mesh>)}
    </group>
    <ContactArrival rig={rig} pointer={pointer} />
    <FooterHorizon rig={rig} camera={camera} />
  </group>;
}

export default function SpaceScene() {
  const rig = useRef({ x: 0, y: 0, z: 0, progress: 0, root: { x: 0, y: 0, z: 0 } });
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
            rig.current.progress = progress;
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
