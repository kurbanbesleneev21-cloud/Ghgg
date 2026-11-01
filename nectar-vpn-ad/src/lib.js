import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PI = Math.PI;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const easeOutBack = (t) => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const easeOutElastic = (t) => { t = clamp(t); if (t === 0 || t === 1) return t; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * PI) / 3) + 1; };
export const easeInOut = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

const matCache = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.55, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.opacity, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide });
  matCache.set(key, m); return m;
}
export function mesh(geo, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const G = {};
export const sphere = (r, w = 32, h = 24) => (G['s' + r + w] ??= new THREE.SphereGeometry(r, w, h));
export const capsule = (r, l) => (G['c' + r + '_' + l] ??= new THREE.CapsuleGeometry(r, l, 8, 20));
export const rbox = (w, h, d, r = 0.08) => (G['b' + [w, h, d, r]] ??= new RoundedBoxGeometry(w, h, d, 3, r));
export const cyl = (rt, rb, h, s = 24) => (G['y' + [rt, rb, h, s]] ??= new THREE.CylinderGeometry(rt, rb, h, s));
export const cone = (r, h, s = 24) => (G['o' + [r, h, s]] ??= new THREE.ConeGeometry(r, h, s));
export const torus = (r, t, arc = PI * 2) => (G['t' + [r, t, arc]] ??= new THREE.TorusGeometry(r, t, 10, 28, arc));

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { canvas: c, g }; return t;
}
export function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function hexPath(g, cx, cy, r, rot = 0) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * PI / 3; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }

// ---------------- FACE -----------------
function buildFace(head, R, o) {
  const face = {};
  const eyeR = o.eyeR ?? 0.125;
  const white = mat('#ffffff', { rough: 0.25 });
  const irisM = mat(o.eye ?? '#5a3b1e', { rough: 0.2 });
  const black = mat('#111111', { rough: 0.15 });
  const shine = mat('#ffffff', { emissive: '#ffffff', ei: 0.9 });
  face.eyes = []; face.irises = [];
  for (const side of [-1, 1]) {
    const eg = new THREE.Group();
    const ex = 0.37 * R * (o.eyeSpread ?? 1), ey = 0.09 * R;
    eg.position.set(side * ex, ey, Math.sqrt(R * R - ex * ex - ey * ey) - eyeR * 0.35);
    eg.rotation.y = side * 0.32;
    head.add(eg);
    const w = mesh(sphere(eyeR), white, 0, 0, 0, eg); w.scale.set(1, 1.12, 0.6);
    const ir = new THREE.Group(); ir.position.z = eyeR * 0.42; eg.add(ir);
    const iris = mesh(sphere(eyeR * 0.66), irisM, 0, 0, 0, ir); iris.scale.set(1, 1.1, 0.45);
    const pup = mesh(sphere(eyeR * 0.38), black, 0, 0, eyeR * 0.14, ir); pup.scale.set(1, 1.1, 0.5);
    mesh(sphere(eyeR * 0.17), shine, -eyeR * 0.26, eyeR * 0.3, eyeR * 0.3, ir);
    mesh(sphere(eyeR * 0.08), shine, eyeR * 0.22, -eyeR * 0.22, eyeR * 0.3, ir);
    face.eyes.push(eg); face.irises.push(ir);
    // lashes for some
    if (o.lashes) { const l = mesh(capsule(0.012, 0.05), black, side * eyeR * 0.85, eyeR * 0.9, 0.0, eg); l.rotation.z = -side * 0.9; }
  }
  // brows
  face.brows = [];
  for (const side of [-1, 1]) {
    const bp = new THREE.Group(); const bx = 0.37 * R * (o.eyeSpread ?? 1), by = 0.42 * R;
    bp.position.set(side * bx, by, Math.sqrt(R * R - bx * bx - by * by) + 0.005); bp.rotation.y = side * 0.3; head.add(bp);
    const b = mesh(capsule(0.022, 0.09), mat(o.brow ?? o.hairColor ?? '#3a2a1a'), 0, 0, 0, bp); b.rotation.z = PI / 2;
    face.brows.push(bp); bp.userData.side = side; bp.userData.y = by;
  }
  // nose
  mesh(sphere(0.045 * R / 0.44), mat(o.noseColor ?? o.skin), 0, -0.06 * R, R * 0.98, head).scale.set(1.1, 0.9, 1);
  // cheeks
  const blush = new THREE.MeshStandardMaterial({ color: '#ff7a8a', transparent: true, opacity: 0.45, roughness: 0.8 });
  for (const side of [-1, 1]) { const c = mesh(sphere(0.065), blush, side * 0.58 * R, -0.2 * R, R * 0.74, head); c.scale.set(1, 0.6, 0.35); c.rotation.y = side * 0.6; c.castShadow = false; }
  // mouth
  const my = -0.36 * R, mz = Math.sqrt(R * R - my * my) - 0.005;
  const mouthM = mat('#5b1a1a', { rough: 0.6 });
  face.smile = mesh(torus(0.085 * R / 0.44, 0.02, PI), mouthM, 0, my + 0.03, mz, head); face.smile.rotation.z = PI; face.smile.rotation.x = -0.25;
  face.frown = mesh(torus(0.07 * R / 0.44, 0.019, PI), mouthM, 0, my - 0.04, mz - 0.01, head); face.frown.rotation.x = -0.25;
  face.open = new THREE.Group(); face.open.position.set(0, my, mz - 0.02); face.open.rotation.x = -0.3; head.add(face.open);
  mesh(sphere(0.085 * R / 0.44), mat('#4a1010'), 0, 0, 0, face.open).scale.set(1.15, 1, 0.45);
  mesh(sphere(0.05 * R / 0.44), mat('#ff6f7d'), 0, -0.035 * R / 0.44, 0.012, face.open).scale.set(1.2, 0.6, 0.5);
  mesh(sphere(0.06 * R / 0.44), mat('#ffffff'), 0, 0.045 * R / 0.44, 0.006, face.open).scale.set(1.4, 0.35, 0.45);
  return face;
}

