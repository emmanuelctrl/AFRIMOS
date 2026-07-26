import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useContainerMaps, useSteelMaps } from './containerTextures';

/* ---- Port palette, taken from the reference ----------------------- */
const BODY = '#2C5C7E'; // hero container: steel blue
const BODY_STEEL = '#22485F'; // its ends and roof
const FRAME = '#131C24'; // rails, castings, chassis
const CRANE = '#B4562A'; // gantry legs, weathered orange
const TROLLEY = '#D8A33C'; // spreader and trolley, safety yellow
const CAB = '#D7DCE0'; // truck cab, off-white
const GLASS = '#0E1A20';
const CHROME = '#AEBCC4';
const TYRE = '#14181C';
const HUB = '#7F8D96';
const BEAN = '#6B4423';
const BEAN_DARK = '#3A2416';

const LENGTH = 6.4;
const HEIGHT = 1.55;
const DEPTH = 1.5;

/* ------------------------------------------------------------------ *
 *  The hoisted container
 * ------------------------------------------------------------------ */
function Container({ scale = 1 }: { scale?: number }) {
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
      <mesh>
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
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[LENGTH + 0.015, 0.11, DEPTH + 0.05]} />
          <meshStandardMaterial color={FRAME} metalness={0.75} roughness={0.42} />
        </mesh>
      ))}

      {corners.map((p, i) => (
        <mesh key={i} position={p}>
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

/* ------------------------------------------------------------------ *
 *  Gantry crane — legs, top beam, trolley, spreader and falls
 * ------------------------------------------------------------------ */
function Gantry() {
  const LEG_X = 7.4;
  const TOP_Y = 5.6;

  return (
    <group>
      {/* Legs, one pair each side */}
      {[LEG_X, -LEG_X].map((x) =>
        [1.5, -1.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, TOP_Y / 2 - 1.2, z]}>
            <boxGeometry args={[0.5, TOP_Y + 1.4, 0.5]} />
            <meshStandardMaterial color={CRANE} metalness={0.5} roughness={0.72} />
          </mesh>
        ))
      )}

      {/* Sill beams at the feet */}
      {[LEG_X, -LEG_X].map((x) => (
        <mesh key={`sill-${x}`} position={[x, -1.85, 0]}>
          <boxGeometry args={[0.7, 0.4, 3.6]} />
          <meshStandardMaterial color={TROLLEY} metalness={0.5} roughness={0.7} />
        </mesh>
      ))}

      {/* Top girder */}
      <mesh position={[0, TOP_Y, 0]}>
        <boxGeometry args={[LEG_X * 2 + 1, 0.72, 1.5]} />
        <meshStandardMaterial color={TROLLEY} metalness={0.55} roughness={0.6} />
      </mesh>
      {/* Girder underside detail */}
      <mesh position={[0, TOP_Y - 0.5, 0]}>
        <boxGeometry args={[LEG_X * 2, 0.3, 0.9]} />
        <meshStandardMaterial color={CRANE} metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Trolley riding the girder */}
      <mesh position={[0, TOP_Y - 1.05, 0]}>
        <boxGeometry args={[2.5, 0.9, 1.3]} />
        <meshStandardMaterial color={TROLLEY} metalness={0.55} roughness={0.55} />
      </mesh>
      <mesh position={[0.9, TOP_Y - 1.05, 0.68]}>
        <boxGeometry args={[0.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#8E3128" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Spreader bar directly above the load */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[LENGTH * 0.82, 0.34, 0.6]} />
        <meshStandardMaterial color={TROLLEY} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Hoist falls: trolley down to spreader */}
      {[-0.95, 0.95].map((x) =>
        [0.42, -0.42].map((z) => (
          <mesh key={`fall-${x}-${z}`} position={[x, (TOP_Y - 1.5 + 1.55) / 2 + 0.2, z]}>
            <cylinderGeometry args={[0.035, 0.035, TOP_Y - 1.5 - 1.55 + 0.9, 7]} />
            <meshStandardMaterial color="#2A3138" metalness={0.85} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* Slings: spreader down to the container corners */}
      {[-LENGTH / 2 + 0.5, LENGTH / 2 - 0.5].map((x) =>
        [0.55, -0.55].map((z) => (
          <mesh key={`sling-${x}-${z}`} position={[x * 0.82, 1.0, z]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
            <cylinderGeometry args={[0.028, 0.028, 1.15, 6]} />
            <meshStandardMaterial color="#39424A" metalness={0.8} roughness={0.45} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Container yard stacks framing the shot
 * ------------------------------------------------------------------ */
function Stack({
  position,
  rows = 3,
  cols = 2,
  tint,
}: {
  position: [number, number, number];
  rows?: number;
  cols?: number;
  tint: string;
}) {
  const steel = useSteelMaps(tint, 11);
  const boxes = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({ p: [c * 6.6, r * 1.7, 0], s: 0.96 + ((r + c) % 3) * 0.02 });
      }
    }
    return out;
  }, [rows, cols]);

  return (
    <group position={position}>
      {boxes.map((b, i) => (
        <mesh key={i} position={b.p} scale={b.s}>
          <boxGeometry args={[6.4, 1.55, 1.5]} />
          <meshStandardMaterial
            map={steel.map}
            bumpMap={steel.bumpMap}
            bumpScale={0.035}
            metalness={0.5}
            roughness={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Flatbed waiting under the load
 * ------------------------------------------------------------------ */
function Wheel({ position, radius = 0.36 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.26, 20]} />
        <meshStandardMaterial color={TYRE} roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[radius * 0.48, radius * 0.48, 0.03, 16]} />
        <meshStandardMaterial color={HUB} metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Flatbed() {
  return (
    <group position={[0, -1.55, 0]}>
      {/* Deck */}
      <mesh position={[-0.6, 0.35, 0]}>
        <boxGeometry args={[6.6, 0.16, 1.5]} />
        <meshStandardMaterial color="#3A2F2A" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* Chassis rail */}
      <mesh position={[-0.6, 0.2, 0]}>
        <boxGeometry args={[6.9, 0.14, 0.7]} />
        <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Rear bogie + chevron panel */}
      {[-3.1, -3.7].map((x, i) => (
        <group key={i}>
          <Wheel position={[x, 0, 0.86]} />
          <Wheel position={[x, 0, -0.86]} />
        </group>
      ))}
      <mesh position={[-4.15, 0.28, 0]}>
        <boxGeometry args={[0.12, 0.5, 1.5]} />
        <meshStandardMaterial color={TROLLEY} metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Cab */}
      <group position={[2.6, 0, 0]}>
        <mesh position={[0, 0.86, 0]}>
          <boxGeometry args={[1.5, 1.4, 1.48]} />
          <meshStandardMaterial color={CAB} metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0.76, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.3, 0.62]} />
          <meshStandardMaterial color={GLASS} metalness={0.9} roughness={0.12} />
        </mesh>
        {/* Bumper + lights */}
        <mesh position={[0.8, 0.28, 0]}>
          <boxGeometry args={[0.16, 0.24, 1.5]} />
          <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.3} />
        </mesh>
        {[0.5, -0.5].map((z, i) => (
          <mesh key={i} position={[0.84, 0.42, z]}>
            <boxGeometry args={[0.05, 0.14, 0.26]} />
            <meshBasicMaterial color="#FFF3DC" fog={false} />
          </mesh>
        ))}
        <Wheel position={[0.35, 0, 0.82]} />
        <Wheel position={[0.35, 0, -0.82]} />
        <Wheel position={[-0.85, 0, 0.82]} />
        <Wheel position={[-0.85, 0, -0.82]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Wet apron
 * ------------------------------------------------------------------ */
function Ground() {
  return (
    <group position={[0, -2.1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#080F16" metalness={0.9} roughness={0.22} />
      </mesh>
      {/* Reflected light smears on the wet apron */}
      {[
        { x: 0, w: 7, c: '#C8842F', o: 0.2 },
        { x: -6.5, w: 2.6, c: '#7FA8C0', o: 0.14 },
        { x: 6.8, w: 3, c: '#B4562A', o: 0.16 },
      ].map((s, i) => (
        <mesh key={i} position={[s.x, 0.012, 5 + i * 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[s.w, 12]} />
          <meshBasicMaterial color={s.c} transparent opacity={s.o} depthWrite={false} fog={false} />
        </mesh>
      ))}
      {/* Contact shadow under the rig */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshBasicMaterial color="#03070B" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Crane floodlights
 * ------------------------------------------------------------------ */
function Floods() {
  const lamps: [number, number, number][] = [
    [6.4, 5.0, 1.6],
    [-6.4, 5.0, 1.6],
    [0, 5.1, -1.5],
  ];
  return (
    <>
      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshBasicMaterial color="#FFE7BC" fog={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.85, 12, 12]} />
            <meshBasicMaterial color="#FFD79A" transparent opacity={0.22} depthWrite={false} fog={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Coffee beans — the cargo, drifting in the foreground
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

function Beans() {
  const beans = useMemo(
    () => [
      { position: [-8.6, -1.4, 7.5], scale: 1.35, spin: 1 },
      { position: [9.4, 1.2, 7.0], scale: 1.15, spin: -0.9 },
      { position: [-7.2, 3.6, 6.2], scale: 0.95, spin: 1.2 },
      { position: [7.8, 4.0, 6.4], scale: 1.0, spin: -1.1 },
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

function Haze({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });

  return (
    <Points ref={ref} positions={positions} frustumCulled>
      <PointMaterial
        transparent
        color="#9FC0D0"
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

/* ------------------------------------------------------------------ *
 *  Scene
 * ------------------------------------------------------------------ */
function Yard() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Gentle pointer parallax on the whole yard
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -0.16 + x * 0.06, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.02 - y * 0.03, 0.04);
  });

  return (
    <group ref={group} rotation={[0.02, -0.16, 0]}>
      {/* Yard stacks framing left, right and behind */}
      <Stack position={[-15.5, -1.2, -6]} rows={3} cols={2} tint="#2A4E66" />
      <Stack position={[6.5, -1.2, -7.5]} rows={3} cols={2} tint="#5B3B34" />
      <Stack position={[-9, -1.2, -12]} rows={2} cols={3} tint="#39525E" />

      <Gantry />
      <Flatbed />

      {/* The hoisted container, swinging almost imperceptibly */}
      <Float speed={0.7} rotationIntensity={0.06} floatIntensity={0.25}>
        <group position={[0, 0.15, 0]}>
          <Container />
        </group>
      </Float>

      <Floods />
      <Ground />
    </group>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={['#0A141A', 24, 62]} />
      <ambientLight intensity={1.5} color="#B4CEDE" />
      {/* Cool moon key */}
      <directionalLight position={[6, 12, 9]} intensity={3.2} color="#E6F1F9" />
      {/* Warm crane floods */}
      <pointLight position={[6.4, 5, 2]} intensity={90} color="#FFCE8F" distance={26} />
      <pointLight position={[-6.4, 5, 2]} intensity={70} color="#FFC98A" distance={26} />
      <pointLight position={[0, 3.4, 4]} intensity={45} color="#FFE0B0" distance={20} />
      {/* Camera-side fill so the lettered flank reads */}
      <directionalLight position={[-1, 2, 14]} intensity={2.6} color="#F2F7FB" />

      {/* Offset right so the headline column stays clear of the rig */}
      <group position={[3.4, -0.4, 0]} scale={0.86}>
        <Yard />
      </group>
      <Beans />
      <Haze />
    </>
  );
}

/**
 * Hero scene: a gantry crane hoisting an AFRIMOS container over a waiting
 * flatbed in a container yard at night. Built entirely from primitives and
 * generated textures — no external models, HDR fetches or render-target
 * materials, so it renders the same everywhere.
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.4, 25], fov: 38 }}
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
