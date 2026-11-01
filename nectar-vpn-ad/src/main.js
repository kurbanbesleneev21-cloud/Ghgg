import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { PI, clamp, lerp, smooth, easeOutBack, easeOutElastic, easeInOut, rng, mat, mesh, sphere, capsule, rbox, cyl, cone, torus, canvasTex, roundRect, hexPath, makeChar, makeBee, makeShield, makeSky, makePhone } from './lib.js';

const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
const ov = document.getElementById('ov'); const og = ov.getContext('2d');

let ENV = [];
const talkAt = (t) => { const i = Math.floor(t * 30); return ENV[i] ?? 0; };
const HONEY = '#ffb300';

// ---------------- APP SCREEN -----------------
function drawApp(g, w, h, state, t) {
  // state: 'off' | 'connecting' | 'on' | 'error'
  const gr = g.createLinearGradient(0, 0, 0, h);
  if (state === 'error') { gr.addColorStop(0, '#30333d'); gr.addColorStop(1, '#1b1d24'); }
  else { gr.addColorStop(0, '#2a1a05'); gr.addColorStop(1, '#120c03'); }
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const s = w / 540;
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = `700 ${22 * s}px Rubik`; g.textAlign = 'left'; g.fillText('9:41', 30 * s, 44 * s);
  g.textAlign = 'right'; g.fillText(state === 'error' ? '✕ LTE' : '5G ▮▮▮', w - 30 * s, 44 * s);
  g.textAlign = 'center';
  if (state === 'error') {
    // browser with error
    g.fillStyle = '#ffffff'; roundRect(g, 30 * s, 80 * s, w - 60 * s, 60 * s, 30 * s); g.fill();
    g.fillStyle = '#888'; g.font = `500 ${22 * s}px Rubik`; g.fillText('www.мир-без-границ.ру', w / 2, 118 * s);
    // spinner
    const cx = w / 2, cy = 420 * s;
    g.lineWidth = 14 * s; g.strokeStyle = '#444955'; g.beginPath(); g.arc(cx, cy, 90 * s, 0, PI * 2); g.stroke();
    g.strokeStyle = '#ff5a5a'; g.beginPath(); g.arc(cx, cy, 90 * s, t * 3, t * 3 + 1.2); g.stroke();
    g.fillStyle = '#ff5a5a'; g.font = `900 ${110 * s}px Rubik`; g.fillText('!', cx, cy + 38 * s);
    g.fillStyle = '#ffffff'; g.font = `800 ${40 * s}px Rubik`; g.fillText('Нет соединения', w / 2, 600 * s);
    g.fillStyle = '#9aa0ad'; g.font = `500 ${26 * s}px Rubik`; g.fillText('Сайт недоступен', w / 2, 650 * s);
    g.fillText('Ошибка 403', w / 2, 690 * s);
    g.fillStyle = '#ff5a5a'; roundRect(g, 120 * s, 780 * s, w - 240 * s, 80 * s, 40 * s); g.fill();
    g.fillStyle = '#fff'; g.font = `800 ${30 * s}px Rubik`; g.fillText('Повторить', w / 2, 832 * s);
    return;
  }
  // logo
  const lx = w / 2, ly = 150 * s;
  g.fillStyle = HONEY; hexPath(g, lx - 120 * s, ly, 34 * s, PI / 6); g.fill();
  g.fillStyle = '#3b2412'; g.fillRect(lx - 138 * s, ly - 8 * s, 36 * s, 7 * s); g.fillRect(lx - 138 * s, ly + 5 * s, 36 * s, 7 * s);
  g.fillStyle = '#ffffff'; g.font = `900 ${44 * s}px Rubik`; g.textAlign = 'left'; g.fillText('Nectar', lx - 72 * s, ly + 15 * s);
  g.fillStyle = HONEY; g.fillText('VPN', lx + 80 * s, ly + 15 * s); g.textAlign = 'center';
  // big button
  const cx = w / 2, cy = 480 * s, R = 150 * s;
  const on = state === 'on';
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  for (let i = 3; i >= 1; i--) { g.fillStyle = on ? `rgba(255,179,0,${0.08 * i * (0.6 + 0.4 * pulse)})` : `rgba(255,255,255,${0.03 * i})`; g.beginPath(); g.arc(cx, cy, R + i * 28 * s, 0, PI * 2); g.fill(); }
  const bg = g.createRadialGradient(cx - 40 * s, cy - 50 * s, 10, cx, cy, R);
  if (on) { bg.addColorStop(0, '#ffe680'); bg.addColorStop(1, '#ff9800'); } else { bg.addColorStop(0, '#5a4a33'); bg.addColorStop(1, '#2e2414'); }
  g.fillStyle = bg; hexPath(g, cx, cy, R, PI / 6); g.fill();
  g.lineWidth = 6 * s; g.strokeStyle = on ? '#fff3c4' : '#8a7350'; g.stroke();
  // power icon
  g.strokeStyle = on ? '#3b2412' : '#d8c7a5'; g.lineWidth = 16 * s; g.lineCap = 'round';
  g.beginPath(); g.arc(cx, cy + 6 * s, 58 * s, -PI / 2 + 0.6, -PI / 2 - 0.6 + PI * 2); g.stroke();
  g.beginPath(); g.moveTo(cx, cy - 70 * s); g.lineTo(cx, cy - 10 * s); g.stroke();
  if (state === 'connecting') { g.strokeStyle = HONEY; g.lineWidth = 12 * s; g.beginPath(); g.arc(cx, cy, R + 24 * s, t * 8, t * 8 + 2.2); g.stroke(); }
  g.lineCap = 'butt';
  g.fillStyle = on ? HONEY : '#ffffff'; g.font = `900 ${46 * s}px Rubik`;
  g.fillText(on ? 'Подключено ✓' : state === 'connecting' ? 'Подключение…' : 'Не подключено', cx, 740 * s);
  g.fillStyle = on ? '#ffe9b0' : '#b9a98a'; g.font = `500 ${27 * s}px Rubik`;
  g.fillText(on ? 'Ваш трафик под защитой' : 'Нажмите, чтобы подключиться', cx, 786 * s);
  // server card
  g.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(g, 40 * s, 850 * s, w - 80 * s, 110 * s, 26 * s); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `700 ${28 * s}px Rubik`; g.fillText('Сервер: Авто', 70 * s, 896 * s);
  g.fillStyle = '#c9b88f'; g.font = `500 ${24 * s}px Rubik`; g.fillText(on ? 'Скорость: 940 Мбит/с · 12 мс' : 'Лучший сервер рядом', 70 * s, 934 * s);
  g.textAlign = 'center';
}

function makeAppTex(state, w = 540, h = 1044) { const tex = canvasTex(w, h, (g) => drawApp(g, w, h, state, 0)); tex.userData.state = state; return tex; }
function updateAppTex(tex, state, t) { const { g, canvas } = tex.userData; drawApp(g, canvas.width, canvas.height, state, t); tex.needsUpdate = true; }

// ---------------- CHARACTERS -----------------
const okTex = makeAppTex('on', 270, 522);
const heroTex = makeAppTex('error', 270, 522);
const C = {};
const defs = [
  { name: 'timur', skin: '#f2c29b', shirt: '#ff7a1a', hood: true, pants: '#2f4f8f', shoes: '#ffffff', hairStyle: 'spiky', hairColor: '#2b1d14', eye: '#6b3f1d', seed: 11 },
  { name: 'masha', skin: '#ffdcc8', shirt: '#8e5cf7', dress: true, shoes: '#ff4f8b', hairStyle: 'ponytails', hairColor: '#f0b03e', accent: '#ff4f8b', lashes: true, eye: '#3fa7ff', seed: 23, scale: 0.92 },
  { name: 'galya', skin: '#f5cfb0', shirt: '#43a047', collar: '#e8f5e9', pants: '#6d4c41', shoes: '#5d4037', hairStyle: 'bun', hairColor: '#dedede', acc: ['glasses'], glassColor: '#8e24aa', eye: '#5d7a99', seed: 31, scale: 0.94 },
  { name: 'oleg', skin: '#e8b48a', shirt: '#2e86de', collar: '#ffffff', pants: '#3d3d3d', shoes: '#212121', hairStyle: 'short', hairColor: '#4a3020', acc: ['beard'], eye: '#4e342e', seed: 41, scale: 1.06 },
  { name: 'anna', skin: '#f6c7a5', shirt: '#e74c3c', pants: '#263238', shoes: '#ffffff', hairStyle: 'long', hairColor: '#7b3f1d', lashes: true, eye: '#2e7d32', seed: 53 },
  { name: 'lyova', skin: '#f6cfae', shirt: '#fdd835', stripe: '#43a047', pants: '#1e88e5', shoes: '#e53935', hairStyle: 'short', hairColor: '#5d3a1a', acc: ['cap'], accent: '#1e88e5', eye: '#5d3a1a', seed: 61, scale: 0.72 },
  { name: 'amara', skin: '#8d5524', shirt: '#ffca28', pants: '#5d4037', shoes: '#ffffff', hairStyle: 'curly', hairColor: '#1b1b1b', backpack: '#e65100', scarf: '#00897b', lashes: true, eye: '#3e2723', seed: 71, noseColor: '#7a4820' },
  { name: 'kenji', skin: '#f1d3b0', shirt: '#00a8a8', pants: '#37474f', shoes: '#ffffff', hairStyle: 'short', hairColor: '#111111', acc: ['glasses', 'headphones'], accent: '#ff5252', eye: '#2b1d14', seed: 83 },
  { name: 'sophie', skin: '#ffe0cc', shirt: '#ff8fb1', pants: '#5c6bc0', shoes: '#ffffff', hairStyle: 'bob', hairColor: '#c1440e', acc: ['beret'], accent: '#c2185b', lashes: true, eye: '#43a047', seed: 97 },
  { name: 'carlos', skin: '#c68642', shirt: '#2ecc71', shortSleeve: true, pants: '#1a237e', shoes: '#ffeb3b', hairStyle: 'short', hairColor: '#1b1b1b', acc: ['mustache'], eye: '#3e2723', seed: 103, noseColor: '#b5763a' },
  { name: 'leyla', skin: '#e0ac69', shirt: '#ab47bc', pants: '#37474f', shoes: '#ffffff', hairStyle: 'hijab', hijab: '#7e57c2', lashes: true, eye: '#5d4037', seed: 113 },
];
for (const d of defs) { C[d.name] = makeChar({ ...d, phoneTex: d.name === 'timur' ? heroTex : okTex }); }
const beeAppTex = makeAppTex('off');
const bee = makeBee(beeAppTex);

// ---------------- COMMON -----------------
function newScene(bgTop, bgBot, fog) {
  const s = new THREE.Scene(); s.environment = envTex;
  s.background = makeSky(bgTop, bgBot);
  if (fog) s.fog = new THREE.Fog(fog[0], fog[1], fog[2]);
  return s;
}
function addLights(s, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky ?? '#cfe8ff', o.ground ?? '#ffe2b8', o.hemi ?? 1.1); s.add(hemi);
  const sun = new THREE.DirectionalLight(o.sun ?? '#fff1d6', o.si ?? 2.6);
  sun.position.set(...(o.pos ?? [6, 12, 8])); sun.castShadow = true;
  const b = o.sb ?? 12; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -b, right: b, top: b, bottom: -b, near: 0.5, far: 80 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  if (o.target) sun.target.position.set(...o.target);
  s.add(sun); s.add(sun.target);
  const rim = new THREE.DirectionalLight(o.rim ?? '#ffd27a', o.ri ?? 1.2); rim.position.set(-6, 5, -8); s.add(rim);
  s.environmentIntensity = 0.6;
  return { hemi, sun, rim };
}
const cam = (fov = 40) => new THREE.PerspectiveCamera(fov, W / H, 0.1, 600);
function place(c, x, y, z, ry = 0) { c.root.position.set(x, y, z); c.root.rotation.set(0, ry, 0); }
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// sprite icon textures
function iconTex(kind) {
  return canvasTex(256, 256, (g, w, h) => {
    g.translate(128, 128);
    g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 12; g.shadowOffsetY = 6;
    const bubble = (col) => { g.fillStyle = col; g.beginPath(); g.arc(0, 0, 100, 0, PI * 2); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 10; g.strokeStyle = '#fff'; g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'x') { bubble('#ff4d4d'); g.strokeStyle = '#fff'; g.lineWidth = 26; g.beginPath(); g.moveTo(-40, -40); g.lineTo(40, 40); g.moveTo(40, -40); g.lineTo(-40, 40); g.stroke(); }
    if (kind === 'lock') { bubble('#6b5bd6'); g.fillStyle = '#fff'; roundRect(g, -45, -10, 90, 70, 14); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); g.arc(0, -15, 30, PI, 0); g.stroke(); g.fillStyle = '#6b5bd6'; g.beginPath(); g.arc(0, 22, 11, 0, PI * 2); g.fill(); }
    if (kind === 'wifi') { bubble('#ff9f1a'); g.strokeStyle = '#fff'; g.lineWidth = 14; for (const r of [70, 48, 26]) { g.beginPath(); g.arc(0, 40, r, -PI * 0.75, -PI * 0.25); g.stroke(); } g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 40, 9, 0, PI * 2); g.fill(); g.strokeStyle = '#d32f2f'; g.lineWidth = 16; g.beginPath(); g.moveTo(-60, -50); g.lineTo(60, 60); g.stroke(); }
    if (kind === 'eye') { bubble('#e53950'); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, 62, 36, 0, 0, PI * 2); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, 22, 0, PI * 2); g.fill(); }
    if (kind === 'slow') { bubble('#4a90e2'); g.strokeStyle = '#fff'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 55, 0, PI * 2); g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -38); g.moveTo(0, 0); g.lineTo(28, 14); g.stroke(); }
    if (kind === 'hex') { g.shadowColor = 'transparent'; const gr = g.createRadialGradient(0, 0, 0, 0, 0, 120); gr.addColorStop(0, 'rgba(255,240,170,1)'); gr.addColorStop(0.5, 'rgba(255,179,0,0.9)'); gr.addColorStop(1, 'rgba(255,140,0,0)'); g.fillStyle = gr; hexPath(g, 0, 0, 110, PI / 6); g.fill(); }
    if (kind === 'spark') { g.shadowColor = 'transparent'; const gr = g.createRadialGradient(0, 0, 0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,230,140,0.9)'); gr.addColorStop(1, 'rgba(255,170,0,0)'); g.fillStyle = gr; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4; const r = i % 2 ? 40 : 128; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
    if (kind === 'puff') { g.shadowColor = 'transparent'; const gr = g.createRadialGradient(0, 0, 0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 128, 0, PI * 2); g.fill(); }
    if (kind === 'heart') { bubble('#ff4f8b'); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 45); g.bezierCurveTo(-90, -10, -40, -75, 0, -30); g.bezierCurveTo(40, -75, 90, -10, 0, 45); g.fill(); }
    if (kind === 'like') { bubble('#2196f3'); g.fillStyle = '#fff'; g.font = '900 120px Rubik'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('♪', 0, 6); }
    if (kind === 'chat') { bubble('#2ecc71'); g.fillStyle = '#fff'; roundRect(g, -55, -40, 110, 70, 18); g.fill(); g.beginPath(); g.moveTo(-25, 25); g.lineTo(-40, 55); g.lineTo(5, 28); g.fill(); g.fillStyle = '#2ecc71'; for (const x of [-25, 0, 25]) { g.beginPath(); g.arc(x, -5, 8, 0, PI * 2); g.fill(); } }
  });
}
const ICON = {}; for (const k of ['x', 'lock', 'wifi', 'eye', 'slow', 'hex', 'spark', 'puff', 'heart', 'like', 'chat']) ICON[k] = iconTex(k);
function sprite(tex, size, additive = false) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })); s.scale.setScalar(size); return s; }

