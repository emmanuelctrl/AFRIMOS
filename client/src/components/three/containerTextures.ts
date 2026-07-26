import { useMemo } from 'react';
import * as THREE from 'three';

const W = 2048;
const H = 512;

/** Deterministic PRNG so the weathering pattern is stable between renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Paints the corrugated wave that defines a container's side. Returned as a
 * shading pass so the same profile can drive both colour and bump.
 */
function paintCorrugation(
  ctx: CanvasRenderingContext2D,
  { light, dark, period = 46 }: { light: string; dark: string; period?: number }
) {
  for (let x = 0; x < W; x += period) {
    // Each period is one trapezoid: lit face, flat crest, shadowed face.
    const g = ctx.createLinearGradient(x, 0, x + period, 0);
    g.addColorStop(0, dark);
    g.addColorStop(0.18, light);
    g.addColorStop(0.5, light);
    g.addColorStop(0.82, dark);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, period, H);
  }
}

/** Rust blooms, road grime and rain streaks. */
function paintWeathering(ctx: CanvasRenderingContext2D, seed: number) {
  const rand = rng(seed);

  // Rain streaks running down from the top rail
  for (let i = 0; i < 90; i++) {
    const x = rand() * W;
    const len = 60 + rand() * 260;
    const g = ctx.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, 'rgba(20,12,10,0.30)');
    g.addColorStop(1, 'rgba(20,12,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 1 + rand() * 3, len);
  }

  // Rust blooms, concentrated low where water sits
  for (let i = 0; i < 40; i++) {
    const x = rand() * W;
    const y = H * (0.45 + rand() * 0.55);
    const r = 8 + rand() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(96,44,20,0.45)');
    g.addColorStop(0.6, 'rgba(78,36,18,0.20)');
    g.addColorStop(1, 'rgba(78,36,18,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Road grime along the bottom edge
  const grime = ctx.createLinearGradient(0, H, 0, H * 0.68);
  grime.addColorStop(0, 'rgba(12,10,9,0.55)');
  grime.addColorStop(1, 'rgba(12,10,9,0)');
  ctx.fillStyle = grime;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  // Scuffs
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = `rgba(230,225,220,${0.04 + rand() * 0.07})`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    const x = rand() * W;
    const y = rand() * H;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 90, y + (rand() - 0.5) * 20);
    ctx.stroke();
  }
}

/** Owner code, serial, size/type code and the CSC plate. */
function paintMarkings(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // Big owner stencil
  ctx.fillStyle = 'rgba(244,246,247,0.9)';
  ctx.font = 'bold 128px "Space Grotesk", Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '14px';
  ctx.fillText('AFRIMOS', 210, H * 0.42);

  ctx.font = '46px Inter, sans-serif';
  ctx.fillStyle = 'rgba(244,246,247,0.62)';
  ctx.letterSpacing = '12px';
  ctx.fillText('VERIFIED EXPORT', 214, H * 0.58);

  // Container number, in the standard owner-code / serial / check-digit form
  ctx.font = 'bold 40px "Courier New", monospace';
  ctx.fillStyle = 'rgba(244,246,247,0.8)';
  ctx.letterSpacing = '4px';
  ctx.fillText('AFRU 482915 7', 1180, H * 0.3);

  ctx.font = '30px "Courier New", monospace';
  ctx.fillStyle = 'rgba(244,246,247,0.55)';
  ctx.fillText('40 HC   MAX 30,480 KG', 1180, H * 0.44);

  // CSC / consolidated plate
  ctx.fillStyle = 'rgba(228,232,235,0.85)';
  ctx.fillRect(1640, H * 0.62, 150, 92);
  ctx.fillStyle = 'rgba(24,28,32,0.75)';
  ctx.font = '20px "Courier New", monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText('CSC SAFETY', 1652, H * 0.66);
  ctx.fillText('APPROVAL', 1652, H * 0.71);
  ctx.fillText('ET/1284/26', 1652, H * 0.76);

  ctx.restore();
}

function makeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  return canvas;
}

export interface ContainerMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

/**
 * Builds the container skin procedurally: a corrugated, weathered, stencilled
 * side panel plus matching bump and roughness passes. Flat-coloured boxes read
 * as toy geometry — the surface detail is what sells the material.
 */
export function useContainerMaps(base: string, seed = 7): ContainerMaps {
  return useMemo(() => {
    const c = new THREE.Color(base);
    const light = `#${c.clone().offsetHSL(0, 0, 0.07).getHexString()}`;
    const dark = `#${c.clone().offsetHSL(0, 0, -0.14).getHexString()}`;

    // ---- Colour ----
    const colour = makeCanvas();
    const cx = colour.getContext('2d')!;
    cx.fillStyle = base;
    cx.fillRect(0, 0, W, H);
    paintCorrugation(cx, { light, dark });
    paintWeathering(cx, seed);
    paintMarkings(cx);

    // ---- Bump: the corrugation profile in greyscale ----
    const bump = makeCanvas();
    const bx = bump.getContext('2d')!;
    bx.fillStyle = '#808080';
    bx.fillRect(0, 0, W, H);
    paintCorrugation(bx, { light: '#f2f2f2', dark: '#141414' });
    // Rails read as raised bands top and bottom
    bx.fillStyle = '#e8e8e8';
    bx.fillRect(0, 0, W, 26);
    bx.fillRect(0, H - 26, W, 26);

    // ---- Roughness: grime and rust are rougher than clean paint ----
    const rough = makeCanvas();
    const rx = rough.getContext('2d')!;
    rx.fillStyle = '#6e6e6e';
    rx.fillRect(0, 0, W, H);
    const rand = rng(seed + 31);
    for (let i = 0; i < 70; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 20 + rand() * 90;
      const g = rx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(220,220,220,0.5)');
      g.addColorStop(1, 'rgba(220,220,220,0)');
      rx.fillStyle = g;
      rx.beginPath();
      rx.arc(x, y, r, 0, Math.PI * 2);
      rx.fill();
    }

    const wrap = (canvas: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(canvas);
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.anisotropy = 8;
      return t;
    };

    return { map: wrap(colour), bumpMap: wrap(bump), roughnessMap: wrap(rough) };
  }, [base, seed]);
}

/** Plain corrugated steel, used for the doors and roof. */
export function useSteelMaps(base: string, seed = 3): ContainerMaps {
  return useMemo(() => {
    const c = new THREE.Color(base);
    const light = `#${c.clone().offsetHSL(0, 0, 0.06).getHexString()}`;
    const dark = `#${c.clone().offsetHSL(0, 0, -0.12).getHexString()}`;

    const colour = makeCanvas();
    const cx = colour.getContext('2d')!;
    cx.fillStyle = base;
    cx.fillRect(0, 0, W, H);
    paintCorrugation(cx, { light, dark, period: 96 });
    paintWeathering(cx, seed);

    const bump = makeCanvas();
    const bx = bump.getContext('2d')!;
    bx.fillStyle = '#808080';
    bx.fillRect(0, 0, W, H);
    paintCorrugation(bx, { light: '#ededed', dark: '#1a1a1a', period: 96 });

    const rough = makeCanvas();
    const rx = rough.getContext('2d')!;
    rx.fillStyle = '#7a7a7a';
    rx.fillRect(0, 0, W, H);

    const wrap = (canvas: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(canvas);
      t.anisotropy = 8;
      return t;
    };

    return { map: wrap(colour), bumpMap: wrap(bump), roughnessMap: wrap(rough) };
  }, [base, seed]);
}