function applyFace(face, s) {
  // s: {emotion, talk, blink, lookX, lookY}
  const em = s.emotion || 'happy';
  const talk = s.talk || 0;
  const openAmt = em === 'surprised' ? Math.max(0.6, talk) : (em === 'cheer' ? Math.max(0.75, talk) : talk);
  face.open.visible = openAmt > 0.06;
  face.open.scale.set(em === 'surprised' ? 0.75 : 1, 0.25 + openAmt * 0.95, 1);
  const sad = em === 'sad' || em === 'worried';
  face.smile.visible = !face.open.visible && !sad;
  face.frown.visible = !face.open.visible && sad;
  if (em === 'neutral') face.smile.scale.set(0.8, 0.5, 1); else face.smile.scale.set(1, 1, 1);
  for (const b of face.brows) {
    const side = b.userData.side;
    let rot = 0, dy = 0;
    if (sad) { rot = -side * 0.38; dy = 0.01; }
    if (em === 'surprised') { dy = 0.05; }
    if (em === 'cheer' || em === 'happy') { dy = 0.02; rot = side * 0.08; }
    b.rotation.z = rot; b.position.y = b.userData.y + dy;
  }
  const bl = s.blink ?? 1;
  const sq = em === 'cheer' ? 0.8 : 1;
  for (const e of face.eyes) e.scale.y = Math.max(0.08, bl * sq * (em === 'surprised' ? 1.12 : 1));
  for (const ir of face.irises) { ir.position.x = (s.lookX || 0) * 0.04; ir.position.y = (s.lookY || 0) * 0.03; }
}