// particle pool of sprites
function spritePool(scene, tex, n, additive = true) { const arr = []; for (let i = 0; i < n; i++) { const s = sprite(tex, 0.2, additive); s.visible = false; scene.add(s); arr.push(s); } return arr; }

// floating emoji-icons above heads (reactions)
function reactionIcons(scene, n, kinds) { const arr = []; for (let i = 0; i < n; i++) { const s = sprite(ICON[kinds[i % kinds.length]], 0.4); s.visible = false; scene.add(s); arr.push(s); } return arr; }
function updateReactions(arr, anchors, lt, period = 1.6) {
  arr.forEach((s, i) => {
    const a = anchors[i % anchors.length]; const off = i * 0.53;
    const p = ((lt + off) % period) / period;
    s.visible = lt > 0.2;
    s.position.set(a.x + Math.sin(i * 3 + lt * 2) * 0.25, a.y + p * 1.2, a.z);
    const sc = 0.42 * easeOutBack(clamp(p * 4)) * (1 - smooth(0.75, 1, p));
    s.scale.setScalar(Math.max(0.001, sc));
  });
}

// ================= SCENE: CITY ==================
function buildCity() {
  const s = new THREE.Scene(); s.environment = envTex;
  // sky dome with mix
  const skyMat = new THREE.ShaderMaterial({
    uniforms: { mixv: { value: 0 } }, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float mixv; varying vec3 vW; void main(){ float h = clamp(vW.y*1.6+0.15,0.,1.);
      vec3 a = mix(vec3(0.70,0.74,0.80), vec3(0.42,0.48,0.60), h);
      vec3 b = mix(vec3(0.85,0.95,1.0), vec3(0.20,0.58,1.0), h);
      gl_FragColor = vec4(mix(a,b,mixv),1.); }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat); s.add(sky);
  s.fog = new THREE.Fog('#b9c3d1', 45, 150);
  const L = addLights(s, { pos: [14, 22, 12], sb: 18, si: 2.2 });
  // ground
  const ground = mesh(new THREE.PlaneGeometry(500, 500), mat('#8fd16a', { rough: 0.95 }), 0, 0, 0, s); ground.rotation.x = -PI / 2; ground.castShadow = false;
  const strip = (x, z, w, d, col, y = 0.01) => { const m = mesh(new THREE.PlaneGeometry(w, d), mat(col, { rough: 0.9 }), x, y, z, s); m.rotation.x = -PI / 2; m.castShadow = false; return m; };
  // main street along x
  const rowsZ = [0, -34];
  for (const z0 of rowsZ) {
    strip(0, z0 + 1.2, 200, 3.2, '#efe6d6', 0.02); // near sidewalk (hero side)
    strip(0, z0 - 4, 200, 7, '#4a4e5a', 0.015);
    strip(0, z0 - 9.2, 200, 3.4, '#efe6d6', 0.02);
    for (let x = -100; x < 100; x += 4) strip(x, z0 - 4, 2, 0.22, '#ffd54a', 0.025);
  }
  for (const x0 of [-22, 22]) { strip(x0, 0, 7, 200, '#4a4e5a', 0.012); for (let z = -100; z < 100; z += 4) strip(x0, z, 0.22, 2, '#ffd54a', 0.022); }
  // crosswalk
  for (let i = 0; i < 6; i++) strip(-6 + i * 0.9, -4, 0.5, 6, '#ffffff', 0.03);
  // buildings
  const r = rng(5);
  const pastel = ['#ff8fa3', '#ffd166', '#6ec6ff', '#b39ddb', '#80cbc4', '#ffab76', '#a5d6a7', '#f48fb1', '#90caf9', '#ffe082', '#ce93d8', '#ff8a65'];
  const winGeo = new THREE.BoxGeometry(0.55, 0.75, 0.08);
  const winMat = new THREE.MeshStandardMaterial({ color: '#cfefff', emissive: '#ffe9a8', emissiveIntensity: 0.25, roughness: 0.15, metalness: 0.1 });
  const winInst = new THREE.InstancedMesh(winGeo, winMat, 12000); let wi = 0; const dm = new THREE.Object3D();
  const addB = (x, z, w, d, h, col, facing) => {
    const b = mesh(rbox(w, h, d, 0.25), mat(col, { rough: 0.6 }), x, h / 2, z, s);
    // roof
    const k = r();
    if (k < 0.3) { const c = mesh(cone(Math.max(w, d) * 0.62, 1.6, 4), mat(['#e74c3c', '#8e44ad', '#16a085', '#d35400'][Math.floor(r() * 4)]), x, h + 0.8, z, s); c.rotation.y = PI / 4; c.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); }
    else if (k < 0.5) { mesh(cyl(0.45, 0.45, 1, 16), mat('#a1887f'), x + w * 0.2, h + 0.5, z, s); mesh(cone(0.55, 0.5, 16), mat('#795548'), x + w * 0.2, h + 1.25, z, s); }
    else if (k < 0.65) { mesh(cyl(0.04, 0.04, 2.2, 6), mat('#9e9e9e', { metal: 0.6 }), x, h + 1.1, z, s); mesh(sphere(0.14), mat('#ff5252', { emissive: '#ff1744', ei: 1 }), x, h + 2.25, z, s); }
    // door on facing side
    const fz = z + facing * (d / 2 + 0.01);
    mesh(rbox(1.0, 1.7, 0.12, 0.08), mat('#6d4c41'), x, 0.85, fz, s);
    mesh(rbox(1.3, 0.1, 0.5, 0.04), mat('#ffffff'), x, 1.9, fz + facing * 0.25, s);
    const cols = Math.max(1, Math.floor((w - 0.6) / 1.0)), rowsN = Math.floor((h - 2.4) / 1.25);
    for (let fi = 0; fi < 2; fi++) {
      const sideZ = fi ? -facing : facing;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rowsN; j++) {
        if (wi >= 12000) break;
        const wx = x - (cols - 1) * 0.5 + i * 1.0; const wy = 2.6 + j * 1.25;
        if (fi === 0 && Math.abs(wx - x) < 0.7 && wy < 2.8) continue;
        dm.position.set(wx, wy, z + sideZ * (d / 2 + 0.02)); dm.rotation.set(0, 0, 0); dm.updateMatrix(); winInst.setMatrixAt(wi++, dm.matrix);
      }
    }
    // awning shop for low ones
    if (h < 7 && r() < 0.6) { const aw = mesh(rbox(w * 0.85, 0.12, 1.0, 0.05), mat(['#ef5350', '#26a69a', '#ffca28', '#5c6bc0'][Math.floor(r() * 4)]), x, 2.4, fz + facing * 0.5, s); aw.rotation.x = facing * 0.25; }
  };
  for (const z0 of rowsZ) {
    for (const [zb, facing] of [[z0 - 14.5, 1], [z0 + 6.8, -1]]) {
      let x = -60;
      while (x < 60) {
        const w = 3.6 + r() * 2.6; const h = 4 + r() * (Math.abs(x) < 12 && zb > z0 ? 4 : 13); const d = 4 + r() * 2.5;
        if (Math.abs(x + w / 2 - 22) < 5 || Math.abs(x + w / 2 + 22) < 5 || (zb > z0 && Math.abs(x + w / 2) < 10)) { x += w + 0.4; continue; }
        addB(x + w / 2, zb + (facing > 0 ? -d / 2 + 2 : d / 2 - 2), w, d, h, pastel[Math.floor(r() * pastel.length)], facing);
        x += w + 0.35;
      }
    }
  }
  winInst.count = wi; winInst.instanceMatrix.needsUpdate = true; s.add(winInst);
  // trees instanced
  const treeTr = new THREE.InstancedMesh(cyl(0.12, 0.16, 1.2, 8), mat('#8d6e63'), 400);
  const treeCr = new THREE.InstancedMesh(sphere(0.8, 16, 12), mat('#4caf50', { rough: 0.8 }), 400);
  let ti = 0;
  for (const z0 of rowsZ) for (const zz of [z0 + 2.4, z0 - 10.4]) for (let x = -60; x < 60; x += 5.5) {
    if (Math.abs(x) < 3 && zz === 2.4) continue;
    const jx = x + (r() - 0.5);
    dm.position.set(jx, 0.6, zz); dm.scale.set(1, 1, 1); dm.updateMatrix(); treeTr.setMatrixAt(ti, dm.matrix);
    const sc = 0.8 + r() * 0.5; dm.position.set(jx, 1.5 + sc * 0.5, zz); dm.scale.set(sc, sc * 1.1, sc); dm.updateMatrix(); treeCr.setMatrixAt(ti, dm.matrix);
    treeCr.setColorAt(ti, new THREE.Color(['#4caf50', '#66bb6a', '#7cb342', '#43a047'][Math.floor(r() * 4)]));
    ti++;
  }
  treeTr.count = treeCr.count = ti; treeTr.castShadow = treeCr.castShadow = true; treeCr.receiveShadow = true; s.add(treeTr, treeCr);
  // lamps
  for (let x = -30; x <= 30; x += 10) { mesh(cyl(0.06, 0.08, 3.2, 8), mat('#37474f', { metal: 0.5 }), x + 2.7, 1.6, 2.6, s); mesh(sphere(0.2), mat('#fff8e1', { emissive: '#ffe082', ei: 0.8 }), x + 2.7, 3.25, 2.6, s); }
  // bench behind hero
  const bench = new THREE.Group(); bench.position.set(-1.7, 0, 1.6); s.add(bench);
  mesh(rbox(1.8, 0.1, 0.5, 0.04), mat('#d84315'), 0, 0.5, 0, bench); mesh(rbox(1.8, 0.4, 0.08, 0.04), mat('#d84315'), 0, 0.8, -0.24, bench);
  for (const x of [-0.75, 0.75]) mesh(rbox(0.08, 0.5, 0.45, 0.02), mat('#37474f'), x, 0.25, 0, bench);
  // crowd instanced citizens
  const N = 260;
  const cBody = new THREE.InstancedMesh(capsule(0.22, 0.32), mat('#ffffff', { rough: 0.7 }), N);
  const cHead = new THREE.InstancedMesh(sphere(0.3, 20, 16), mat('#ffffff', { rough: 0.5 }), N);
  const cHair = new THREE.InstancedMesh(sphere(0.31, 16, 12, ), mat('#ffffff', { rough: 0.8 }), N);
  const cEye = new THREE.InstancedMesh(sphere(0.075, 12, 10), mat('#ffffff', { rough: 0.2 }), N * 2);
  const cPup = new THREE.InstancedMesh(sphere(0.045, 10, 8), mat('#151515'), N * 2);
  const cPhone = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.2, 0.02), new THREE.MeshStandardMaterial({ color: '#222', emissive: '#7fd3ff', emissiveIntensity: 0.6 }), N);
  [cBody, cHead, cHair, cEye, cPup, cPhone].forEach((m) => { m.castShadow = true; m.receiveShadow = true; s.add(m); });
  const skins = ['#f2c29b', '#8d5524', '#c68642', '#e0ac69', '#ffdbac', '#f1c27d', '#5c3a1e'];
  const cits = [];
  for (let i = 0; i < N; i++) {
    const z0 = rowsZ[i % 3];
    const lane = r() < 0.5 ? z0 + 1.0 + r() * 1.2 : z0 - 9.0 - r() * 1.4;
    const dir = r() < 0.15 ? 0 : (r() < 0.5 ? 1 : -1);
    let x0 = -60 + r() * 120;
    if (z0 === 0 && lane > -1 && Math.abs(x0) < 3.5) x0 += 7 * Math.sign(x0 || 1);
    cits.push({ x0, z: lane, dir, sp: 1.0 + r() * 0.8, sc: 0.85 + r() * 0.35, ph: r() * 10 });
    cBody.setColorAt(i, new THREE.Color(pastel[Math.floor(r() * pastel.length)]).offsetHSL(0, 0.1, -0.08));
    cHead.setColorAt(i, new THREE.Color(skins[Math.floor(r() * skins.length)]));
    cHair.setColorAt(i, new THREE.Color(['#2b1d14', '#5d3a1a', '#f0b03e', '#111', '#c1440e', '#dedede', '#7b3f1d'][Math.floor(r() * 7)]));
  }
  const updCrowd = (t) => {
    const q = new THREE.Object3D();
    cits.forEach((c, i) => {
      let x = c.x0 + c.dir * c.sp * t; x = ((x + 60) % 120 + 120) % 120 - 60;
      if (c.z > -1 && c.z < 3 && Math.abs(x) < 2.8) x = 2.8 * Math.sign(x || 1) + (x - 2.8 * Math.sign(x || 1)) * 0; // keep hero spot free
      const bob = c.dir ? Math.abs(Math.sin(t * 8 + c.ph)) * 0.06 : 0.02 * Math.sin(t * 2 + c.ph);
      const ry = c.dir === 0 ? 0.0 + Math.sin(c.ph) * 0.6 : (c.dir > 0 ? PI / 2 : -PI / 2);
      q.rotation.set(0, ry, 0); q.scale.setScalar(c.sc);
      q.position.set(x, (0.5 + bob) * c.sc, c.z); q.updateMatrix(); cBody.setMatrixAt(i, q.matrix);
      q.position.set(x, (1.05 + bob) * c.sc, c.z); q.updateMatrix(); cHead.setMatrixAt(i, q.matrix);
      const back = new THREE.Vector3(0, 0.08, -0.05).applyEuler(q.rotation).multiplyScalar(c.sc);
      q.position.set(x + back.x, (1.05 + bob) * c.sc + back.y, c.z + back.z); q.updateMatrix(); cHair.setMatrixAt(i, q.matrix);
      for (const sd of [-1, 1]) {
        const e = new THREE.Vector3(sd * 0.11, 0.04, 0.25).applyEuler(q.rotation).multiplyScalar(c.sc);
        q.position.set(x + e.x, (1.05 + bob) * c.sc + e.y, c.z + e.z); q.updateMatrix(); cEye.setMatrixAt(i * 2 + (sd > 0 ? 1 : 0), q.matrix);
        const p = new THREE.Vector3(sd * 0.11, 0.04, 0.31).applyEuler(q.rotation).multiplyScalar(c.sc);
        q.position.set(x + p.x, (1.05 + bob) * c.sc + p.y, c.z + p.z); q.updateMatrix(); cPup.setMatrixAt(i * 2 + (sd > 0 ? 1 : 0), q.matrix);
      }
      const ph = new THREE.Vector3(0.05, 0.0, 0.3).applyEuler(q.rotation).multiplyScalar(c.sc);
      q.rotation.x = -0.4; q.position.set(x + ph.x, (0.75 + bob) * c.sc, c.z + ph.z); q.updateMatrix(); cPhone.setMatrixAt(i, q.matrix);
    });
    [cBody, cHead, cHair, cEye, cPup, cPhone].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  };
  // cars
  const cars = [];
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group(); const col = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00'][i % 6];
    mesh(rbox(2.2, 0.7, 1.1, 0.25), mat(col, { rough: 0.3, metal: 0.2 }), 0, 0.55, 0, g);
    mesh(rbox(1.2, 0.55, 1.0, 0.22), mat('#bfe9ff', { rough: 0.1, metal: 0.3 }), -0.1, 1.1, 0, g);
    for (const wx of [-0.7, 0.7]) for (const wz of [-0.55, 0.55]) { const w = mesh(cyl(0.25, 0.25, 0.2, 16), mat('#222'), wx, 0.25, wz, g); w.rotation.x = PI / 2; }
    for (const wz of [-0.35, 0.35]) mesh(sphere(0.09), mat('#fff8e1', { emissive: '#fff59d', ei: 1 }), 1.1, 0.6, wz, g);
    s.add(g); cars.push({ g, lane: i % 2 ? -2.3 : -5.7, dir: i % 2 ? 1 : -1, x0: -50 + i * 11, sp: 6 + (i % 3) * 1.5, z0: rowsZ[i % 3] });
  }
  const updCars = (t) => { for (const c of cars) { let x = c.x0 + c.dir * c.sp * t; x = ((x + 60) % 120 + 120) % 120 - 60; c.g.position.set(x, 0, c.z0 + c.lane); c.g.rotation.y = c.dir > 0 ? 0 : PI; c.g.position.y = 0.02 * Math.sin(t * 20 + c.x0); } };
  // clouds
  const clouds = [];
  for (let i = 0; i < 14; i++) { const g = new THREE.Group(); for (let k = 0; k < 5; k++) mesh(sphere(1.5 + r() * 1.4, 20, 14), mat('#ffffff', { rough: 1 }), k * 1.6 - 3, r() * 0.8, r() * 1.2, g).castShadow = false; g.position.set(-80 + r() * 160, 26 + r() * 10, -70 + r() * 60); s.add(g); clouds.push(g); }
  // hero setup
  const hero = C.timur;
  // storm cloud
  const storm = new THREE.Group(); s.add(storm);
  for (let k = 0; k < 6; k++) mesh(sphere(0.35 + (k % 3) * 0.1, 20, 14), mat('#7d8696', { rough: 1 }), (k - 2.5) * 0.28, (k % 2) * 0.12, (k % 3) * 0.08 - 0.08, storm);
  const rainGeo = cyl(0.012, 0.012, 0.22, 4); const rainMat = new THREE.MeshBasicMaterial({ color: '#9fd2ff', transparent: true, opacity: 0.8 });
  const rain = new THREE.InstancedMesh(rainGeo, rainMat, 40); storm.add(rain);
  // problem icons
  const icons = ['x', 'lock', 'wifi', 'slow', 'eye'].map((k) => { const sp = sprite(ICON[k], 0.5); s.add(sp); return sp; });
  // bee + trail
  s.add(bee.root);
  const trail = spritePool(s, ICON.hex, 34);
  const puffs = spritePool(s, ICON.puff, 14, false);
  const sparks = spritePool(s, ICON.spark, 26);
  // shield
  const shield = makeShield(1.55); s.add(shield);
  const ring = mesh(new THREE.RingGeometry(0.9, 1.0, 64), new THREE.MeshBasicMaterial({ color: HONEY, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.04, 0, s); ring.rotation.x = -PI / 2; ring.castShadow = false;
  // camera
  const camera = cam(40);
  const beePath = (u) => { // u 0..1
    const p0 = v3(9, 7, -4), p1 = v3(5, 1, 6), p2 = v3(-2, 3.5, 2.5), p3 = v3(1.15, 1.25, 0.5);
    const a = 1 - u; return p0.clone().multiplyScalar(a * a * a).add(p1.clone().multiplyScalar(3 * a * a * u)).add(p2.clone().multiplyScalar(3 * a * u * u)).add(p3.clone().multiplyScalar(u * u * u));
  };
  return {
    scene: s, camera,
    enter() { s.add(hero.root); s.add(bee.root); place(hero, 0, 0, 0, 0); hero.root.scale.setScalar(1); },
    update(t) {
      updCrowd(t); updCars(t);
      clouds.forEach((c, i) => (c.position.x = -80 + ((i * 23 + t * 1.2) % 160)));
      const bright = smooth(12.0, 13.2, t);
      skyMat.uniforms.mixv.value = bright;
      s.fog.color.set('#b9c3d1').lerp(new THREE.Color('#cfefff'), bright);
      L.sun.intensity = lerp(1.3, 2.8, bright); L.hemi.intensity = lerp(0.8, 1.2, bright);
      L.sun.color.set('#d9e2ff').lerp(new THREE.Color('#fff1d6'), bright);
      // hero acting
      const shieldPhase = t >= 22;
      let st = { t, phone: true, emotion: 'neutral', tap: t > 2 && t < 7, lookY: -0.6, headX: 0.25 };
      if (t > 5.0) st.emotion = 'worried';
      if (t > 7.4 && t < 8.6) { st.shake = true; st.emotion = 'sad'; }
      if (t > 9.4 && t < 11.2) { st.headX = -0.05; st.lookY = 0.2; st.emotion = 'sad'; }
      if (t >= 11.2 && t < 12.6) { st = { t, phone: true, emotion: 'surprised', headY: 0.55, headX: -0.1, lookX: 0.8 }; }
      if (t >= 12.6 && t < 22) { st = { t, phone: t < 14.2, emotion: 'happy', headY: 0.5, lookX: 0.7, headX: -0.05, talk: 0 }; if (t > 14.2) st.handsHips = true; }
      if (shieldPhase) { const lt = t - 22; st = { t, emotion: 'cheer', cheer: smooth(0.1, 0.3, lt), jump: Math.max(0, Math.sin(clamp((lt - 0.3) / 0.55) * PI)) * 0.55 + Math.max(0, Math.sin(clamp((lt - 0.9) / 0.5) * PI)) * 0.35, headX: -0.15 }; }
      hero.set(st);
      if (t < 12.6 || shieldPhase) hero.root.rotation.y = shieldPhase ? 0 : smooth(11.2, 12, t) * 0.35;
      // storm
      const stormVis = smooth(4.8, 5.8, t) * (1 - smooth(12.1, 12.5, t));
      storm.visible = stormVis > 0.01; storm.position.set(0.05, 2.65 + 0.05 * Math.sin(t * 2), 0); storm.scale.setScalar(Math.max(0.001, stormVis) * (1 + 0.04 * Math.sin(t * 5)));
      const q = new THREE.Object3D();
      for (let i = 0; i < 40; i++) { const ph = ((t * 2.2 + i * 0.137) % 1); q.position.set(((i * 37) % 13) / 13 * 1.4 - 0.7, -0.2 - ph * 1.2, ((i * 17) % 7) / 7 * 0.4 - 0.2); q.updateMatrix(); rain.setMatrixAt(i, q.matrix); }
      rain.instanceMatrix.needsUpdate = true;
      // icons
      icons.forEach((ic, i) => {
        const tin = 5.3 + i * 0.55; const tout = 12.1;
        const sc = easeOutBack(clamp((t - tin) / 0.35)) * (1 - smooth(tout, tout + 0.25, t));
        ic.visible = sc > 0.01; ic.scale.setScalar(Math.max(0.001, sc * 0.5));
        const a = -0.9 + i * 0.45;
        const out = smooth(tout, tout + 0.3, t) * 1.5;
        ic.position.set(Math.sin(a) * (1.05 + out), 1.65 + Math.cos(a) * 0.55 + 0.06 * Math.sin(t * 3 + i) + i * 0.0, 0.25);
      });
      // bee
      bee.root.visible = t > 10.9;
      const bu = clamp((t - 11.0) / 1.1);
      if (t < 22) {
        const bp = beePath(easeInOut(bu));
        bee.root.position.copy(bp);
        const ahead = beePath(easeInOut(clamp(bu + 0.02)));
        bee.root.rotation.set(0, bu < 1 ? Math.atan2(ahead.x - bp.x, ahead.z - bp.z) * 0.5 : -0.35, 0);
        bee.root.scale.setScalar(0.85);
        const talkv = talkAt(t);
        bee.set({ t, talk: t > 12.5 ? talkv : 0, wave: smooth(12.5, 12.8, t) * (1 - smooth(13.7, 14.0, t)), show: smooth(14.4, 15.0, t), emotion: t < 12.4 ? 'cheer' : 'happy', point: t > 12.05 && t < 12.4, tilt: bu < 1 ? 0.25 : 0, headY: t > 14.6 ? 0.25 : 0.3 });
        if (t > 14.6) updateAppTex(beeAppTex, 'off', t);
      } else {
        bee.root.position.set(1.4, 1.3 + 0.1 * Math.sin(t * 3), 0.6); bee.root.rotation.set(0, -0.4, 0); bee.root.scale.setScalar(0.85);
        bee.set({ t, emotion: 'cheer', cheer: 1, show: 0 });
      }
      // trail
      trail.forEach((sp, i) => {
        const back = i * 0.012; const u = clamp(bu - back);
        const vis = t > 11.0 && t < 12.6 && bu - back > 0 && i * 0.012 < 0.4;
        sp.visible = vis && (bu < 1 || t - 12.1 < i * 0.02);
        if (sp.visible) { const p = beePath(easeInOut(u)); sp.position.copy(p).add(v3(Math.sin(i * 7) * 0.1, 0.5 + Math.cos(i * 5) * 0.1, -0.2)); const sc = 0.35 * (1 - i / trail.length); sp.scale.setScalar(sc); sp.material.rotation = t * 3 + i; }
      });
      // zap & puff at 12.1
      puffs.forEach((p, i) => { const lt = t - 12.1; const a = i / puffs.length * PI * 2; p.visible = lt > 0 && lt < 0.8; if (p.visible) { const d = easeOutBack(clamp(lt / 0.5)) * 0.9; p.position.set(Math.cos(a) * d, 2.65 + Math.sin(a) * d * 0.6, 0.1); p.scale.setScalar(0.6 * (1 - lt / 0.8) + 0.05); p.material.opacity = 1 - lt / 0.8; } });
      // sparkles at bee arrival and shield
      sparks.forEach((p, i) => {
        let lt = t - 11.0, base = v3(9, 7, -4);
        const r2 = rng(i * 97 + 1);
        if (t > 21.9) { lt = t - 22.05; base = v3(0, 1.0, 0); }
        p.visible = lt > 0 && lt < 1.3;
        if (p.visible) { const a = r2() * PI * 2, b = r2() * 1.5; const d = easeOutBack(clamp(lt / 0.6)) * (1.2 + r2() * 1.6); p.position.set(base.x + Math.cos(a) * d, base.y + Math.sin(b) * d * 0.8 + lt * 0.6, base.z + Math.sin(a) * d * 0.6); p.scale.setScalar(0.35 * (1 - lt / 1.3) + 0.02); p.material.rotation = lt * 4 + i; }
      });
      // shield
      const sp = t - 22.05;
      shield.visible = sp > 0; ring.visible = sp > 0 && sp < 1.2;
      if (shield.visible) { const k = easeOutElastic(clamp(sp / 0.9)); shield.scale.set(k, k, k); shield.userData.mat.uniforms.uTime.value = t; shield.userData.mat.uniforms.uOp.value = 1; }
      if (ring.visible) { const k = 1 + sp * 4; ring.scale.set(k, k, k); ring.material.opacity = 1 - sp / 1.2; }
      // camera path
      let pos, look;
      if (t < 6.2) {
        const u = easeInOut(t / 6.2);
        pos = v3(lerp(-26, 3.5, u), lerp(38, 3.2, Math.pow(u, 0.8)), lerp(46, 9, u));
        look = v3(lerp(0, 0, u), lerp(0, 1.4, u), lerp(-14, 0, u));
      } else if (t < 11) {
        const u = easeInOut((t - 6.2) / 4.8);
        pos = v3(lerp(3.5, 0.3, u), lerp(3.2, 1.95, u), lerp(9, 4.6, u)); look = v3(0, lerp(1.4, 1.55, u), 0);
      } else if (t < 15.5) {
        const u = easeInOut((t - 11) / 1.2);
        pos = v3(lerp(0.3, 0.9, u), lerp(1.95, 2.0, u), lerp(4.6, 6.2, u)); look = v3(lerp(0, 0.55, u), 1.5, 0);
      } else if (t < 22) {
        const ph = new THREE.Vector3(); bee.phone.getWorldPosition(ph);
        const u = easeInOut((t - 15.5) / 2.1);
        pos = v3(lerp(0.9, ph.x - 0.05, u), lerp(2.0, ph.y + 0.02, u), lerp(6.2, ph.z + 1.25, u)); look = v3(lerp(0.55, ph.x - 0.05, u), lerp(1.5, ph.y + 0.02, u), lerp(0, ph.z, u));
      } else {
        const u = easeInOut((t - 22) / 1.6);
        pos = v3(lerp(0.2, 0.5, u), lerp(2.2, 2.6, u), lerp(5.6, 7.4, u)); look = v3(0.3, lerp(1.4, 1.5, u), 0);
      }
      camera.position.copy(pos); camera.lookAt(look);
    },
  };
}

// ================= SCENE: PHONE CLOSE-UP ==================
function buildPhone() {
  const s = newScene('#3a2405', '#1a0f02');
  addLights(s, { si: 2, hemi: 1.2, pos: [3, 6, 8] });
  const tex = makeAppTex('off', 540, 1044);
  const phone = makePhone(tex, 1); s.add(phone);
  phone.scale.setScalar(14);
  // bokeh hexes
  const bok = [];
  const r = rng(77);
  for (let i = 0; i < 40; i++) { const sp = sprite(ICON.hex, 0.5 + r() * 1.5, true); sp.position.set((r() - 0.5) * 12, (r() - 0.5) * 20, -4 - r() * 6); sp.material.opacity = 0.25 + r() * 0.4; s.add(sp); bok.push({ sp, y0: sp.position.y, sp2: 0.3 + r() * 0.5 }); }
  // finger
  const hand = new THREE.Group(); s.add(hand);
  const skinM = mat('#f2c29b', { rough: 0.5 });
  mesh(capsule(0.27, 1.3), skinM, 0, 0, 0, hand);
  mesh(capsule(0.48, 0.9), skinM, 0.3, -1.25, 0, hand).rotation.z = 0.2;
  mesh(capsule(0.6, 1.2), mat('#ff7a1a', { rough: 0.7 }), 0.55, -2.6, 0, hand).rotation.z = 0.25;
  mesh(sphere(0.2), mat('#ffd9c4', { rough: 0.3 }), 0, 0.6, 0.2, hand).scale.set(1, 1.2, 0.4);
  const burst = spritePool(s, ICON.spark, 30);
  const ripple = mesh(new THREE.RingGeometry(0.85, 1, 6), new THREE.MeshBasicMaterial({ color: '#ffe082', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0.5, s);
  const camera = cam(40); camera.position.set(0, 0, 9.5);
  const btnY = (480 / 1044 - 0.5) * -0.29 * 14; // screen coords to world
  return {
    scene: s, camera,
    enter() {},
    update(t) {
      const lt = t - 17.6;
      const state = t < 20.45 ? 'off' : t < 21.2 ? 'connecting' : 'on';
      updateAppTex(tex, state, t);
      phone.rotation.set(-0.05 + 0.03 * Math.sin(t), 0.12 * Math.sin(t * 0.7) - 0.05, 0.03 * Math.sin(t * 0.9));
      phone.position.set(0, 0.15 + 0.05 * Math.sin(t * 1.3), 0);
      bok.forEach((b, i) => { b.sp.position.y = b.y0 + ((t * b.sp2 + 30) % 20) - 10; });
      // finger press
      const inP = smooth(19.4, 20.35, t), outP = smooth(20.75, 21.5, t);
      const press = t > 20.3 && t < 20.7 ? Math.sin((t - 20.3) / 0.4 * PI) : 0;
      hand.position.set(lerp(3.8, 0.12, inP) + outP * 3.5, lerp(-9, btnY + 0.15 - 0.88, inP) - outP * 6, lerp(2.5, 0.8, inP) - press * 0.25);
      hand.rotation.set(0.25, 0, lerp(0.35, 0.18, inP));
      hand.visible = t > 19.3 && t < 21.6;
      ripple.visible = t > 20.45 && t < 21.4; if (ripple.visible) { const k = 0.4 + (t - 20.45) * 1.6; ripple.scale.set(k, k, k); ripple.position.set(0, btnY + 0.15, 0.4); ripple.material.opacity = 1 - (t - 20.45) / 0.95; }
      burst.forEach((b, i) => { const l2 = t - 21.2; const r2 = rng(i * 13 + 5); b.visible = l2 > 0 && l2 < 0.9; if (b.visible) { const a = r2() * PI * 2; const d = easeOutBack(clamp(l2 / 0.5)) * (1.6 + r2() * 2.4); b.position.set(Math.cos(a) * d, btnY + 0.15 + Math.sin(a) * d, 1); b.scale.setScalar(0.7 * (1 - l2 / 0.9) + 0.05); } });
      const u = easeInOut(clamp(lt / 4.4));
      camera.position.set(0, 0.1, lerp(9.8, 8.2, u)); camera.lookAt(0, 0.05, 0);
    },
  };
}

// ================= ROOMS (vignettes) ==================
function roomBase(wallCol, floorCol, sideCol) {
  const s = newScene('#ffe9c7', '#ffd59a');
  const L = addLights(s, { pos: [4, 8, 7], si: 2.4, hemi: 1.0, sb: 7 });
  const floor = mesh(new THREE.PlaneGeometry(30, 30), mat(floorCol, { rough: 0.6 }), 0, 0, 0, s); floor.rotation.x = -PI / 2;
  mesh(new THREE.PlaneGeometry(30, 14), mat(wallCol, { rough: 0.9 }), 0, 7, -3.2, s);
  const sw = mesh(new THREE.PlaneGeometry(14, 14), mat(sideCol ?? wallCol, { rough: 0.9 }), -4.6, 7, 3, s); sw.rotation.y = PI / 2;
  const sw2 = mesh(new THREE.PlaneGeometry(14, 14), mat(sideCol ?? wallCol, { rough: 0.9 }), 4.6, 7, 3, s); sw2.rotation.y = -PI / 2;
  mesh(new THREE.BoxGeometry(30, 0.25, 0.06), mat('#ffffff'), 0, 0.12, -3.17, s);
  return { s, L };
}
function frameTex(draw, w = 512, h = 512) { return canvasTex(w, h, draw); }
function windowMesh(s, x, y, z, w, h, skyCol = ['#7fd3ff', '#d4f3ff']) {
  const g = new THREE.Group(); g.position.set(x, y, z); s.add(g);
  const tex = canvasTex(256, 256, (c, W2, H2) => { const gr = c.createLinearGradient(0, 0, 0, H2); gr.addColorStop(0, skyCol[0]); gr.addColorStop(1, skyCol[1]); c.fillStyle = gr; c.fillRect(0, 0, W2, H2); c.fillStyle = '#fff'; for (const [cx, cy] of [[60, 70], [180, 110]]) { c.beginPath(); c.arc(cx, cy, 22, 0, PI * 2); c.arc(cx + 25, cy - 8, 26, 0, PI * 2); c.arc(cx + 50, cy, 20, 0, PI * 2); c.fill(); } c.fillStyle = '#81c784'; c.beginPath(); c.arc(60, 300, 120, 0, PI * 2); c.arc(220, 320, 130, 0, PI * 2); c.fill(); });
  mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), 0, 0, 0, g).castShadow = false;
  const fm = mat('#ffffff', { rough: 0.4 });
  mesh(rbox(w + 0.25, 0.14, 0.18, 0.05), fm, 0, h / 2, 0.05, g); mesh(rbox(w + 0.25, 0.14, 0.18, 0.05), fm, 0, -h / 2, 0.05, g);
  mesh(rbox(0.14, h, 0.18, 0.05), fm, -w / 2, 0, 0.05, g); mesh(rbox(0.14, h, 0.18, 0.05), fm, w / 2, 0, 0.05, g); mesh(rbox(0.08, h, 0.12, 0.03), fm, 0, 0, 0.05, g);
  return g;
}
function plant(s, x, z, sc = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(sc); s.add(g); mesh(cyl(0.28, 0.2, 0.5, 20), mat('#e07a5f'), 0, 0.25, 0, g); for (let i = 0; i < 6; i++) { const l = mesh(sphere(0.25, 16, 12), mat('#43a047'), Math.cos(i) * 0.18, 0.7 + (i % 3) * 0.15, Math.sin(i) * 0.18, g); l.scale.set(0.6, 1.4, 0.6); l.rotation.z = Math.cos(i) * 0.5; } return g; }
function laptop(s, x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g); mesh(rbox(0.7, 0.04, 0.48, 0.02), mat('#cfd8dc', { metal: 0.6, rough: 0.3 }), 0, 0.02, 0, g); const lid = new THREE.Group(); lid.position.set(0, 0.04, -0.24); lid.rotation.x = -0.25; g.add(lid); mesh(rbox(0.7, 0.46, 0.03, 0.02), mat('#b0bec5', { metal: 0.6, rough: 0.3 }), 0, 0.23, 0, lid); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), new THREE.MeshBasicMaterial({ map: okTex, toneMapped: false })); sc.position.set(0, 0.23, 0.017); sc.rotation.z = PI / 2; sc.scale.set(0.62, 1.6, 1); lid.add(sc); return g; }

