/* KYOR: the stage UI, rooms, crate builder and bag. The 3D can lives in scene.js. */
const D = window.KYOR;
const Bag = window.KyorBag;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const inr = Bag.inr;
const body = document.body;
let scene = null;
let flavour = 'kokum';
try { flavour = localStorage.getItem('kyor-flavour') === 'guava' ? 'guava' : 'kokum'; } catch (e) { /* private mode */ }

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2400);
}

/* ---------- the giant type behind the can ---------- */
let megaText = '';
function setMega(text) {
  if (text === megaText) return;
  megaText = text;
  const unit = `<span>${text}</span><i>✺</i>`;
  $$('[data-mega]').forEach(el => { el.innerHTML = unit.repeat(8); });
}

/* ---------- flavour ---------- */
function setFlavour(fl, { fromInit = false } = {}) {
  const f = D.flavours[fl];
  flavour = fl;
  body.dataset.flavour = fl;
  try { localStorage.setItem('kyor-flavour', fl); } catch (e) { /* fine */ }
  $('[data-flavour-name]').textContent = f.name;
  $('[data-flavour-line]').textContent = f.line;
  const add = $('[data-add-hero]');
  add.dataset.add = f.product;
  add.textContent = `Add 6 cans · ₹540`;
  $('#canStill').src = f.can;
  $('.top__mark img').src = `assets/kit/${fl}/wordmark.webp`;
  $$('.flavours [data-flavour]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.flavour === fl)));
  $('meta[name="theme-color"]').setAttribute('content', fl === 'kokum' ? '#3a1a12' : '#262e1f');
  if (!hoverRoom) setMega(body.dataset.state === 'peeled' ? 'PICK A TILE' : f.mega);
  fillRooms();
  if (scene && !fromInit) scene.setFlavour(fl);
}

/* ---------- hold to peel ---------- */
const peelBtn = $('#peelBtn');
let hold = 0, holding = false, holdRaf = 0;
function setPeeled(on) {
  body.dataset.state = on ? 'peeled' : 'whole';
  $('#peelLabel').textContent = on ? 'Put it back' : 'Hold to peel';
  peelBtn.style.setProperty('--p', on ? 1 : 0);
  if (!hoverRoom) setMega(on ? 'PICK A TILE' : D.flavours[flavour].mega);
  if (scene) scene.peel(on);
}
function holdStep() {
  hold = Math.max(0, Math.min(1, hold + (holding ? 0.028 : -0.06)));
  peelBtn.style.setProperty('--p', hold);
  if (hold >= 1) { holding = false; setPeeled(true); return; }
  if (hold > 0 || holding) holdRaf = requestAnimationFrame(holdStep);
}
function holdStart(e) {
  if (body.dataset.state === 'peeled') return;
  if (e) e.preventDefault();
  if (reduce) { setPeeled(true); return; }
  holding = true; cancelAnimationFrame(holdRaf); holdStep();
}
function holdEnd() { holding = false; }
let pressWasPeeled = false;
peelBtn.addEventListener('pointerdown', e => { pressWasPeeled = body.dataset.state === 'peeled'; holdStart(e); });
addEventListener('pointerup', holdEnd);
peelBtn.addEventListener('click', () => { if (pressWasPeeled) { pressWasPeeled = false; hold = 0; setPeeled(false); } });
peelBtn.addEventListener('keydown', e => {
  if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
    pressWasPeeled = body.dataset.state === 'peeled';
    if (!pressWasPeeled) holdStart(e);
  }
});
peelBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') holdEnd(); });

// scroll down peels, scroll up puts it back (only on the stage)
let wheelAcc = 0, wheelLock = 0;
addEventListener('wheel', e => {
  if (body.classList.contains('room-open') || $('#bag').open) return;
  const now = Date.now();
  if (now < wheelLock) return;
  wheelAcc += e.deltaY;
  if (wheelAcc > 140 && body.dataset.state !== 'peeled') { hold = 1; setPeeled(true); wheelAcc = 0; wheelLock = now + 900; }
  if (wheelAcc < -140 && body.dataset.state === 'peeled') { hold = 0; setPeeled(false); wheelAcc = 0; wheelLock = now + 900; }
}, { passive: true });