// ---------------- HAIR & ACCESSORIES -----------------
function buildHair(head, R, o) {
  const hm = mat(o.hairColor ?? '#2b1d14', { rough: 0.7 });
  const st = o.hairStyle;
  const cap = (sx = 1.07, back = 0.13, up = 0.05) => { const h = mesh(sphere(R * sx), hm, 0, R * up, -R * back, head); return h; };
  if (st === 'spiky') {
    cap(1.06, 0.16, 0.06);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * PI * 2; const r = R * 0.55;
      const c = mesh(cone(R * 0.22, R * 0.55, 12), hm, Math.cos(a) * r * 0.9, R * 0.85, Math.sin(a) * r * 0.8 - R * 0.1, head);
      c.rotation.z = -Math.cos(a) * 0.7; c.rotation.x = Math.sin(a) * 0.7;
    }
    const f = mesh(cone(R * 0.25, R * 0.5, 12), hm, R * 0.1, R * 0.82, R * 0.55, head); f.rotation.x = 1.2; f.rotation.z = -0.3;
  } else if (st === 'bob' || st === 'ponytails' || st === 'bun' || st === 'long') {
    cap(1.08, 0.12, 0.06);
    const fr = mesh(sphere(R * 0.6), hm, -R * 0.25, R * 0.62, R * 0.55, head); fr.scale.set(1.3, 0.55, 0.6); fr.rotation.z = 0.35;
    const fr2 = mesh(sphere(R * 0.5), hm, R * 0.35, R * 0.68, R * 0.5, head); fr2.scale.set(1.2, 0.5, 0.6); fr2.rotation.z = -0.3;
    if (st === 'bob' || st === 'long') { for (const s of [-1, 1]) { const sd = mesh(sphere(R * 0.5), hm, s * R * 0.78, -R * (st === 'long' ? 0.35 : 0.15), -R * 0.15, head); sd.scale.set(0.6, st === 'long' ? 1.9 : 1.2, 1); } if (st === 'long') mesh(sphere(R * 0.8), hm, 0, -R * 0.55, -R * 0.55, head).scale.set(1.2, 1.4, 0.6); }
    if (st === 'ponytails') { for (const s of [-1, 1]) { const p = mesh(sphere(R * 0.38), hm, s * R * 1.12, R * 0.0, -R * 0.2, head); p.scale.set(0.8, 1.5, 0.8); p.rotation.z = s * 0.4; mesh(sphere(R * 0.12), mat(o.accent ?? '#ff4f8b'), s * R * 0.9, R * 0.35, -R * 0.15, head); } }
    if (st === 'bun') { mesh(sphere(R * 0.42), hm, 0, R * 1.05, -R * 0.25, head); }
  } else if (st === 'curly') {
    const r = rng(o.seed ?? 7);
    for (let i = 0; i < 34; i++) {
      const th = r() * PI * 2, ph = r() * 1.25; const rr = R * 1.02;
      const x = Math.sin(ph) * Math.cos(th) * rr, y = Math.cos(ph) * rr + R * 0.05, z = Math.sin(ph) * Math.sin(th) * rr - R * 0.12;
      if (z > R * 0.55 && y < R * 0.75) continue;
      mesh(sphere(R * (0.28 + r() * 0.12), 16, 12), hm, x, y, z, head);
    }
  } else if (st === 'short') {
    cap(1.05, 0.14, 0.08);
    const f = mesh(sphere(R * 0.55), hm, R * 0.1, R * 0.7, R * 0.45, head); f.scale.set(1.5, 0.45, 0.7); f.rotation.z = -0.2;
  } else if (st === 'hijab') {
    const hj = mat(o.hijab ?? '#9c6ade', { rough: 0.8 });
    const h = mesh(sphere(R * 1.12), hj, 0, R * 0.05, -R * 0.2, head);
    const d = mesh(sphere(R * 0.95), hj, 0, -R * 0.85, -R * 0.2, head); d.scale.set(1.25, 0.8, 1.05);
    const rim = mesh(torus(R * 0.78, R * 0.1), hj, 0, -R * 0.02, R * 0.52, head); rim.scale.set(0.95, 1.15, 1);
  } else if (st === 'bald') {
    for (const s of [-1, 1]) { const h = mesh(sphere(R * 0.35), hm, s * R * 0.82, R * 0.05, -R * 0.3, head); h.scale.set(0.6, 0.9, 1.2); }
  }
  // accessories on head
  const acc = o.acc || [];
  if (acc.includes('glasses')) {
    const gm = mat(o.glassColor ?? '#222222', { rough: 0.3 });
    for (const s of [-1, 1]) { const ring = mesh(torus(R * 0.24, 0.016), gm, s * R * 0.37, R * 0.09, R * 1.0, head); ring.rotation.y = s * 0.25; }
    const br = mesh(capsule(0.012, R * 0.15), gm, 0, R * 0.12, R * 1.03, head); br.rotation.z = PI / 2;
    for (const s of [-1, 1]) { const arm = mesh(capsule(0.012, R * 0.7), gm, s * R * 0.86, R * 0.1, R * 0.45, head); arm.rotation.x = PI / 2; }
  }
  if (acc.includes('headphones')) {
    const hp = mat(o.accent ?? '#ff5252', { rough: 0.35 });
    const band = mesh(torus(R * 1.08, 0.035, PI), hp, 0, R * 0.08, 0, head);
    for (const s of [-1, 1]) { const cup = mesh(cyl(R * 0.26, R * 0.26, R * 0.2), hp, s * R * 1.02, 0, 0, head); cup.rotation.z = PI / 2; }
  }
  if (acc.includes('cap')) {
    const cm = mat(o.accent ?? '#e53935');
    const c = mesh(sphere(R * 1.08, 32, 16), cm, 0, R * 0.15, -R * 0.05, head); c.scale.set(1, 0.75, 1);
    const v = mesh(cyl(R * 0.62, R * 0.62, 0.03), cm, 0, R * 0.5, R * 0.75, head); v.scale.set(1, 1, 0.75); v.rotation.x = 0.18;
  }
  if (acc.includes('beret')) {
    const b = mesh(sphere(R * 0.95), mat(o.accent ?? '#c2185b'), R * 0.2, R * 0.82, -R * 0.1, head); b.scale.set(1.15, 0.38, 1.1); b.rotation.z = -0.25;
    mesh(sphere(R * 0.1), mat(o.accent ?? '#c2185b'), R * 0.25, R * 1.15, -R * 0.1, head);
  }
  if (acc.includes('beard')) {
    const bm = mat(o.hairColor, { rough: 0.8 });
    const b = mesh(sphere(R * 0.62), bm, 0, -R * 0.62, R * 0.45, head); b.scale.set(1.25, 0.8, 0.7);
    for (const s of [-1, 1]) { const m = mesh(capsule(0.045, R * 0.22), bm, s * R * 0.16, -R * 0.24, R * 0.93, head); m.rotation.z = PI / 2 + s * 0.35; }
  }
  if (acc.includes('mustache')) {
    const bm = mat(o.hairColor, { rough: 0.8 });
    for (const s of [-1, 1]) { const m = mesh(capsule(0.04, R * 0.22), bm, s * R * 0.17, -R * 0.23, R * 0.94, head); m.rotation.z = PI / 2 + s * 0.4; }
  }
  if (acc.includes('grayhair')) {
    cap(1.06, 0.16, 0.05);
    mesh(sphere(R * 0.45), hm, 0, R * 0.95, -R * 0.45, head);
  }
}

