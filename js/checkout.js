/* Checkout: validation, totals and a test-mode payment. Wire a real gateway in `takePayment`. */
(function () {
  const D = window.KYOR;
  const Bag = window.KyorBag;
  const inr = Bag.inr;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const PROMOS = { FIRSTSIP: { pct: 10, label: 'FIRSTSIP, 10% off' } };
  let promo = null;

  const summary = $('#summary');
  const wide = matchMedia('(min-width: 761px)');
  const syncSummary = () => { if (wide.matches) summary.open = true; };
  wide.addEventListener('change', syncSummary);
  syncSummary();
  summary.querySelector('summary').addEventListener('click', e => { if (wide.matches) e.preventDefault(); });

  const value = name => ($(`input[name="${name}"]:checked`) || {}).value;

  function totals() {
    const subtotal = Bag.subtotal();
    const discount = promo ? Math.round(subtotal * promo.pct / 100) : 0;
    const after = subtotal - discount;
    const shipping = value('ship') === 'express' ? 149 : (after >= D.freeShippingFrom || !subtotal ? 0 : 79);
    const cod = value('pay') === 'cod' ? 40 : 0;
    const total = after + shipping + cod;
    return { subtotal, discount, shipping, cod, total, gst: Math.round(total - total / 1.12) };
  }

  function render() {
    const lines = Bag.lines();
    const t = totals();
    $('#sumList').innerHTML = lines.length ? lines.map(l => `
      <li class="${Bag.imgFor(l.kind) ? '' : 'no-img'}">${Bag.imgFor(l.kind) ? `<img src="${Bag.imgFor(l.kind)}" alt="" width="48" height="60">` : ''}
        <div><b>${l.qty} × ${l.name}</b><small>${l.detail}</small></div>
        <span>${inr(l.price * l.qty)}</span></li>`).join('')
      : '<li><div><b>Your bag is empty</b><small><a href="index.html#shop">Build a crate in the shop</a></small></div></li>';
    $('#totals').innerHTML = `
      <div><dt>Subtotal</dt><dd>${inr(t.subtotal)}</dd></div>
      ${t.discount ? `<div><dt>${promo.label}</dt><dd>−${inr(t.discount)}</dd></div>` : ''}
      <div><dt>Delivery</dt><dd>${t.shipping ? inr(t.shipping) : 'Free'}</dd></div>
      ${t.cod ? `<div><dt>Cash on delivery</dt><dd>${inr(t.cod)}</dd></div>` : ''}
      <div class="is-grand"><dt>Total<small>Includes ${inr(t.gst)} GST</small></dt><dd>${inr(t.total)}</dd></div>`;
    $('#sumTop').textContent = inr(t.total);
    const pay = value('pay');
    $('#payBtn').textContent = pay === 'cod' ? `Place order, ${inr(t.total)}` : `Pay ${inr(t.total)}`;
    $('#payBtn').disabled = !lines.length;
  }

  /* ---------- validation ---------- */
  const rules = {
    name: v => v.trim().length >= 2 || 'Please enter your name.',
    phone: v => /^[6-9]\d{9}$/.test(v) || 'Enter a 10-digit mobile number.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter an email address like name@example.com.',
    address: v => v.trim().length >= 6 || 'Add your flat, building and street.',
    pin: v => /^[1-9]\d{5}$/.test(v) || 'Pincodes have 6 digits.',
    city: v => v.trim().length >= 2 || 'Add your city.'
  };
  function check(id) {
    const input = $('#' + id);
    const field = input.closest('.field');
    const res = rules[id](input.value);
    let err = field.querySelector('.field__err');
    if (res === true) {
      field.classList.remove('is-bad'); input.removeAttribute('aria-invalid');
      if (err) err.remove();
      return true;
    }
    field.classList.add('is-bad'); input.setAttribute('aria-invalid', 'true');
    if (!err) {
      err = document.createElement('p'); err.className = 'field__err'; err.id = id + 'Err';
      field.appendChild(err);
      input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), err.id].filter(Boolean).join(' '));
    }
    err.textContent = res;
    return false;
  }
  Object.keys(rules).forEach(id => {
    const input = $('#' + id);
    input.addEventListener('blur', () => { if (input.value) check(id); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('is-bad')) check(id); });
  });

  $('#phone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
  $('#pin').addEventListener('input', e => {
    const v = e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    if (v.length !== 6) return;
    const cities = { 40: 'Mumbai', 41: 'Pune', 56: 'Bengaluru', 11: 'New Delhi', 12: 'Gurugram', 20: 'Noida', 60: 'Chennai', 50: 'Hyderabad', 70: 'Kolkata', 38: 'Ahmedabad', 30: 'Jaipur' };
    const city = cities[v.slice(0, 2)];
    if (city && !$('#city').value) { $('#city').value = city; if ($('#city').closest('.field').classList.contains('is-bad')) check('city'); }
    const metro = /^(40|41|56|11|12|20)/.test(v);
    $('#stdEta').textContent = (metro ? 'Arrives in 1 to 2 days.' : 'Arrives in 3 to 5 days.') + ' Free over ₹999, otherwise ₹79.';
  });

  $$('input[name="ship"]').forEach(r => r.addEventListener('change', render));
  $$('input[name="pay"]').forEach(r => r.addEventListener('change', () => {
    $$('[data-pay-detail]').forEach(el => { el.hidden = el.dataset.payDetail !== r.value; });
    $('#coError').textContent = '';
    render();
  }));

  $('#promoBtn').addEventListener('click', () => {
    const code = $('#promo').value.trim().toUpperCase();
    promo = PROMOS[code] || null;
    $('#promoMsg').textContent = promo ? `${promo.label} is applied.` : code ? 'That code didn’t work. Check the spelling, or try FIRSTSIP.' : 'First order? Try FIRSTSIP for 10% off.';
    render();
  });

  /* ---------- payment ---------- */
  function takePayment(order) {
    // Connect Razorpay, Cashfree or Stripe here: create the order on your server,
    // open the provider's checkout with `order.total`, and resolve with its payment id.
    return new Promise(resolve => setTimeout(() => resolve({ ok: true, id: 'KY' + Date.now().toString(36).toUpperCase().slice(-6) }), 1400));
  }

  $('#coForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#coError');
    err.textContent = '';
    const bad = Object.keys(rules).filter(id => !check(id));
    if (bad.length) { $('#' + bad[0]).focus(); err.textContent = 'A few details need fixing before you pay.'; return; }
    const pay = value('pay');
    const vpa = $('#vpa').value.trim();
    if (pay === 'upi' && vpa && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(vpa)) { $('#vpa').focus(); err.textContent = 'UPI IDs look like yourname@okbank.'; return; }
    if (pay === 'netbanking' && !$('#bank').value) { $('#bank').focus(); err.textContent = 'Choose your bank.'; return; }
    const t = totals();
    if (pay === 'cod' && t.total > 3000) { err.textContent = 'Orders over ₹3,000 need to be paid online.'; return; }

    const btn = $('#payBtn');
    btn.classList.add('is-busy');
    btn.textContent = pay === 'cod' ? 'Placing your order…' : 'Waiting for payment…';
    const res = await takePayment({ total: t.total, method: pay });
    btn.classList.remove('is-busy');
    if (!res.ok) { err.textContent = 'The payment didn’t go through and you haven’t been charged. Please try again.'; render(); return; }

    const metro = /^(40|41|56|11|12|20)/.test($('#pin').value);
    const days = value('ship') === 'express' ? 1 : metro ? 2 : 5;
    const date = new Date(); date.setDate(date.getDate() + days);
    const items = Bag.lines().map(l => `${l.qty} × ${l.name}`).join(', ');
    $('#doneLead').textContent = `Thanks, ${$('#name').value.trim().split(' ')[0]}. We’ve sent the receipt to ${$('#email').value.trim()} and we’ll message +91 ${$('#phone').value} when it ships.`;
    $('#doneFacts').innerHTML = `
      <div><dt>Order</dt><dd>${res.id}</dd></div>
      <div><dt>Items</dt><dd>${items}</dd></div>
      <div><dt>${pay === 'cod' ? 'To pay at the door' : 'Paid'}</dt><dd>${inr(t.total)}</dd></div>
      <div><dt>Arrives by</dt><dd>${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</dd></div>
      <div><dt>Address</dt><dd>${$('#address').value.trim()}, ${$('#city').value.trim()} ${$('#pin').value}</dd></div>`;
    Bag.clear();
    $('#main').classList.add('is-done');
    const done = $('#done');
    done.hidden = false;
    scrollTo(0, 0);
    done.focus();
  });

  Bag.onChange(render);
  render();
})();