// swipe up on the stage peels, swipe down puts it back
let sy = 0, sx = 0, swiping = false;
$('#gl').addEventListener('touchstart', e => { sy = e.touches[0].clientY; sx = e.touches[0].clientX; swiping = true; }, { passive: true });
$('#gl').addEventListener('touchend', e => {
  if (!swiping) return; swiping = false;
  const dy = e.changedTouches[0].clientY - sy, dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.4) { if (dy < 0 && body.dataset.state !== 'peeled') { hold = 1; setPeeled(true); } else if (dy > 0 && body.dataset.state === 'peeled') { hold = 0; setPeeled(false); } }
}, { passive: true });

/* ---------- tooltip that follows the pointer over a card ---------- */
const tip = $('#tip');
let hoverRoom = null, px = 0, py = 0;
addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; if (hoverRoom) placeTip(); }, { passive: true });
function placeTip() { tip.style.transform = `translate(${Math.min(px + 22, innerWidth - 260)}px, ${Math.max(70, py - 96)}px)`; }
function onHover(h) {
  hoverRoom = h ? h.room : null;
  tip.classList.toggle('is-on', !!h);
  if (h) {
    $('b', tip).textContent = h.name;
    $('span', tip).textContent = h.hint;
    placeTip();
    setMega(({ origins: 'ORIGINS', day: 'YOUR DAY', inside: 'INSIDE', sessions: 'SESSIONS', shop: 'THE SHOP' })[h.room]);
  } else setMega(body.dataset.state === 'peeled' ? 'PICK A TILE' : D.flavours[flavour].mega);
}

/* ---------- rooms ---------- */
let openRoomId = null, lastFocus = null;
function fillRooms() {
  const f = D.flavours[flavour];
  $$('[data-art]').forEach(img => { img.src = f.art[img.dataset.art]; });
  $('[data-origins-title]').innerHTML = f.origins.title;
  $('[data-origins-lead]').textContent = f.origins.lead;
  $('#counters').innerHTML = f.counters.map(([n, u, l]) => `<li><b data-count="${n}">${n}</b><i>${u}</i><span>${l}</span></li>`).join('');
  $('#ingredients').innerHTML = f.ingredients.map(([n, from, does], i) => `
    <article class="ing" style="--i:${i}"><h3>${n}</h3><p class="ing__from">${from}</p><p>${does}</p></article>`).join('');
}
function openRoom(room, from) {
  const panel = $(`[data-room-panel="${room}"]`);
  if (!panel || openRoomId === room) return;
  if (openRoomId) closeRoom({ silent: true });
  lastFocus = document.activeElement;
  openRoomId = room;
  const x = from ? from.x : innerWidth / 2, y = from ? from.y : innerHeight / 2;
  panel.style.setProperty('--x', x + 'px'); panel.style.setProperty('--y', y + 'px');
  panel.hidden = false;
  void panel.offsetWidth;
  panel.classList.add('is-open');
  body.classList.add('room-open');
  panel.querySelector('.room__scroll').scrollTop = 0;
  if (location.hash !== '#' + room) history.pushState({ room }, '', '#' + room);
  setTimeout(() => { if (openRoomId === room && scene) scene.pause(true); }, reduce ? 0 : 750);
  panel.querySelector('.room__close').focus({ preventScroll: true });
  if (room === 'inside') countUp();
  if (room === 'shop') renderCrate(false);
}
function closeRoom({ silent = false } = {}) {
  if (!openRoomId) return;
  const panel = $(`[data-room-panel="${openRoomId}"]`);
  openRoomId = null;
  if (scene) { scene.pause(false); scene.returnCard(); }
  panel.classList.remove('is-open');
  body.classList.remove('room-open');
  setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, reduce ? 0 : 600);
  if (!silent && location.hash) history.pushState({}, '', location.pathname + location.search);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
