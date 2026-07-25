import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Roasted-copper container: caramel body, dark-roast corrugation, walnut rails
const ROAST = '#C07A34';
const ROAST_DARK = '#6B3F19';
const WALNUT = '#4A3423';

/* ------------------------------------------------------------------ *
 *  Shipping container — built procedurally, no external assets
 * ------------------------------------------------------------------ */
const LENGTH = 6.6;
const HEIGHT = 1.62;
const DEPTH = 1.62;
const RIB_COUNT = 30;

function Container() {
  const group = useRef<THREE.Group>(null);

  // Corrugated side ribs, distributed along the length.
  const ribs = useMemo(
    () =>
      Array.from({ length: RIB_COUNT }, (_, i) => {
        const t = i / (RIB_COUNT - 1);
        return -LENGTH / 2 + 0.28 + t * (LENGTH - 0.56);
      }),
    []
  );

  // Corner castings at all eight corners.
  const corners = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const x of [-LENGTH / 2, LENGTH / 2]) {
      for (const y of [-HEIGHT / 2, HEIGHT / 2]) {
        for (const z of [-DEPTH / 2, DEPTH / 2]) out.push([x, y, z]);
      }
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    // Pointer parallax — the container leans toward the cursor.
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      -0.62 + x * 0.16,
      0.045
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      0.1 - y * 0.1,
      0.045
    );
  });

  return (
    <group ref={group} rotation={[0.1, -0.62, 0.14]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[LENGTH, HEIGHT, DEPTH]} />
        <meshStandardMaterial color={ROAST} metalness={0.72} roughness={0.42} />
      </mesh>

      {/* Corrugation */}
      {ribs.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.055, HEIGHT * 0.94, DEPTH + 0.022]} />
          <meshStandardMaterial color={ROAST_DARK} metalness={0.8} roughness={0.34} />
        </mesh>
      ))}

      {/* Top and bottom rails */}
      {[HEIGHT / 2, -HEIGHT / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[LENGTH + 0.02, 0.13, DEPTH + 0.05]} />
          <meshStandardMaterial color={WALNUT} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* Corner castings */}
      {corners.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.24, 0.2, 0.2]} />
          <meshStandardMaterial color="#150E08" metalness={0.9} roughness={0.28} />
        </mesh>
      ))}

      {/* Door end: panel + locking bars */}
      <group position={[-LENGTH / 2 - 0.012, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[DEPTH * 0.97, HEIGHT * 0.97]} />
          <meshStandardMaterial color={ROAST_DARK} metalness={0.7} roughness={0.45} />
        </mesh>
        {[-0.5, -0.18, 0.18, 0.5].map((z, i) => (
          <mesh key={i} position={[-0.03, 0, z * DEPTH * 0.8]}>
            <cylinderGeometry args={[0.028, 0.028, HEIGHT * 0.86, 8]} />
            <meshStandardMaterial color="#EADBC4" metalness={0.95} roughness={0.22} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Lifting rig — cables running up out of frame, as if crane-hoisted
 * ------------------------------------------------------------------ */
function Rig() {
  const anchors: [number, number, number][] = [
    [-LENGTH / 2 + 0.4, HEIGHT / 2, DEPTH / 2],
    [LENGTH / 2 - 0.4, HEIGHT / 2, DEPTH / 2],
    [-LENGTH / 2 + 0.4, HEIGHT / 2, -DEPTH / 2],
    [LENGTH / 2 - 0.4, HEIGHT / 2, -DEPTH / 2],
  ];

  return (
    <group rotation={[0.1, -0.62, 0.14]}>
      {anchors.map(([x, y, z], i) => {
        const height = 7;
        return (
          <mesh key={i} position={[x * 0.5, y + height / 2, z * 0.5]}>
            <cylinderGeometry args={[0.012, 0.012, height, 6]} />
            <meshBasicMaterial color="#7A6244" />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Ambient dust motes
 * ------------------------------------------------------------------ */
function Motes({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.014;
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      state.pointer.x * 0.35,
      0.02
    );
  });

  return (
    <Points ref={ref} positions={positions} frustumCulled>
      <PointMaterial
        transparent
        color="#E0BE93"
        size={0.026}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.9} />
      {/* Key light from above, like a floodlit dock */}
      <directionalLight position={[3, 8, 4]} intensity={3.4} color="#FFF6E9" />
      {/* Fill from camera side so the near face never goes muddy */}
      <directionalLight position={[-2, 2, 7]} intensity={1.5} color="#E8CFA6" />
      {/* Rim light picks out the top edge and corner castings */}
      <directionalLight position={[-4, 5, -5]} intensity={2} color="#E3B778" />
      <pointLight position={[-6, 2, 4]} intensity={55} color="#B87333" distance={24} />
      <pointLight position={[6, -2, 3]} intensity={34} color="#E3B778" distance={20} />

      {/* Pushed toward the camera and scaled up so it reads as the foreground
          subject, with the wordmark sitting behind it. */}
      <group position={[0, -0.1, 0.55]} scale={1.04}>
        <Float speed={1.05} rotationIntensity={0.16} floatIntensity={0.42}>
          <Container />
          <Rig />
        </Float>
      </group>

      <Motes />
    </>
  );
}

/**
 * Hero scene: a crane-suspended shipping container. Uses only lights and
 * standard materials — no HDR fetches or render-target-dependent features, so
 * it renders identically on locked-down networks and software renderers.
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 8.4], fov: 42 }}
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
