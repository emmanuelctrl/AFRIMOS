import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ---- Palette: dark rig reading against the cream page ------------- */
const BODY = '#43301F'; // container side panels
const BODY_RIB = '#352517'; // corrugation shadow
const FRAME = '#2A1D12'; // rails, castings, chassis
const CAB = '#57422C'; // lighter than the container so the two read apart
const GLASS = '#1D2A30';
const CHROME = '#C9BCA6';
const TYRE = '#1A1410';
const HUB = '#9C8768';
const BEAN = '#6B4423';
const BEAN_DARK = '#3A2416';

/* Container proportions (shortened from a real 40ft for framing) */
const LENGTH = 5.8;
const HEIGHT = 1.5;
const DEPTH = 1.44;
const RIB_COUNT = 34;

/* ------------------------------------------------------------------ *
 *  Stencilled side decal, drawn to a canvas texture
 * ------------------------------------------------------------------ */
function useDecalTexture(text: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#EFE4D2';
      ctx.font = 'bold 150px "Space Grotesk", Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '18px';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '46px Inter, sans-serif';
      ctx.fillStyle = 'rgba(239,228,210,0.7)';
      ctx.letterSpacing = '10px';
      ctx.fillText('VERIFIED EXPORT', canvas.width / 2, canvas.height / 2 + 80);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }, [text]);
}

/* ------------------------------------------------------------------ *
 *  Shipping container
 * ------------------------------------------------------------------ */
