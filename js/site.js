/* KYOR home page: flavour switch, held scene, origins row, the day index, crate builder, bag. */
(function () {
  const D = window.KYOR;
  const Bag = window.KyorBag;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const inr = Bag.inr;

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  }

  /* ---------- bag ---------- */
  const bag = $('#bag');
  function renderBag() {
    const lines = Bag.lines();
    const sub = Bag.subtotal();
    $$('[data-bag-count]').forEach(el => { el.textContent = Bag.count(); });
    $('#bagTotal').textContent = inr(sub);
    const left = D.freeShippingFrom - sub;
    $('#bagShip').innerHTML = !lines.length ? '' : left > 0
      ? `Add <b>${inr(left)}</b> more for free delivery.`
      : '<b>Free delivery</b> on this order.';
    const list = $('#bagList');
    if (!lines.length) {
      list.innerHTML = `<li class="bag__empty"><p>Your bag is empty. Start with a crate, or a 6-pack of either flavour.</p><p style="margin-top:16px"><a class="link" href="#shop" data-close-bag>Build a crate</a></p></li>`;
    } else {
      list.innerHTML = lines.map(l => `
        <li class="bag__line${Bag.imgFor(l.kind) ? '' : ' no-img'}">
          ${Bag.imgFor(l.kind) ? `<img src="${Bag.imgFor(l.kind)}" alt="" width="56" height="72">` : ''}
          <div>
            <b>${l.name}</b><small>${l.detail}</small>
            <div class="bag__qty">
              <button type="button" data-qty="${l.key}" data-step="-1" aria-label="One fewer ${l.name}">−</button>
              <span aria-label="Quantity">${l.qty}</span>
              <button type="button" data-qty="${l.key}" data-step="1" aria-label="One more ${l.name}">+</button>
            </div>
          </div>
          <span>${inr(l.price * l.qty)}</span>
        </li>`).join('');
    }
    const go = $('#toCheckout');
    go.setAttribute('aria-disabled', String(!lines.length));
  }
  Bag.onChange(renderBag);
  renderBag();

  function openBag() {
    if (typeof bag.showModal === 'function') bag.showModal(); else bag.setAttribute('open', '');
  }
  function closeBag() {
    if (typeof bag.close === 'function') bag.close(); else bag.removeAttribute('open');
  }
  bag.addEventListener('click', e => { if (e.target === bag) closeBag(); });
  $('#toCheckout').addEventListener('click', e => { if (!Bag.count()) e.preventDefault(); });

  function addProduct(id) {
    const p = D.products.find(x => x.id === id);
    if (!p) return;
    Bag.add({ key: p.id, name: p.name, detail: p.detail, price: p.price, kind: p.kind });
    toast(`${p.name}, ${p.detail.toLowerCase()}, is in your bag`);
  }

  /* ---------- product list ---------- */
  $('#productList').innerHTML = D.products.map(p => `
    <li>
      <b>${p.name}</b>
      <span>${p.detail}</span>
      <span class="price">${inr(p.price)}</span>
      <button class="btn" type="button" data-add="${p.id}" aria-label="Add ${p.name}, ${p.detail}">Add</button>
    </li>`).join('');

  /* ---------- flavour switch (hero) ---------- */
  const hero = $('#top');
  function setFlavour(id) {
    const f = D.flavours[id];
    document.documentElement.dataset.flavour = id;
    hero.dataset.field = f.field;
    $$('[data-hero-line]').forEach((el, i) => { el.textContent = f.lines[i]; });
    $('#heroLine').textContent = f.line;
    const add = $('#heroAdd');
    add.dataset.add = id === 'kokum' ? 'kk6' : 'cg6';
    $$('.switch [data-flavour]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.flavour === id)));
    $$('.hero__img').forEach(img => {
      const on = img.dataset.can === id;
      if (on) { img.classList.remove('is-leaving'); img.classList.add('is-on'); }
      else if (img.classList.contains('is-on')) { img.classList.remove('is-on'); img.classList.add('is-leaving'); }
    });
    if (!reduce.matches) {
      $$('.hero__word').forEach(w => { w.style.animation = 'none'; void w.offsetWidth; w.style.animation = ''; });
    }
    try { localStorage.setItem('kyor-flavour', id); } catch (e) { /* fine */ }
    updateBar();
  }

  /* ---------- the bar follows the field beneath it ---------- */
  const bar = $('#bar');
  const meta = $('meta[name="theme-color"]');
  const fieldColour = { kokum: '#4e1525', guava: '#eaa79c', chilli: '#a4261c', sage: '#9ca48c', ground: '#e6e4df' };
  const blocks = $$('main > section, body > footer');
  const scene = $('#inside');
  const steps = $$('.step', scene);
  let sceneLive = false;
  let sceneField = steps[0].dataset.field;

  function fieldAt(y) {
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        if (el === scene) {
          if (sceneLive) return sceneField;
          for (const s of steps) { const sr = s.getBoundingClientRect(); if (sr.top <= y && sr.bottom > y) return s.dataset.field; }
        }
        return el.dataset.field;
      }
    }
    return 'ground';
  }
  function updateBar() {
    const f = fieldAt(bar.offsetHeight / 2);
    if (bar.dataset.field !== f) {
      bar.dataset.field = f;
      meta.setAttribute('content', fieldColour[f] || '#e6e4df');
    }
  }

  /* ---------- held scene: the can stays, the field wipes up ---------- */
  function sceneSetup() {
    sceneLive = !reduce.matches;
    scene.classList.toggle('is-live', sceneLive);
    scene.style.setProperty('--n', steps.length);
    if (!sceneLive) steps.forEach(s => { s.style.removeProperty('--clip'); s.style.removeProperty('--lift'); s.style.removeProperty('--can'); });
  }
  function sceneUpdate() {
    if (!sceneLive) return;
    const r = scene.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = clamp(-r.top / total, 0, 1);
    const x = p * (steps.length - 1);
    let active = 0;
    steps.forEach((s, i) => {
      if (i === 0) return;
      const t = clamp((x - (i - 1) - 0.25) / 0.6, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      s.style.setProperty('--clip', ((1 - e) * 100).toFixed(2) + '%');
      s.style.setProperty('--lift', ((1 - e) * 56).toFixed(1) + 'px');
      s.style.setProperty('--can', ((1 - e) * 90).toFixed(1) + 'px');
      if (t > 0.5) active = i;
    });
    sceneField = steps[active].dataset.field;
  }

  /* ---------- scroll-linked picture ---------- */
  const zoomPic = $('.sessions__pic');
  function zoomUpdate() {
    if (reduce.matches || !zoomPic) return;
    const r = zoomPic.getBoundingClientRect();
    const t = clamp(1 - (r.top + r.height) / (innerHeight + r.height), 0, 1);
    zoomPic.style.setProperty('--zoom', (1 + t * 0.08).toFixed(4));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sceneUpdate(); updateBar(); zoomUpdate(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  reduce.addEventListener('change', () => { sceneSetup(); onScroll(); });

  /* ---------- reveals: heading, then text, then picture ---------- */
  if ('IntersectionObserver' in window && !reduce.matches) {
    $$('main > section').forEach(sec => $$('[data-reveal]', sec).forEach((el, i) => el.style.setProperty('--d', Math.min(i, 3) * 80 + 'ms')));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-in'));
  }

  /* ---------- origins row ---------- */
  const row = $('#row');
  $$('[data-row]').forEach(b => b.addEventListener('click', () => {
    const card = row.querySelector('.place');
    const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap || 16) : 320;
    row.scrollBy({ left: step * Number(b.dataset.row), behavior: reduce.matches ? 'auto' : 'smooth' });
  }));
  row.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      $(`[data-row="${e.key === 'ArrowRight' ? 1 : -1}"]`).click();
    }
  });
  (function dragRow() {
    let down = false, startX = 0, startLeft = 0, moved = false;
    row.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = row.scrollLeft;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; row.classList.add('is-dragging'); }
      row.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      row.classList.remove('is-dragging');
    });
    row.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  })();

  /* ---------- the day index ---------- */
  const times = $$('.time');
  const preview = $('#dayPreview');
  let current = 0;
  function openTime(i) {
    if (i === current && times[i].classList.contains('is-open')) return;
    current = i;
    times.forEach((t, k) => {
      t.classList.toggle('is-open', k === i);
      t.querySelector('button').setAttribute('aria-expanded', String(k === i));
    });
    const img = times[i].querySelector('.time__more img');
    if (preview.getAttribute('src') !== img.getAttribute('src')) {
      preview.classList.add('is-swapping');
      const next = new Image();
      next.src = img.getAttribute('src');
      const swap = () => { preview.src = next.src; preview.classList.remove('is-swapping'); };
      if (next.decode) next.decode().then(swap, swap); else next.onload = swap;
    }
  }
  times.forEach((t, i) => {
    const b = t.querySelector('button');
    b.addEventListener('click', () => openTime(i));
    b.addEventListener('mouseenter', () => { if (canHover.matches) openTime(i); });
    b.addEventListener('focus', () => { if (canHover.matches) openTime(i); });
  });

  /* ---------- build a crate ---------- */
  const crate = { size: 12, kokum: 6, cadence: 'once' };
  const mix = $('#mix');
  const cansEl = $('#crateCans');
  function renderCrate(changed) {
    const { size, kokum, cadence } = crate;
    const guava = size - kokum;
    const subscribed = cadence !== 'once';
    const price = D.crate.sizes[size] * (subscribed ? 1 - D.crate.subscribeOff : 1);
    mix.max = size;
    mix.value = kokum;
    mix.setAttribute('aria-valuetext', `${kokum} Kokum Cola, ${guava} Chili Guava`);
    $('#mixOut [data-kokum]').textContent = `${kokum} Kokum Cola`;
    $('#mixOut [data-guava]').textContent = `${guava} Chili Guava`;
    $('#cratePrice').textContent = inr(price);
    $('#cratePer').textContent = `${inr(price / size)} a can${subscribed ? ', delivered ' + (cadence === '2w' ? 'every 2 weeks' : 'every 4 weeks') : ''}`;
    $('#crateSub').textContent = subscribed
      ? `You save ${inr(D.crate.sizes[size] - price)} on every delivery. Skip or cancel from your phone.`
      : 'Subscribe and save 15%. Skip or cancel from your phone.';
    $('#crateAdd').textContent = `Add crate to bag, ${inr(price)}`;

    cansEl.style.setProperty('--cols', size === 24 ? 8 : 6);
    const imgs = $$('img', cansEl);
    for (let i = 0; i < Math.max(size, imgs.length); i++) {
      let img = imgs[i];
      if (i >= size) { img.remove(); continue; }
      const want = i < kokum ? D.flavours.kokum.can : D.flavours.guava.can;
      if (!img) {
        img = document.createElement('img');
        img.alt = ''; img.width = 448; img.height = 902; img.decoding = 'async';
        cansEl.appendChild(img);
      }
      if (img.getAttribute('src') !== want) {
        img.src = want;
        if (changed && !reduce.matches) { img.classList.add('is-new'); setTimeout(() => img.classList.remove('is-new'), 30); }
      }
    }
  }
  $$('input[name="size"]').forEach(r => r.addEventListener('change', () => {
    const ratio = crate.kokum / crate.size;
    crate.size = Number(r.value);
    crate.kokum = Math.round(ratio * crate.size);
    renderCrate(true);
  }));
  mix.addEventListener('input', () => { crate.kokum = Number(mix.value); renderCrate(true); });
  $$('input[name="cadence"]').forEach(r => r.addEventListener('change', () => { crate.cadence = r.value; renderCrate(false); }));
  $('#crateAdd').addEventListener('click', () => {
    const { size, kokum, cadence } = crate;
    const subscribed = cadence !== 'once';
    const price = Math.round(D.crate.sizes[size] * (subscribed ? 1 - D.crate.subscribeOff : 1));
    const every = { once: '', '2w': ', every 2 weeks', '4w': ', every 4 weeks' }[cadence];
    Bag.add({
      key: `crate-${size}-${kokum}-${cadence}`,
      name: `Crate of ${size}`,
      detail: `${kokum} Kokum Cola, ${size - kokum} Chili Guava${every}`,
      price, kind: 'crate'
    });
    toast(`A crate of ${size} is in your bag`);
  });
  renderCrate(false);

  /* ---------- menu (phone) ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- one click handler for the page ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    const add = t.closest('[data-add]');
    if (add) addProduct(add.dataset.add);
    if (t.closest('[data-open-bag]')) openBag();
    if (t.closest('[data-close-bag]')) closeBag();
    const q = t.closest('[data-qty]');
    if (q) {
      const line = Bag.lines().find(l => l.key === q.dataset.qty);
      if (line) Bag.setQty(line.key, line.qty + Number(q.dataset.step));
    }
    const fl = t.closest('.switch [data-flavour]');
    if (fl) setFlavour(fl.dataset.flavour);
  });
  $('.switch').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next = document.documentElement.dataset.flavour === 'kokum' ? 'guava' : 'kokum';
    setFlavour(next);
    $(`.switch [data-flavour="${next}"]`).focus();
  });

  /* ---------- the name at full width in the footer ---------- */
  const footName = $('.foot__name span');
  function fitName() {
    if (!footName) return;
    const box = footName.parentElement;
    box.style.fontSize = '100px';
    const w = footName.getBoundingClientRect().width;
    const avail = box.clientWidth;
    if (w) box.style.fontSize = (100 * avail / w * 0.995) + 'px';
  }
  addEventListener('resize', fitName);
  addEventListener('load', fitName);
  if (document.fonts) {
    document.fonts.addEventListener('loadingdone', fitName);
    document.fonts.load('800 100px Besley').then(fitName, () => {});
  }

  /* ---------- start ---------- */
  let saved = 'kokum';
  try { saved = localStorage.getItem('kyor-flavour') || 'kokum'; } catch (e) { /* fine */ }
  if (saved === 'guava') setFlavour('guava');
  sceneSetup();
  sceneUpdate();
  updateBar();
  zoomUpdate();
  fitName();
})();