function shieldFor(s, r) { const sh = makeShield(r); s.add(sh); return sh; }
function updShield(sh, lt, t, delay = 0.35) { const k = easeOutElastic(clamp((lt - delay) / 0.8)); sh.visible = lt > delay; sh.scale.setScalar(Math.max(0.001, k)); sh.userData.mat.uniforms.uTime.value = t; sh.userData.mat.uniforms.uOp.value = 0.42; }

function buildFamily() {
  const { s } = roomBase('#ffe4b5', '#d9a066', '#ffd59e');
  windowMesh(s, -2.2, 3.2, -3.15, 2.2, 1.9);
  // picture frames
  for (const [x, y, c] of [[1.3, 3.6, '#ff8a65'], [2.5, 3.3, '#4fc3f7'], [1.9, 2.7, '#aed581']]) { mesh(rbox(0.8, 0.6, 0.06, 0.03), mat('#ffffff'), x, y, -3.12, s); mesh(new THREE.PlaneGeometry(0.62, 0.42), mat(c), x, y, -3.08, s); }
  // rug
  const rug = mesh(new THREE.CircleGeometry(2.6, 48), mat('#ef9a9a', { rough: 1 }), 0, 0.012, 0.9, s); rug.rotation.x = -PI / 2; rug.scale.y = 0.6;
  // sofa
  const sofa = new THREE.Group(); sofa.position.set(-0.4, 0, -1.8); s.add(sofa);
  const sm = mat('#26a69a', { rough: 0.8 });
  mesh(rbox(3.6, 0.5, 1.1, 0.18), sm, 0, 0.35, 0, sofa); mesh(rbox(3.6, 0.9, 0.35, 0.16), sm, 0, 0.9, -0.42, sofa);
  for (const x of [-1.9, 1.9]) mesh(rbox(0.35, 0.8, 1.1, 0.15), sm, x, 0.55, 0, sofa);
  for (const x of [-1.1, 0, 1.1]) mesh(rbox(1.0, 0.18, 0.9, 0.1), mat('#4db6ac', { rough: 0.85 }), x, 0.66, 0.05, sofa);
  mesh(rbox(0.5, 0.45, 0.16, 0.12), mat('#ffca28'), -1.4, 1.0, -0.15, sofa).rotation.z = 0.2;
  // armchair
  const ac = new THREE.Group(); ac.position.set(2.75, 0, -0.6); ac.rotation.y = -0.6; s.add(ac);
  const am = mat('#ab47bc', { rough: 0.8 });
  mesh(rbox(1.3, 0.5, 1.1, 0.18), am, 0, 0.35, 0, ac); mesh(rbox(1.3, 1.0, 0.3, 0.15), am, 0, 0.95, -0.45, ac); for (const x of [-0.65, 0.65]) mesh(rbox(0.28, 0.75, 1.1, 0.12), am, x, 0.55, 0, ac);
  // lamp + plant + table
  mesh(cyl(0.05, 0.05, 2.2, 8), mat('#5d4037'), -3.4, 1.1, -1.8, s); mesh(cone(0.45, 0.55, 24), mat('#fff3e0', { emissive: '#ffcc80', ei: 0.5 }), -3.4, 2.3, -1.8, s);
  plant(s, 3.6, -2.4, 1.2);
  mesh(rbox(1.4, 0.12, 0.8, 0.05), mat('#8d6e63'), 0, 0.5, 0.6, s); for (const x of [-0.6, 0.6]) mesh(cyl(0.05, 0.05, 0.5, 8), mat('#5d4037'), x, 0.25, 0.6, s);
  mesh(cyl(0.13, 0.1, 0.18, 16), mat('#ffffff'), 0.3, 0.65, 0.6, s); mesh(sphere(0.18), mat('#ff7043'), -0.3, 0.65, 0.6, s); mesh(sphere(0.15), mat('#ffca28'), -0.05, 0.63, 0.75, s);
  const shield = shieldFor(s, 4.2);
  const reac = reactionIcons(s, 6, ['heart', 'like', 'chat']);
  const camera = cam(42);
  const chars = ['oleg', 'anna', 'lyova', 'galya'];
  return {
    scene: s, camera,
    enter() {
      for (const n of chars) s.add(C[n].root);
      place(C.oleg, -1.5, 0, -1.65, 0.1); place(C.anna, -0.3, 0, -1.65, 0); place(C.lyova, 0.75, 0, -1.6, -0.15); place(C.galya, 2.7, 0, -0.55, -0.6);
      for (const n of chars) C[n].root.scale.setScalar(C[n].o.scale ?? 1);
      s.add(bee.root);
    },
    update(t) {
      const lt = t - 23.6;
      C.oleg.set({ t, sit: true, sitH: 0.62, phone: true, emotion: lt > 0.6 ? 'happy' : 'neutral', talk: lt > 1.2 ? 0.5 * Math.max(0, Math.sin(t * 13)) : 0, headX: 0.2, lookY: -0.5 });
      C.anna.set({ t, sit: true, sitH: 0.62, phone: true, emotion: 'happy', headZ: 0.15, headY: -0.4, lookX: -0.6, talk: lt > 0.8 && lt < 1.8 ? 0.6 * Math.max(0, Math.sin(t * 11)) : 0 });
      C.lyova.set({ t, sit: lt < 1.1, sitH: 0.62, phone: lt < 1.1, cheer: smooth(1.1, 1.3, lt), emotion: lt > 1.1 ? 'cheer' : 'happy', jump: lt > 1.1 ? Math.abs(Math.sin((lt - 1.1) * 5)) * 0.35 : 0 });
      if (lt > 1.1) C.lyova.root.position.set(0.95, 0, -1.0); else C.lyova.root.position.set(0.75, 0.0, -1.6);
      C.galya.set({ t, sit: true, sitH: 0.62, phone: true, emotion: lt > 0.5 ? 'happy' : 'surprised', headX: 0.15, lookY: -0.3, talk: lt > 1.5 ? 0.4 * Math.max(0, Math.sin(t * 9)) : 0 });
      updShield(shield, lt, t, 0.35); shield.position.set(0, 0, -0.6);
      updateReactions(reac, [v3(-1.5, 2.3, -1.4), v3(-0.3, 2.3, -1.4), v3(2.6, 2.3, -0.4)], lt);
      // bee zip
      const bu = clamp((lt - 1.4) / 1.2);
      bee.root.visible = bu > 0 && bu < 1; bee.root.position.set(lerp(-5, 5, bu), 2.9 + Math.sin(bu * PI * 2) * 0.3, 0.4); bee.root.rotation.set(0, PI / 2 - 0.5, 0); bee.root.scale.setScalar(0.6); bee.set({ t, emotion: 'cheer', wave: 1, tilt: -0.2 });
      const u = easeInOut(lt / 2.7);
      camera.position.set(lerp(-0.6, 0.6, u), lerp(2.6, 2.3, u), lerp(8.6, 7.4, u)); camera.lookAt(0.2, 1.25, -0.8);
    },
  };
}