function Container() {
  const decal = useDecalTexture('AFRIMOS');

  // Corrugation: alternating depths give the trapezoidal wave a real
  // container has, instead of a flat panel with lines on it.
  const ribs = useMemo(
    () =>
      Array.from({ length: RIB_COUNT }, (_, i) => {
        const t = i / (RIB_COUNT - 1);
        return {
          x: -LENGTH / 2 + 0.22 + t * (LENGTH - 0.44),
          out: i % 2 === 0,
        };
      }),
    []
  );

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
    <group>
      {/* Shell */}
      <mesh>
        <boxGeometry args={[LENGTH, HEIGHT, DEPTH]} />
        <meshStandardMaterial color={BODY} metalness={0.45} roughness={0.62} />
      </mesh>

      {/* Corrugation */}
      {ribs.map((rib, i) => (
        <mesh key={i} position={[rib.x, 0, 0]}>
          <boxGeometry
            args={[rib.out ? 0.075 : 0.05, HEIGHT * 0.9, DEPTH + (rib.out ? 0.03 : 0.012)]}
          />
          <meshStandardMaterial
            color={rib.out ? BODY : BODY_RIB}
            metalness={0.5}
            roughness={rib.out ? 0.55 : 0.7}
          />
        </mesh>
      ))}

      {/* Top / bottom rails */}
      {[HEIGHT / 2, -HEIGHT / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[LENGTH + 0.01, 0.12, DEPTH + 0.06]} />
          <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}

      {/* Corner castings */}
      {corners.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.26, 0.19, 0.19]} />
          <meshStandardMaterial color={FRAME} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Side decal, both faces */}
      {[DEPTH / 2 + 0.035, -DEPTH / 2 - 0.035].map((z, i) => (
        <mesh key={i} position={[0.4, 0.05, z]} rotation={[0, i === 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[2.6, 0.65]} />
          <meshBasicMaterial map={decal} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Door end — hinges, locking bars and handles */}
      <group position={[-LENGTH / 2 - 0.02, 0, 0]}>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[DEPTH * 0.98, HEIGHT * 0.94]} />
          <meshStandardMaterial color={FRAME} metalness={0.5} roughness={0.6} />
        </mesh>
        {[-0.42, -0.15, 0.15, 0.42].map((z, i) => (
          <group key={i} position={[-0.04, 0, z * DEPTH]}>
            {/* Locking bar */}
            <mesh>
              <cylinderGeometry args={[0.022, 0.022, HEIGHT * 0.82, 10]} />
              <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Cam handle */}
            <mesh position={[-0.045, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.05, 0.16, 0.05]} />
              <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Wheels
 * ------------------------------------------------------------------ */
function Wheel({ position, radius = 0.34 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.24, 22]} />
        <meshStandardMaterial color={TYRE} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[radius * 0.5, radius * 0.5, 0.03, 18]} />
        <meshStandardMaterial color={HUB} metalness={0.75} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Axle({ x, z = DEPTH / 2 + 0.06 }: { x: number; z?: number }) {
  return (
    <>
      <Wheel position={[x, -0.34, z]} />
      <Wheel position={[x, -0.34, -z]} />
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Semi tractor unit
 * ------------------------------------------------------------------ */
function Tractor() {
  return (
    <group position={[LENGTH / 2 + 1.35, 0, 0]}>
      {/* Sleeper + cab body */}
      <mesh position={[-0.35, 0.16, 0]}>
        <boxGeometry args={[1.2, 1.5, DEPTH]} />
        <meshStandardMaterial color={CAB} metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0.62, 0.02, 0]}>
        <boxGeometry args={[0.78, 1.22, DEPTH * 0.98]} />
        <meshStandardMaterial color={CAB} metalness={0.55} roughness={0.42} />
      </mesh>

      {/* Windscreen + side glass */}
      <mesh position={[1.015, 0.28, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH * 0.88, 0.5]} />
        <meshStandardMaterial color={GLASS} metalness={0.9} roughness={0.12} />
      </mesh>
      {[DEPTH / 2 + 0.005, -DEPTH / 2 - 0.005].map((z, i) => (
        <mesh key={i} position={[0.62, 0.28, z]} rotation={[0, i === 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.5, 0.42]} />
          <meshStandardMaterial color={GLASS} metalness={0.9} roughness={0.12} />
        </mesh>
      ))}

      {/* Grille, bumper, headlights */}
      <mesh position={[1.03, -0.32, 0]}>
        <boxGeometry args={[0.1, 0.44, DEPTH * 0.9]} />
        <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[1.06, -0.62, 0]}>
        <boxGeometry args={[0.16, 0.2, DEPTH * 1.02]} />
        <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.3} />
      </mesh>
      {[0.45, -0.45].map((z, i) => (
        <mesh key={i} position={[1.08, -0.45, z]}>
          <boxGeometry args={[0.05, 0.12, 0.24]} />
          <meshStandardMaterial color="#FFF3DC" emissive="#FFE9C4" emissiveIntensity={0.7} />
        </mesh>
      ))}

      {/* Exhaust stacks */}
      {[DEPTH / 2 - 0.06, -DEPTH / 2 + 0.06].map((z, i) => (
        <mesh key={i} position={[-0.92, 0.42, z]}>
          <cylinderGeometry args={[0.055, 0.055, 1.6, 12]} />
          <meshStandardMaterial color={CHROME} metalness={0.92} roughness={0.22} />
        </mesh>
      ))}

      {/* Mirrors */}
      {[DEPTH / 2 + 0.1, -DEPTH / 2 - 0.1].map((z, i) => (
        <mesh key={i} position={[0.92, 0.34, z]}>
          <boxGeometry args={[0.05, 0.3, 0.06]} />
          <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Fuel tank */}
      {[DEPTH / 2 - 0.02, -DEPTH / 2 + 0.02].map((z, i) => (
        <mesh key={i} position={[-0.5, -0.5, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 14]} />
          <meshStandardMaterial color={CHROME} metalness={0.88} roughness={0.28} />
        </mesh>
      ))}

      {/* Steer + drive axles */}
      <Axle x={0.72} />
      <Axle x={-0.52} />
      <Axle x={-0.98} />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Chassis trailer carrying the container
 * ------------------------------------------------------------------ */
function Rig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Subtle pointer parallax — the rig turns a few degrees toward the cursor.
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -0.5 + x * 0.12, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.06 - y * 0.06, 0.04);
  });

  return (
    <group ref={group} rotation={[0.06, -0.5, 0]} position={[0, -0.1, 0]}>
      {/* Container sits on the deck */}
      <group position={[0, 0.28, 0]}>
        <Container />
      </group>

      {/* Deck + chassis rails */}
      <mesh position={[0.3, -0.52, 0]}>
        <boxGeometry args={[LENGTH + 1.5, 0.12, DEPTH * 0.9]} />
        <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.45} />
      </mesh>

      {/* Bogie */}
      <Axle x={-LENGTH / 2 + 0.65} />
      <Axle x={-LENGTH / 2 + 1.2} />

      {/* Landing legs */}
      {[0.4, -0.4].map((z, i) => (
        <mesh key={i} position={[LENGTH / 2 - 1.1, -0.72, z]}>
          <boxGeometry args={[0.09, 0.4, 0.09]} />
          <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      <Tractor />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Coffee beans
 * ------------------------------------------------------------------ */
function Bean({
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
    ref.current.rotation.x += delta * 0.28 * spin;
    ref.current.rotation.y += delta * 0.42 * spin;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.9} floatIntensity={1.1}>
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

function Beans() {
  const beans = useMemo(
    () => [
      { position: [-4.6, 1.9, 1.6], scale: 1.05, spin: 1 },
      { position: [4.4, 1.6, 1.2], scale: 0.85, spin: -0.8 },
      { position: [-3.4, -2.3, 2.1], scale: 0.95, spin: 1.3 },
      { position: [4.8, -2.0, 1.8], scale: 1.15, spin: -1.1 },
      { position: [1.6, 2.4, 2.3], scale: 0.8, spin: 0.9 },
    ],
    []
  );

  return (
    <>
      {beans.map((b, i) => (
        <Bean key={i} position={b.position as [number, number, number]} scale={b.scale} spin={b.spin} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Airborne coffee dust
 * ------------------------------------------------------------------ */
function Motes({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.014;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 0.3, 0.02);
  });

  return (
    <Points ref={ref} positions={positions} frustumCulled>
      <PointMaterial
        transparent
        color="#8A7357"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      {/* Bright, daylight-ish rig — the page behind it is cream */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 9, 6]} intensity={2.6} color="#FFF6E9" />
      <directionalLight position={[-3, 3, 8]} intensity={1.3} color="#F5E4C8" />
      <directionalLight position={[-6, 4, -5]} intensity={1.1} color="#D49A5A" />
      <pointLight position={[5, 1, 4]} intensity={22} color="#B0722F" distance={22} />

      {/* Shifted left and scaled down so the tractor stays fully in frame */}
      <group position={[-1.15, -0.15, 0]} scale={0.78}>
        <Rig />
      </group>

      <Beans />
      <Motes />
    </>
  );
}

/**
 * Hero scene: a semi hauling an AFRIMOS container. Built from primitives with
 * no external assets, no HDR fetch and no render-target-dependent materials, so
 * it renders the same on locked-down networks and software renderers.
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 10.5], fov: 42 }}
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
