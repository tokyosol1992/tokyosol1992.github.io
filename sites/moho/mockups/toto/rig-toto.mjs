#!/usr/bin/env node
/**
 * TOTO face rig — bakes a skeleton, skin weights and face masks into the
 * static Tripo GLB, without Blender.
 *
 *   bash scripts/with-node24.sh node sites/moho/mockups/toto/rig-toto.mjs \
 *     [source.glb] [out.glb]
 *
 * Input : one static mesh (POSITION/NORMAL/TEXCOORD_0) + one baseColor JPEG.
 * Output: the same mesh with
 *   - 16 joints (root → spine → chest → neck → head → jaw / mouth corners /
 *     brows / eyes / lids / ears), JOINTS_0 + WEIGHTS_0 (4 influences)
 *   - `_MOUTH` (vec2) attribute: signed distance to the painted smile line
 *     (in mouth-edge units) and a mask that is 1 along the mouth opening
 *   - the painted irises removed from the texture (in-painted with sclera), so
 *     the page can draw a moving iris on a virtual eyeball instead
 *   - an extra mask texture (index 1): R = eye opening, G = eyelid area
 *   - all landmarks in `nodes[toto].extras.faceRig` for the runtime
 *
 * Landmarks were measured on this exact model (2026-11-17) by mapping every
 * head texel back to 3D and fitting the painted features; see
 * docs/moho/HISTORY.md. Units are metres, +Y up, the character faces +Z,
 * and "L" is the character's left (+X).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] ?? path.join(here, 'source/toto-source.glb');
const OUT = process.argv[3] ?? path.join(here, 'toto-rigged.glb');

// ───────────────────────────── landmarks ──────────────────────────────────
const CM = 0.01;
const EYES = {
  // o: sclera centroid, n: outward surface normal, u/v: in-surface axes (v up)
  // iris: painted iris circle in (u, v) around o; open: opening ellipse
  // (sclera + top outline) centre and semi-axes in (u, v) around o.
  L: {
    o: [0.0805, 0.8111, 0.0609], n: [0.575, 0.115, 0.81],
    u: [0.818, -0.081, -0.569], v: [0, 0.99, -0.14],
    iris: { c: [-2.25 * CM, -1.45 * CM], r: 2.2 * CM },
    open: { c: [-0.785 * CM, -0.31 * CM], a: 3.67 * CM, b: 3.96 * CM },
  },
  R: {
    o: [-0.069, 0.8059, 0.0713], n: [-0.467, 0.038, 0.884],
    u: [0.884, 0.02, 0.466], v: [0, 0.999, -0.043],
    iris: { c: [2.25 * CM, -1.45 * CM], r: 2.2 * CM },
    open: { c: [0.735 * CM, -0.18 * CM], a: 3.7 * CM, b: 4.0 * CM },
  },
};
// Virtual eyeball radius: with 2.5 cm the iris lands on the painted spot when
// the eye looks straight down +Z, i.e. the artwork "looks at the viewer".
const EYEBALL_RADIUS = 2.5 * CM;

// Painted smile line, side profile (y → z) per side, from the texture.
const SMILE = {
  L: [[0.61, 0.077], [0.62, 0.0717], [0.63, 0.0643], [0.64, 0.0565], [0.65, 0.0508], [0.66, 0.0456],
      [0.67, 0.042], [0.68, 0.0389], [0.69, 0.0372], [0.70, 0.0354], [0.708, 0.037]],
  R: [[0.61, 0.086], [0.62, 0.0814], [0.63, 0.0757], [0.64, 0.0693], [0.65, 0.0648], [0.66, 0.0611],
      [0.67, 0.0589], [0.68, 0.0564], [0.69, 0.057], [0.70, 0.0618]],
};
const MOUTH_CORNER_Y = { L: 0.708, R: 0.700 };
const MOUTH_EDGE = 0.008; // half-width of the lip transition band (stretches open)

const JOINTS = [
  // name, parent, bind position (world, identity rotation)
  ['root', -1, [0, 0, 0]],
  ['spine', 0, [0, 0.3, -0.03]],
  ['chest', 1, [0, 0.46, -0.035]],
  ['neck', 2, [0, 0.585, -0.04]],
  ['head', 3, [0, 0.625, -0.035]],
  ['jaw', 4, [0, 0.705, -0.01]],
  ['mouth_L', 4, [0.127, 0.71, 0.04]],
  ['mouth_R', 4, [-0.111, 0.70, 0.062]],
  ['brow_L', 4, [0.0798, 0.896, 0.0564]],
  ['brow_R', 4, [-0.0792, 0.8826, 0.0657]],
  ['eye_L', 4, null], // filled from EYES below
  ['eye_R', 4, null],
  ['lid_L', 4, null],
  ['lid_R', 4, null],
  ['ear_L', 4, [0.145, 0.87, -0.06]],
  ['ear_R', 4, [-0.14, 0.86, -0.055]],
];
const J = Object.fromEntries(JOINTS.map(([n], i) => [n, i]));

// ───────────────────────────── small math ─────────────────────────────────
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => mul(a, 1 / Math.hypot(...a));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const r4v = (v) => v.map(r4);

for (const e of Object.values(EYES)) {
  e.n = norm(e.n);
  e.u = norm(sub(e.u, mul(e.n, dot(e.u, e.n))));
  e.v = norm(sub(e.v, add(mul(e.n, dot(e.v, e.n)), mul(e.u, dot(e.v, e.u)))));
  e.openCenter = add(e.o, add(mul(e.u, e.open.c[0]), mul(e.v, e.open.c[1])));
  e.center = sub(e.openCenter, mul(e.n, EYEBALL_RADIUS));
}
JOINTS[J.eye_L][2] = JOINTS[J.lid_L][2] = EYES.L.center;
JOINTS[J.eye_R][2] = JOINTS[J.lid_R][2] = EYES.R.center;

// ───────────────────────────── GLB io ─────────────────────────────────────
function readGlb(buf) {
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
  let off = 12, json, bin;
  while (off < buf.length) {
    const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'));
    else if (type === 0x004e4942) bin = data;
    off += 8 + len;
  }
  return { json, bin };
}
const COMP = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function readAccessor(json, bin, i) {
  const a = json.accessors[i], bv = json.bufferViews[a.bufferView];
  const T = COMP[a.componentType], n = NCOMP[a.type];
  if (bv.byteStride && bv.byteStride !== n * T.BYTES_PER_ELEMENT) throw new Error('interleaved data not supported');
  const start = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
  return new T(Uint8Array.from(bin.subarray(start, start + a.count * n * T.BYTES_PER_ELEMENT)).buffer);
}
const viewBytes = (json, bin, i) => {
  const bv = json.bufferViews[i];
  return bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
};

class BinWriter {
  parts = []; length = 0; views = []; accessors = [];
  view(bytes, target) {
    const pad = (4 - (this.length % 4)) % 4;
    if (pad) { this.parts.push(Buffer.alloc(pad)); this.length += pad; }
    const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.views.push({ buffer: 0, byteOffset: this.length, byteLength: buf.length, ...(target ? { target } : {}) });
    this.parts.push(buf); this.length += buf.length;
    return this.views.length - 1;
  }
  accessor(arr, type, componentType, { target = 34962, minmax = false, normalized = false } = {}) {
    const n = NCOMP[type], count = arr.length / n;
    const acc = { bufferView: this.view(arr, target), componentType, count, type };
    if (normalized) acc.normalized = true;
    if (minmax) {
      const min = Array(n).fill(Infinity), max = Array(n).fill(-Infinity);
      for (let i = 0; i < count; i++) for (let k = 0; k < n; k++) {
        const x = arr[i * n + k]; if (x < min[k]) min[k] = x; if (x > max[k]) max[k] = x;
      }
      acc.min = min; acc.max = max;
    }
    this.accessors.push(acc);
    return this.accessors.length - 1;
  }
  toBuffer() { const b = Buffer.concat(this.parts); const pad = (4 - (b.length % 4)) % 4; return pad ? Buffer.concat([b, Buffer.alloc(pad)]) : b; }
}
function writeGlb(json, bin) {
  let js = Buffer.from(JSON.stringify(json), 'utf8');
  const jpad = (4 - (js.length % 4)) % 4; if (jpad) js = Buffer.concat([js, Buffer.alloc(jpad, 0x20)]);
  const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
  bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jh, js, bh, bin]);
}

// ───────────────────────────── load ───────────────────────────────────────
const src = readGlb(fs.readFileSync(SRC));
const { json, bin } = src;
if (json.meshes.length !== 1 || json.meshes[0].primitives.length !== 1) throw new Error('expected one mesh primitive');
const prim = json.meshes[0].primitives[0];
const P = readAccessor(json, bin, prim.attributes.POSITION);
const NRM = readAccessor(json, bin, prim.attributes.NORMAL);
const UV = readAccessor(json, bin, prim.attributes.TEXCOORD_0);
const IDX = Uint32Array.from(readAccessor(json, bin, prim.indices));
const meshNode = json.nodes.find((n) => n.mesh === 0);
const T0 = meshNode.translation ?? [0, 0, 0];
const NV = P.length / 3;
for (let i = 0; i < NV; i++) for (let k = 0; k < 3; k++) P[i * 3 + k] += T0[k]; // skinned meshes ignore node TRS

const mat = json.materials[0];
const baseTex = json.textures[mat.pbrMetallicRoughness.baseColorTexture.index];
const baseImg = json.images[baseTex.source];
const { data: TEX, info } = await sharp(viewBytes(json, bin, baseImg.bufferView)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const TW = info.width, TH = info.height;
console.log(`mesh ${NV} verts, ${IDX.length / 3} tris, texture ${TW}x${TH}`);

const texAt = (u, v) => {
  const x = clamp(Math.floor(u * TW), 0, TW - 1), y = clamp(Math.floor(v * TH), 0, TH - 1);
  const o = (y * TW + x) * 3; return [TEX[o], TEX[o + 1], TEX[o + 2]];
};
const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];

// ───────────────────────────── weld + classify ────────────────────────────
// UV seams split vertices; weights must agree on every copy of a position.
const weld = new Int32Array(NV), wmap = new Map(), WP = [];
for (let i = 0; i < NV; i++) {
  const k = `${Math.round(P[i * 3] * 1e5)},${Math.round(P[i * 3 + 1] * 1e5)},${Math.round(P[i * 3 + 2] * 1e5)}`;
  let w = wmap.get(k);
  if (w === undefined) { w = WP.length; wmap.set(k, w); WP.push([P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]); }
  weld[i] = w;
}
const NW = WP.length;
const minLum = new Float32Array(NW).fill(255), isJacket = new Uint8Array(NW);
for (let i = 0; i < NV; i++) {
  const c = texAt(UV[i * 2], UV[i * 2 + 1]), w = weld[i], l = lum(c);
  if (l < minLum[w]) minLum[w] = l;
  const blue = c[2] > c[0] + 40, collar = c[1] > c[0] + 5 && c[1] > c[2] - 5 && l < 90;
  if (blue || collar) isJacket[w] = 1;
}
const BODY_Y = 0.555;
const isEar = (p, w) => minLum[w] < 60 && Math.abs(p[0]) > 0.11 && p[1] > 0.53 && p[2] < 0.06;
const isBody = (p, w) => !isEar(p, w) && (p[1] < BODY_Y || (isJacket[w] && p[1] < 0.66));

// distance from each head vertex to the jacket/neck seam
const seam = [];
for (let w = 0; w < NW; w++) { const p = WP[w]; if (isBody(p, w) && p[1] > 0.5) seam.push(p); }
const distToSeam = (p) => {
  let best = Infinity;
  for (const q of seam) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < best) best = d; }
  return Math.sqrt(best);
};

// ───────────────────────────── mouth field ────────────────────────────────
const curveZ = (side, y) => {
  const c = SMILE[side];
  if (y <= c[0][0]) return c[0][1] + (c[0][0] - y) * 0.6; // keep heading forward/down under the muzzle
  for (let i = 1; i < c.length; i++) if (y <= c[i][0]) {
    const t = (y - c[i - 1][0]) / (c[i][0] - c[i - 1][0]); return mix(c[i - 1][1], c[i][1], t);
  }
  return c[c.length - 1][1];
};
// Signed distance-ish to the lip line: > 0 upper muzzle/face, < 0 jaw side.
function mouthField(p) {
  const t = smooth(-0.04, 0.04, p[0]);
  const yc = mix(MOUTH_CORNER_Y.R, MOUTH_CORNER_Y.L, t);
  const zc = mix(curveZ('R', Math.min(p[1], yc)), curveZ('L', Math.min(p[1], yc)), t);
  const dFront = (p[2] - zc) * 0.86; // slope of the line ≈ 30° from vertical
  const dUp = p[1] - yc;
  const sd = Math.max(dFront, dUp);
  const zCorner = mix(curveZ('R', yc), curveZ('L', yc), t);
  // sharp along the painted line, soft behind the corners (cheek stretch only)
  const edge = mix(0.032, MOUTH_EDGE, smooth(zCorner - 0.035, zCorner - 0.006, p[2]));
  const mask = smooth(zCorner - 0.012, zCorner + 0.004, p[2]) * smooth(0.585, 0.6, p[1]);
  return { sd, edge, mask };
}

// ───────────────────────────── weights ────────────────────────────────────
const gauss = (p, c, sx, sy, sz) => {
  const d = ((p[0] - c[0]) / sx) ** 2 + ((p[1] - c[1]) / sy) ** 2 + ((p[2] - c[2]) / sz) ** 2;
  return d > 9 ? 0 : Math.exp(-0.5 * d);
};
const jp = (name) => JOINTS[J[name]][2];
const WW = Array.from({ length: NW }, () => new Float32Array(JOINTS.length));
for (let w = 0; w < NW; w++) {
  const p = WP[w], W = WW[w];
  if (isBody(p, w)) {
    const radial = Math.hypot(p[0], p[2] + 0.045);
    const neck = smooth(0.545, 0.6, p[1]) * smooth(0.17, 0.11, radial);
    const rest = 1 - neck, up = smooth(0.33, 0.45, p[1]), mid = smooth(0.17, 0.26, p[1]);
    W[J.neck] = neck; W[J.chest] = rest * up; W[J.spine] = rest * (1 - up) * mid; W[J.root] = rest * (1 - up) * (1 - mid);
    continue;
  }
  const headAmt = smooth(0.004, 0.03, distToSeam(p));
  const chain = new Float32Array(JOINTS.length);
  if (isEar(p, w)) {
    const side = p[0] > 0 ? 'L' : 'R';
    const sway = smooth(0.135, 0.2, Math.abs(p[0])) * smooth(0.86, 0.66, p[1]) + 0.35 * smooth(0.8, 0.6, p[1]);
    chain[J[`ear_${side}`]] = clamp(sway, 0, 1);
  } else {
    const m = mouthField(p);
    const backFade = smooth(-0.13, -0.06, p[2]);
    chain[J.jaw] = smooth(m.edge, -m.edge, m.sd) * backFade * smooth(0.6, 0.64, p[1] + 0.03);
    const front = smooth(-0.01, 0.02, p[2]);
    chain[J.mouth_L] = gauss(p, jp('mouth_L'), 0.02, 0.017, 0.02) * front;
    chain[J.mouth_R] = gauss(p, jp('mouth_R'), 0.02, 0.017, 0.02) * front;
    chain[J.brow_L] = gauss(p, jp('brow_L'), 0.024, 0.013, 0.02) * front;
    chain[J.brow_R] = gauss(p, jp('brow_R'), 0.024, 0.013, 0.02) * front;
  }
  let s = 0; for (const x of chain) s += x;
  if (s > 1) for (let k = 0; k < chain.length; k++) chain[k] /= s;
  chain[J.head] = Math.max(0, 1 - Math.min(1, s));
  for (let k = 0; k < chain.length; k++) W[k] = chain[k] * headAmt;
  W[J.neck] += 1 - headAmt;
}

// top-4 per vertex, normalised
const JOINTS_0 = new Uint8Array(NV * 4), WEIGHTS_0 = new Float32Array(NV * 4), MOUTH = new Float32Array(NV * 2);
let dropped = 0;
for (let i = 0; i < NV; i++) {
  const W = WW[weld[i]];
  const order = [...W.keys()].filter((k) => W[k] > 1e-4).sort((a, b) => W[b] - W[a]);
  if (order.length > 4) dropped++;
  const top = order.slice(0, 4); let s = 0; for (const k of top) s += W[k];
  top.forEach((k, j) => { JOINTS_0[i * 4 + j] = k; WEIGHTS_0[i * 4 + j] = W[k] / s; });
  const p = WP[weld[i]], m = isBody(p, weld[i]) || isEar(p, weld[i]) ? null : mouthField(p);
  MOUTH[i * 2] = m ? clamp(m.sd / MOUTH_EDGE, -4, 4) : 4;
  MOUTH[i * 2 + 1] = m ? m.mask * smooth(0.016, MOUTH_EDGE, m.edge) : 0;
}
const counts = JOINTS.map(([n], k) => [n, WW.filter((W) => W[k] > 0.5).length]);
console.log('verts mostly on each joint:', counts.map(([n, c]) => `${n}:${c}`).join(' '));
if (dropped) console.log(`note: ${dropped} vertices had >4 influences (smallest dropped)`);

// ───────────────────────────── eyes: in-paint + masks ─────────────────────
const isWhite = (c) => Math.min(c[0], c[1], c[2]) > 185 && c[0] - c[2] < 40;
const isSkin = (c) => c[0] > 165 && c[1] > 130 && c[0] - c[2] > 45;
const texel = new Map(); // pixel index → { side, lu, lv }
const covered = new Uint8Array(TW * TH); // texels inside any UV island (the rest is atlas padding)
for (let t = 0; t < IDX.length; t += 3) {
  const ia = IDX[t], ib = IDX[t + 1], ic = IDX[t + 2];
  const pa = [P[ia * 3], P[ia * 3 + 1], P[ia * 3 + 2]], pb = [P[ib * 3], P[ib * 3 + 1], P[ib * 3 + 2]], pc = [P[ic * 3], P[ic * 3 + 1], P[ic * 3 + 2]];
  const cen = mul(add(add(pa, pb), pc), 1 / 3);
  const side = cen[0] > 0 ? 'L' : 'R', e = EYES[side];
  const nearEye = Math.hypot(...sub(cen, e.o)) < 0.065 && cen[2] > 0;
  const ua = [UV[ia * 2] * TW, UV[ia * 2 + 1] * TH], ub = [UV[ib * 2] * TW, UV[ib * 2 + 1] * TH], uc = [UV[ic * 2] * TW, UV[ic * 2 + 1] * TH];
  const x0 = Math.max(0, Math.floor(Math.min(ua[0], ub[0], uc[0]))), x1 = Math.min(TW - 1, Math.ceil(Math.max(ua[0], ub[0], uc[0])));
  const y0 = Math.max(0, Math.floor(Math.min(ua[1], ub[1], uc[1]))), y1 = Math.min(TH - 1, Math.ceil(Math.max(ua[1], ub[1], uc[1])));
  const v0 = [ub[0] - ua[0], ub[1] - ua[1]], v1 = [uc[0] - ua[0], uc[1] - ua[1]];
  const d00 = v0[0] * v0[0] + v0[1] * v0[1], d01 = v0[0] * v1[0] + v0[1] * v1[1], d11 = v1[0] * v1[0] + v1[1] * v1[1];
  const den = d00 * d11 - d01 * d01; if (Math.abs(den) < 1e-12) continue;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v2 = [x + 0.5 - ua[0], y + 0.5 - ua[1]];
    const d20 = v2[0] * v0[0] + v2[1] * v0[1], d21 = v2[0] * v1[0] + v2[1] * v1[1];
    const bv = (d11 * d20 - d01 * d21) / den, bw = (d00 * d21 - d01 * d20) / den, bu = 1 - bv - bw;
    if (bu < -0.03 || bv < -0.03 || bw < -0.03) continue;
    covered[y * TW + x] = 1;
    if (!nearEye) continue;
    const q = sub(add(add(mul(pa, bu), mul(pb, bv)), mul(pc, bw)), e.o);
    texel.set(y * TW + x, { side, lu: dot(q, e.u), lv: dot(q, e.v) });
  }
}
const target = new Set(), known = new Map(), maskR = new Set(), maskG = new Set();
const irisSamples = { rim: [], iris: [], pupil: [] }, lidSamples = [];
for (const [pix, t] of texel) {
  const e = EYES[t.side], o = pix * 3, c = [TEX[o], TEX[o + 1], TEX[o + 2]];
  const di = Math.hypot(t.lu - e.iris.c[0], t.lv - e.iris.c[1]);
  const ell = (m) => ((t.lu - e.open.c[0]) / (e.open.a + m)) ** 2 + ((t.lv - e.open.c[1]) / (e.open.b + m)) ** 2;
  const inIris = di < e.iris.r + 0.3 * CM, inOpen = ell(0.5 * CM) < 1;
  if (inIris && inOpen && !isSkin(c)) {
    target.add(pix);
    const f = di / e.iris.r;
    if (f < 0.35 && lum(c) < 40) irisSamples.pupil.push(c);
    else if (f > 0.62 && f < 0.8 && lum(c) > 35 && lum(c) < 140) irisSamples.iris.push(c);
    else if (f > 0.86 && f < 0.97 && lum(c) < 90) irisSamples.rim.push(c);
  } else if (isWhite(c) && inOpen) known.set(pix, c);
  if (ell(0.8 * CM) < 1 && (isWhite(c) || target.has(pix))) maskR.add(pix);
  if (ell(0.45 * CM) < 1 && !isSkin(c)) maskG.add(pix);
  const ring = ell(1.4 * CM);
  if (ring < 1 && ell(0.7 * CM) > 1 && isSkin(c) && t.lv > -1 * CM) lidSamples.push(c);
}
// Fill the iris area with the sclera's own median colour, then relax so the
// edge blends into the surrounding (slightly shaded) white.
const N4 = [1, -1, TW, -TW];
const median = (k) => { const v = [...known.values()].filter((c) => lum(c) > 215).map((c) => c[k]).sort((a, b) => a - b); return v[v.length >> 1] ?? 236; };
const SCLERA = [median(0), median(1), median(2)];
const filled = new Map();
for (const pix of target) filled.set(pix, SCLERA.slice());
for (let it = 0; it < 30; it++) { // relax: blend the fill into the shaded sclera
  const nextVals = new Map();
  for (const [pix] of filled) {
    let r = 0, g = 0, b = 0, n = 0;
    for (const d of N4) { const c = known.get(pix + d) ?? filled.get(pix + d); if (c) { r += c[0]; g += c[1]; b += c[2]; n++; } }
    if (n) nextVals.set(pix, [r / n, g / n, b / n]);
  }
  for (const [pix, c] of nextVals) filled.set(pix, c);
}
for (const [pix, c] of filled) { const o = pix * 3; TEX[o] = c[0]; TEX[o + 1] = c[1]; TEX[o + 2] = c[2]; }
// The atlas padding around each island still holds the old iris; bilinear/mip
// sampling reads it at seams. Grow the in-painted colour and both masks a few
// texels into padding only (never into another island).
const N8 = [1, -1, TW, -TW, TW + 1, TW - 1, -TW + 1, -TW - 1];
const MR = new Uint8Array(TW * TH), MG = new Uint8Array(TW * TH);
for (const pix of maskR) MR[pix] = 255;
for (const pix of maskG) MG[pix] = 255;
let front = new Set([...filled.keys(), ...maskR, ...maskG]);
let grown = 0;
for (let ring = 0; ring < 8; ring++) {
  const next = new Set();
  for (const pix of front) for (const d of N8) {
    const q = pix + d;
    if (q < 0 || q >= TW * TH || covered[q] || next.has(q)) continue;
    if (MR[q] || MG[q] || filled.has(q)) continue;
    next.add(q);
  }
  for (const q of next) {
    let r = 0, g = 0, b = 0, n = 0, mr = 0, mg = 0;
    for (const d of N8) {
      const s = q + d; if (s < 0 || s >= TW * TH) continue;
      mr = Math.max(mr, MR[s]); mg = Math.max(mg, MG[s]);
      const c = filled.get(s); if (c) { r += c[0]; g += c[1]; b += c[2]; n++; }
    }
    MR[q] = mr; MG[q] = mg;
    if (n) { const c = [r / n, g / n, b / n]; filled.set(q, c); const o = q * 3; TEX[o] = c[0]; TEX[o + 1] = c[1]; TEX[o + 2] = c[2]; }
  }
  grown += next.size; front = next;
}
console.log(`eyes: ${texel.size} texels mapped, ${target.size} iris texels in-painted with ${SCLERA}, ${grown} padding texels grown`);

const avg = (arr, fallback) => arr.length ? arr.reduce((s, c) => [s[0] + c[0], s[1] + c[1], s[2] + c[2]], [0, 0, 0]).map((x) => Math.round(x / arr.length)) : fallback;
const colors = {
  iris: avg(irisSamples.iris, [96, 58, 34]), irisRim: avg(irisSamples.rim, [40, 22, 14]),
  pupil: avg(irisSamples.pupil, [12, 8, 6]), lid: avg(lidSamples, [236, 214, 158]),
};
console.log('sampled colours', JSON.stringify(colors));

// mask at half resolution (2×2 box filter for soft edges)
const MW = TW / 2, MH = TH / 2, dil = new Uint8Array(MW * MH * 3);
for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
  const p0 = (y * 2) * TW + x * 2, o = (y * MW + x) * 3;
  dil[o] = (MR[p0] + MR[p0 + 1] + MR[p0 + TW] + MR[p0 + TW + 1]) >> 2;
  dil[o + 1] = (MG[p0] + MG[p0 + 1] + MG[p0 + TW] + MG[p0 + TW + 1]) >> 2;
}

// ───────────────────────────── write ──────────────────────────────────────
const outTex = await sharp(TEX, { raw: { width: TW, height: TH, channels: 3 } }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
const outMask = await sharp(dil, { raw: { width: MW, height: MH, channels: 3 } }).png({ compressionLevel: 9 }).toBuffer();

const W8 = new BinWriter();
const attrs = {
  POSITION: W8.accessor(P, 'VEC3', 5126, { minmax: true }),
  NORMAL: W8.accessor(NRM, 'VEC3', 5126),
  TEXCOORD_0: W8.accessor(UV, 'VEC2', 5126),
  JOINTS_0: W8.accessor(JOINTS_0, 'VEC4', 5121),
  WEIGHTS_0: W8.accessor(WEIGHTS_0, 'VEC4', 5126),
  _MOUTH: W8.accessor(MOUTH, 'VEC2', 5126),
};
const indices = W8.accessor(IDX, 'SCALAR', 5125, { target: 34963 });
const world = JOINTS.map(([, , p]) => p);
const IBM = new Float32Array(JOINTS.length * 16);
world.forEach((p, k) => { const o = k * 16; IBM[o] = IBM[o + 5] = IBM[o + 10] = IBM[o + 15] = 1; IBM[o + 12] = -p[0]; IBM[o + 13] = -p[1]; IBM[o + 14] = -p[2]; });
const ibm = W8.accessor(IBM, 'MAT4', 5126, { target: undefined });
const texView = W8.view(new Uint8Array(outTex), undefined);
const maskView = W8.view(new Uint8Array(outMask), undefined);

const eyeExtras = (e) => ({
  center: r4v(e.center), openCenter: r4v(e.openCenter), n: r4v(e.n), u: r4v(e.u), v: r4v(e.v),
  openRadius: [r4(e.open.a), r4(e.open.b)], radius: EYEBALL_RADIUS,
  irisAngle: r4(Math.atan2(e.iris.r, EYEBALL_RADIUS)),
});
const nodes = [];
nodes.push({ name: 'toto', children: [1, 2], extras: { faceRig: {
  version: 1,
  joints: JOINTS.map(([n]) => n),
  eyes: { L: eyeExtras(EYES.L), R: eyeExtras(EYES.R) },
  mouth: { edge: MOUTH_EDGE },
  colors,
  maskTexture: 1,
  note: 'Eye/lid joints carry no weights: their rotation drives the eye shader (virtual eyeball + lids).',
} } });
nodes.push({ name: 'toto_mesh', mesh: 0, skin: 0 });
const jointNode = (k) => 2 + k;
JOINTS.forEach(([name, parent, p], k) => {
  const pp = parent < 0 ? [0, 0, 0] : world[parent];
  const kids = JOINTS.map((j, c) => (j[1] === k ? jointNode(c) : -1)).filter((x) => x >= 0);
  nodes.push({ name, translation: r4v(sub(p, pp)).map((x) => x || 0), ...(kids.length ? { children: kids } : {}) });
});
// translations were rounded: recompute IBMs from the rounded hierarchy so bind pose is exact
const rounded = [];
JOINTS.forEach(([, parent], k) => { const t = nodes[jointNode(k)].translation; rounded[k] = parent < 0 ? t : add(rounded[parent], t); });
rounded.forEach((p, k) => { const o = k * 16; IBM[o + 12] = -p[0]; IBM[o + 13] = -p[1]; IBM[o + 14] = -p[2]; });

const out = {
  asset: { version: '2.0', generator: 'rig-toto.mjs (MoHo mockups)', extras: { source: json.asset } },
  scene: 0,
  scenes: [{ name: 'TOTO', nodes: [0] }],
  nodes,
  skins: [{ name: 'toto_rig', joints: JOINTS.map((_, k) => jointNode(k)), inverseBindMatrices: ibm, skeleton: jointNode(0) }],
  meshes: [{ name: 'toto', primitives: [{ attributes: attrs, indices, material: 0, mode: 4 }] }],
  materials: [{ ...mat, name: 'toto_skin' }],
  samplers: json.samplers,
  images: [{ name: 'toto_basecolor', mimeType: 'image/jpeg', bufferView: texView }, { name: 'toto_face_mask', mimeType: 'image/png', bufferView: maskView }],
  textures: [{ sampler: 0, source: 0 }, { sampler: 0, source: 1 }],
  accessors: W8.accessors,
  bufferViews: W8.views,
  buffers: [{ byteLength: 0 }],
};
out.materials[0].pbrMetallicRoughness = { ...mat.pbrMetallicRoughness, baseColorTexture: { index: 0 } };
const binOut = W8.toBuffer();
out.buffers[0].byteLength = binOut.length;
fs.writeFileSync(OUT, writeGlb(out, binOut));
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(fs.statSync(OUT).size / 1e6).toFixed(2)} MB)`);

// Web package for the page: artifact hosting serves .json/.jpg/.png but not .glb,
// so ship geometry as base64 inside JSON and the two images as plain files.
// The page rebuilds a GLB in memory from this (see loadRig() in toto-face.src.html).
const dir = path.dirname(OUT);
const imgStart = W8.views[texView].byteOffset;
const webGltf = {
  ...out,
  images: [{ name: 'toto_basecolor', mimeType: 'image/jpeg', uri: 'toto-basecolor.jpg' }, { name: 'toto_face_mask', mimeType: 'image/png', uri: 'toto-facemask.png' }],
  bufferViews: out.bufferViews.slice(0, texView),
  buffers: [{ byteLength: imgStart }],
};
if (maskView !== texView + 1 || maskView !== out.bufferViews.length - 1) throw new Error('image views must be last');
fs.writeFileSync(path.join(dir, 'toto-rig.json'), JSON.stringify({ format: 'toto-rig-web/1', gltf: webGltf, bin: binOut.subarray(0, imgStart).toString('base64') }));
fs.writeFileSync(path.join(dir, 'toto-basecolor.jpg'), outTex);
fs.writeFileSync(path.join(dir, 'toto-facemask.png'), outMask);
console.log('wrote web package: toto-rig.json + toto-basecolor.jpg + toto-facemask.png');