function buildCafe() {
  const { s } = roomBase('#ffe0b2', '#a1887f', '#ffcc80');
  mesh(new THREE.BoxGeometry(30, 1.4, 0.1), mat('#6d4c41'), 0, 0.7, -3.13, s);
  windowMesh(s, 2.3, 3.0, -3.12, 2.4, 2.0, ['#ffb74d', '#fff3e0']);
  // menu board
  const menu = canvasTex(512, 384, (g, w, h) => { g.fillStyle = '#263238'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8d6e63'; g.lineWidth = 18; g.strokeRect(0, 0, w, h); g.fillStyle = '#ffe082'; g.font = '900 64px Rubik'; g.textAlign = 'center'; g.fillText('КОФЕ', w / 2, 90); g.fillStyle = '#fff'; g.font = '600 34px Rubik'; g.textAlign = 'left'; ['Капучино ....... 180', 'Латте ............ 200', 'Какао ............ 150', 'Wi-Fi + Nectar  ✓'].forEach((l, i) => g.fillText(l, 40, 160 + i * 52)); });
  mesh(new THREE.PlaneGeometry(2.0, 1.5), new THREE.MeshStandardMaterial({ map: menu, roughness: 0.9 }), -1.7, 3.4, -3.1, s);
  // string lights
  const bulbs = [];
  for (let i = 0; i < 16; i++) { const x = -4 + i * 0.55; const y = 4.6 - Math.sin((i / 15) * PI) * 0.45; const b = mesh(sphere(0.09), mat(['#ffeb3b', '#ff7043', '#81d4fa', '#f48fb1'][i % 4], { emissive: ['#ffeb3b', '#ff7043', '#81d4fa', '#f48fb1'][i % 4], ei: 1.4 }), x, y, -2.6, s); b.castShadow = false; bulbs.push(b); }
  // counter
  mesh(rbox(3.4, 1.1, 0.9, 0.1), mat('#8d6e63'), -2.6, 0.55, -2.4, s); mesh(rbox(3.5, 0.1, 1.0, 0.04), mat('#efebe9'), -2.6, 1.13, -2.4, s);
  mesh(rbox(0.6, 0.7, 0.5, 0.08), mat('#b0bec5', { metal: 0.7, rough: 0.25 }), -3.3, 1.53, -2.5, s);
  // table
  mesh(cyl(0.95, 0.95, 0.08, 40), mat('#ffffff', { rough: 0.3 }), 0.5, 0.95, -0.3, s); mesh(cyl(0.08, 0.12, 0.95, 12), mat('#37474f'), 0.5, 0.47, -0.3, s);
  for (const [x, z] of [[0.1, -0.1], [0.9, -0.5], [0.6, 0.15]]) { mesh(cyl(0.11, 0.08, 0.16, 16), mat('#ffffff'), x, 1.07, z, s); mesh(cyl(0.09, 0.09, 0.01, 16), mat('#6d4c41'), x, 1.15, z, s); mesh(torus(0.05, 0.015), mat('#ffffff'), x + 0.12, 1.07, z, s).rotation.y = PI / 2; }
  mesh(cyl(0.22, 0.22, 0.03, 24), mat('#ffccbc'), 0.4, 1.0, -0.6, s); mesh(cone(0.15, 0.2, 3), mat('#ffb74d'), 0.4, 1.12, -0.6, s);
  // steam
  const steam = spritePool(s, ICON.puff, 9, false);
  plant(s, 3.8, -2.4, 1.1);
  const shield = shieldFor(s, 3.4);
  const reac = reactionIcons(s, 5, ['chat', 'heart', 'like']);
  const camera = cam(42);
  const chars = ['sophie', 'carlos', 'masha'];
  return {
    scene: s, camera,
    enter() { for (const n of chars) { s.add(C[n].root); C[n].root.scale.setScalar(C[n].o.scale ?? 1); } place(C.sophie, -0.55, 0, -0.35, 0.7); place(C.carlos, 1.6, 0, -0.55, -0.7); place(C.masha, 0.55, 0, -1.6, 0); s.add(bee.root); },
    update(t) {
      const lt = t - 26.3;
      C.sophie.set({ t, phone: true, emotion: 'happy', headY: 0.3, talk: 0.6 * Math.max(0, Math.sin(t * 12)) * (lt < 1.2 ? 1 : 0), headX: 0.1 });
      C.carlos.set({ t, phone: lt < 1.0, emotion: lt > 1 ? 'cheer' : 'happy', headY: -0.4, wave: smooth(1.0, 1.2, lt), talk: lt > 1 ? 0.7 * Math.max(0, Math.sin(t * 10)) : 0 });
      C.masha.set({ t, phone: true, emotion: 'happy', dance: 0.6, headZ: 0.1 });
      bulbs.forEach((b, i) => (b.material.emissiveIntensity = 1 + 0.6 * Math.sin(t * 6 + i)));
      steam.forEach((p, i) => { const k = ((t * 0.8 + i / 3) % 1); const cx = [0.1, 0.9, 0.6][i % 3], cz = [-0.1, -0.5, 0.15][i % 3]; p.position.set(cx + Math.sin(t * 3 + i) * 0.05, 1.2 + k * 0.6, cz); p.scale.setScalar(0.12 + k * 0.2); p.material.opacity = 0.5 * (1 - k); p.visible = true; });
      updShield(shield, lt, t, 0.3); shield.position.set(0.5, 0, -0.6);
      updateReactions(reac, [v3(-0.55, 2.3, -0.3), v3(1.6, 2.3, -0.5), v3(0.55, 2.2, -1.5)], lt);
      const bu = clamp((lt - 1.2) / 1.2); bee.root.visible = bu > 0 && bu < 1; bee.root.position.set(lerp(5, -5, bu), 3.0 + Math.sin(bu * 9) * 0.2, 0.6); bee.root.rotation.set(0, -PI / 2 + 0.5, 0); bee.root.scale.setScalar(0.55); bee.set({ t, emotion: 'cheer', wave: 1 });
      const u = easeInOut(lt / 2.7); const a = lerp(-0.35, 0.25, u);
      camera.position.set(0.5 + Math.sin(a) * 7.0, 2.5, -0.3 + Math.cos(a) * 7.0); camera.lookAt(0.5, 1.3, -0.6);
    },
  };
}

function buildUni() {
  const { s } = roomBase('#e3f2fd', '#c8a27a', '#bbdefb');
  const board = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#2e5e3e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a1887f'; g.lineWidth = 24; g.strokeRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.92)'; g.font = '700 70px Rubik'; g.fillText('E = mc²', 70, 130); g.font = '600 50px Rubik'; g.fillText('∫ f(x)dx  · π ≈ 3,14', 70, 230); g.fillStyle = '#ffe082'; g.font = '800 58px Rubik'; g.fillText('Знания без границ!', 70, 360); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(840, 170, 80, 0, PI * 2); g.stroke(); g.beginPath(); g.moveTo(760, 170); g.lineTo(920, 170); g.stroke(); });
  mesh(new THREE.PlaneGeometry(5.2, 2.6), new THREE.MeshStandardMaterial({ map: board, roughness: 0.95 }), 0, 3.2, -3.1, s);
  windowMesh(s, -4.55, 3.0, 0.5, 2.0, 2.0).rotation.y = PI / 2;
  // desks
  const deskM = mat('#ffcc80', { rough: 0.6 });
  for (const [x, z] of [[-1.6, -0.6], [1.5, -0.6], [0, 1.2]]) { mesh(rbox(1.6, 0.1, 0.8, 0.04), deskM, x, 0.95, z, s); for (const dx of [-0.7, 0.7]) mesh(cyl(0.04, 0.04, 0.95, 8), mat('#607d8b', { metal: 0.5 }), x + dx, 0.47, z, s); }
  laptop(s, -1.6, 1.0, -0.6, 0); laptop(s, 1.5, 1.0, -0.6, 0);
  // books
  for (let i = 0; i < 4; i++) mesh(rbox(0.5, 0.1, 0.35, 0.02), mat(['#e53935', '#1e88e5', '#43a047', '#fdd835'][i]), 0.4, 1.06 + i * 0.1, 1.2, s).rotation.y = i * 0.2;
  // globe on desk
  mesh(sphere(0.25), mat('#42a5f5'), -0.4, 1.3, 1.2, s); mesh(cyl(0.03, 0.12, 0.1, 12), mat('#795548'), -0.4, 1.03, 1.2, s);
  const shield = shieldFor(s, 3.8);
  const reac = reactionIcons(s, 5, ['like', 'chat', 'heart']);
  const camera = cam(42);
  const chars = ['kenji', 'leyla', 'timur'];
  return {
    scene: s, camera,
    enter() { for (const n of chars) { s.add(C[n].root); C[n].root.scale.setScalar(C[n].o.scale ?? 1); } place(C.kenji, -1.6, 0, -1.35, 0); place(C.leyla, 1.5, 0, -1.35, 0); place(C.timur, 0.05, 0, 0.35, 0.0); s.add(bee.root); },
    update(t) {
      const lt = t - 29.0;
      C.kenji.set({ t, emotion: 'happy', headX: 0.25, lookY: -0.5, dance: 0.4, headZ: 0.12 * Math.sin(t * 6.28) });
      C.kenji.arms[0].rotation.set(-0.9, 0, 0.3); C.kenji.arms[1].rotation.set(-0.9 - 0.1 * Math.max(0, Math.sin(t * 20)), 0, -0.3);
      C.leyla.set({ t, phone: lt < 1.3, emotion: lt > 1.3 ? 'cheer' : 'happy', wave: smooth(1.3, 1.5, lt), headY: -0.2 });
      C.timur.set({ t, phone: true, emotion: 'happy', headX: 0.2, lookY: -0.4, talk: lt > 1.6 ? 0.5 * Math.max(0, Math.sin(t * 12)) : 0 });
      updShield(shield, lt, t, 0.3); shield.position.set(0, 0, -0.4);
      updateReactions(reac, [v3(-1.6, 2.4, -1.2), v3(1.5, 2.4, -1.2), v3(0.05, 2.3, 0.4)], lt);
      const bu = clamp((lt - 0.8) / 1.3); bee.root.visible = bu > 0 && bu < 1; bee.root.position.set(lerp(-5, 5, bu), 3.4 + Math.sin(bu * 8) * 0.25, -1.5); bee.root.rotation.set(0, PI / 2 - 0.4, 0); bee.root.scale.setScalar(0.55); bee.set({ t, emotion: 'cheer', wave: 1 });
      const u = easeInOut(lt / 2.7);
      camera.position.set(lerp(0.8, -0.5, u), lerp(3.4, 2.9, u), lerp(8.5, 7.6, u)); camera.lookAt(0, 1.4, -0.6);
    },
  };
}

function buildTravel() {
  const s = newScene('#5ec8ff', '#d9f4ff');
  addLights(s, { pos: [5, 10, 8], si: 2.6, sb: 8 });
  const floor = mesh(new THREE.PlaneGeometry(40, 40), mat('#d7dee3', { rough: 0.55 }), 0, 0, 0, s); floor.rotation.x = -PI / 2;
  // big window frame
  for (let i = -4; i <= 4; i++) mesh(rbox(0.16, 6, 0.16, 0.04), mat('#455a64', { metal: 0.5 }), i * 1.6, 3, -4, s);
  mesh(rbox(14, 0.2, 0.2, 0.05), mat('#455a64', { metal: 0.5 }), 0, 6, -4, s);
  // outside runway
  const run = mesh(new THREE.PlaneGeometry(80, 10), mat('#607d8b'), 0, -0.02, -16, s); run.rotation.x = -PI / 2;
  const grass = mesh(new THREE.PlaneGeometry(200, 100), mat('#9ccc65'), 0, -0.05, -50, s); grass.rotation.x = -PI / 2;
  for (let x = -40; x < 40; x += 4) { const d = mesh(new THREE.PlaneGeometry(2, 0.25), mat('#ffffff'), x, 0.0, -16, s); d.rotation.x = -PI / 2; }
  // plane
  const plane = new THREE.Group(); s.add(plane);
  mesh(capsule(0.7, 6), mat('#ffffff', { rough: 0.3 }), 0, 0, 0, plane).rotation.z = PI / 2;
  const wing = mesh(rbox(1.6, 0.12, 8, 0.05), mat('#eceff1'), 0, -0.1, 0, plane);
  mesh(rbox(1.2, 1.6, 0.12, 0.05), mat('#ffb300', { emissive: '#ff8f00', ei: 0.2 }), -3.1, 0.9, 0, plane);
  mesh(rbox(0.9, 0.1, 2.6, 0.04), mat('#eceff1'), -3.1, 0.2, 0, plane);
  for (let i = 0; i < 8; i++) mesh(sphere(0.12, 10, 8), mat('#90caf9', { emissive: '#64b5f6', ei: 0.3 }), -1.8 + i * 0.5, 0.25, 0.65, plane);
  // departures board
  const board = canvasTex(768, 512, (g, w, h) => { g.fillStyle = '#1a1f2b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffb300'; g.font = '900 54px Rubik'; g.fillText('ВЫЛЕТ  ✈', 30, 70); g.font = '700 40px Rubik'; [['ТОКИО', '10:45', '#8bc34a'], ['ПАРИЖ', '11:20', '#8bc34a'], ['ДУБАЙ', '12:05', '#ffeb3b'], ['РИО', '13:30', '#8bc34a'], ['НАЙРОБИ', '14:10', '#8bc34a']].forEach(([c, tm, col], i) => { g.fillStyle = '#fff'; g.fillText(c, 30, 150 + i * 72); g.fillStyle = '#ffe082'; g.fillText(tm, 400, 150 + i * 72); g.fillStyle = col; g.fillText('●', 640, 150 + i * 72); }); });
  mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshBasicMaterial({ map: board, toneMapped: false }), 3.0, 4.4, -3.8, s);
  mesh(cyl(0.05, 0.05, 2.0, 8), mat('#455a64'), 3.0, 6.2, -3.8, s);
  // seats
  for (let i = 0; i < 4; i++) { mesh(rbox(0.6, 0.1, 0.6, 0.05), mat('#1e88e5'), -3.2 + i * 0.7, 0.55, -2.4, s); mesh(rbox(0.6, 0.6, 0.1, 0.05), mat('#1e88e5'), -3.2 + i * 0.7, 0.85, -2.7, s); }
  mesh(rbox(2.8, 0.1, 0.5, 0.04), mat('#78909c', { metal: 0.6 }), -2.15, 0.35, -2.45, s);
  // suitcase
  const suit = new THREE.Group(); s.add(suit);
  mesh(rbox(0.55, 0.75, 0.3, 0.08), mat('#ef5350', { rough: 0.35 }), 0, 0.5, 0, suit); for (const x of [-0.15, 0.15]) mesh(rbox(0.04, 0.72, 0.31, 0.01), mat('#ffcdd2'), x, 0.5, 0, suit);
  mesh(cyl(0.02, 0.02, 0.5, 8), mat('#90a4ae', { metal: 0.6 }), 0, 1.1, -0.1, suit); mesh(rbox(0.25, 0.05, 0.05, 0.02), mat('#37474f'), 0, 1.35, -0.1, suit);
  mesh(sphere(0.05), mat('#222'), -0.2, 0.08, 0.1, suit); mesh(sphere(0.05), mat('#222'), 0.2, 0.08, 0.1, suit);
  // stickers on suitcase
  const shield = shieldFor(s, 3.2);
  const reac = reactionIcons(s, 4, ['heart', 'chat', 'like']);
  const camera = cam(42);
  return {
    scene: s, camera,
    enter() { s.add(C.amara.root); s.add(C.oleg.root); C.amara.root.scale.setScalar(1); place(C.oleg, -1.95, 0, -2.25, 0.2); C.oleg.root.scale.setScalar(1.06); s.add(bee.root); },
    update(t) {
      const lt = t - 31.7;
      const walk = 1 - smooth(1.2, 1.6, lt);
      const ax = lerp(-2.5, 0.6, easeInOut(clamp(lt / 1.6)));
      place(C.amara, ax, 0, 0.6, lt < 1.6 ? 0.9 : lerp(0.9, 0.1, smooth(1.4, 1.8, lt)));
      C.amara.set({ t, walk, phone: lt < 1.6, wave: smooth(1.7, 1.9, lt), emotion: lt > 1.7 ? 'cheer' : 'happy', headY: lt < 1.6 ? -0.5 : 0 });
      suit.position.set(ax + 0.65, 0, 0.75); suit.rotation.set(0, 0.9, walk * 0.15 * Math.sin(t * 9));
      C.oleg.set({ t, sit: true, sitH: 0.6, phone: true, emotion: 'happy', headX: 0.2, lookY: -0.5 });
      plane.position.set(lerp(-26, 14, lt / 2.7), 0.8 + Math.max(0, lt - 0.9) * 2.8, -15); plane.rotation.set(0, 0, Math.min(0.28, Math.max(0, lt - 0.9) * 0.4));
      updShield(shield, lt, t, 0.6); shield.position.set(ax, 0, 0.6); shield.scale.multiplyScalar(0.55);
      updateReactions(reac, [v3(ax, 2.3, 0.6), v3(-1.95, 2.1, -2.2)], lt);
      bee.root.visible = lt > 1.4; bee.root.position.set(ax + 1.1 + 0.1 * Math.sin(t * 3), 1.9, 1.0); bee.root.rotation.set(0, -0.4, 0); bee.root.scale.setScalar(0.55); bee.set({ t, emotion: 'cheer', wave: 1 });
      const u = easeInOut(lt / 2.7);
      camera.position.set(lerp(-0.9, 0.3, u), 2.3, lerp(9.0, 8.2, u)); camera.lookAt(lerp(-0.7, 0.0, u), 1.35, -0.4);
    },
  };
}

// ================= GLOBE ==================
function latlon(lat, lon, R) { const phi = (lon + 180) / 360 * PI * 2, th = (90 - lat) / 180 * PI; return v3(-R * Math.cos(phi) * Math.sin(th), R * Math.cos(th), R * Math.sin(phi) * Math.sin(th)); }
function frameAt(lat, lon) { const n = latlon(lat, lon, 1).normalize(); const down = v3(0, -1, 0); const f = down.clone().sub(n.clone().multiplyScalar(n.dot(down))).normalize(); const r = n.clone().cross(f); return { n, f, r }; }
function buildGlobe() {
  const s = newScene('#1b1150', '#6a3fd1');
  addLights(s, { pos: [6, 14, 14], si: 2.8, sb: 10, sky: '#e1d7ff', ground: '#ffd9a8', hemi: 1.2 });
  // stars
  const r = rng(9); const starGeo = new THREE.BufferGeometry(); const pts = [];
  for (let i = 0; i < 700; i++) { const a = r() * PI * 2, b = (r() - 0.5) * PI; const d = 120; pts.push(Math.cos(a) * Math.cos(b) * d, Math.sin(b) * d, Math.sin(a) * Math.cos(b) * d); }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  s.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.6, sizeAttenuation: true })));
  const R = 6;
  const tex = canvasTex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#47c2ff'); gr.addColorStop(0.5, '#1f8fff'); gr.addColorStop(1, '#47c2ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const P = (lon, lat) => [(lon + 180) / 360 * w, (90 - lat) / 180 * h];
    const conts = [
      [[-165, 65], [-140, 70], [-95, 72], [-75, 65], [-60, 52], [-70, 43], [-80, 25], [-97, 17], [-82, 8], [-105, 20], [-118, 33], [-125, 48], [-150, 58]],
      [[-80, 10], [-60, 8], [-35, -7], [-40, -22], [-58, -38], [-68, -55], [-75, -45], [-72, -18], [-81, -5]],
      [[-10, 36], [0, 43], [-5, 48], [5, 53], [10, 58], [5, 62], [20, 70], [40, 68], [60, 60], [45, 45], [30, 40], [25, 36], [15, 38], [10, 44]],
      [[-17, 15], [-10, 30], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -28], [20, -35], [12, -17], [9, 4], [-8, 5]],
      [[40, 68], [70, 75], [110, 78], [140, 72], [180, 68], [160, 60], [140, 50], [130, 35], [120, 22], [105, 10], [98, 18], [90, 22], [80, 8], [72, 20], [60, 25], [50, 30], [35, 35], [45, 45], [60, 60]],
      [[113, -22], [130, -12], [142, -11], [153, -27], [146, -39], [135, -35], [115, -34]],
      [[-50, 60], [-30, 70], [-20, 80], [-45, 83], [-65, 78], [-55, 68]],
      [[130, 33], [136, 35], [141, 41], [143, 44], [140, 38]],
      [[44, -13], [50, -15], [48, -25], [44, -22]],
      [[-6, 50], [2, 51], [-2, 58], [-6, 56]],
    ];
    const drawPoly = (pts) => { g.beginPath(); const p = pts.map(([a, b]) => P(a, b)); for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (i === 0) g.moveTo(m[0], m[1]); else g.quadraticCurveTo(a[0], a[1], m[0], m[1]); } const a = p[0], b = p[1]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); g.closePath(); };
    g.lineJoin = 'round';
    for (const c of conts) { drawPoly(c); g.strokeStyle = '#ffe9a3'; g.lineWidth = 22; g.stroke(); }
    for (const c of conts) { drawPoly(c); g.fillStyle = '#62d26f'; g.fill(); }
    // forests/deserts
    g.save(); for (const c of conts) { drawPoly(c); g.save(); g.clip(); for (let i = 0; i < 40; i++) { const [x, y] = P(c[0][0] + (r() - 0.5) * 80, c[0][1] - r() * 40); g.fillStyle = r() < 0.3 ? 'rgba(255,214,120,0.5)' : 'rgba(46,160,80,0.45)'; g.beginPath(); g.arc(x, y, 20 + r() * 50, 0, PI * 2); g.fill(); } g.restore(); } g.restore();
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h * 0.05); g.fillRect(0, h * 0.95, w, h * 0.05);
  });
  const globe = new THREE.Group(); s.add(globe);
  mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }), 0, 0, 0, globe);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 64, 48), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 wp = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition-wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }`, fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0-abs(dot(vN,vV)),3.0); gl_FragColor = vec4(vec3(0.55,0.8,1.0)*f*1.6, f); }` }));
  s.add(atmo);
  // clouds around globe
  const cloudG = new THREE.Group(); globe.add(cloudG);
  for (let i = 0; i < 18; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) mesh(sphere(0.3 + r() * 0.25, 14, 10), mat('#ffffff', { rough: 1 }), k * 0.35, r() * 0.15, r() * 0.2, c).castShadow = false; const lat = (r() - 0.5) * 140, lon = r() * 360 - 180; const { n, f, r: rr } = frameAt(lat, lon); c.position.copy(n.clone().multiplyScalar(R + 1.6)); c.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(rr, n, f)); cloudG.add(c); }
  // landmarks
  const lm = {};
  const onGlobe = (obj, lat, lon, dx = 0, dz = 0) => { const { n, f, r: rr } = frameAt(lat, lon); const p = n.clone().multiplyScalar(R).add(rr.clone().multiplyScalar(dx)).add(f.clone().multiplyScalar(dz)); const n2 = p.clone().normalize(); obj.position.copy(n2.clone().multiplyScalar(R - 0.02)); const f2 = f.clone().sub(n2.clone().multiplyScalar(n2.dot(f))).normalize(); obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(n2.clone().cross(f2), n2, f2)); globe.add(obj); return obj; };
  const grp = () => new THREE.Group();
  // Moscow: onion domes
  { const g = grp(); mesh(rbox(1.4, 1.2, 1.0, 0.1), mat('#e53935'), 0, 0.6, 0, g); for (const [x, h, c] of [[-0.45, 1.6, '#43a047'], [0, 2.1, '#fdd835'], [0.45, 1.6, '#1e88e5']]) { mesh(cyl(0.2, 0.2, h - 0.9, 16), mat('#fff3e0'), x, 0.9 + (h - 0.9) / 2, 0, g); const d = mesh(sphere(0.3, 20, 16), mat(c, { rough: 0.3 }), x, h + 0.15, 0, g); d.scale.set(1, 1.15, 1); mesh(cone(0.1, 0.35, 12), mat(c), x, h + 0.55, 0, g); } lm.moscow = onGlobe(g, 55.7, 37.6, 1.3, -0.6); }
  // Paris: tower
  { const g = grp(); const tm = mat('#8d6e63', { rough: 0.5, metal: 0.3 }); mesh(cyl(0.12, 0.75, 1.3, 4), tm, 0, 0.65, 0, g); mesh(rbox(0.9, 0.12, 0.9, 0.03), tm, 0, 1.3, 0, g); mesh(cyl(0.05, 0.22, 1.5, 4), tm, 0, 2.05, 0, g); mesh(cyl(0.02, 0.04, 0.4, 6), tm, 0, 3.0, 0, g); lm.paris = onGlobe(g, 48.8, 2.3, 1.2, -0.5); }
  // Nairobi: acacia + giraffe-ish
  { const g = grp(); mesh(cyl(0.08, 0.12, 1.4, 8), mat('#6d4c41'), 0, 0.7, 0, g); const cr = mesh(sphere(0.8, 20, 12), mat('#7cb342'), 0, 1.55, 0, g); cr.scale.set(1.4, 0.35, 1.2); mesh(sphere(0.45, 20, 16), mat('#ffca28', { emissive: '#ffb300', ei: 0.6 }), -1.6, 2.4, -0.8, g); lm.nairobi = onGlobe(g, -1.3, 36.8, 1.3, -0.5); }
  // Tokyo: pagoda + sakura
  { const g = grp(); for (let i = 0; i < 4; i++) { mesh(rbox(0.8 - i * 0.12, 0.35, 0.8 - i * 0.12, 0.04), mat('#fff3e0'), 0, 0.2 + i * 0.5, 0, g); const roof = mesh(cone(0.75 - i * 0.1, 0.25, 4), mat('#d32f2f'), 0, 0.5 + i * 0.5, 0, g); roof.rotation.y = PI / 4; } mesh(cyl(0.02, 0.02, 0.5, 6), mat('#ffd54f'), 0, 2.4, 0, g); const tr = grp(); tr.position.set(-1.0, 0, 0.4); g.add(tr); mesh(cyl(0.06, 0.09, 0.8, 8), mat('#6d4c41'), 0, 0.4, 0, tr); for (let k = 0; k < 5; k++) mesh(sphere(0.32, 14, 10), mat('#f8bbd0'), Math.cos(k * 1.3) * 0.25, 1.0 + (k % 2) * 0.15, Math.sin(k * 1.3) * 0.25, tr); lm.tokyo = onGlobe(g, 35.7, 139.7, 1.2, -0.5); }
  // Rio: palms + hill
  { const g = grp(); const hill = mesh(sphere(0.9, 20, 14), mat('#66bb6a'), 0.6, 0, -0.6, g); hill.scale.set(0.8, 1.6, 0.8); for (const x of [-0.4, 0.2]) { mesh(cyl(0.05, 0.08, 1.3, 8), mat('#8d6e63'), x, 0.65, 0.3, g); for (let k = 0; k < 5; k++) { const l = mesh(sphere(0.35, 12, 8), mat('#2e7d32'), x + Math.cos(k * 1.25) * 0.28, 1.35, 0.3 + Math.sin(k * 1.25) * 0.28, g); l.scale.set(1.2, 0.2, 0.5); l.rotation.y = -k * 1.25; } } lm.rio = onGlobe(g, -22.9, -43.2, 1.2, -0.4); }
  // Dubai: tower
  { const g = grp(); mesh(cyl(0.08, 0.35, 3.2, 6), mat('#90caf9', { rough: 0.1, metal: 0.6 }), 0, 1.6, 0, g); mesh(cyl(0.01, 0.06, 0.8, 6), mat('#cfd8dc', { metal: 0.6 }), 0, 3.6, 0, g); lm.dubai = onGlobe(g, 25.2, 55.3, 1.1, -0.4); }
  // NY: skyscrapers
  { const g = grp(); for (const [x, h, c] of [[-0.4, 1.8, '#90a4ae'], [0.1, 2.4, '#b0bec5'], [0.55, 1.4, '#78909c']]) mesh(rbox(0.4, h, 0.4, 0.05), mat(c, { metal: 0.3, rough: 0.3 }), x, h / 2, 0, g); lm.ny = onGlobe(g, 40.7, -74, 1.2, -0.5); }
  const people = [
    ['timur', 55.7, 37.6], ['sophie', 48.8, 2.3], ['amara', -1.3, 36.8], ['kenji', 35.7, 139.7], ['carlos', -22.9, -43.2], ['leyla', 25.2, 55.3], ['masha', 40.7, -74], ['anna', -33.8, 151], ['oleg', 60, -100],
  ];
  const holders = {};
  for (const [n, la, lo] of people) { const hgrp = grp(); onGlobe(hgrp, la, lo, 0, 0); holders[n] = hgrp; }
  // arcs
  const arcMat = new THREE.MeshBasicMaterial({ color: '#ffc94a', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const arcs = [];
  const pairs = [['timur', 'sophie'], ['sophie', 'amara'], ['amara', 'kenji'], ['kenji', 'carlos'], ['carlos', 'masha'], ['masha', 'timur'], ['leyla', 'anna'], ['oleg', 'kenji'], ['timur', 'leyla'], ['anna', 'amara']];
  pairs.forEach(([a, b], i) => {
    const pa = latlon(people.find((p) => p[0] === a)[1], people.find((p) => p[0] === a)[2], R); const pb = latlon(people.find((p) => p[0] === b)[1], people.find((p) => p[0] === b)[2], R);
    const mid = pa.clone().add(pb).multiplyScalar(0.5); const ml = mid.length(); mid.normalize().multiplyScalar(Math.max(R * 1.25, ml + pa.distanceTo(pb) * 0.45));
    const curve = new THREE.QuadraticBezierCurve3(pa.clone().multiplyScalar(1.01), mid, pb.clone().multiplyScalar(1.01));
    const geo = new THREE.TubeGeometry(curve, 80, 0.05, 8); const m2 = new THREE.Mesh(geo, arcMat); m2.renderOrder = 5; globe.add(m2);
    const dot = mesh(sphere(0.14, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), 0, 0, 0, globe);
    arcs.push({ m: m2, curve, dot, start: 34.6 + i * 0.55 });
  });
  const stops = [
    { n: 'timur', lat: 55.7, lon: 37.6, t: 34.3, label: 'Москва' },
    { n: 'sophie', lat: 48.8, lon: 2.3, t: 36.4, label: 'Париж' },
    { n: 'amara', lat: -1.3, lon: 36.8, t: 38.4, label: 'Найроби' },
    { n: 'kenji', lat: 35.7, lon: 139.7, t: 40.3, label: 'Токио' },
  ];
  const tilt = 0.28;
  const qFor = (lat, lon) => { const { n, f, r: rr } = frameAt(lat, lon); const Ms = new THREE.Matrix4().makeBasis(rr, n, f); const up = v3(0, Math.cos(tilt), Math.sin(tilt)), fw = v3(0, -Math.sin(tilt), Math.cos(tilt)); const Mt = new THREE.Matrix4().makeBasis(v3(1, 0, 0), up, fw); const M = Mt.multiply(Ms.clone().transpose()); return new THREE.Quaternion().setFromRotationMatrix(M); };
  stops.forEach((st) => (st.q = qFor(st.lat, st.lon)));
  const camera = cam(40);
  return {
    scene: s, camera, stops,
    enter() { for (const [n] of people) { holders[n].add(C[n].root); C[n].root.position.set(0, 0, 0); C[n].root.rotation.set(0, 0, 0); C[n].root.scale.setScalar(0.9 * (C[n].o.scale ?? 1)); } s.add(bee.root); },
    update(t) {
      // globe orientation
      let q;
      if (t < 42.2) {
        let i = stops.length - 1; for (let k = 0; k < stops.length; k++) if (t >= stops[k].t) i = k;
        const cur = stops[i]; const prev = stops[Math.max(0, i - 1)];
        const u = easeInOut(clamp((t - cur.t) / 0.9));
        q = i === 0 ? cur.q.clone() : prev.q.clone().slerp(cur.q, u);
        const spinIn = 1 - smooth(34.3, 35.4, t); if (spinIn > 0) q.multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), -spinIn * 1.2));
      } else {
        const u = easeInOut(clamp((t - 42.2) / 1.5));
        q = stops[3].q.clone().slerp(qFor(30, 60), u);
        q.premultiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), (t - 42.2) * 0.25));
      }
      globe.quaternion.copy(q);
      cloudG.rotation.y = t * 0.03;
      // characters
      for (const [n] of people) {
        const isStop = stops.find((st) => st.n === n && t >= st.t + 0.5 && t < st.t + 2.2);
        C[n].set({ t, wave: isStop ? smooth(0, 0.2, t - isStop.t - 0.5) : 0, emotion: isStop ? 'cheer' : 'happy', dance: isStop ? 0 : 0.7, beatOff: n.length * 0.1, cheer: t > 42.6 ? 1 : 0 });
      }
      // arcs
      for (const a of arcs) { const p = clamp((t - a.start) / 0.9); const cnt = a.m.geometry.index.count; a.m.geometry.setDrawRange(0, Math.floor(cnt * p / 3) * 3); a.m.visible = p > 0; a.dot.visible = p >= 1; if (a.dot.visible) a.dot.position.copy(a.curve.getPoint(((t - a.start) * 0.45) % 1)); }
      // camera
      let pos, look;
      const near = { p: v3(0, R * Math.cos(tilt) + 1.6, R * Math.sin(tilt) + 6.2), l: v3(0, R * Math.cos(tilt) + 0.9, R * Math.sin(tilt)) };
      const far = { p: v3(0, 2.0, 31), l: v3(0, 0.5, 0) };
      if (t < 34.9) { const u = easeInOut((t - 34.3) / 0.6); pos = far.p.clone().lerp(near.p, 0.6 + 0.4 * u); look = far.l.clone().lerp(near.l, 0.6 + 0.4 * u); }
      else if (t < 42.2) {
        // little pull-back during transitions
        let k = 0; for (const st of stops) { const d = t - st.t; if (d > 0 && d < 0.9) k = Math.sin(d / 0.9 * PI); }
        pos = near.p.clone().add(v3(0.3 * Math.sin(t), 1.4 * k, 3.0 * k)); look = near.l.clone();
      } else { const u = easeInOut(clamp((t - 42.2) / 1.6)); pos = near.p.clone().lerp(far.p, u); look = near.l.clone().lerp(far.l, u); }
      camera.position.copy(pos); camera.lookAt(look);
      // bee orbit
      const ba = t * 1.4; const br = t < 42.2 ? 2.6 : R + 2.4;
      bee.root.visible = true;
      if (t < 42.2) { bee.root.position.set(near.l.x + Math.cos(ba) * 2.2, near.l.y + 1.2 + Math.sin(t * 2) * 0.2, near.l.z + 1.0 + Math.sin(ba) * 0.8); bee.root.scale.setScalar(0.5); bee.root.rotation.set(0, -Math.sin(ba) * 0.8, 0); }
      else { bee.root.position.set(Math.cos(ba) * br, 2.5 + Math.sin(t) * 1.5, Math.sin(ba) * br); bee.root.scale.setScalar(1.0); bee.root.rotation.set(0, -ba, 0); }
      bee.set({ t, emotion: 'cheer', wave: 1, talk: talkAt(t) });
    },
  };
}