addEventListener('popstate', () => {
  const r = location.hash.slice(1);
  if ($(`[data-room-panel="${r}"]`)) openRoom(r); else closeRoom({ silent: true });
});
addEventListener('keydown', e => { if (e.key === 'Escape' && openRoomId && !$('#bag').open) closeRoom(); });

/* ---------- origins: drag strip ---------- */
const strip = $('#strip');
(function dragStrip() {
  let down = false, x0 = 0, l0 = 0, moved = false;
  strip.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = strip.scrollLeft; strip.classList.add('is-drag'); });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = l0 - dx; });
  addEventListener('pointerup', () => { down = false; strip.classList.remove('is-drag'); });
  strip.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  strip.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = strip.scrollWidth - strip.clientWidth;
    if ((e.deltaY > 0 && strip.scrollLeft < max - 1) || (e.deltaY < 0 && strip.scrollLeft > 0)) { e.preventDefault(); strip.scrollLeft += e.deltaY; }
  }, { passive: false });
  strip.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); strip.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * strip.clientWidth * 0.6, behavior: reduce ? 'auto' : 'smooth' }); }
  });
})();

/* ---------- your day: the runner is the slider ---------- */
const dayRange = $('#dayRange');
const START = 360, END = 1380; // 6:00 to 23:00
let momentIdx = -1;
const fmt = min => { const h = Math.floor(min / 60), m = Math.floor(min % 60); const h12 = ((h + 11) % 12) + 1; return [`${h12}:${String(m).padStart(2, '0')}`, h < 12 ? 'am' : 'pm']; };
const SKY = [[0, [177, 88, 45]], [0.28, [133, 144, 104]], [0.55, [83, 100, 69]], [0.78, [113, 63, 45]], [1, [38, 30, 36]]];
function skyAt(k) {
  let a = SKY[0], b = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i++) if (k >= SKY[i][0] && k <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = (k - a[0]) / ((b[0] - a[0]) || 1);
  return `rgb(${a[1].map((v, j) => Math.round(v + (b[1][j] - v) * t)).join(',')})`;
}
function nearestMoment(min) { let best = 0; D.moments.forEach((m, i) => { if (Math.abs(m.at - min) < Math.abs(D.moments[best].at - min)) best = i; }); return best; }
function renderDay(snap) {
  const min = START + (END - START) * (dayRange.value / 1000);
  const i = nearestMoment(min);
  const shown = snap ? D.moments[i].at : min;
  const [t, ap] = fmt(shown);
  $('#dayClock').innerHTML = `${t}<small>${ap}</small>`;
  dayRange.style.setProperty('--v', dayRange.value / 1000);
  $('.room--day').style.backgroundColor = skyAt((shown - START) / (END - START));
  if (i !== momentIdx) {
    momentIdx = i;
    const m = D.moments[i], f = D.flavours[m.can];
    const img = $('#momentImg');
    img.classList.add('is-swap');
    const next = new Image(); next.src = m.img;
    const swap = () => { img.src = m.img; img.alt = m.alt; img.classList.remove('is-swap'); };
    (next.decode ? next.decode() : Promise.resolve()).then(swap, swap);
    $('#momentTitle').textContent = m.title;
    $('#momentBody').textContent = m.body;
    $('#momentCan').textContent = f.name;
    const add = $('#momentAdd');
    add.dataset.add = f.product; add.textContent = `Add 6 ${f.name} · ₹540`;
  }
  dayRange.setAttribute('aria-valuetext', `${t} ${ap}, ${D.moments[i].title}`);
}
dayRange.addEventListener('input', () => renderDay(false));
dayRange.addEventListener('change', () => {
  const m = D.moments[nearestMoment(START + (END - START) * (dayRange.value / 1000))];
  const target = ((m.at - START) / (END - START)) * 1000;
  if (reduce) { dayRange.value = target; renderDay(true); return; }
  const v0 = Number(dayRange.value), t0 = performance.now();
  (function anim() { const k = Math.min(1, (performance.now() - t0) / 380); dayRange.value = v0 + (target - v0) * (1 - Math.pow(1 - k, 3)); renderDay(k === 1); if (k < 1) requestAnimationFrame(anim); })();
});
dayRange.value = ((D.moments[0].at - START) / (END - START)) * 1000;
renderDay(true);

