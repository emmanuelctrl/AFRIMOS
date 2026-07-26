import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useContainerMaps, useSteelMaps } from './containerTextures';

/* ---- Shared cargo palette ----------------------------------------- */
export const BODY = '#2C5C7E'; // container flanks: steel blue
export const BODY_STEEL = '#22485F'; // its ends and roof
export const FRAME = '#131C24'; // rails, castings, chassis
export const CHROME = '#AEBCC4';
export const BEAN = '#3A2213';
export const BEAN_DARK = '#231407';

export const LENGTH = 6.4;
export const HEIGHT = 1.55;
export const DEPTH = 1.5;

/**
 * A 40ft high-cube, built from a box with per-face materials: corrugated,
 * weathered flanks; plain steel roof and ends; a dark door end. Everything is
 * drawn into canvas textures at runtime, so there is no model to download.
 *
 * Shared by the wide yard scene and the close-up showpiece.
 */
export function Container({ scale = 1 }: { scale?: number }) {
  const side = useContainerMaps(BODY, 7);
  const steel = useSteelMaps(BODY_STEEL, 3);

  const corners = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const x of [-LENGTH / 2, LENGTH / 2]) {
      for (const y of [-HEIGHT / 2, HEIGHT / 2]) {
        for (const z of [-DEPTH / 2, DEPTH / 2]) out.push([x, y, z]);
      }
    }
    return out;
  }, []);

  return (
    <group scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[LENGTH, HEIGHT, DEPTH]} />
        {[0, 1].map((i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={steel.map}
            bumpMap={steel.bumpMap}
            bumpScale={0.02}
            roughnessMap={steel.roughnessMap}
            metalness={0.55}
            roughness={0.68}
          />
        ))}
        <meshStandardMaterial
          attach="material-2"
          map={steel.map}
          bumpMap={steel.bumpMap}
          bumpScale={0.03}
          metalness={0.6}
          roughness={0.74}
        />
        <meshStandardMaterial attach="material-3" color="#0E141A" metalness={0.4} roughness={0.9} />
        {[4, 5].map((i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={side.map}
            bumpMap={side.bumpMap}
            bumpScale={0.05}
            roughnessMap={side.roughnessMap}
            metalness={0.6}
            roughness={0.55}
          />
        ))}
      </mesh>

      {[HEIGHT / 2, -HEIGHT / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[LENGTH + 0.015, 0.11, DEPTH + 0.05]} />
          <meshStandardMaterial color={FRAME} metalness={0.75} roughness={0.42} />
        </mesh>
      ))}

      {corners.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.27, 0.2, 0.2]} />
          <meshStandardMaterial color={FRAME} metalness={0.8} roughness={0.38} />
        </mesh>
      ))}

      {/* Door hardware */}
      <group position={[-LENGTH / 2 - 0.035, 0, 0]}>
        {[-0.4, -0.14, 0.14, 0.4].map((z, i) => (
          <group key={i} position={[0, 0, z * DEPTH]}>
            <mesh>
              <cylinderGeometry args={[0.024, 0.024, HEIGHT * 0.84, 12]} />
              <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.28} />
            </mesh>
            <mesh position={[-0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.045, 0.18, 0.045]} />
              <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.32} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** A single tumbling coffee bean — the cargo, made visible. */
export function Bean({
  position,
  scale = 1,
  spin = 1,
}: {
  position: [number, number, number];
  scale?: number;
  spin?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.26 * spin;
    ref.current.rotation.y += delta * 0.4 * spin;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.9} floatIntensity={1.1}>
      <group ref={ref} position={position} scale={scale}>
        <mesh scale={[1, 0.66, 0.78]}>
          <sphereGeometry args={[0.3, 24, 20]} />
          <meshStandardMaterial color={BEAN} roughness={0.55} metalness={0.12} />
        </mesh>
        {/* Crease sits flush in the face; proud of it, it reads as a ring. */}
        {[0.2, -0.2].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} scale={[0.88, 0.085, 0.13]}>
            <sphereGeometry args={[0.3, 16, 12]} />
            <meshStandardMaterial color={BEAN_DARK} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}