// ================= FINALE ==================
let FONT = null;
function buildFinale() {
  const s = new THREE.Scene(); s.environment = envTex;
  s.background = canvasTex(512, 1024, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.35, 20, w / 2, h * 0.4, h * 0.75); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.35, '#ffc23a'); gr.addColorStop(1, '#ff6a00'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.globalAlpha = 0.12; g.fillStyle = '#ffffff'; for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(w / 2, h * 0.35); const a = i / 18 * PI * 2; g.lineTo(w / 2 + Math.cos(a) * 2000, h * 0.35 + Math.sin(a) * 2000); g.lineTo(w / 2 + Math.cos(a + 0.12) * 2000, h * 0.35 + Math.sin(a + 0.12) * 2000); g.fill(); } g.globalAlpha = 0.18; for (let i = 0; i < 40; i++) { hexPath(g, (i * 97) % w, (i * 211) % h, 18 + (i % 4) * 10, PI / 6); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); } });
  const L = addLights(s, { pos: [4, 10, 12], si: 2.4, sb: 8, hemi: 1.3, sky: '#fff2d6', ground: '#ffb36b' });
  // stage
  const hexTop = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = '#ffd25e'; g.fillRect(0, 0, w, h); for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { const cx = x * 80 + (y % 2) * 40, cy = y * 70; hexPath(g, cx, cy, 38, PI / 6); g.fillStyle = (x + y) % 3 ? '#ffc23a' : '#ffb000'; g.fill(); g.strokeStyle = '#fff3c4'; g.lineWidth = 4; g.stroke(); } });
  const stage = mesh(cyl(4.6, 4.8, 0.5, 6), [mat('#e08a00'), new THREE.MeshStandardMaterial({ map: hexTop, roughness: 0.45 }), mat('#e08a00')], 0, -0.25, 0, s); stage.rotation.y = PI / 6;
  mesh(cyl(3.2, 3.2, 0.45, 6), [mat('#e08a00'), new THREE.MeshStandardMaterial({ map: hexTop, roughness: 0.45 }), mat('#e08a00')], 0, 0.22, -1.4, s).rotation.y = PI / 6;
  // logo
  const logo = new THREE.Group(); s.add(logo);
  const emblem = mesh(new THREE.TorusGeometry(2.25, 0.16, 12, 6), mat('#fff3c4', { emissive: '#ffb300', ei: 0.7, metal: 0.4, rough: 0.25 }), 0, 0, -0.4, logo); emblem.rotation.z = PI / 2;
  const emblemFill = mesh(new THREE.CircleGeometry(2.2, 6), new THREE.MeshStandardMaterial({ color: '#3b2412', roughness: 0.4, transparent: true, opacity: 0.88 }), 0, 0, -0.5, logo); emblemFill.rotation.z = PI / 2;
  const frontM = new THREE.MeshStandardMaterial({ color: '#ffd54a', emissive: '#ffa000', emissiveIntensity: 0.35, metalness: 0.55, roughness: 0.22 });
  const sideM = new THREE.MeshStandardMaterial({ color: '#e07000', metalness: 0.4, roughness: 0.35 });
  const mkText = (str, size, y) => { const geo = new TextGeometry(str, { font: FONT, size, height: size * 0.35, curveSegments: 8, bevelEnabled: true, bevelThickness: size * 0.06, bevelSize: size * 0.04, bevelSegments: 4 }); geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(-(bb.max.x + bb.min.x) / 2, 0, 0); const m2 = new THREE.Mesh(geo, [frontM, sideM]); m2.position.y = y; m2.castShadow = true; logo.add(m2); return m2; };
  const t1 = mkText('NECTAR', 0.78, 0.05); const t2 = mkText('VPN', 0.62, -0.9);
  t2.material = [new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffe9a8', emissiveIntensity: 0.25, metalness: 0.3, roughness: 0.25 }), sideM];
  logo.position.set(0, 5.75, -1.6);
  // confetti
  const CN = 420;
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.5 }), CN); s.add(conf);
  const cr = rng(31); const cd = [];
  for (let i = 0; i < CN; i++) { cd.push({ x: (cr() - 0.5) * 11, z: (cr() - 0.5) * 6 - 0.5, y0: 9 + cr() * 10, sp: 1.2 + cr() * 1.2, rs: cr() * 10, ph: cr() * 6 }); conf.setColorAt(i, new THREE.Color(['#ff4f8b', '#4fc3f7', '#ffeb3b', '#8bc34a', '#ffffff', '#b388ff', '#ff7043'][i % 7])); }
  // spot cones
  const beams = [];
  for (const x of [-4, 4]) { const b = mesh(new THREE.ConeGeometry(1.6, 12, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#fff7d6', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), x, 6, -3, s); b.castShadow = false; beams.push(b); }
  const shield = makeShield(6.2); s.add(shield); shield.position.set(0, 0, -1.2);
  const sparks = spritePool(s, ICON.spark, 30);
  const camera = cam(40);
  const front = [['lyova', -2.5], ['masha', -1.5], ['timur', -0.5], ['amara', 0.5], ['carlos', 1.5], ['sophie', 2.5]];
  const back = [['galya', -2.4], ['oleg', -1.2], ['anna', 0], ['kenji', 1.2], ['leyla', 2.4]];
  return {
    scene: s, camera,
    enter() {
      for (const [n, x] of front) { s.add(C[n].root); place(C[n], x, 0, 0.6, -x * 0.06); C[n].root.scale.setScalar(C[n].o.scale ?? 1); }
      for (const [n, x] of back) { s.add(C[n].root); place(C[n], x, 0.45, -1.2, -x * 0.05); C[n].root.scale.setScalar(C[n].o.scale ?? 1); }
      s.add(bee.root);
    },
    update(t) {
      const lt = t - 44.6;
      // characters enter by jumping in, then dance
      const all = [...front, ...back];
      all.forEach(([n, x], i) => {
        const c = C[n]; const delay = i * 0.06;
        const inP = clamp((lt - delay) / 0.5);
        const by = back.find((b) => b[0] === n) ? 0.45 : 0;
        c.root.position.y = by + (1 - easeOutBack(inP)) * -2.5;
        const cheer = lt > 5.3 ? 1 : (i % 2 ? smooth(0.6, 0.9, lt) : 0);
        c.set({ t, emotion: lt > 0.6 ? 'cheer' : 'happy', dance: lt > 0.5 ? 1 : 0, beatOff: (i % 2) * 0.25, cheer, wave: i % 2 ? 0 : smooth(0.6, 0.9, lt), sway: 0.08 });
      });
      // logo
      const lp = easeOutElastic(clamp((lt - 0.4) / 1.1));
      logo.scale.setScalar(Math.max(0.001, lp)); logo.rotation.y = 0.12 * Math.sin(t * 1.1); logo.position.y = 5.75 + 0.08 * Math.sin(t * 1.7);
      frontM.emissiveIntensity = 0.35 + 0.25 * Math.max(0, Math.sin(t * PI * 2)) * (lt > 1 ? 1 : 0);
      // bee
      const bp = easeOutBack(clamp((lt - 0.2) / 0.8));
      const mv = easeInOut(clamp((lt - 4.9) / 0.8));
      bee.root.visible = true; bee.root.position.set(lerp(lerp(6, 0, bp), -2.55, mv), lerp(2.5, 4.3, mv) + 0.1 * Math.sin(t * 3), lerp(1.4, 0.6, mv)); bee.root.rotation.set(0, mv * 0.35, 0); bee.root.scale.setScalar(lerp(0.85, 0.6, mv));
      bee.set({ t, talk: talkAt(t), emotion: 'happy', wave: lt > 5.2 ? 1 : 0, cheer: lt > 1.0 && lt < 5.2 ? 0.6 : 0, dance: 0.3 });
      // confetti
      const q = new THREE.Object3D();
      cd.forEach((c, i) => { const tt = Math.max(0, lt - 0.5); let y = c.y0 - tt * c.sp * 2.2; y = y < -1 ? 9 + ((y + 1) % 10 + 10) % 10 : y; q.position.set(c.x + Math.sin(t * 2 + c.ph) * 0.3, lt < 0.5 ? 30 : y, c.z); q.rotation.set(t * c.rs, t * c.rs * 0.7, c.ph); q.updateMatrix(); conf.setMatrixAt(i, q.matrix); });
      conf.instanceMatrix.needsUpdate = true;
      beams.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * (0.35 + 0.25 * Math.sin(t * 1.3 + i)); });
      shield.userData.mat.uniforms.uTime.value = t; shield.userData.mat.uniforms.uOp.value = 0.35; shield.scale.setScalar(Math.max(0.001, easeOutElastic(clamp((lt - 0.6) / 1.2))));
      sparks.forEach((p, i) => { const r2 = rng(i * 7 + 3); const l2 = (lt - 0.5 - r2() * 8) % 2.5; p.visible = lt > 0.5 && l2 > 0 && l2 < 0.8; if (p.visible) { p.position.set((r2() - 0.5) * 6, 3.6 + r2() * 3.5, -0.8); p.scale.setScalar(0.5 * Math.sin(l2 / 0.8 * PI)); p.material.rotation = l2 * 3; } });
      const u = easeInOut(clamp(lt / 3.0));
      camera.position.set(0.5 * Math.sin(t * 0.4), lerp(6.0, 4.8, u), lerp(18.5, 14.2, u)); camera.lookAt(0, lerp(4.9, 4.45, u), -0.5);
    },
  };
}