export function makePhone(tex, scale = 1) {
  const g = new THREE.Group();
  mesh(rbox(0.17 * scale, 0.32 * scale, 0.025 * scale, 0.02 * scale), mat('#1d1d28', { rough: 0.3, metal: 0.4 }), 0, 0, 0, g);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.15 * scale, 0.29 * scale), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.z = 0.0135 * scale; g.add(scr); g.userData.screen = scr;
  return g;
}

// ---------------- CHARACTER -----------------
export function makeChar(o) {
  const root = new THREE.Group(); root.name = o.name;
  const body = new THREE.Group(); root.add(body);
  const skin = mat(o.skin, { rough: 0.5 });
  const shirt = mat(o.shirt, { rough: 0.7 });
  const pants = mat(o.pants ?? '#34495e', { rough: 0.75 });
  const shoes = mat(o.shoes ?? '#ffffff', { rough: 0.45 });
  const legs = [];
  for (const side of [-1, 1]) {
    const lp = new THREE.Group(); lp.position.set(side * 0.13, 0.42, 0); body.add(lp);
    mesh(capsule(0.095, 0.2), o.dress ? skin : pants, 0, -0.18, 0, lp);
    mesh(sphere(0.11), shoes, 0, -0.38, 0.05, lp).scale.set(1, 0.6, 1.45);
    legs.push(lp);
  }
  const torso = mesh(capsule(0.28, 0.26), shirt, 0, 0.72, 0, body); torso.scale.set(1, 1, 0.82);
  if (o.dress) { const sk = mesh(cone(0.42, 0.5, 28), shirt, 0, 0.55, 0, body); sk.scale.set(1, 1, 0.85); }
  else mesh(cyl(0.285, 0.29, 0.14), pants, 0, 0.5, 0, body).scale.set(1, 1, 0.82);
  if (o.collar) mesh(torus(0.17, 0.05), mat(o.collar), 0, 0.98, 0, body).rotation.x = PI / 2;
  if (o.hood) { const h = mesh(torus(0.2, 0.08), shirt, 0, 0.98, -0.08, body); h.rotation.x = PI / 2.3; }
  if (o.stripe) mesh(cyl(0.283, 0.283, 0.07), mat(o.stripe), 0, 0.78, 0, body).scale.set(1, 1, 0.83);
  if (o.backpack) { mesh(rbox(0.4, 0.46, 0.2, 0.08), mat(o.backpack), 0, 0.75, -0.3, body); mesh(rbox(0.3, 0.16, 0.08, 0.04), mat(o.backpack), 0, 0.62, -0.42, body); }
  if (o.scarf) { mesh(torus(0.2, 0.07), mat(o.scarf), 0, 0.98, 0, body).rotation.x = PI / 2; mesh(capsule(0.06, 0.18), mat(o.scarf), 0.1, 0.85, 0.22, body).rotation.z = 0.15; }
  if (o.apron) { const a = mesh(rbox(0.38, 0.5, 0.04, 0.03), mat(o.apron), 0, 0.62, 0.23, body); }
  if (o.badge) { const b = mesh(cyl(0.07, 0.07, 0.02, 6), mat('#ffb300', { emissive: '#ff9800', ei: 0.4, metal: 0.3, rough: 0.3 }), 0.12, 0.82, 0.24, body); b.rotation.x = PI / 2; }
  const arms = [];
  for (const side of [-1, 1]) {
    const ap = new THREE.Group(); ap.position.set(side * 0.31, 0.9, 0); body.add(ap);
    mesh(capsule(0.078, 0.25), o.shortSleeve ? skin : shirt, 0, -0.18, 0, ap);
    if (o.shortSleeve) mesh(capsule(0.088, 0.06), shirt, 0, -0.06, 0, ap);
    mesh(sphere(0.088), o.gloves ? mat(o.gloves) : skin, 0, -0.38, 0, ap);
    ap.userData.side = side; arms.push(ap);
  }
  const headG = new THREE.Group(); headG.position.y = 1.27; body.add(headG);
  const R = o.R ?? 0.44;
  mesh(sphere(R, 40, 32), skin, 0, 0, 0, headG);
  for (const s of [-1, 1]) mesh(sphere(0.085), skin, s * R * 0.98, -0.02, -0.02, headG).scale.set(0.5, 1, 0.8);
  const face = buildFace(headG, R, o);
  buildHair(headG, R, o);
  root.scale.setScalar(o.scale ?? 1);
  let phone = null;
  if (o.phoneTex) {
    phone = makePhone(o.phoneTex, 1.1); phone.position.set(0, 0.95, 0.42); phone.rotation.set(-0.5, PI, 0); body.add(phone); phone.visible = false;
    // flip so screen faces character (screen +z -> -z)
  }
  const c = { o, root, body, legs, arms, headG, face, phone, seed: o.seed ?? 1 };
  c.set = (s) => poseChar(c, s);
  poseChar(c, { t: 0 });
  return c;
}

