import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { Bean, Container } from './ContainerModel';

/**
 * The container, close and lit hard from three sides, tilted so both the
 * lettered flank and the door end are in frame. Nothing else is in the scene —
 * no ground, no fog — so it reads as a solid object sitting in front of the
 * page rather than another thing inside the photograph.
 */
function Rig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Follows the pointer just enough to feel physical, never enough to spin.
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      -0.78 + x * 0.14,
      0.045
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      0.12 - y * 0.09,
      0.045
    );
  });

  return (
    // Yawed hard enough that the door end and the lettered flank are both in
    // frame — side-on, a box this simple flattens into a stripe.
    <group ref={group} rotation={[0.12, -0.78, 0]}>
      <Float speed={1.05} rotationIntensity={0.14} floatIntensity={0.55}>
        <Container scale={1.18} />
      </Float>
    </group>
  );
}

const BEANS: { position: [number, number, number]; scale: number; spin: number }[] = [
  { position: [-3.2, -1.7, 2.9], scale: 1.05, spin: 1 },
  { position: [3.1, 1.9, 2.4], scale: 0.85, spin: -0.9 },
  { position: [-2.4, 2.2, 1.5], scale: 0.7, spin: 1.25 },
  { position: [3.6, -2.1, 1.2], scale: 0.62, spin: -1.15 },
];

export default function ContainerShowpiece() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.9, 8.2], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.75} color="#A8C6D8" />
      {/* Warm cream key from the upper left — the sun off the apron */}
      <directionalLight position={[-5, 6, 7]} intensity={3.1} color="#FFF3DC" />
      {/* Ocean rim from behind right: the edge that makes it pop off the photo */}
      <directionalLight position={[7, 2.5, -5]} intensity={4.6} color="#6FC8E4" />
      {/* Low cream bounce so the underside is never a dead black band */}
      <directionalLight position={[1, -4, 5]} intensity={0.9} color="#EADFC7" />
      {/* Camera-side fill aimed at the near end — unlit, it reads as a hole */}
      <directionalLight position={[4, 1.5, 8]} intensity={2.4} color="#DCEAF2" />
      <pointLight position={[-2.5, 1.5, 4]} intensity={22} color="#FCF9F2" distance={16} />

      <Rig />
      {BEANS.map((b, i) => (
        <Bean key={i} position={b.position} scale={b.scale} spin={b.spin} />
      ))}
    </Canvas>
  );
}