/* ---------- inside: counters roll up ---------- */
function countUp() {
  $$('#counters [data-count]').forEach((el, i) => {
    const n = Number(el.dataset.count);
    if (reduce || !n) { el.textContent = n; return; }
    const t0 = performance.now() + i * 120;
    (function step() { const k = Math.max(0, Math.min(1, (performance.now() - t0) / 900)); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })();
  });
}

/* ---------- shop: build a crate ---------- */
const crate = { size: 12, kokum: 6, cadence: 'once' };
const mix = $('#mix');
function cratePrice() { return Math.round(D.crate.sizes[crate.size] * (crate.cadence === 'once' ? 1 : 1 - D.crate.subscribeOff)); }
function renderCrate(bounce) {
  const { size, kokum, cadence } = crate;
  const guava = size - kokum, price = cratePrice();
  mix.max = size; mix.value = kokum;
  mix.style.setProperty('--v', kokum / size);
  mix.setAttribute('aria-valuetext', `${kokum} Kokum Cola, ${guava} Chili Guava`);
  $('.mix__out [data-kokum]').textContent = `${kokum} Kokum Cola`;
  $('.mix__out [data-guava]').textContent = `${guava} Chili Guava`;
  $('#cratePrice').textContent = inr(price);
  $('#cratePer').textContent = `${inr(price / size)} a can${cadence === 'once' ? '' : cadence === '2w' ? ', every 2 weeks' : ', every 4 weeks'}`;
  $('#crateAdd').textContent = `Add crate to bag · ${inr(price)}`;
  const box = $('#crateCans');
  box.style.setProperty('--cols', size === 24 ? 8 : 6);
  const imgs = $$('img', box);
  for (let i = 0; i < Math.max(size, imgs.length); i++) {
    let img = imgs[i];
    if (i >= size) { img.remove(); continue; }
    const want = i < kokum ? D.flavours.kokum.can : D.flavours.guava.can;
    if (!img) { img = document.createElement('img'); img.alt = ''; img.width = 448; img.height = 902; img.style.setProperty('--i', i); box.appendChild(img); }
    if (img.getAttribute('src') !== want) {
      img.src = want;
      if (bounce && !reduce) { img.classList.remove('is-pop'); void img.offsetWidth; img.classList.add('is-pop'); }
    }
  }
}
$$('input[name="size"]').forEach(r => r.addEventListener('change', () => { const ratio = crate.kokum / crate.size; crate.size = Number(r.value); crate.kokum = Math.round(ratio * crate.size); renderCrate(true); }));
mix.addEventListener('input', () => { crate.kokum = Number(mix.value); renderCrate(true); });
$$('input[name="cadence"]').forEach(r => r.addEventListener('change', () => { crate.cadence = r.value; renderCrate(false); }));
$('#crateAdd').addEventListener('click', () => {
  const { size, kokum, cadence } = crate;
  const every = { once: '', '2w': ', every 2 weeks', '4w': ', every 4 weeks' }[cadence];
  Bag.add({ key: `crate-${size}-${kokum}-${cadence}`, name: `Crate of ${size}`, detail: `${kokum} Kokum Cola, ${size - kokum} Chili Guava${every}`, price: cratePrice(), kind: 'crate' });
  toast(`Added · crate of ${size}`);
});
$('#shelf').innerHTML = D.products.map(p => `
  <li class="shelf__item shelf__item--${p.kind}">
    ${Bag.imgFor(p.kind) ? `<img src="${Bag.imgFor(p.kind)}" alt="" width="448" height="902" loading="lazy">` : `<img class="shelf__art" src="${p.art}" alt="" loading="lazy">`}
    <h4>${p.name}</h4><p>${p.detail}</p>
    <div class="shelf__buy"><b>${inr(p.price)}</b><button class="btn btn--ink" type="button" data-add="${p.id}" aria-label="Add ${p.name}, ${p.detail}">Add</button></div>
  </li>`).join('');

