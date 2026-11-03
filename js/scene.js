/* KYOR 3D: a matte aluminium can whose label is composed live from the brand's Photoshop layers.
   Hold to peel: every tile lifts off the curved can, flattens and deals itself out as a card.
   Cards with a room open that room. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LABEL, LABELS } from './label-data.js';

const CIRC_PX = 4290;                 // the can's circumference in label pixels (207 mm at 20.7 px/mm)
const R = 1;                          // can radius in world units
const PX = (2 * Math.PI * R) / CIRC_PX;
const H = LABEL.h * PX;               // label height in world units (≈ 3.31)
const ROOM_ORDER = ['origins', 'day', 'inside', 'sessions', 'shop'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ images & label art */
const imgCache = new Map();
function loadImg(src) {
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((res, rej) => {
      const i = new Image();
      i.decoding = 'async';
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    }));
  }
  return imgCache.get(src);
}
async function loadFlavour(fl) {
  const L = LABELS[fl];
  const pairs = await Promise.all(L.images.map(n => loadImg(L.dir + n + '.webp').then(i => [n, i])));
  return Object.fromEntries(pairs);
}
function drawItem(ctx, it, imgs) {
  if (it.img) ctx.drawImage(imgs[it.img], it.x, it.y);
  else if (it.fill) { ctx.fillStyle = it.fill; ctx.fillRect(it.rect[0], it.rect[1], it.rect[2] - it.rect[0], it.rect[3] - it.rect[1]); }
  else if (it.text) {
    ctx.font = it.font.replace('{s}', it.size);
    ctx.fillStyle = it.color;
    ctx.textAlign = it.align;
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (it.tr / 1000) * it.size + 'px';
    ctx.fillText(it.text, it.x, it.y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
}
function drawTile(ctx, t, imgs, ox = 0, oy = 0) {
  if (t.fill) { ctx.fillStyle = t.fill; ctx.fillRect(t.rect[0] - ox, t.rect[1] - oy, t.rect[2] - t.rect[0], t.rect[3] - t.rect[1]); }
  if (t.img) ctx.drawImage(imgs[t.img], t.ix - ox, t.iy - oy);
}
function drawBack(ctx, fl, imgs) {
  // the back panel, centred on x = 0 in label pixels
  const ink = 'rgb(31,17,4)', cream = 'rgb(241,226,197)';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgb(244,239,204)';
  ctx.font = '600 70px Barlow';
  ctx.fillText(fl === 'kokum' ? 'BREWED WITH KONKAN KOKUM' : 'PRESSED WITH PINK GUAVA', 0, 250);
  const wm = imgs.wordmark;
  const ww = 760, wh = (wm.height / wm.width) * ww;
  ctx.drawImage(wm, -ww / 2, 330, ww, wh);
  ctx.fillStyle = cream;
  ctx.fillRect(-520, 680, 1040, 820);
  ctx.fillStyle = ink;
  ctx.textAlign = 'left';
  ctx.font = '700 64px "Roboto Condensed"';
  ctx.fillText('NUTRITION  ·  PER 355 ML', -470, 780);
  ctx.fillRect(-470, 810, 940, 8);
  const rows = fl === 'kokum'
    ? [['Energy', '38 kcal'], ['Total sugars', '4.2 g'], ['Added sugar', '0 g'], ['Prebiotic fibre', '3 g'], ['Caffeine', '18 mg']]
    : [['Energy', '34 kcal'], ['Total sugars', '3.8 g'], ['Added sugar', '0 g'], ['Prebiotic fibre', '3 g'], ['Vitamin C', '45% RDA']];
  ctx.font = '500 54px "Roboto Condensed"';
  rows.forEach(([k, v], i) => {
    const y = 900 + i * 104;
    ctx.textAlign = 'left'; ctx.fillText(k, -470, y);
    ctx.textAlign = 'right'; ctx.fillText(v, 470, y);
    if (i < rows.length - 1) ctx.fillRect(-470, y + 34, 940, 3);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgb(244,239,204)';
  ctx.font = '500 46px "Roboto Condensed"';
  const ing = fl === 'kokum'
    ? 'CARBONATED WATER, KOKUM RIND, KOLA NUT, CHICORY INULIN, JAGGERY, BLACK SALT, CUMIN'
    : 'CARBONATED WATER, PINK GUAVA, GUNTUR CHILLI, LIME, CHICORY INULIN, ROCK SALT, STEVIA LEAF';
  ctx.fillText(ing, 0, 1600);
  ctx.fillText('BREWED & CANNED BY KYOR BEVERAGES, PUNE  ·  INFINITELY RECYCLABLE', 0, 1670);
  // barcode
  ctx.fillStyle = cream; ctx.fillRect(-260, 1760, 520, 260);
  ctx.fillStyle = ink;
  let x = -230, seed = fl === 'kokum' ? 7 : 13;
  while (x < 230) { seed = (seed * 9301 + 49297) % 233280; const w = 4 + (seed % 4) * 4; if (seed % 3) ctx.fillRect(x, 1790, w, 170); x += w + 4 + (seed % 2) * 4; }
  ctx.font = '500 36px "Roboto Condensed"';
  ctx.fillText('8 906123 40' + (fl === 'kokum' ? '1' : '2') + '17 3', 0, 1998);
}
function buildWrap(fl, imgs, withTiles, texW) {
  const L = LABELS[fl];
  const s = texW / CIRC_PX;
  const c = document.createElement('canvas');
  c.width = texW; c.height = Math.round(LABEL.h * s);
  const ctx = c.getContext('2d');
  ctx.scale(s, s);
  // the printed ground runs all the way round
  for (let x = CIRC_PX / 2 - LABEL.w / 2 - LABEL.w * 2; x < CIRC_PX; x += LABEL.w) ctx.drawImage(imgs.bg, x, 0);
  // back panel straddles the seam
  for (const cx of [0, CIRC_PX]) { ctx.save(); ctx.translate(cx, 0); drawBack(ctx, fl, imgs); ctx.restore(); }
  // front panel, centred
  ctx.save();
  ctx.translate(CIRC_PX / 2 - LABEL.w / 2, 0);
  const under = L.base.filter(i => !i.text);
  const over = L.base.filter(i => i.text);
  under.forEach(i => drawItem(ctx, i, imgs));
  if (withTiles) L.tiles.forEach(t => drawTile(ctx, t, imgs));
  over.forEach(i => drawItem(ctx, i, imgs));
  ctx.restore();
  return c;
}
function tileCanvas(t, imgs, scale) {
  const w = t.rect[2] - t.rect[0], h = t.rect[3] - t.rect[1];
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w * scale)); c.height = Math.max(2, Math.round(h * scale));
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  drawTile(ctx, t, imgs, t.rect[0], t.rect[1]);
  return c;
}

/* ------------------------------------------------------------------ the scene */
export async function createScene(canvas, opts = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const maxTex = renderer.capabilities.maxTextureSize;
  const texW = Math.min(small ? 2048 : 4096, maxTex);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1a12, 0.55));
  const key = new THREE.DirectionalLight(0xfff0dd, 1.5); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc896, 1.6); rim.position.set(-6, 2, -3); scene.add(rim);
  const spot = new THREE.PointLight(0xfff4e6, 12, 18, 2); spot.position.set(2, 1, 5); scene.add(spot);

  /* ---- the can ---- */
  const can = new THREE.Group();
  scene.add(can);
  const metal = new THREE.MeshStandardMaterial({ color: 0xb4b1aa, metalness: 1, roughness: 0.36, envMapIntensity: 0.9 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x8d8a84, metalness: 1, roughness: 0.48, envMapIntensity: 0.8 });
  const labelMat = new THREE.MeshStandardMaterial({ metalness: 0.18, roughness: 0.72, envMapIntensity: 0.45 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 160, 1, true, Math.PI, Math.PI * 2), labelMat);
  can.add(body);
  const top = [[1, 0], [1, 0.04], [0.985, 0.12], [0.93, 0.25], [0.865, 0.36], [0.84, 0.41], [0.845, 0.45], [0.852, 0.478], [0.838, 0.495], [0.815, 0.478], [0.808, 0.45], [0.798, 0.432]];
  const topGeo = new THREE.LatheGeometry(top.map(([r, y]) => new THREE.Vector2(r, H / 2 + y)), 120);
  can.add(new THREE.Mesh(topGeo, metal));
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.8, 96), metalDark);
  lid.rotation.x = -Math.PI / 2; lid.position.y = H / 2 + 0.432; can.add(lid);
  const score = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.008, 8, 96), metal);
  score.rotation.x = Math.PI / 2; score.position.y = H / 2 + 0.436; can.add(score);
  const tabShape = new THREE.Shape();
  tabShape.absarc(0, 0.06, 0.2, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0.1, 0.09, 0, Math.PI * 2, true); tabShape.holes.push(hole);
  const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 32 }), metal);
  tab.scale.set(1, 1.35, 1);
  tab.rotation.x = -Math.PI / 2; tab.position.set(0, H / 2 + 0.44, 0.12); can.add(tab);
  const bottom = [[0, -0.1], [0.5, -0.11], [0.64, -0.19], [0.72, -0.235], [0.82, -0.225], [0.92, -0.15], [0.98, -0.07], [1, 0]];
  can.add(new THREE.Mesh(new THREE.LatheGeometry(bottom.map(([r, y]) => new THREE.Vector2(r, -H / 2 + y)), 120), metal));

  // soft contact shadow
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const sctx = sh.getContext('2d');
  const g = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = g; sctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.26;
  scene.add(shadow);

  /* ---- bubbles ---- */
  const N = reduce ? 0 : 220;
  const bubGeo = new THREE.BufferGeometry();
  const bp = new Float32Array(N * 3), bv = new Float32Array(N * 3), life = new Float32Array(N);
  bubGeo.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const bc = document.createElement('canvas'); bc.width = bc.height = 64;
  const bx = bc.getContext('2d'); bx.strokeStyle = 'rgba(255,245,225,0.95)'; bx.lineWidth = 5; bx.beginPath(); bx.arc(32, 32, 24, 0, Math.PI * 2); bx.stroke();
  const bubbles = new THREE.Points(bubGeo, new THREE.PointsMaterial({ size: 0.13, map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false, opacity: 0.9 }));
  scene.add(bubbles);
  for (let i = 0; i < N; i++) { life[i] = 0; bp[i * 3 + 1] = -99; }
  function burst(count = 120) {
    let made = 0;
    for (let i = 0; i < N && made < count; i++) {
      if (life[i] > 0) continue;
      const a = Math.random() * Math.PI * 2, r = 0.6 + Math.random() * 1.6;
      bp[i * 3] = can.position.x + Math.cos(a) * r; bp[i * 3 + 1] = can.position.y + H / 2 + Math.random() * 0.4 - 0.2; bp[i * 3 + 2] = Math.sin(a) * r * 0.6;
      bv[i * 3] = (Math.random() - 0.5) * 0.6; bv[i * 3 + 1] = 1.2 + Math.random() * 2.6; bv[i * 3 + 2] = (Math.random() - 0.3) * 0.8;
      life[i] = 1.2 + Math.random() * 1.4; made++;
    }
  }

  /* ---- label & tiles per flavour ---- */
  let flavour = opts.flavour || 'kokum';
  let tiles = [];
  const tileGroup = new THREE.Group(); scene.add(tileGroup);
  const texLoader = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  let texFull, texBase;

  async function buildFlavour(fl) {
    await document.fonts.ready;
    await Promise.all(['700 40px Montserrat', '700 40px Roboto', '400 40px Roboto', '600 40px Barlow', '500 40px "Roboto Condensed"'].map(f => document.fonts.load(f).catch(() => {})));
    const imgs = await loadFlavour(fl);
    const L = LABELS[fl];
    const full = texLoader(buildWrap(fl, imgs, true, texW));
    const base = texLoader(buildWrap(fl, imgs, false, texW));
    const scale = small ? 0.45 : 0.7;
    const made = L.tiles.map((t, i) => {
      const w = t.rect[2] - t.rect[0], h = t.rect[3] - t.rect[1];
      const wU = w * PX, hU = h * PX;
      const segX = Math.max(4, Math.round(w / 60)), segY = Math.max(2, Math.round(h / 160));
      const morph = new THREE.PlaneGeometry(wU, hU, segX, segY);
      const flat = new THREE.PlaneGeometry(wU, hU, 1, 1);
      const local = morph.attributes.position.array.slice();
      const map = texLoader(tileCanvas(t, imgs, scale));
      const mat = new THREE.MeshStandardMaterial({ map, transparent: true, side: THREE.DoubleSide, roughness: 0.62, metalness: 0.12, alphaTest: 0.02 });
      const mesh = new THREE.Mesh(morph, mat);
      mesh.visible = false;
      mesh.renderOrder = 2 + i;
      const cxPx = (t.rect[0] + t.rect[2]) / 2, cyPx = (t.rect[1] + t.rect[3]) / 2;
      return {
        def: t, mesh, morph, flat, local, wU, hU,
        theta: (cxPx - LABEL.w / 2) * PX / R,
        y0: (LABEL.h / 2 - cyPx) * PX,
        layer: i,
        cur: { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1 },
        slot: { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1 },
        lift: 0, spin: Math.random() * Math.PI * 2, wob: 0.6 + Math.random() * 0.8
      };
    });
    return { full, base, made };
  }

  async function applyFlavour(fl) {
    const built = await buildFlavour(fl);
    if (texFull) { texFull.dispose(); texBase.dispose(); }
    tiles.forEach(t => { tileGroup.remove(t.mesh); t.morph.dispose(); t.flat.dispose(); t.mesh.material.map.dispose(); t.mesh.material.dispose(); });
    texFull = built.full; texBase = built.base; tiles = built.made;
    tiles.forEach(t => tileGroup.add(t.mesh));
    labelMat.map = peel > 0 ? texBase : texFull;
    labelMat.needsUpdate = true;
    flavour = fl;
    layout();
  }

  /* ---- layout of the dealt cards ---- */
  let aspect = 1;
  let canScale = 1, canY = 0, canPeelY = 0.5, canPeelScale = 0.72;
  const camDist = () => camera.position.z;
  function visibleAt(z) {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camDist() - z);
    return { h, w: h * aspect };
  }
  function layout() {
    const portrait = aspect < 0.9;
    const rooms = tiles.filter(t => t.def.room).sort((a, b) => ROOM_ORDER.indexOf(a.def.room) - ROOM_ORDER.indexOf(b.def.room));
    const decor = tiles.filter(t => !t.def.room);
    const zc = 2.4;
    const v = visibleAt(zc);
    const v0 = visibleAt(0);
    if (!portrait) {
      // the cards deal into an arc around the can: left high, left low, bottom, right low, right high
      const angles = [150, 207, 270, 333, 30].map(d => (d * Math.PI) / 180);
      const boxH = v.h * 0.27, boxW = boxH * 1.18;
      rooms.forEach((t, i) => {
        const a = angles[i % angles.length];
        const s = Math.min((boxW * 1.4) / t.wU, boxH / t.hU);
        t.slot.p.set(Math.cos(a) * v.w * 0.335, Math.sin(a) * v.h * 0.29 - v.h * 0.02, zc + (Math.sin(a) < -0.9 ? 0.3 : 0));
        t.slot.q.setFromEuler(new THREE.Euler(-Math.sin(a) * 0.12, -Math.cos(a) * 0.32, Math.cos(a) * 0.07));
        t.slot.s = s;
      });
      canPeelY = v0.h * 0.06; canPeelScale = 0.74;
    } else {
      const boxW = (v.w * 0.92) / 3, boxH = Math.min(boxW * 1.1, v.h * 0.17);
      rooms.forEach((t, i) => {
        const row = i < 3 ? 0 : 1, inRow = row === 0 ? 3 : rooms.length - 3, col = row === 0 ? i : i - 3;
        const x = (col - (inRow - 1) / 2) * boxW * 1.02;
        const s = Math.min((boxW * 0.96) / t.wU, boxH / t.hU);
        t.slot.p.set(x, -v.h * 0.03 - row * boxH * 1.12, zc);
        t.slot.q.setFromEuler(new THREE.Euler(-0.04, 0, (col - (inRow - 1) / 2) * -0.06));
        t.slot.s = s;
      });
      canPeelY = v0.h * 0.24; canPeelScale = 0.6;
    }
    // decorative tiles drift far behind, around the edges
    const vb = visibleAt(-5);
    decor.forEach((t, i) => {
      const a = (i / Math.max(1, decor.length)) * Math.PI * 2 + 0.35;
      const s = Math.min((vb.h * 0.13) / t.hU, (vb.w * 0.11) / t.wU);
      t.slot.p.set(Math.cos(a) * vb.w * 0.41, Math.sin(a) * vb.h * 0.36 + vb.h * 0.04, -5 - (i % 3) * 0.7);
      t.slot.q.setFromEuler(new THREE.Euler(0.15 * Math.sin(a), -0.35 * Math.cos(a), 0.18 * Math.sin(a * 2)));
      t.slot.s = s;
    });
    // the can: centred while whole
    canScale = portrait ? Math.min(1, (v0.w * 0.52) / 2.2) : Math.min(1.08, (v0.h * 0.66) / (H + 0.8));
    canY = portrait ? v0.h * 0.08 : 0;
  }

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.position.z = aspect < 0.9 ? 15.5 : 13;
    camera.updateProjectionMatrix();
    layout();
  }

  /* ---- state ---- */
  let peel = 0;              // 0 whole label … 1 dealt out
  let peelTarget = 0;
  let rotY = -0.35, spinVel = 0, dragging = false, lastX = 0, lastT = 0;
  let tiltX = 0, tiltY = 0, pointer = new THREE.Vector2(0, 0), pointerSet = false;
  let hovered = null, focusedRoom = null, flying = null, paused = false;
  const listeners = { hover: [], open: [], peel: [] };
  const emit = (k, v) => listeners[k].forEach(fn => fn(v));
  const ray = new THREE.Raycaster();

  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerSet = true;
  }
  function pick() {
    if (peel < 0.98 || !pointerSet) return null;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(tiles.filter(t => t.def.room).map(t => t.mesh), false);
    return hits.length ? tiles.find(t => t.mesh === hits[0].object) : null;
  }
  canvas.addEventListener('pointerdown', e => {
    setPointer(e);
    const t = pick();
    if (t) { canvas.dataset.pressed = t.def.room; return; }
    dragging = true; lastX = e.clientX; lastT = performance.now(); spinVel = 0;
    canvas.setPointerCapture(e.pointerId);
    emit('peel', { dragStart: true });
  });
  canvas.addEventListener('pointermove', e => {
    setPointer(e);
    if (dragging) {
      const now = performance.now(), dx = e.clientX - lastX;
      rotY += dx * 0.008;
      spinVel = (dx * 0.008) / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
    }
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', e => {
    endDrag();
    const t = pick();
    if (t && canvas.dataset.pressed === t.def.room) open(t.def.room);
    delete canvas.dataset.pressed;
  });
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { pointerSet = false; });

  function open(room) {
    const t = tiles.find(x => x.def.room === room);
    focusedRoom = room;
    let rect = null;
    if (t && peel > 0.9) {
      const p = t.cur.p.clone().project(camera);
      rect = { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight };
      flying = { t, k: 0, dir: 1 };
    }
    emit('open', { room, from: rect });
  }

  /* ---- animation loop ---- */
  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), canQ = new THREE.Quaternion();
  const clock = new THREE.Clock();
  let tPrev = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (paused || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(0.05, clock.getDelta());
    const time = clock.elapsedTime;

    // peel easing toward target (reduced motion: snap)
    const speed = reduce ? 10 : 0.75;
    peel = peelTarget > peel ? Math.min(peelTarget, peel + dt * speed) : Math.max(peelTarget, peel - dt * speed * 1.4);
    labelMat.map = peel > 0.001 ? texBase : texFull;

    // can spin, tilt and placement
    if (!dragging) {
      rotY += spinVel;
      spinVel *= 0.94;
      if (!reduce) rotY += dt * (0.22 + 0.25 * peel);
    }
    const tx = pointerSet && !dragging ? pointer.y * 0.12 : 0, ty = pointerSet && !dragging ? pointer.x * 0.25 : 0;
    tiltX = lerp(tiltX, tx, 0.06); tiltY = lerp(tiltY, ty, 0.06);
    const pe = easeIO(clamp(peel * 1.2, 0, 1));
    can.rotation.set(tiltX, rotY + tiltY, (reduce ? 0 : Math.sin(time * 0.7) * 0.03));
    const sc = lerp(canScale, canScale * canPeelScale, pe);
    can.scale.setScalar(sc);
    can.position.set(0, lerp(canY, canPeelY, pe) + (reduce ? 0 : Math.sin(time * 1.1) * 0.05), lerp(0, -1.2, pe));
    shadow.position.set(can.position.x, can.position.y - (H / 2 + 0.26) * sc, can.position.z);
    shadow.scale.setScalar(sc);
    shadow.material.opacity = 1 - pe * 0.4;
    spot.position.set(pointer.x * 5, pointer.y * 3 + 1, 5);
    can.updateMatrixWorld();
    canQ.setFromRotationMatrix(can.matrixWorld);

    // hover
    const h = pick();
    if (h !== hovered) {
      hovered = h;
      canvas.style.cursor = h ? 'pointer' : (peel > 0.98 ? 'grab' : 'grab');
      emit('hover', h ? { room: h.def.room, name: h.def.name, hint: h.def.hint } : null);
    }

    // tiles
    for (const t of tiles) {
      const local = clamp((peel - (t.def.room ? 0 : 0.12) - t.layer * 0.035) / 0.62, 0, 1);
      const e = ease(local);
      if (local <= 0) { t.mesh.visible = false; continue; }
      t.mesh.visible = true;
      const hov = hovered === t ? 1 : 0;
      t.lift = lerp(t.lift, hov, 0.15);
      // target: slot + idle float + hover lift
      tmpV.copy(t.slot.p);
      if (!reduce) { tmpV.y += Math.sin(time * t.wob + t.spin) * 0.06; tmpV.x += Math.cos(time * t.wob * 0.7 + t.spin) * (t.def.room ? 0.02 : 0.12); }
      tmpV.z += t.lift * 0.6;
      tmpQ.copy(t.slot.q);
      if (t.lift > 0.01) {
        tmpE.set(-pointer.y * 0.25 * t.lift, pointer.x * 0.35 * t.lift, 0);
        tmpQ.slerp(new THREE.Quaternion().setFromEuler(tmpE), t.lift * 0.85);
      }
      if (!t.def.room && !reduce) tmpQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(time * 0.3 + t.spin) * 0.25));
      let s = t.slot.s * (1 + t.lift * 0.12);
      if (flying && flying.t === t) {
        flying.k = clamp(flying.k + dt * 2.4 * flying.dir, 0, 1);
        const k = easeIO(flying.k);
        tmpV.lerp(new THREE.Vector3(0, 0, camera.position.z - 2.2), k);
        tmpQ.slerp(new THREE.Quaternion(), k);
        s = lerp(s, s * 2.6, k);
      }
      if (flying && flying.t === t && flying.dir < 0 && flying.k <= 0) flying = null;
      t.cur.p.copy(tmpV); t.cur.q.copy(tmpQ); t.cur.s = s;

      if (e >= 1) {
        if (t.mesh.geometry !== t.flat) t.mesh.geometry = t.flat;
        t.mesh.position.copy(tmpV); t.mesh.quaternion.copy(tmpQ); t.mesh.scale.setScalar(s);
      } else {
        if (t.mesh.geometry !== t.morph) t.mesh.geometry = t.morph;
        t.mesh.position.set(0, 0, 0); t.mesh.quaternion.identity(); t.mesh.scale.setScalar(1);
        const pos = t.morph.attributes.position.array, loc = t.local;
        const rr = R + 0.006 + t.layer * 0.0015;
        const arc = Math.sin(e * Math.PI) * (1.3 + t.layer * 0.06);
        for (let i = 0; i < loc.length; i += 3) {
          const lx = loc[i], ly = loc[i + 1];
          // on the can (curved, in can space → world)
          const a = t.theta + lx / R;
          const cv = new THREE.Vector3(Math.sin(a) * rr, t.y0 + ly, Math.cos(a) * rr).applyMatrix4(can.matrixWorld);
          // flat card in its slot
          const fv = new THREE.Vector3(lx * s, ly * s, 0).applyQuaternion(tmpQ).add(tmpV);
          // fly out along the surface normal first
          const nrm = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)).applyQuaternion(canQ);
          cv.lerp(fv, e).addScaledVector(nrm, arc);
          pos[i] = cv.x; pos[i + 1] = cv.y; pos[i + 2] = cv.z;
        }
        t.morph.attributes.position.needsUpdate = true;
        t.morph.computeVertexNormals();
      }
    }

    // bubbles
    if (N) {
      for (let i = 0; i < N; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        bp[i * 3] += bv[i * 3] * dt; bp[i * 3 + 1] += bv[i * 3 + 1] * dt; bp[i * 3 + 2] += bv[i * 3 + 2] * dt;
        bv[i * 3] += Math.sin(time * 3 + i) * dt * 0.4;
        if (life[i] <= 0) bp[i * 3 + 1] = -99;
      }
      bubGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    tPrev = time;
  }

  addEventListener('resize', resize);
  resize();
  await applyFlavour(flavour);
  frame();

  /* ---- public API ---- */
  return {
    get peeled() { return peelTarget === 1; },
    get flavour() { return flavour; },
    peel(on) {
      const was = peelTarget;
      peelTarget = on ? 1 : 0;
      if (on && was === 0) burst(160);
      emit('peel', { on });
    },
    async setFlavour(fl) {
      if (fl === flavour) return;
      if (peelTarget) this.peel(false);
      burst(140);
      const spinTo = rotY + Math.PI * 2;
      const start = rotY, t0 = performance.now(), dur = reduce ? 1 : 900;
      let swapped = false;
      const swap = applyFlavour.bind(null, fl);
      await new Promise(res => {
        (function step() {
          const k = Math.min(1, (performance.now() - t0) / dur);
          rotY = start + (spinTo - start) * easeIO(k);
          spinVel = 0;
          if (k > 0.35 && !swapped) { swapped = true; swap(); }
          if (k < 1) requestAnimationFrame(step); else res();
        })();
      });
    },
    open,
    returnCard() { if (flying) flying.dir = -1; focusedRoom = null; },
    pause(p) { paused = p; if (!p) clock.getDelta(); },
    nudge(v) { spinVel += v; },
    on(k, fn) { listeners[k].push(fn); },
    burst
  };
}