export function poseChar(c, s) {
  const t = s.t ?? 0;
  const beat = 0.5;
  const dance = s.dance ?? 0;
  const bp = (t + (s.beatOff ?? 0)) / beat;
  const hop = Math.abs(Math.sin(PI * bp));
  let y = (s.jump ?? 0) + dance * hop * 0.12;
  c.body.position.y = y;
  const squash = 1 + 0.015 * Math.sin(t * 2.2 + c.seed) - dance * (1 - hop) * 0.06;
  c.body.scale.set(1 + (1 - squash) * 0.6, squash, 1 + (1 - squash) * 0.6);
  c.body.rotation.z = (s.sway ?? 0) * Math.sin(t * 2 * PI / (beat * 2));
  c.body.rotation.y = s.turn ?? 0;
  // head
  c.headG.rotation.x = (s.headX ?? 0) + 0.03 * Math.sin(t * 1.7 + c.seed);
  c.headG.rotation.y = (s.headY ?? 0) + 0.05 * Math.sin(t * 0.9 + c.seed * 2);
  c.headG.rotation.z = (s.headZ ?? 0) + dance * 0.08 * Math.sin(PI * bp);
  // blink
  const bt = (t + c.seed * 1.37) % 3.3;
  const blink = bt < 0.13 ? Math.abs(Math.cos(bt / 0.13 * PI)) : 1;
  applyFace(c.face, { emotion: s.emotion, talk: s.talk, blink, lookX: s.lookX, lookY: s.lookY });
  // arms
  const [aL, aR] = c.arms;
  const rest = 0.13 + 0.02 * Math.sin(t * 2.2 + c.seed);
  aL.rotation.set(0, 0, -rest); aR.rotation.set(0, 0, rest);
  const walk = s.walk ?? 0;
  if (walk) {
    const ph = t * 9;
    c.legs[0].rotation.x = Math.sin(ph) * 0.6 * walk; c.legs[1].rotation.x = -Math.sin(ph) * 0.6 * walk;
    aL.rotation.x = -Math.sin(ph) * 0.5 * walk; aR.rotation.x = Math.sin(ph) * 0.5 * walk;
    c.body.position.y += Math.abs(Math.cos(ph)) * 0.05 * walk;
  } else { c.legs[0].rotation.x = 0; c.legs[1].rotation.x = 0; }
  if (s.sit) { c.legs[0].rotation.x = -PI / 2; c.legs[1].rotation.x = -PI / 2; c.body.position.y += (s.sitH ?? 0) - 0.42 + 0.1; }
  if (s.phone) {
    aL.rotation.set(-1.05, 0, 0.42); aR.rotation.set(-1.05, 0, -0.42);
    if (s.tap) aR.rotation.x += -0.12 * Math.max(0, Math.sin(t * 14));
  }
  if (c.phone) c.phone.visible = !!s.phone;
  if (s.shake) { aL.rotation.x += 0.15 * Math.sin(t * 30); aR.rotation.x += 0.15 * Math.sin(t * 30); }
  if (s.wave) {
    const w = s.wave; aR.rotation.set(0, 0, lerp(rest, 2.55 + 0.35 * Math.sin(t * 11), w));
  }
  if (s.cheer) {
    const ch = s.cheer; const f = 0.25 * Math.sin(t * 9 + c.seed);
    aL.rotation.set(0, 0, lerp(-rest, -2.65 - f, ch)); aR.rotation.set(0, 0, lerp(rest, 2.65 + f, ch));
  }
  if (s.point) { aR.rotation.set(-1.4, 0, 0.3); }
  if (s.handsHips) { aL.rotation.set(0, 0, -0.75); aR.rotation.set(0, 0, 0.75); }
}

