import { useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import {
  Float,
  Icosahedron,
  MeshDistortMaterial,
  Points,
  PointMaterial,
  Sphere,
} from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 *  Particle field — slowly drifting starfield that reacts to the mouse
 * ------------------------------------------------------------------ */
function ParticleField({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute in a spherical shell so the centre stays clear
      const r = 4.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
    // Gentle pull toward the pointer
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      state.pointer.x * 0.4,
      0.02
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      state.pointer.y * 0.3,
      0.02
    );
  });

  return (
    <Points ref={ref} positions={positions} frustumCulled>
      <PointMaterial
        transparent
        color="#67E8F9"
        size={0.022}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/* ------------------------------------------------------------------ *
 *  Neural sphere — wireframe hologram wrapping the core
 * ------------------------------------------------------------------ */
function NeuralSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
    ref.current.rotation.z += delta * 0.02;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.02);
  });

  return (
    <Icosahedron ref={ref} args={[1.62, 3]}>
      <meshBasicMaterial
        color="#22D3EE"
        wireframe
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Icosahedron>
  );
}

/* ------------------------------------------------------------------ *
 *  Glass core — distorted, refractive centrepiece
 * ------------------------------------------------------------------ */
function GlassCore() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Follow the pointer with a soft lag
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      state.pointer.x * 0.5,
      0.03
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      -state.pointer.y * 0.4,
      0.03
    );
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.7}>
      <Sphere ref={ref} args={[1.15, 64, 64]}>
        {/*
          Deliberately avoids `transmission`: real glass needs float render
          targets that some drivers and software renderers do not support, and
          the sphere then renders invisible. Emissive + metalness reproduces the
          look and runs everywhere.
        */}
        <MeshDistortMaterial
          color="#0B2A4A"
          emissive="#0EA5E9"
          emissiveIntensity={0.45}
          roughness={0.15}
          metalness={0.9}
          distort={0.28}
          speed={1.4}
          transparent
          opacity={0.95}
        />
      </Sphere>
      <NeuralSphere />
    </Float>
  );
}

/* ------------------------------------------------------------------ *
 *  Orbiting accent shards
 * ------------------------------------------------------------------ */
function Shards() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  const shards = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return {
          position: [Math.cos(angle) * 3.1, Math.sin(angle * 1.6) * 1.1, Math.sin(angle) * 3.1] as [
            number,
            number,
            number,
          ],
          color: i % 2 === 0 ? '#A855F7' : '#22D3EE',
          scale: 0.1 + (i % 3) * 0.035,
        };
      }),
    []
  );

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <Float key={i} speed={1.6} rotationIntensity={1.4} floatIntensity={1.1}>
          <mesh position={s.position} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={1.5}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Scene root
 * ------------------------------------------------------------------ */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#E0F2FE" />
      <pointLight position={[-5, -2, -4]} intensity={40} color="#A855F7" distance={18} />
      <pointLight position={[5, 3, 3]} intensity={30} color="#22D3EE" distance={18} />

      {/* Offset toward the right half so the headline column stays uncluttered */}
      <group position={[1.5, 0.2, 0]}>
        <GlassCore />
        <Shards />
      </group>
      <ParticleField />

      {/*
        No <Environment>: both the HDR presets (remote CDN fetch) and the
        procedural variant (cube render target) are failure points on locked-down
        networks and software renderers. Plain lights give the same mood and are
        supported universally.
      */}
      <pointLight position={[0, 4, -3]} intensity={25} color="#E0F2FE" distance={16} />
      <pointLight position={[-3, -4, 2]} intensity={20} color="#6366F1" distance={16} />
    </>
  );
}

/**
 * Hero 3D scene. Rendered on a capped DPR with `powerPreference: high-performance`
 * and frameloop paused when off-screen (handled by the parent's lazy mount).
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      style={{ pointerEvents: 'none' }}
    >
      <Scene />
    </Canvas>
  );
}

// Keep TS aware of the intrinsic three elements used above.
export type { ThreeElements };
