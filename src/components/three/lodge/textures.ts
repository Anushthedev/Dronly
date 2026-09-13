import * as THREE from 'three';

/**
 * Procedural materials for the lodge and its valley.
 *
 * Everything is drawn to a canvas at runtime rather than loaded as an
 * asset. Flat untextured colour is the single biggest reason a real-time
 * scene reads as a toy, and this site ships no image files — so the grain,
 * mortar and shingle courses are generated instead.
 *
 * Each generator is deterministic: the same seed draws the same texture on
 * every load, so the building never changes between visits.
 */

/** Deterministic PRNG — textures must be identical on every load. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function finish(
  canvas: HTMLCanvasElement,
  repeat: [number, number],
  anisotropy = 8,
) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Horizontal timber courses with grain, knots and a shadow line. */
export function woodSiding(repeat: [number, number] = [3, 2]) {
  const { canvas, ctx } = makeCanvas(512);
  const random = rng(41);
  const courses = 9;
  const h = 512 / courses;

  ctx.fillStyle = '#6b5034';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < courses; i += 1) {
    const y = i * h;
    const tone = 92 + Math.floor(random() * 34);
    ctx.fillStyle = `rgb(${tone + 22}, ${tone - 8}, ${Math.round(tone * 0.62)})`;
    ctx.fillRect(0, y, 512, h - 1);

    // Grain: long, low-contrast streaks along the course.
    for (let g = 0; g < 26; g += 1) {
      const gy = y + random() * h;
      ctx.strokeStyle = `rgba(0,0,0,${0.03 + random() * 0.07})`;
      ctx.lineWidth = 0.5 + random() * 1.6;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(
        170,
        gy + (random() - 0.5) * 5,
        340,
        gy + (random() - 0.5) * 5,
        512,
        gy,
      );
      ctx.stroke();
    }

    // A knot or two per course.
    if (random() > 0.45) {
      const kx = random() * 512;
      const ky = y + h * 0.5;
      const r = 3 + random() * 5;
      for (let k = 3; k > 0; k -= 1) {
        ctx.strokeStyle = `rgba(40,24,12,${0.22 * k})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(kx, ky, r * k * 0.5, r * k * 0.34, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Shadow in the joint between courses.
    ctx.fillStyle = 'rgba(26,14,6,0.5)';
    ctx.fillRect(0, y + h - 2, 512, 2);
  }

  return finish(canvas, repeat);
}

/** Coursed stone with mortar joints — plinth and chimney. */
export function stoneWall(repeat: [number, number] = [2, 2]) {
  const { canvas, ctx } = makeCanvas(512);
  const random = rng(97);

  ctx.fillStyle = '#584f45';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 10;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r += 1) {
    let x = -random() * 60;
    while (x < 512) {
      const w = 40 + random() * 74;
      const inset = 2;
      const tone = 118 + Math.floor(random() * 52);
      ctx.fillStyle = `rgb(${tone}, ${tone - 4}, ${tone - 12})`;
      ctx.fillRect(x + inset, r * rh + inset, w - inset * 2, rh - inset * 2);

      // Mottling so no two stones read the same.
      for (let s = 0; s < 12; s += 1) {
        ctx.fillStyle = `rgba(${random() > 0.5 ? 255 : 0},${random() > 0.5 ? 255 : 0},${random() > 0.5 ? 255 : 0},0.035)`;
        ctx.fillRect(
          x + inset + random() * (w - 4),
          r * rh + inset + random() * (rh - 4),
          2 + random() * 7,
          2 + random() * 5,
        );
      }

      // Bottom-right shading gives each block a little relief.
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + inset, r * rh + rh - 4, w - inset * 2, 2);
      x += w;
    }
  }
  return finish(canvas, repeat);
}

/** Overlapping split shingles, staggered row to row. */
export function shingleRoof(repeat: [number, number] = [4, 6]) {
  const { canvas, ctx } = makeCanvas(512);
  const random = rng(233);

  ctx.fillStyle = '#2f2c2b';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r += 1) {
    const offset = (r % 2) * 26 - random() * 10;
    let x = offset - 60;
    while (x < 512) {
      const w = 38 + random() * 22;
      const tone = 54 + Math.floor(random() * 34);
      ctx.fillStyle = `rgb(${tone}, ${tone - 3}, ${tone - 6})`;
      ctx.fillRect(x, r * rh, w - 2, rh);

      // Weathering streaks down each shingle.
      if (random() > 0.6) {
        ctx.fillStyle = `rgba(255,255,255,${0.02 + random() * 0.04})`;
        ctx.fillRect(x + random() * w * 0.6, r * rh, 2 + random() * 5, rh);
      }
      x += w;
    }
    // The overlap's cast shadow — what actually reads as depth from above.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, r * rh + rh - 3, 512, 3);
  }
  return finish(canvas, repeat);
}

/**
 * Ground detail — deliberately near-neutral.
 *
 * The terrain carries its colour in vertex attributes (meadow, dry grass,
 * rock, snow, shoreline). A saturated green map would multiply over all of
 * that and tint the rock and the snowcaps green, which is exactly what made
 * the peaks read as grassy hills. So this contributes texture and tonal
 * break-up only, and lets the vertex colours decide the hue.
 */
export function groundCover(repeat: [number, number] = [60, 60]) {
  const { canvas, ctx } = makeCanvas(512);
  const random = rng(613);

  ctx.fillStyle = '#9a9a96';
  ctx.fillRect(0, 0, 512, 512);

  // Broad tonal patches first, fine blades on top.
  for (let i = 0; i < 240; i += 1) {
    const v = 132 + Math.floor(random() * 58);
    ctx.fillStyle = `rgba(${v}, ${v + 2}, ${v - 3}, 0.45)`;
    ctx.beginPath();
    ctx.ellipse(
      random() * 512,
      random() * 512,
      16 + random() * 62,
      12 + random() * 46,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  for (let i = 0; i < 3600; i += 1) {
    const v = 118 + Math.floor(random() * 74);
    ctx.strokeStyle = `rgba(${v}, ${v + 3}, ${v - 4}, 0.4)`;
    ctx.lineWidth = 0.7;
    const x = random() * 512;
    const y = random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (random() - 0.5) * 3, y - 2 - random() * 4);
    ctx.stroke();
  }
  return finish(canvas, repeat, 16);
}

/** Soft cumulus for the sky dome. Alpha-only, tinted at draw time. */
export function cloudField() {
  const { canvas, ctx } = makeCanvas(1024);
  const random = rng(1777);
  ctx.clearRect(0, 0, 1024, 1024);

  // Clouds live in a band: a dome drawn edge to edge would put cumulus
  // directly overhead where a drone camera rarely points.
  for (let c = 0; c < 26; c += 1) {
    const cx = random() * 1024;
    const cy = 250 + random() * 430;
    const puffs = 8 + Math.floor(random() * 12);
    for (let p = 0; p < puffs; p += 1) {
      const px = cx + (random() - 0.5) * 190;
      const py = cy + (random() - 0.5) * 54;
      const r = 22 + random() * 52;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