// ---------------- BEE MASCOT -----------------
export function makeBee(phoneTex) {
  const root = new THREE.Group(); root.name = 'bee';
  const body = new THREE.Group(); root.add(body);
  const yellow = mat('#ffc61a', { rough: 0.38 });
  const dark = mat('#3b2412', { rough: 0.5 });
  const stripeTex = canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = '#ffc61a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3b2412'; for (const y of [0.34, 0.56, 0.78]) g.fillRect(0, y * h, w, h * 0.1);
  });
  const bodyM = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.4 });
  const torso = mesh(sphere(0.42, 40, 32), bodyM, 0, 0.55, -0.02, body); torso.scale.set(1, 1.1, 0.95);
  const sting = mesh(cone(0.08, 0.2, 16), dark, 0, 0.12, -0.12, body); sting.rotation.x = PI + 0.5;
  // hex badge
  const badge = mesh(cyl(0.13, 0.13, 0.04, 6), mat('#fff3c4', { emissive: '#ffb300', ei: 0.35, rough: 0.25, metal: 0.2 }), 0, 0.72, 0.38, body); badge.rotation.x = PI / 2; badge.rotation.y = PI / 6;
  const badgeIn = mesh(cyl(0.085, 0.085, 0.05, 6), mat('#ff9f00', { emissive: '#ff8f00', ei: 0.6 }), 0, 0.72, 0.39, body); badgeIn.rotation.x = PI / 2; badgeIn.rotation.y = PI / 6;
  // scarf
  mesh(torus(0.26, 0.07), mat('#ff7a00', { rough: 0.7 }), 0, 0.98, 0, body).rotation.x = PI / 2;
  const tail = mesh(capsule(0.06, 0.2), mat('#ff7a00', { rough: 0.7 }), 0.2, 0.86, -0.2, body); tail.rotation.set(0.5, 0, 0.9);
  const headG = new THREE.Group(); headG.position.y = 1.32; body.add(headG);
  const R = 0.46;
  mesh(sphere(R, 48, 36), yellow, 0, 0, 0, headG);
  const face = buildFace(headG, R, { skin: '#ffc61a', noseColor: '#ffb000', eye: '#2b6cff', eyeR: 0.15, brow: '#3b2412', lashes: false });
  // antennae
  const ants = [];
  for (const s of [-1, 1]) {
    const ag = new THREE.Group(); ag.position.set(s * 0.17, R * 0.85, 0.05); headG.add(ag);
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.05, 0.3, 0.05), new THREE.Vector3(s * 0.22, 0.42, 0.12));
    mesh(new THREE.TubeGeometry(curve, 16, 0.022, 8), dark, 0, 0, 0, ag);
    mesh(sphere(0.075), mat('#ffb300', { emissive: '#ff9100', ei: 1.2 }), s * 0.22, 0.42, 0.12, ag);
    ants.push(ag);
  }
  // wings
  const wingM = new THREE.MeshPhysicalMaterial({ color: '#d6f4ff', transparent: true, opacity: 0.55, roughness: 0.1, transmission: 0, side: THREE.DoubleSide, emissive: '#a8e6ff', emissiveIntensity: 0.25 });
  const wings = [];
  for (const s of [-1, 1]) {
    const wp = new THREE.Group(); wp.position.set(s * 0.18, 0.85, -0.3); body.add(wp);
    const w1 = mesh(sphere(0.32), wingM, s * 0.32, 0.18, 0, wp); w1.scale.set(1, 0.55, 0.06); w1.rotation.z = s * 0.5; w1.castShadow = false;
    const w2 = mesh(sphere(0.22), wingM, s * 0.25, -0.12, -0.02, wp); w2.scale.set(1, 0.5, 0.06); w2.rotation.z = -s * 0.3; w2.castShadow = false;
    wp.userData.side = s; wings.push(wp);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    const ap = new THREE.Group(); ap.position.set(s * 0.36, 0.75, 0); body.add(ap);
    mesh(capsule(0.05, 0.2), dark, 0, -0.14, 0, ap);
    mesh(sphere(0.085), mat('#ffffff', { rough: 0.4 }), 0, -0.3, 0, ap);
    ap.userData.side = s; arms.push(ap);
  }
  const legs = [];
  for (const s of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(s * 0.15, 0.25, 0.05); body.add(lg); mesh(capsule(0.045, 0.12), dark, 0, -0.1, 0, lg); mesh(sphere(0.07), mat('#ffffff'), 0, -0.2, 0.03, lg).scale.set(1, 0.7, 1.3); legs.push(lg); }
  let phone = null;
  if (phoneTex) { phone = makePhone(phoneTex, 2.0); phone.position.set(0.42, 0.95, 0.35); phone.rotation.set(0, -0.25, 0); body.add(phone); phone.visible = false; }
  const b = { root, body, headG, face, wings, arms, legs, ants, phone, seed: 3 };
  b.set = (s) => {
    const t = s.t ?? 0;
    const flap = Math.sin(t * 2 * PI * 9.3);
    for (const w of wings) { w.rotation.y = w.userData.side * (0.25 + 0.55 * flap); w.rotation.z = w.userData.side * 0.15 * flap; }
    body.position.y = (s.hover ?? 1) * 0.08 * Math.sin(t * 3.1);
    body.rotation.z = (s.tilt ?? 0) + 0.04 * Math.sin(t * 1.9);
    body.rotation.x = s.lean ?? 0;
    body.rotation.y = s.turn ?? 0;
    const dance = s.dance ?? 0; const hop = Math.abs(Math.sin(PI * t / 0.5));
    body.position.y += dance * hop * 0.12;
    headG.rotation.set((s.headX ?? 0) + 0.04 * Math.sin(t * 2), (s.headY ?? 0), (s.headZ ?? 0) + 0.05 * Math.sin(t * 1.3));
    for (const a of ants) a.rotation.z = 0.12 * Math.sin(t * 5 + a.position.x * 9);
    const bt = (t + 0.7) % 2.9; const blink = bt < 0.13 ? Math.abs(Math.cos(bt / 0.13 * PI)) : 1;
    applyFace(face, { emotion: s.emotion ?? 'happy', talk: s.talk, blink, lookX: s.lookX, lookY: s.lookY });
    const [aL, aR] = arms;
    aL.rotation.set(0, 0, -0.5 - 0.1 * Math.sin(t * 3)); aR.rotation.set(0, 0, 0.5 + 0.1 * Math.sin(t * 3));
    if (s.wave) aR.rotation.set(0, 0, lerp(0.5, 2.5 + 0.4 * Math.sin(t * 12), s.wave));
    if (s.cheer) { aL.rotation.z = lerp(aL.rotation.z, -2.6, s.cheer); aR.rotation.z = lerp(aR.rotation.z, 2.6, s.cheer); }
    if (s.show) { aR.rotation.set(-1.2 * s.show, 0, lerp(0.5, 0.2, s.show)); }
    if (s.point) aL.rotation.set(-1.3, 0, -0.2);
    for (const l of legs) l.rotation.x = 0.3 * Math.sin(t * 3 + l.position.x * 10);
    if (phone) { phone.visible = (s.show ?? 0) > 0.05; phone.scale.setScalar(easeOutBack(s.show ?? 0)); }
  };
  b.set({ t: 0 });
  return b;
}