/* ---------- bag ---------- */
const bag = $('#bag');
function renderBag() {
  const lines = Bag.lines(), sub = Bag.subtotal();
  $$('[data-bag-count]').forEach(el => { el.textContent = Bag.count(); });
  $('#bagTotal').textContent = inr(sub);
  const left = D.freeShippingFrom - sub;
  $('#bagShip').textContent = !lines.length ? '' : left > 0 ? `Add ${inr(left)} more for free delivery.` : 'Free delivery on this order.';
  $('#bagList').innerHTML = lines.length ? lines.map(l => `
    <li class="bag__line${Bag.imgFor(l.kind) ? '' : ' no-img'}">
      ${Bag.imgFor(l.kind) ? `<img src="${Bag.imgFor(l.kind)}" alt="" width="48" height="96">` : ''}
      <div><b>${l.name}</b><small>${l.detail}</small>
        <span class="bag__qty"><button type="button" data-qty="${l.key}" data-step="-1" aria-label="One fewer ${l.name}">−</button><span>${l.qty}</span><button type="button" data-qty="${l.key}" data-step="1" aria-label="One more ${l.name}">+</button></span>
      </div>
      <span>${inr(l.price * l.qty)}</span>
    </li>`).join('') : '<li class="bag__empty">Your bag is empty. Peel the can and open the shop, or add a 6-pack from the front.</li>';
  $('#toCheckout').setAttribute('aria-disabled', String(!lines.length));
}
Bag.onChange(renderBag);
renderBag();
$('#toCheckout').addEventListener('click', e => { if (!Bag.count()) e.preventDefault(); });
bag.addEventListener('click', e => { if (e.target === bag) bag.close(); });
function addProduct(id) {
  const p = D.products.find(x => x.id === id);
  if (!p) return;
  Bag.add({ key: p.id, name: p.name, detail: p.detail, price: p.price, kind: p.kind });
  toast(`Added · ${p.name}`);
  if (scene && !openRoomId) scene.burst(60);
}

/* ---------- one click handler ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const room = t.closest('[data-room]');
  if (room) { const r = room.getBoundingClientRect(); openRoom(room.dataset.room, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }
  if (t.closest('[data-close-room]')) closeRoom();
  if (t.closest('[data-home]')) { e.preventDefault(); closeRoom(); if (body.dataset.state === 'peeled') { hold = 0; setPeeled(false); } }
  const add = t.closest('[data-add]'); if (add) addProduct(add.dataset.add);
  if (t.closest('[data-open-bag]')) bag.showModal();
  if (t.closest('[data-close-bag]')) bag.close();
  const q = t.closest('[data-qty]');
  if (q) { const l = Bag.lines().find(x => x.key === q.dataset.qty); if (l) Bag.setQty(l.key, l.qty + Number(q.dataset.step)); }
  const fl = t.closest('.flavours [data-flavour]');
  if (fl && fl.dataset.flavour !== flavour) { hold = 0; setPeeled(false); setFlavour(fl.dataset.flavour); }
});

/* ---------- photo credits travel with the photographs ---------- */
const credits = $('.credits').textContent.trim();
$$('.room__scroll').forEach(el => { const p = document.createElement('p'); p.className = 'room-credits'; p.textContent = credits; el.appendChild(p); });

/* ---------- start ---------- */
setFlavour(flavour, { fromInit: true });
setMega(D.flavours[flavour].mega);
renderCrate(false);

(async function start() {
  const test = document.createElement('canvas');
  const ok = !!(test.getContext('webgl2') || test.getContext('webgl'));
  if (!ok) { body.classList.add('no-gl'); return; }
  try {
    const { createScene } = await import('./scene.js');
    scene = await createScene($('#gl'), { flavour });
    scene.on('hover', onHover);
    scene.on('open', ({ room, from }) => openRoom(room, from));
    scene.on('peel', v => { if (v.dragStart) body.classList.add('has-dragged'); });
    body.classList.add('gl-ready');
  } catch (err) {
    console.error(err);
    body.classList.add('no-gl');
  }
  const r = location.hash.slice(1);
  if ($(`[data-room-panel="${r}"]`)) openRoom(r);
})();