// ================= OVERLAY ==================
const SUBS = [
  [1.0, 4.7, 'Мы живём в мире, где всё связано с интернетом.'],
  [5.4, 9.5, 'Но иногда он медленный, заблокированный и небезопасный.'],
  [12.6, 17.7, 'Знакомьтесь — Нектар! Ваш надёжный помощник — Nectar\u00A0VPN.'],
  [19.5, 23.2, 'Одно касание — и ваше соединение под защитой.'],
  [23.8, 25.2, 'Для всей семьи.'],
  [26.5, 27.6, 'Для друзей.'],
  [29.2, 30.3, 'Для учёбы.'],
  [31.9, 33.5, 'И для путешествий!'],
  [35.2, 40.1, 'Быстрый и безопасный интернет без границ — в любой точке мира.'],
  [45.4, 49.1, 'Nectar\u00A0VPN. Твой интернет — твои правила!'],
  [50.0, 52.4, 'Подключайся уже сегодня!'],
];
const CUTS = [17.6, 22.0, 23.6, 26.3, 29.0, 31.7, 34.3, 44.6];
function wrap(g, text, maxW) { const words = text.split(' '); const lines = []; let cur = ''; for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (g.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2; } if (cur) lines.push(cur); return lines; }
function popText(g, lines, cx, y, size, t0, t, o = {}) {
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${size}px Rubik`;
  lines.forEach((line, li) => {
    const p = clamp((t - t0 - li * 0.18) / 0.45); if (p <= 0) return;
    const k = easeOutBack(p); const yy = y + li * size * 1.12;
    g.save(); g.translate(cx, yy); g.scale(k, k); g.rotate((1 - p) * -0.08);
    g.lineJoin = 'round'; g.lineWidth = size * 0.2; g.strokeStyle = o.stroke ?? '#3b2412'; g.strokeText(line, 0, size * 0.07); g.strokeText(line, 0, 0);
    const gr = g.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, o.c1 ?? '#ffe066'); gr.addColorStop(1, o.c2 ?? '#ff9800'); g.fillStyle = gr; g.fillText(line, 0, 0);
    g.restore();
  });
  g.restore();
}
function chip(g, text, t0, t1, t, y = 150) {
  const p = clamp((t - t0) / 0.35), q = 1 - clamp((t - (t1 - 0.25)) / 0.25); const a = Math.min(p, q); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '800 54px Rubik'; const w = g.measureText(text).width + 130; const x = W / 2 - w / 2; const yy = y - (1 - easeOutBack(p)) * 40;
  g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 20; g.shadowOffsetY = 8;
  g.fillStyle = '#ffffff'; roundRect(g, x, yy, w, 96, 48); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = HONEY; hexPath(g, x + 52, yy + 48, 24, PI / 6); g.fill();
  g.fillStyle = '#3b2412'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, x + 92, yy + 50);
  g.restore();
}
function drawWipes(g, t) {
  for (const c of CUTS) {
    const p = (t - (c - 0.32)) / 0.64; if (p <= 0 || p >= 1) continue;
    const r = 95, hh = r * Math.sqrt(3);
    for (let row = -1; row < H / (hh / 2) + 2; row++) for (let col = -1; col < W / (r * 3) + 2; col++) {
      const cx = col * r * 3 + (row % 2) * r * 1.5, cy = row * hh / 2;
      const d = (cx / W) * 0.35 + (cy / H) * 0.65;
      const cov = p < 0.5 ? clamp(p * 2 * 1.6 - d * 0.6) : clamp((1 - p) * 2 * 1.6 - (1 - d) * 0.6);
      if (cov <= 0) continue;
      hexPath(g, cx, cy, r * 1.04 * easeOutBack(cov), 0); g.fillStyle = (row + col) % 3 ? '#ffb300' : '#ffc94a'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#ff9100'; g.stroke();
    }
  }
}
function drawSubs(g, t) {
  const s = SUBS.find((x) => t >= x[0] - 0.1 && t <= x[1] + 0.25); if (!s) return;
  const a = Math.min(clamp((t - s[0] + 0.1) / 0.2), clamp((s[1] + 0.25 - t) / 0.2));
  g.save(); g.globalAlpha = a; g.font = '700 50px Rubik'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = wrap(g, s[2], 900); const lh = 64; const bh = lines.length * lh + 40; const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 70;
  const y0 = 1790 - bh;
  g.fillStyle = 'rgba(20,12,4,0.62)'; roundRect(g, W / 2 - bw / 2, y0, bw, bh, 30); g.fill();
  g.fillStyle = '#ffffff'; lines.forEach((l, i) => g.fillText(l, W / 2, y0 + 20 + lh / 2 + i * lh + 2));
  g.restore();
}
function drawOverlay(t) {
  og.clearRect(0, 0, W, H);
  // vignette
  const vg = og.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.22)'); og.fillStyle = vg; og.fillRect(0, 0, W, H);
  if (t > 7.2 && t < 11.2) { const out = 1 - smooth(10.8, 11.2, t); og.save(); og.globalAlpha = out; popText(og, ['Интернет должен', 'быть свободным', 'и безопасным!'], W / 2, 250, 92, 7.2, t, { c1: '#ffffff', c2: '#ffe08a' }); og.restore(); }
  if (t > 12.7 && t < 17.5) { const out = 1 - smooth(17.2, 17.5, t); og.save(); og.globalAlpha = out; popText(og, ['Nectar VPN'], W / 2, 230, 120, 12.7, t); og.restore(); }
  chip(og, 'Дома', 23.75, 26.3, t); chip(og, 'В кафе', 26.45, 29.0, t); chip(og, 'На учёбе', 29.15, 31.7, t); chip(og, 'В путешествии', 31.85, 34.3, t);
  chip(og, 'Москва', 34.6, 36.6, t); chip(og, 'Париж', 36.8, 38.6, t); chip(og, 'Найроби', 38.8, 40.5, t); chip(og, 'Токио', 40.7, 42.3, t);
  if (t > 42.5 && t < 44.6) { og.save(); og.globalAlpha = 1 - smooth(44.2, 44.5, t); popText(og, ['Мир без границ'], W / 2, 230, 100, 42.5, t, { c1: '#ffffff', c2: '#ffd54a' }); og.restore(); }
  if (t > 46.3) popText(og, ['Твой интернет.', 'Твои правила!'], W / 2, 120, 84, 46.3, t, { c1: '#ffffff', c2: '#fff1c1', stroke: '#7a3a00' });
  if (t > 49.8) {
    const p = easeOutBack(clamp((t - 49.8) / 0.5)); const pulse = 1 + 0.035 * Math.sin((t - 49.8) * 7);
    og.save(); og.translate(W / 2, 1185); og.scale(p * pulse, p * pulse);
    og.shadowColor = 'rgba(80,30,0,0.45)'; og.shadowBlur = 30; og.shadowOffsetY = 12;
    const gr = og.createLinearGradient(0, -60, 0, 60); gr.addColorStop(0, '#3b2412'); gr.addColorStop(1, '#1e1208'); og.fillStyle = gr; roundRect(og, -430, -62, 860, 124, 62); og.fill();
    og.shadowColor = 'transparent'; og.lineWidth = 6; og.strokeStyle = '#ffd54a'; og.stroke();
    og.fillStyle = '#ffd54a'; og.font = '900 52px Rubik'; og.textAlign = 'center'; og.textBaseline = 'middle'; og.fillText('Подключайся уже сегодня!', 0, 4);
    // shine sweep
    const sx = ((t - 50.2) % 2.2) / 2.2 * 1200 - 600; og.globalCompositeOperation = 'source-atop'; const sg = og.createLinearGradient(sx - 80, 0, sx + 80, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); og.fillStyle = sg; og.fillRect(-430, -62, 860, 124);
    og.restore();
  }
  if (!(t > 49.8 && t < 52.6 && false)) drawSubs(og, t);
  drawWipes(og, t);
  // fade in/out
  if (t < 0.5) { og.fillStyle = `rgba(0,0,0,${1 - t / 0.5})`; og.fillRect(0, 0, W, H); }
}

// ================= TIMELINE ==================
let SC = {};
let current = null;
const segments = [];
function sceneFor(t) { for (const s of segments) if (t < s.end) return s.sc; return segments[segments.length - 1].sc; }
window.init = async () => {
  for (let k = 0; k < 50; k++) { const ws = [500, 600, 700, 800, 900]; await Promise.all(ws.map((w) => document.fonts.load(`${w} 60px Rubik`, 'Привет Nectar'))); if (ws.every((w) => document.fonts.check(`${w} 60px Rubik`, 'Привет Nectar'))) break; await new Promise((r) => setTimeout(r, 100)); }
  await document.fonts.ready;
  ENV = await (await fetch('env.json')).json().catch(() => []);
  FONT = await new Promise((res) => new FontLoader().load('node_modules/three/examples/fonts/helvetiker_bold.typeface.json', res));
  // redraw textures with fonts
  updateAppTex(okTex, 'on', 0); updateAppTex(heroTex, 'error', 0);
  for (const k of Object.keys(ICON)) {} // static
  SC.city = buildCity(); SC.phone = buildPhone(); SC.family = buildFamily(); SC.cafe = buildCafe(); SC.uni = buildUni(); SC.travel = buildTravel(); SC.globe = buildGlobe(); SC.finale = buildFinale();
  segments.push({ end: 17.6, sc: SC.city }, { end: 22.0, sc: SC.phone }, { end: 23.6, sc: SC.city }, { end: 26.3, sc: SC.family }, { end: 29.0, sc: SC.cafe }, { end: 31.7, sc: SC.uni }, { end: 34.3, sc: SC.travel }, { end: 44.6, sc: SC.globe }, { end: 999, sc: SC.finale });
  // compile all
  for (const k in SC) { SC[k].enter(); SC[k].update(k === 'city' ? 1 : 30); renderer.compile(SC[k].scene, SC[k].camera); }
  current = null;
  return 'ok';
};
window.renderAt = (t) => {
  const sc = sceneFor(t);
  if (sc !== current) { sc.enter(); current = sc; }
  if (t > 3 && t < 8) updateAppTex(heroTex, 'error', t);
  sc.update(t);
  renderer.render(sc.scene, sc.camera);
  drawOverlay(t);
  return true;
};
