/* KYOR — chapters, dial navigation, interactions, storefront & bag. */
(function () {
  const D = window.KYOR;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEV = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const dev = n => String(n).padStart(2, '0').split('').map(d => DEV[d]).join('');
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  const state = {
    scene: 0,
    flavour: store.get('kyor-flavour', 'kokum'),
    cart: store.get('kyor-cart', []),
    sub: store.get('kyor-sub', false),
    busy: false
  };
  const fl = () => D.flavours[state.flavour];
  window.KyorState = state;

  /* ---------------- toast & cursor ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
  }
  window.KyorToast = toast;

  if (matchMedia('(pointer: fine)').matches && !reduce) {
    const c = $('#cursor'), lab = $('#cursorLabel');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      const h = e.target.closest('[data-cursor], button, a, input, label, select');
      c.classList.toggle('is-hover', !!h);
      lab.textContent = h && h.dataset.cursor ? h.dataset.cursor : '';
      c.classList.toggle('has-label', !!(h && h.dataset.cursor));
    });
    (function tick() { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); })();
    document.body.classList.add('has-cursor');
  }

  /* ---------------- intro: press & hold to crack ---------------- */
  function initIntro() {
    const intro = $('#intro');
    if (sessionStorage.getItem('kyor-opened') || reduce) { intro.remove(); document.body.classList.add('is-open'); return; }
    const tab = $('#introTab'), ring = $('.intro__ring'), fizz = $('#introFizz');
    let p = 0, holding = false, raf;
    const C = 729;
    function open() {
      sessionStorage.setItem('kyor-opened', '1');
      intro.classList.add('is-cracked');
      for (let i = 0; i < 40; i++) {
        const b = document.createElement('i');
        b.style.cssText = `--x:${Math.random() * 100}%;--s:${4 + Math.random() * 14}px;--d:${0.6 + Math.random() * 1.2}s;--delay:${Math.random() * 0.4}s`;
        fizz.appendChild(b);
      }
      setTimeout(() => { intro.classList.add('is-gone'); document.body.classList.add('is-open'); }, 900);
      setTimeout(() => intro.remove(), 1800);
    }
    function step() {
      p += holding ? 0.022 : -0.04; p = Math.max(0, Math.min(1, p));
      ring.style.strokeDashoffset = C * (1 - p);
      tab.style.setProperty('--p', p);
      if (p >= 1) return open();
      if (holding || p > 0) raf = requestAnimationFrame(step);
    }
    const start = e => { e.preventDefault(); holding = true; cancelAnimationFrame(raf); step(); };
    const stop = () => { holding = false; };
    tab.addEventListener('pointerdown', start);
    addEventListener('pointerup', stop);
    tab.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !holding) start(e); });
    tab.addEventListener('keyup', stop);
    $('#introSkip').addEventListener('click', open);
    tab.focus({ preventScroll: true });
  }

  /* ---------------- flavour ---------------- */
  const spinners = [];
  function setFlavour(id, silent) {
    state.flavour = id; store.set('kyor-flavour', id);
    document.documentElement.dataset.flavour = id;
    $('meta[name=theme-color]').setAttribute('content', id === 'kokum' ? '#a9553a' : '#5d6a4c');
    $$('.flavour-switch [role=radio]').forEach(b => b.setAttribute('aria-checked', b.dataset.flavour === id));
    renderHero(); renderFarm(); renderInside(); renderRouteToken();
    spinners.forEach(s => { s.render(); s.nudge(silent ? 0 : 14); });
    $$('.can-spin').forEach(el => { el.classList.remove('is-flip'); void el.offsetWidth; if (!silent) el.classList.add('is-flip'); });
  }

  /* ---------------- 01 home ---------------- */
  function renderHero() {
    const f = fl();
    $('#heroEyebrow').textContent = `Flavour ${f.index} — ${f.hi}`;
    $('#heroNotes').textContent = f.notes;
    $('#heroStamps').innerHTML = f.stamps.map((s, i) => `<li style="--r:${[-6, 4, -3, 7][i]}deg"><span>${s}</span></li>`).join('');
    $('#heroPrice').textContent = inr(540);
    const words = f.ticker.concat(f.ticker);
    $('#ticker').innerHTML = words.concat(words).map(w => `<span>${w}</span><b>✺</b>`).join('');
  }

  /* ---------------- 02 farm → stomach ---------------- */
  let stop = 0;
  const icons = [
    '<path d="M60 150 V100"/><path d="M60 112 C40 112 30 96 30 80 C50 80 60 92 60 112Z"/><path d="M60 100 C80 100 92 84 92 66 C70 66 60 80 60 100Z"/><path d="M10 150 H110"/><path d="M20 162 H100" stroke-dasharray="4 6"/>',
    '<path d="M30 120 C30 90 90 90 90 120 L84 156 H36Z"/><path d="M30 120 H90"/><circle cx="48" cy="104" r="12"/><circle cx="70" cy="98" r="14"/><path d="M40 80 Q60 50 80 80"/>',
    '<circle cx="60" cy="90" r="24"/>' + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${60 + Math.cos(a) * 34} ${90 + Math.sin(a) * 34} L${60 + Math.cos(a) * 48} ${90 + Math.sin(a) * 48}"/>`; }).join('') + '<path d="M14 156 H106"/><path d="M24 146 H96"/>',
    '<path d="M36 60 H84 V70 C96 80 96 90 96 100 V150 C96 158 90 162 84 162 H36 C30 162 24 158 24 150 V100 C24 90 24 80 36 70Z"/><circle cx="50" cy="130" r="5"/><circle cx="68" cy="112" r="7"/><circle cx="58" cy="94" r="4"/><circle cx="74" cy="140" r="4"/>',
    '<path d="M36 50 H84 L90 64 V150 L84 164 H36 L30 150 V64Z"/><path d="M30 64 H90"/><path d="M30 150 H90"/><path d="M42 96 H78"/><path d="M42 110 H70"/><ellipse cx="60" cy="50" rx="24" ry="4"/>',
    '<path d="M40 50 C20 60 20 90 40 98 C60 106 90 100 92 120 C94 140 70 150 54 146 C40 142 36 130 46 124"/><path d="M40 50 C50 44 70 44 76 54"/><circle cx="60" cy="80" r="3"/><circle cx="72" cy="128" r="3"/><circle cx="48" cy="112" r="3"/>'
  ];
  function renderFarm() {
    const f = fl(), s = f.farm[stop];
    $('#farmCard').innerHTML = `
      <span class="farm__num">${dev(stop + 1)}</span>
      <p class="mono eyebrow">Stop ${String(stop + 1).padStart(2, '0')} / 06 · ${f.origin}</p>
      <h3 class="farm__title"><span class="hi">${s.hi}</span> ${s.t}</h3>
      <p class="farm__desc">${s.d}</p>
      <div class="farm__stat"><b>${s.stat}</b><span class="mono">${s.statL}</span></div>`;
    $('#farmArt').innerHTML = `<svg viewBox="0 0 120 180" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${icons[stop]}</svg><span class="farm__ghost">${s.hi}</span>`;
    $('#farmBg').style.setProperty('--p', stop / 5);
    $$('.route__stop').forEach((b, i) => { b.classList.toggle('is-active', i === stop); b.classList.toggle('is-past', i < stop); b.querySelector('.route__lab').textContent = f.farm[i].t; });
    const tok = $('#routeToken'); tok.setAttribute('aria-valuenow', stop + 1); tok.setAttribute('aria-valuetext', s.t);
  }
  function renderRouteToken() { $('#routeToken span').textContent = state.flavour === 'kokum' ? 'K' : 'G'; }
  function initFarm() {
    const stopsEl = $('#routeStops');
    stopsEl.innerHTML = D.flavours.kokum.farm.map((s, i) => `<button class="route__stop" data-stop="${i}" style="--x:${i / 5}"><i></i><span class="route__lab"></span></button>`).join('');
    const route = $('#route'), tok = $('#routeToken');
    let dragging = false;
    const setTok = (p, snap) => { tok.style.setProperty('--x', p); if (snap) tok.classList.add('is-snap'); else tok.classList.remove('is-snap'); };
    const go = i => { stop = Math.max(0, Math.min(5, i)); setTok(stop / 5, true); renderFarm(); };
    stopsEl.addEventListener('click', e => { const b = e.target.closest('.route__stop'); if (b) go(+b.dataset.stop); });
    const rel = e => { const r = stopsEl.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
    tok.addEventListener('pointerdown', e => { dragging = true; tok.setPointerCapture(e.pointerId); tok.classList.add('is-drag'); });
    tok.addEventListener('pointermove', e => {
      if (!dragging) return;
      const p = rel(e); setTok(p, false);
      const i = Math.round(p * 5); if (i !== stop) { stop = i; renderFarm(); }
    });
    const end = () => { if (!dragging) return; dragging = false; tok.classList.remove('is-drag'); go(stop); };
    tok.addEventListener('pointerup', end); tok.addEventListener('pointercancel', end);
    tok.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); go(stop + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); go(stop - 1); }
    });
    route.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
    go(0);
  }

  /* ---------------- 03 day sundial ---------------- */
  let dialRot = 0, momentI = 0;
  const hourToDeg = h => h / 24 * 360;
  function skyFor(h) {
    const stops = [[0, '#1d2230', '#3a2f3f'], [5.5, '#4b3b4a', '#c47b5a'], [7.5, '#c99b72', '#e8d6b4'], [12, '#cdbf9d', '#e9e0c9'], [17, '#c27a4f', '#e1b07c'], [19.5, '#5a3a45', '#a5573e'], [21.5, '#22263a', '#4a3346'], [24, '#1d2230', '#3a2f3f']];
    let a = stops[0], b = stops[1];
    for (let i = 0; i < stops.length - 1; i++) if (h >= stops[i][0] && h <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
    const t = (h - a[0]) / ((b[0] - a[0]) || 1);
    const mix = (c1, c2) => { const p = x => [1, 3, 5].map(j => parseInt(x.substr(j, 2), 16)); const A = p(c1), B = p(c2); return `rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * t)).join(',')})`; };
    return [mix(a[1], b[1]), mix(a[2], b[2]), h < 6 || h > 20.5];
  }
  function initDay() {
    const ring = $('#dialRing');
    let s = '';
    for (let i = 0; i < 96; i++) {
      const a = i / 96 * Math.PI * 2, big = i % 4 === 0, r1 = 188, r2 = big ? 172 : 180;
      s += `<line x1="${Math.sin(a) * r1}" y1="${-Math.cos(a) * r1}" x2="${Math.sin(a) * r2}" y2="${-Math.cos(a) * r2}" stroke="#2b2012" stroke-opacity="${big ? .7 : .35}" stroke-width="${big ? 2 : 1}"/>`;
      if (big && (i / 4) % 3 === 0) { const h = i / 4; s += `<text x="${Math.sin(a) * 156}" y="${-Math.cos(a) * 156 + 5}" text-anchor="middle" font-family="Martian Mono" font-size="12" fill="#2b2012">${String(h).padStart(2, '0')}</text>`; }
    }
    D.moments.forEach((m, i) => {
      const a = hourToDeg(m.h) * Math.PI / 180;
      s += `<g class="dial-moment" data-i="${i}" transform="translate(${Math.sin(a) * 136} ${-Math.cos(a) * 136})"><circle r="11" /><text y="4" text-anchor="middle" font-family="Martian Mono" font-size="10">${i + 1}</text></g>`;
    });
    ring.innerHTML = s;

    const dial = $('#sundial');
    let dragging = false, startA = 0, startRot = 0, moved = false;
    const ang = e => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; };
    dial.addEventListener('pointerdown', e => { dragging = true; moved = false; startA = ang(e); startRot = dialRot; dial.setPointerCapture(e.pointerId); dial.classList.add('is-drag'); });
    dial.addEventListener('pointermove', e => {
      if (!dragging) return;
      let d = ang(e) - startA; if (d > 180) d -= 360; if (d < -180) d += 360;
      if (Math.abs(d) > 2) moved = true;
      dialRot = startRot + d; startA = ang(e); startRot = dialRot; updateDial(false);
    });
    const end = e => {
      if (!dragging) return; dragging = false; dial.classList.remove('is-drag');
      if (!moved) { const m = e.target.closest('.dial-moment'); if (m) return setMoment(+m.dataset.i); }
      setMoment(nearestMoment());
    };
    dial.addEventListener('pointerup', end); dial.addEventListener('pointercancel', end);
    dial.tabIndex = 0; dial.setAttribute('role', 'slider'); dial.setAttribute('aria-label', 'Time of day'); dial.setAttribute('aria-valuemin', 1); dial.setAttribute('aria-valuemax', 6);
    dial.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); setMoment((momentI + 1) % 6); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); setMoment((momentI + 5) % 6); }
    });
    setMoment(0);
  }
  const curHour = () => (((-dialRot % 360) + 360) % 360) / 360 * 24;
  function nearestMoment() {
    const h = curHour(); let best = 0, bd = 99;
    D.moments.forEach((m, i) => { let d = Math.abs(m.h - h); d = Math.min(d, 24 - d); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function updateDial(snap) {
    const ring = $('#dialRing');
    ring.style.transition = snap && !reduce ? 'transform .7s cubic-bezier(.2,.9,.2,1.1)' : 'none';
    ring.setAttribute('transform', `rotate(${dialRot})`);
    ring.style.transform = `rotate(${dialRot}deg)`;
    $$('.dial-moment', ring).forEach(g => { g.style.transform = ''; g.querySelector('text').setAttribute('transform', `rotate(${-dialRot})`); });
    const h = curHour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 5) * 5;
    $('#dialTime').textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const [top, bottom, night] = skyFor(h);
    const sky = $('#daySky'); sky.style.setProperty('--sky-a', top); sky.style.setProperty('--sky-b', bottom);
    $('.scene--day').classList.toggle('is-night', night);
  }
  function setMoment(i) {
    momentI = i;
    const target = -hourToDeg(D.moments[i].h);
    let d = target - dialRot; d = ((d % 360) + 540) % 360 - 180; dialRot += d;
    updateDial(true);
    const m = D.moments[i], f = D.flavours[m.f];
    $('#dialLabel').textContent = m.label;
    $('#sundial').setAttribute('aria-valuenow', i + 1); $('#sundial').setAttribute('aria-valuetext', m.label);
    $$('.dial-moment').forEach(g => g.classList.toggle('is-on', +g.dataset.i === i));
    $('#moment').innerHTML = `
      <p class="mono eyebrow">${String(i + 1).padStart(2, '0')} / 06 · ${m.who}</p>
      <h3 class="moment__title">${m.t}</h3>
      <p class="moment__desc">${m.d}</p>
      <div class="moment__pick">
        <div class="moment__can">${KyorCan.canSVG(f, { offset: 5 })}</div>
        <div><span class="mono small">Pairs with</span><b>${f.name}</b><button class="btn btn--metal btn--sm" data-add="${m.f === 'kokum' ? 'kk6' : 'cg6'}">Add 6 · ${inr(540)}</button></div>
      </div>
      <div class="moment__nav"><button class="icon-btn" data-moment="${(i + 5) % 6}" aria-label="Earlier">←</button><button class="icon-btn" data-moment="${(i + 1) % 6}" aria-label="Later">→</button></div>`;
  }

  /* ---------------- 04 inside ---------------- */
  let ingI = 0;
  function renderInside() {
    const f = fl();
    $('#ingredients').innerHTML = f.ingredients.map((g, i) => `
      <button class="ing ${i === ingI ? 'is-open' : ''}" data-ing="${i}" aria-expanded="${i === ingI}">
        <span class="ing__no mono">${String(i + 1).padStart(2, '0')}</span>
        <span class="ing__hi">${g.hi}</span>
        <span class="ing__n">${g.n}</span>
        <span class="ing__more"><span class="mono small">${g.o}</span><span>${g.w}</span></span>
      </button>`).join('');
    $('#ticket').innerHTML = `
      <p class="mono ticket__head">Nutrition · per 350 ml can</p>
      <dl>${f.nutrition.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <p class="mono small ticket__foot">FSSAI-compliant · Vegan · Gluten-free · Traditional ingredients. Not medical advice — just good soda.</p>
      <div class="ticket__barcode" aria-hidden="true"></div>`;
  }

  /* ---------------- 05 adda deck ---------------- */
  let order = D.deck.map((_, i) => i);
  function cardHTML(c) {
    if (c.type === 'img') return `<figure class="card card--img"><img src="${c.src}" alt="${c.t}" draggable="false" loading="lazy"><figcaption><span class="mono">${c.k}</span><b>${c.t}</b><small>${c.d}</small></figcaption></figure>`;
    if (c.type === 'list') return `<div class="card card--${c.tone}"><span class="mono card__k">${c.k}</span><h4>${c.t}</h4><ol>${c.items.map(x => `<li class="mono">${x}</li>`).join('')}</ol><p>${c.d}</p></div>`;
    return `<div class="card card--${c.tone}"><span class="mono card__k">${c.k}</span><h4>${c.t}</h4><p>${c.d}</p><span class="card__seal">क्योर</span></div>`;
  }
  function renderDeck() {
    const deck = $('#deck');
    deck.innerHTML = order.slice(0, 5).reverse().map((ci, k, arr) => {
      const depth = arr.length - 1 - k;
      return `<div class="deck__slot" data-depth="${depth}" style="--d:${depth};--r:${[0, -4, 5, -7, 3][depth]}deg">${cardHTML(D.deck[ci])}</div>`;
    }).join('');
    $('#deckCount').textContent = `${String(order[0] + 1).padStart(2, '0')} / ${String(D.deck.length).padStart(2, '0')}`;
    bindTop();
  }
  function fling(dir) {
    const top = $('#deck .deck__slot[data-depth="0"]'); if (!top) return;
    top.style.transition = reduce ? 'none' : 'transform .45s cubic-bezier(.3,.6,.3,1), opacity .45s';
    top.style.transform = `translate(${dir * 130}%, -10%) rotate(${dir * 28}deg)`; top.style.opacity = 0;
    setTimeout(() => { order.push(order.shift()); renderDeck(); }, reduce ? 0 : 380);
  }
  function unfling() { order.unshift(order.pop()); renderDeck(); }
  function bindTop() {
    const top = $('#deck .deck__slot[data-depth="0"]'); if (!top) return;
    top.dataset.cursor = 'Fling';
    let sx = 0, sy = 0, dx = 0, dy = 0, on = false;
    top.addEventListener('pointerdown', e => { on = true; sx = e.clientX; sy = e.clientY; top.setPointerCapture(e.pointerId); top.style.transition = 'none'; });
    top.addEventListener('pointermove', e => { if (!on) return; dx = e.clientX - sx; dy = e.clientY - sy; top.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`; });
    const end = () => {
      if (!on) return; on = false;
      if (Math.abs(dx) > 90) fling(Math.sign(dx));
      else if (Math.abs(dx) < 4 && Math.abs(dy) < 4) fling(1);
      else { top.style.transition = 'transform .4s cubic-bezier(.2,1.4,.4,1)'; top.style.transform = ''; }
      dx = dy = 0;
    };
    top.addEventListener('pointerup', end); top.addEventListener('pointercancel', end);
  }

  /* ---------------- 06 shop ---------------- */
  let filter = 'all';
  const priceOf = p => state.sub && p.cat !== 'merch' ? Math.round(p.price * 0.85) : p.price;
  function renderShop() {
    const list = D.products.filter(p => filter === 'all' || p.cat === filter);
    $('#shelf').innerHTML = list.map((p, i) => `
      <article class="product product--${p.cat}" style="--i:${i}">
        ${p.tag ? `<span class="product__tag mono">${p.tag}</span>` : ''}
        <div class="product__art">${KyorCan.miniArt(p.art, D.flavours)}</div>
        <div class="product__info">
          <h3>${p.name}</h3>
          <p class="mono small">${p.pack}</p>
          <div class="product__buy">
            <span class="price">${priceOf(p) !== p.price ? `<s>${inr(p.price)}</s>` : ''}${inr(priceOf(p))}</span>
            <button class="btn btn--metal btn--sm" data-add="${p.id}" aria-label="Add ${p.name} ${p.pack} to bag">Add +</button>
          </div>
        </div>
      </article>`).join('') + `<article class="product product--note"><p class="mono eyebrow">Delivery</p><h3>Free over ₹999.</h3><p>Pan-India in 3–5 days. Next-day in Mumbai, Pune, Bengaluru &amp; Delhi NCR. Every crate ships plastic-free.</p></article>`;
  }

  /* ---------------- bag ---------------- */
  const FREE = 999;
  function saveCart() { store.set('kyor-cart', state.cart); renderBag(); }
  function addToBag(id, qty = 1) {
    const p = D.products.find(x => x.id === id); if (!p) return;
    const line = state.cart.find(l => l.id === id);
    if (line) line.qty += qty; else state.cart.push({ id, qty });
    saveCart();
    const btn = $('#bagBtn'); btn.classList.remove('is-bump'); void btn.offsetWidth; btn.classList.add('is-bump');
    toast(`${p.name} · ${p.pack} added to thaila`);
  }
  function cartTotals() {
    const lines = state.cart.map(l => { const p = D.products.find(x => x.id === l.id); return p && { ...l, p, unit: priceOf(p), total: priceOf(p) * l.qty }; }).filter(Boolean);
    return { lines, subtotal: lines.reduce((s, l) => s + l.total, 0), count: lines.reduce((s, l) => s + l.qty, 0) };
  }
  function renderBag() {
    const { lines, subtotal, count } = cartTotals();
    $('#bagCount').textContent = count;
    $('#bagSubtotal').textContent = inr(subtotal);
    const left = FREE - subtotal;
    $('#bagShip').innerHTML = `<p class="mono small">${left > 0 ? `${inr(left)} away from free delivery` : 'Free delivery unlocked ✺'}</p><div class="meter"><i style="width:${Math.min(100, subtotal / FREE * 100)}%"></i></div>`;
    $('#bagList').innerHTML = lines.length ? lines.map(l => `
      <li class="bag-line">
        <div class="bag-line__art">${KyorCan.miniArt(l.p.art.kind === 'cans' ? { kind: 'cans', f: [l.p.art.f[0]] } : l.p.art, D.flavours)}</div>
        <div class="bag-line__info"><b>${l.p.name}</b><span class="mono small">${l.p.pack}${state.sub && l.p.cat !== 'merch' ? ' · subscribed' : ''}</span>
          <div class="qty"><button data-qty="${l.id}" data-d="-1" aria-label="Decrease">−</button><span>${l.qty}</span><button data-qty="${l.id}" data-d="1" aria-label="Increase">+</button></div>
        </div>
        <span class="bag-line__price">${inr(l.total)}</span>
      </li>`).join('') : `<li class="bag-empty"><span class="hi">ख़ाली</span><p>Your thaila is empty. The Dukaan is one twist of the dial away.</p><button class="btn btn--ghost" data-go="5" data-close-bag>Go to the Dukaan</button></li>`;
    $('#toCheckout').disabled = !lines.length;
  }
  function openBag(on) {
    $('#bag').classList.toggle('is-open', on); $('#scrim').classList.toggle('is-on', on);
    $('#bag').setAttribute('aria-hidden', !on);
    if (on) setTimeout(() => $('#bagClose').focus(), 50);
  }
  window.KyorBag = { cartTotals, clear() { state.cart = []; saveCart(); }, openBag, inr, priceOf };

  /* ---------------- navigation: the dial ---------------- */
  const N = D.chapters.length;
  const STEP = 26;
  function initDialNav() {
    $('#dialNav').innerHTML = D.chapters.map((c, i) => `<button class="dial__label" data-go="${i}" style="--a:${i * STEP}deg"><span class="dial__no mono">${String(i + 1).padStart(2, '0')}</span><span class="dial__hi">${c.hi}</span><span class="dial__en mono">${c.short}</span></button>`).join('') +
      Array.from({ length: 72 }, (_, i) => `<i class="dial__tick" style="--a:${i * 5 - 50}deg"></i>`).join('');
    const body = $('.dial__body');
    let sx = 0, on = false, base = 0, moved = false;
    body.addEventListener('pointerdown', e => { on = true; moved = false; sx = e.clientX; base = state.scene; });
    addEventListener('pointermove', e => {
      if (!on) return; const dx = e.clientX - sx;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) $('#dialNav').style.transform = `rotate(${-(base * STEP) + dx / 4}deg)`;
    });
    addEventListener('pointerup', e => {
      if (!on) return; on = false;
      if (!moved) return;
      const dx = e.clientX - sx;
      const target = Math.max(0, Math.min(N - 1, Math.round(base - dx / 4 / STEP)));
      body.dataset.justDragged = '1'; setTimeout(() => delete body.dataset.justDragged, 50);
      if (target !== state.scene) go(target); else $('#dialNav').style.transform = `rotate(${-state.scene * STEP}deg)`;
    });
  }
  function go(i, instant) {
    i = Math.max(0, Math.min(N - 1, i));
    if (state.busy || (i === state.scene && !instant)) return;
    const from = $(`.scene[data-scene="${state.scene}"]`), to = $(`.scene[data-scene="${i}"]`);
    const dir = i > state.scene ? 1 : -1;
    state.scene = i;
    $('#dialNav').style.transform = `rotate(${-i * STEP}deg)`;
    $$('.dial__label').forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-current', k === i ? 'page' : 'false'); });
    $('#chapterNum').textContent = dev(i + 1);
    $('#chapterOf').textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    document.body.dataset.scene = i;
    history.replaceState(null, '', '#' + D.chapters[i].short.toLowerCase());
    if (instant || reduce || !from) { if (from) from.classList.remove('is-active'); to.classList.add('is-active'); return; }
    state.busy = true;
    const sh = $('#shutter');
    $('#shutterHi').textContent = D.chapters[i].hi; $('#shutterEn').textContent = D.chapters[i].en;
    sh.dataset.dir = dir; sh.classList.remove('is-out'); sh.classList.add('is-in');
    setTimeout(() => {
      from.classList.remove('is-active'); to.classList.add('is-active');
      to.scrollTop = 0;
      sh.classList.remove('is-in'); sh.classList.add('is-out');
    }, 520);
    setTimeout(() => { sh.classList.remove('is-out'); state.busy = false; }, 1100);
  }
  window.KyorGo = go;

  function scrollableAncestor(el, dy) {
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2) {
        if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) return el;
        if (dy < 0 && el.scrollTop > 2) return el;
      }
      el = el.parentElement;
    }
    return null;
  }
  function initInputs() {
    let acc = 0, lock = 0;
    addEventListener('wheel', e => {
      if (document.body.classList.contains('is-checkout') || $('#bag').classList.contains('is-open')) return;
      if (scrollableAncestor(e.target, e.deltaY)) return;
      const now = Date.now(); if (now < lock) return;
      acc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(acc) > 60) { go(state.scene + Math.sign(acc)); acc = 0; lock = now + 1200; }
    }, { passive: true });

    let tx = 0, ty = 0, tOn = false;
    addEventListener('touchstart', e => {
      if (e.target.closest('[data-drag], input, .bag, .checkout')) { tOn = false; return; }
      tOn = true; tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    addEventListener('touchend', e => {
      if (!tOn) return; tOn = false;
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(state.scene + (dx < 0 ? 1 : -1));
    }, { passive: true });

    addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select') || document.body.classList.contains('is-checkout')) return;
      if (e.key === 'Escape') openBag(false);
      if ($('#bag').classList.contains('is-open')) return;
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(state.scene + 1); }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(state.scene - 1); }
      if (/^[1-6]$/.test(e.key)) go(+e.key - 1);
    });

    document.addEventListener('click', e => {
      const t = e.target;
      const g = t.closest('[data-go]');
      if (g && !($('.dial__body').dataset.justDragged && g.closest('.dial'))) { if (g.hasAttribute('data-close-bag')) openBag(false); go(+g.dataset.go); }
      const add = t.closest('[data-add]'); if (add) addToBag(add.dataset.add);
      if (t.closest('[data-quick-add]')) addToBag(state.flavour === 'kokum' ? 'kk6' : 'cg6');
      const fb = t.closest('.flavour-switch [data-flavour]'); if (fb && fb.dataset.flavour !== state.flavour) setFlavour(fb.dataset.flavour);
      const mo = t.closest('[data-moment]'); if (mo) setMoment(+mo.dataset.moment);
      const ing = t.closest('[data-ing]'); if (ing) { ingI = +ing.dataset.ing; renderInside(); }
      const fil = t.closest('[data-filter]');
      if (fil) { filter = fil.dataset.filter; $$('#shopFilters button').forEach(b => b.setAttribute('aria-selected', b === fil)); renderShop(); }
      const q = t.closest('[data-qty]');
      if (q) { const l = state.cart.find(x => x.id === q.dataset.qty); l.qty += +q.dataset.d; if (l.qty <= 0) state.cart = state.cart.filter(x => x !== l); saveCart(); }
    });
    $('#navPrev').onclick = () => go(state.scene - 1);
    $('#navNext').onclick = () => go(state.scene + 1);
    $('#bagBtn').onclick = () => openBag(true);
    $('#bagClose').onclick = () => openBag(false);
    $('#scrim').onclick = () => openBag(false);
    $('#deckNext').onclick = () => fling(1);
    $('#deckPrev').onclick = unfling;
    $('#subToggle').checked = state.sub;
    $('#subToggle').onchange = e => { state.sub = e.target.checked; store.set('kyor-sub', state.sub); renderShop(); renderBag(); toast(state.sub ? 'Subscription on — 15% off all cans' : 'One-time purchase'); };
  }

  /* ---------------- boot ---------------- */
  document.documentElement.dataset.flavour = state.flavour;
  initIntro();
  spinners.push(KyorCan.makeSpinnable($('#heroCan'), fl));
  spinners.push(KyorCan.makeSpinnable($('#insideCan'), fl));
  initDialNav(); initFarm(); initDay(); renderDeck(); renderShop(); renderBag(); initInputs();
  setFlavour(state.flavour, true);
  const hash = location.hash.slice(1);
  const start = D.chapters.findIndex(c => c.short.toLowerCase() === hash);
  $$('.scene').forEach(s => s.classList.remove('is-active'));
  state.scene = -1; go(start >= 0 ? start : 0, true);
  if (hash === 'checkout') setTimeout(() => window.KyorCheckout && KyorCheckout.open(), 0);
})();
