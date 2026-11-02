/* The bag, shared by the shop and the checkout. Stored in this browser only. */
(function () {
  const KEY = 'kyor-bag-v2';
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function write(lines) {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* private mode: bag lasts for this page only */ }
    memory = lines;
    listeners.forEach(fn => fn(lines));
  }
  let memory = read();
  const listeners = [];

  const imgFor = kind => ({
    kokum: 'assets/cans/can-kokum.webp',
    guava: 'assets/cans/can-guava.webp',
    mixed: 'assets/cans/can-kokum-grid.webp',
    crate: 'assets/cans/can-kokum-grid.webp'
  }[kind] || '');

  window.KyorBag = {
    inr,
    imgFor,
    lines: () => memory.slice(),
    count: () => memory.reduce((n, l) => n + l.qty, 0),
    subtotal: () => memory.reduce((n, l) => n + l.qty * l.price, 0),
    onChange(fn) { listeners.push(fn); },
    add(line) {
      const lines = memory.slice();
      const found = lines.find(l => l.key === line.key);
      if (found) found.qty += line.qty || 1;
      else lines.push(Object.assign({ qty: 1 }, line));
      write(lines);
    },
    setQty(key, qty) {
      write(memory.map(l => (l.key === key ? Object.assign({}, l, { qty }) : l)).filter(l => l.qty > 0));
    },
    clear() { write([]); }
  };
})();
