import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useContainerMaps, useSteelMaps } from './containerTextures';

/* ---- Palette: dark rig reading against the cream page ------------- */
const BODY = '#7A2B22'; // container side panels (oxide red)
const BODY_RIB = '#5B1E17'; // corrugation shadow
const FRAME = '#161E24'; // rails, castings, chassis
const CAB = '#C21F16'; // signal-red cab, the focal point
const GLASS = '#0E1A20';
const CHROME = '#C8D4DA';
const TYRE = '#1A1410';
const HUB = '#8FA3AD';
const BEAN = '#6B4423';
const BEAN_DARK = '#3A2416';

/* Container proportions (shortened from a real 40ft for framing) */
const LENGTH = 5.8;
const HEIGHT = 1.5;
const DEPTH = 1.44;

/* ------------------------------------------------------------------ *
 *  Shipping container
 * ------------------------------------------------------------------ */
function Container() {
  // Corrugation, weathering and stencils all come from the generated skin, so
  // the side panels are single quads rather than dozens of rib boxes.
  const side = useContainerMaps(BODY, 7);
  const steel = useSteelMaps(BODY_RIB, 3);

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
      {/* Shell: per-face materials so the sides, ends and roof each get the
          right skin instead of one stretched texture wrapped around the box. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[LENGTH, HEIGHT, DEPTH]} />
        {/* +X end */}
        <meshStandardMaterial
          attach="material-0"
          map={steel.map}
          bumpMap={steel.bumpMap}
          bumpScale={0.02}
          roughnessMap={steel.roughnessMap}
          metalness={0.55}
          roughness={0.7}
        />
        {/* -X end (doors) */}
        <meshStandardMaterial
          attach="material-1"
          map={steel.map}
          bumpMap={steel.bumpMap}
          bumpScale={0.02}
          roughnessMap={steel.roughnessMap}
          metalness={0.55}
          roughness={0.7}
        />
        {/* +Y roof */}
        <meshStandardMaterial
          attach="material-2"
          map={steel.map}
          bumpMap={steel.bumpMap}
          bumpScale={0.03}
          metalness={0.6}
          roughness={0.75}
        />
        {/* -Y floor */}
        <meshStandardMaterial attach="material-3" color="#12181D" metalness={0.4} roughness={0.9} />
        {/* +Z / -Z long sides */}
        <meshStandardMaterial
          attach="material-4"
          map={side.map}
          bumpMap={side.bumpMap}
          bumpScale={0.045}
          roughnessMap={side.roughnessMap}
          metalness={0.62}
          roughness={0.58}
        />
        <meshStandardMaterial
          attach="material-5"
          map={side.map}
          bumpMap={side.bumpMap}
          bumpScale={0.045}
          roughnessMap={side.roughnessMap}
          metalness={0.62}
          roughness={0.58}
        />
      </mesh>

      {/* Top / bottom rails */}
      {[HEIGHT / 2, -HEIGHT / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[LENGTH + 0.015, 0.11, DEPTH + 0.05]} />
          <meshStandardMaterial color={FRAME} metalness={0.75} roughness={0.42} />
        </mesh>
      ))}

      {/* Corner castings */}
      {corners.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.27, 0.2, 0.2]} />
          <meshStandardMaterial color={FRAME} metalness={0.8} roughness={0.38} />
        </mesh>
      ))}

      {/* Door hardware on the -X end */}
      <group position={[-LENGTH / 2 - 0.035, 0, 0]}>
        {[-0.4, -0.14, 0.14, 0.4].map((z, i) => (
          <group key={i} position={[0, 0, z * DEPTH]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.024, 0.024, HEIGHT * 0.84, 12]} />
              <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.28} />
            </mesh>
            {/* Cam keeper top and bottom */}
            {[HEIGHT * 0.36, -HEIGHT * 0.36].map((y, k) => (
              <mesh key={k} position={[-0.02, y, 0]}>
                <boxGeometry args={[0.07, 0.07, 0.07]} />
                <meshStandardMaterial color={FRAME} metalness={0.8} roughness={0.4} />
              </mesh>
            ))}
            {/* Handle */}
            <mesh position={[-0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.045, 0.18, 0.045]} />
              <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.32} />
            </mesh>
          </group>
        ))}
        {/* Hinges */}
        {[-0.46, 0.46].map((z, i) =>
          [0.45, 0, -0.45].map((y, k) => (
            <mesh key={`${i}-${k}`} position={[0.01, y * HEIGHT, z * DEPTH]}>
              <boxGeometry args={[0.06, 0.1, 0.09]} />
              <meshStandardMaterial color={FRAME} metalness={0.8} roughness={0.4} />
            </mesh>
          ))
        )}
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
      {/* Headlights — emissive block plus a halo billboard for the bloom look */}
      {[0.45, -0.45].map((z, i) => (
        <group key={i} position={[1.08, -0.45, z]}>
          <mesh>
            <boxGeometry args={[0.05, 0.14, 0.26]} />
            <meshBasicMaterial color="#FFF6E2" fog={false} />
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial
              color="#FFD9A0"
              transparent
              opacity={0.45}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        </group>
      ))}

      {/* Amber marker lights along the roof and down the cab edge */}
      {[-0.34, -0.17, 0, 0.17, 0.34].map((z, i) => (
        <mesh key={`roof-${i}`} position={[0.66, 0.66, z * DEPTH]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color="#FFB347" fog={false} />
        </mesh>
      ))}
      {[0.3, 0.05, -0.2].map((y, i) => (
        <mesh key={`edge-${i}`} position={[1.0, y, DEPTH / 2 + 0.02]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#FF8A3D" fog={false} />
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
    // ~+0.9rad swings the tractor's nose toward the camera for the reference's
    // front-three-quarter view; negative angles show it side-on instead.
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0.92 + x * 0.1, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.05 - y * 0.05, 0.04);
  });

  return (
    <group ref={group} rotation={[0.05, 0.92, 0]} position={[0, -0.1, 0]}>
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
      { position: [-4.9, 1.5, 2.6], scale: 1.15, spin: 1 },
      { position: [-3.2, -1.7, 3.1], scale: 1.0, spin: -0.9 },
      { position: [4.6, 1.9, 2.2], scale: 0.9, spin: 1.2 },
      { position: [3.3, -2.0, 3.0], scale: 1.25, spin: -1.1 },
      { position: [-6.1, -0.3, 1.8], scale: 0.85, spin: 1.4 },
      { position: [1.1, 2.6, 2.4], scale: 0.8, spin: -0.7 },
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
        color="#9FC0D0"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

/* ------------------------------------------------------------------ *
 *  Wet road — dark plane with a warm reflected smear under the rig
 * ------------------------------------------------------------------ */
function Road() {
  return (
    <group position={[0, -1.25, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 34]} />
        <meshStandardMaterial color="#08121A" metalness={0.85} roughness={0.28} />
      </mesh>
      {/* Reflection smears standing in for wet-tarmac highlights */}
      {[
        { x: -1.2, w: 5.5, c: '#E5231B', o: 0.32 },
        { x: 1.4, w: 3.2, c: '#FFB067', o: 0.28 },
        { x: -4.2, w: 2.4, c: '#7FA8C0', o: 0.18 },
      ].map((s, i) => (
        <mesh key={i} position={[s.x, 0.012, 2.2 + i * 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[s.w, 7]} />
          <meshBasicMaterial color={s.c} transparent opacity={s.o} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Distant street lamps — warm bokeh in the haze
 * ------------------------------------------------------------------ */
function Bokeh() {
  const lamps = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        position: [
          -16 + (i % 8) * 4.4 + (i % 3),
          1.4 + ((i * 37) % 5) * 0.5,
          -10 - (i % 4) * 3.2,
        ] as [number, number, number],
        size: 0.2 + ((i * 13) % 4) * 0.1,
        color: i % 3 === 0 ? '#FF8A3D' : '#FFC078',
      })),
    []
  );

  return (
    <>
      {lamps.map((l, i) => (
        <mesh key={i} position={l.position}>
          <sphereGeometry args={[l.size, 10, 10]} />
          <meshBasicMaterial
            color={l.color}
            transparent
            opacity={0.5}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}
    </>
  );
}

function Scene() {
  return (
    <>
      {/* Night: low ambient, cool moonlight, warm sodium bounce */}
      <fog attach="fog" args={['#0A141A', 20, 52]} />
      <ambientLight intensity={1.5} color="#B8D2E2" />
      <directionalLight position={[6, 10, 8]} intensity={3.6} color="#E4F0F8" />
      <directionalLight position={[-6, 4, -6]} intensity={1.8} color="#9FC4DA" />
      {/* Headlight spill and the red rim off the cab */}
      <pointLight position={[5.5, 0.4, 3.5]} intensity={70} color="#FFD9A0" distance={16} />
      <pointLight position={[2, 0.6, 3]} intensity={40} color="#FF6A4A" distance={14} />
      <pointLight position={[-5, 1.6, 2]} intensity={26} color="#FF9A5A" distance={18} />
      {/* Cool rim from behind picks out the container's top edge */}
      <directionalLight position={[-8, 6, -7]} intensity={3.2} color="#B4D8F0" />
      {/* Camera-side key so the lettered flank is the brightest thing in frame */}
      <directionalLight position={[-1, 2.5, 9]} intensity={2.8} color="#FFEBD2" />

      <Road />
      <Bokeh />

      {/* Contact shadow — a plain dark ellipse, since real shadow maps and
          drei's ContactShadows both need render targets we avoid here. */}
      <mesh position={[0.9, -1.23, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 4.4]} />
        <meshBasicMaterial color="#03080C" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* Shifted left and scaled down so the tractor stays fully in frame */}
      <group position={[0.75, 0.05, 0]} scale={1.18}>
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
