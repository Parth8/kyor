/* KYOR — checkout & payment (demo: validates and simulates; plug a gateway in at `processPayment`). */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const { cartTotals, inr, clear, openBag } = window.KyorBag;
  const D = window.KYOR;
  const co = $('#checkout');
  let step = 0, pay = 'upi', promo = null, qrTimer;

  const PROMOS = { PEHLA10: { pct: 10, label: 'First sip — 10% off' }, ADDA15: { pct: 15, label: 'Adda member — 15% off' } };

  function totals() {
    const { lines, subtotal } = cartTotals();
    const discount = promo ? Math.round(subtotal * promo.pct / 100) : 0;
    const after = subtotal - discount;
    const shipSel = ($('input[name=ship]:checked') || {}).value;
    const shipping = shipSel === 'exp' ? 149 : (after >= 999 ? 0 : 79);
    const cod = pay === 'cod' ? 40 : 0;
    const total = after + shipping + cod;
    const gst = Math.round(total - total / 1.12);
    return { lines, subtotal, discount, shipping, cod, total, gst };
  }

  function renderSummary() {
    const t = totals();
    $('#coItems').innerHTML = t.lines.map(l => `
      <li><div class="co-items__art">${KyorCan.miniArt(l.p.art.kind === 'cans' ? { kind: 'cans', f: [l.p.art.f[0]] } : l.p.art, D.flavours)}<span class="co-items__q">${l.qty}</span></div>
      <div><b>${l.p.name}</b><span class="mono small">${l.p.pack}</span></div><span>${inr(l.total)}</span></li>`).join('');
    $('#totals').innerHTML = `
      <div><dt>Subtotal</dt><dd>${inr(t.subtotal)}</dd></div>
      ${t.discount ? `<div class="is-good"><dt>${promo.label}</dt><dd>−${inr(t.discount)}</dd></div>` : ''}
      <div><dt>Delivery</dt><dd>${t.shipping ? inr(t.shipping) : 'Free'}</dd></div>
      ${t.cod ? `<div><dt>COD handling</dt><dd>${inr(t.cod)}</dd></div>` : ''}
      <div class="totals__grand"><dt>Total <small class="mono">incl. ${inr(t.gst)} GST</small></dt><dd>${inr(t.total)}</dd></div>`;
    $('#sumTotalTop').textContent = inr(t.total);
    $('#payBtn').textContent = pay === 'cod' ? `Place order · ${inr(t.total)}` : `Pay ${inr(t.total)}`;
    drawQR(t.total);
  }

  /* demo QR: deterministic pattern seeded by amount (not a scannable UPI code) */
  function drawQR(amount) {
    const cv = $('#qr'); if (!cv) return;
    const ctx = cv.getContext('2d'), n = 29, s = cv.width / n;
    let seed = amount * 7919 + 17;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = '#efe6d3'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#1e1814';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (rnd() > 0.52) ctx.fillRect(x * s, y * s, s, s);
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([x, y]) => {
      ctx.fillStyle = '#efe6d3'; ctx.fillRect((x - 1) * s, (y - 1) * s, 9 * s, 9 * s);
      ctx.fillStyle = '#1e1814'; ctx.fillRect(x * s, y * s, 7 * s, 7 * s);
      ctx.fillStyle = '#efe6d3'; ctx.fillRect((x + 1) * s, (y + 1) * s, 5 * s, 5 * s);
      ctx.fillStyle = '#1e1814'; ctx.fillRect((x + 2) * s, (y + 2) * s, 3 * s, 3 * s);
    });
    ctx.fillStyle = '#5f1f2e'; ctx.fillRect(12 * s, 12 * s, 5 * s, 5 * s);
    ctx.fillStyle = '#efe6d3'; ctx.font = `bold ${s * 3.4}px Rozha One, serif`; ctx.textAlign = 'center'; ctx.fillText('K', 14.5 * s, 15.8 * s);
  }
  function startQrTimer() {
    clearInterval(qrTimer);
    let left = 299;
    const tick = () => { const el = $('#qrTimer'); el.textContent = left > 0 ? `Expires in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'QR expired — tap Pay to refresh'; left--; };
    tick(); qrTimer = setInterval(tick, 1000);
  }

  /* ---------- validation ---------- */
  const rules = {
    fName: v => v.trim().length >= 2 || 'Tell us your name',
    fPhone: v => /^[6-9]\d{9}$/.test(v) || 'Enter a 10-digit Indian mobile number',
    fEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'That email looks off',
    fAddr: v => v.trim().length >= 6 || 'We need a fuller address',
    fPin: v => /^[1-9]\d{5}$/.test(v) || 'Pincodes are 6 digits',
    fCity: v => v.trim().length >= 2 || 'Which city?'
  };
  function check(id) {
    const el = $('#' + id), ok = rules[id](el.value);
    const field = el.closest('.field');
    field.classList.toggle('is-bad', ok !== true);
    let msg = field.querySelector('.err');
    if (ok !== true) { if (!msg) { msg = document.createElement('small'); msg.className = 'err'; field.appendChild(msg); } msg.textContent = ok; }
    else if (msg) msg.remove();
    return ok === true;
  }
  function validStep(i) {
    const ids = i === 0 ? ['fName', 'fPhone', 'fEmail'] : ['fAddr', 'fPin', 'fCity'];
    const res = ids.map(check);
    const firstBad = ids[res.indexOf(false)];
    if (firstBad) $('#' + firstBad).focus();
    return !firstBad;
  }
  const luhn = num => { let s = 0, alt = false; for (let i = num.length - 1; i >= 0; i--) { let d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return num.length >= 12 && s % 10 === 0; };
  function network(n) {
    if (/^4/.test(n)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'MASTERCARD';
    if (/^(60|65|81|82|508|353|356)/.test(n)) return 'RUPAY';
    if (/^3[47]/.test(n)) return 'AMEX';
    return '';
  }
  function validPay() {
    const err = $('#payError'); err.textContent = '';
    if (pay === 'upi') {
      const v = $('#fVpa').value.trim();
      if (v && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v)) return (err.textContent = 'UPI IDs look like name@bank'), false;
      return true; // empty → paying via QR
    }
    if (pay === 'card') {
      const n = $('#cNum').value.replace(/\s/g, ''), exp = $('#cExp').value, cvv = $('#cCvv').value;
      if (!luhn(n)) return (err.textContent = 'Check your card number (try 4242 4242 4242 4242)'), false;
      if (!$('#cName').value.trim()) return (err.textContent = 'Add the name on the card'), false;
      const m = exp.match(/^(\d{2})\/(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1]) < new Date()) return (err.textContent = 'Expiry should be a future MM/YY'), false;
      if (!/^\d{3,4}$/.test(cvv)) return (err.textContent = 'CVV is 3 or 4 digits'), false;
      return true;
    }
    if (pay === 'nb') { if (!$('.bank.is-on')) return (err.textContent = 'Pick your bank'), false; }
    return true;
  }

  /* ---------- steps ---------- */
  function setStep(i) {
    step = i;
    $$('.co-panel').forEach(p => p.classList.toggle('is-active', +p.dataset.panel === i));
    $$('#coSteps li').forEach(li => { const k = +li.dataset.step; li.classList.toggle('is-active', k === i); li.classList.toggle('is-done', k < i); });
    if (i === 2 && pay === 'upi') startQrTimer();
    const first = $(`.co-panel[data-panel="${i}"] input`); if (first && innerWidth > 800) setTimeout(() => first.focus(), 300);
  }

  function processPayment(t) {
    // Integration point: create an order on your server, then open Razorpay / Cashfree / Stripe checkout here.
    return new Promise(res => setTimeout(() => res({ ok: true, id: 'KY-' + Date.now().toString(36).toUpperCase().slice(-6) }), 2200));
  }

  async function submit(e) {
    e.preventDefault();
    if (!validStep(0)) return setStep(0);
    if (!validStep(1)) return setStep(1);
    if (!validPay()) return;
    const t = totals();
    co.classList.add('is-processing');
    const r = await processPayment(t);
    co.classList.remove('is-processing');
    if (!r.ok) { $('#payError').textContent = 'Payment failed. Nothing was charged — try again.'; return; }
    clearInterval(qrTimer);
    const pin = $('#fPin').value;
    const days = $('input[name=ship]:checked').value === 'exp' ? 1 : (/^(4|5|1|11)/.test(pin) ? 3 : 5);
    const d = new Date(); d.setDate(d.getDate() + days);
    $('#successText').textContent = `${$('#fName').value.split(' ')[0]}, your crate is being packed in Pune. We'll WhatsApp you tracking details at +91 ${$('#fPhone').value}.`;
    $('#successTicket').innerHTML = `<div><span>Order</span><b>${r.id}</b></div><div><span>Paid</span><b>${inr(t.total)} · ${({ upi: 'UPI', card: 'Card', nb: 'Netbanking', cod: 'COD' })[pay]}</b></div><div><span>Arrives by</span><b>${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</b></div>`;
    co.classList.add('is-success');
    clear();
  }

  function open() {
    if (!cartTotals().lines.length) { KyorToast('Your thaila is empty'); return; }
    openBag(false);
    co.classList.remove('is-success');
    co.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-checkout');
    co.scrollTop = 0;
    renderSummary(); setStep(0);
  }
  function close() {
    co.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-checkout');
    clearInterval(qrTimer);
  }
  window.KyorCheckout = { open, close };

  /* ---------- wiring ---------- */
  $('#toCheckout').onclick = open;
  $('#coBack').onclick = close;
  $('#successHome').onclick = () => { close(); KyorGo(0); };
  $('#coForm').addEventListener('submit', submit);
  $('#coForm').addEventListener('click', e => {
    if (e.target.closest('[data-next]') && validStep(step)) setStep(step + 1);
    if (e.target.closest('[data-prev]')) setStep(step - 1);
  });
  $$('#coSteps li').forEach(li => li.addEventListener('click', () => { const k = +li.dataset.step; if (k < step) setStep(k); }));
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => $('#' + id).value && check(id)));
  $('#fPhone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
  $('#fPin').addEventListener('input', e => {
    const v = e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    const eta = $('#eta');
    if (v.length === 6) {
      const metro = /^(40|41|56|11|12|20)/.test(v);
      eta.innerHTML = metro ? '✺ Metro pincode — <b>next-day express</b> available.' : '✺ We deliver here in <b>3–5 days</b>.';
      const guess = { 40: 'Mumbai', 41: 'Pune', 56: 'Bengaluru', 11: 'New Delhi', 12: 'Gurugram', 20: 'Noida', 60: 'Chennai', 50: 'Hyderabad', 70: 'Kolkata', 38: 'Ahmedabad', 30: 'Jaipur' }[v.slice(0, 2)];
      if (guess && !$('#fCity').value) $('#fCity').value = guess;
    } else eta.textContent = 'Enter a pincode to see delivery dates.';
  });
  $$('input[name=ship]').forEach(r => r.addEventListener('change', renderSummary));
  $$('.pay-tabs [data-pay]').forEach(b => b.addEventListener('click', () => {
    pay = b.dataset.pay;
    $$('.pay-tabs [data-pay]').forEach(x => x.setAttribute('aria-selected', x === b));
    $$('.pay-pane').forEach(p => p.classList.toggle('is-active', p.dataset.pane === pay));
    $('#payError').textContent = '';
    if (pay === 'upi') startQrTimer();
    renderSummary();
  }));
  $('#banks').innerHTML = D.banks.map(b => `<button type="button" class="bank">${b}</button>`).join('');
  $('#banks').addEventListener('click', e => { const b = e.target.closest('.bank'); if (!b) return; $$('.bank').forEach(x => x.classList.toggle('is-on', x === b)); });

  // live metal card
  const card = $('#metalCard');
  $('#cNum').addEventListener('input', e => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, '$1 ').trim();
    $('#cNumView').textContent = (d + '•'.repeat(16 - d.length)).replace(/(.{4})/g, '$1 ').trim();
    $('#cNetView').textContent = network(d);
  });
  $('#cName').addEventListener('input', e => { $('#cNameView').textContent = e.target.value.toUpperCase() || 'YOUR NAME'; });
  $('#cExp').addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (d.length > 2) d = d.slice(0, 2) + '/' + d.slice(2);
    e.target.value = d; $('#cExpView').textContent = d || 'MM/YY';
  });
  $('#cCvv').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); $('#cCvvView').textContent = '•'.repeat(e.target.value.length) || '•••'; });
  $('#cCvv').addEventListener('focus', () => card.classList.add('is-flipped'));
  $('#cCvv').addEventListener('blur', () => card.classList.remove('is-flipped'));

  $('#promoBtn').onclick = () => {
    const code = $('#promo').value.trim().toUpperCase();
    promo = PROMOS[code] || null;
    $('#promoMsg').textContent = promo ? `✺ ${promo.label} applied` : (code ? 'That code didn\'t fizz. Try PEHLA10.' : '');
    renderSummary();
  };
  $('#sumToggle').onclick = () => { const s = $('#coSummary'); const on = !s.classList.contains('is-open'); s.classList.toggle('is-open', on); $('#sumToggle').setAttribute('aria-expanded', on); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('is-checkout') && !co.classList.contains('is-processing')) close(); });
})();