// ---------------- HONEYCOMB SHIELD -----------------
export function makeShield(radius = 2) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOp: { value: 1 }, uColor: { value: new THREE.Color('#ffb300') }, uCells: { value: 7.0 } },
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){ vP = position; vec4 wp = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform float uTime; uniform float uOp; uniform vec3 uColor; uniform float uCells; varying vec3 vP; varying vec3 vN; varying vec3 vV;
      float hexDist(vec2 p){ p=abs(p); return max(dot(p, normalize(vec2(1.,1.732))), p.x); }
      void main(){
        vec3 n = normalize(vP);
        vec2 uv = vec2(atan(n.z,n.x)*uCells*0.5, acos(clamp(n.y,-1.,1.))*uCells*0.55);
        vec2 r = vec2(1.,1.732); vec2 h = r*.5;
        vec2 a = mod(uv, r)-h; vec2 b = mod(uv-h, r)-h;
        vec2 gv = dot(a,a)<dot(b,b)?a:b;
        float d = hexDist(gv);
        float edge = smoothstep(0.42, 0.5, d);
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float sweep = smoothstep(0.25, 0.0, abs(fract(n.y*0.5 - uTime*0.6) - 0.5));
        vec2 id = uv - gv;
        float tw = 0.5 + 0.5*sin(uTime*3.0 + id.x*3.1 + id.y*1.7);
        float a2 = edge*(0.35 + 0.35*tw) + fres*0.3 + sweep*0.18 + 0.015;
        vec3 col = mix(uColor, vec3(1.0,0.95,0.7), edge*0.6 + sweep*0.4);
        gl_FragColor = vec4(col*a2*uOp, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 40, 0, PI * 2, 0, PI * 0.58), m);
  s.renderOrder = 10; s.userData.mat = m;
  return s;
}

export function makeSky(top, bottom, mid) {
  return canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); if (mid) gr.addColorStop(0.55, mid); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
}
