/* KYOR — procedural SVG cans & product art. The label is a wrap-around strip
   (630 units ≈ the can's circumference) so it can be "spun" by translating it. */
(function () {
  let uid = 0;
  const STRIP = 630;

  function arch(x, y, s, stroke, fill) {
    return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 80 V36 C0 18 16 8 30 0 C44 8 60 18 60 36 V80 Z" fill="${fill || 'none'}" stroke="${stroke}" stroke-width="${2 / s}"/>`;
  }

  function fruitArt(f, c) {
    if (f.id === 'kokum') {
      return `
        <g>
          <ellipse cx="262" cy="112" rx="30" ry="12" fill="${c.leaf}" transform="rotate(-35 262 112)"/>
          <ellipse cx="350" cy="104" rx="30" ry="11" fill="${c.leaf}" transform="rotate(30 350 104)"/>
          <path d="M262 112 L350 104" stroke="${c.leaf}" stroke-width="2"/>
          <circle cx="292" cy="160" r="38" fill="${c.fruit}"/>
          <circle cx="280" cy="146" r="11" fill="${c.fruitHi}" opacity=".7"/>
          <circle cx="348" cy="186" r="30" fill="${c.fruit}"/>
          <circle cx="339" cy="175" r="8" fill="${c.fruitHi}" opacity=".7"/>
          <path d="M240 214 a34 34 0 0 1 68 0 Z" fill="${c.fruit}"/>
          <path d="M246 214 a28 28 0 0 1 56 0 Z" fill="#e7d6c2"/>
          <g fill="${c.a2}">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${256 + i * 9}" cy="${206 - Math.sin(i / 4 * Math.PI) * 10}" rx="3" ry="5"/>`).join('')}</g>
        </g>
        <text x="315" y="268" text-anchor="middle" font-family="Tiro Devanagari Hindi" font-size="34" fill="${c.accent}">कोकम</text>`;
    }
    return `
      <g>
        <ellipse cx="350" cy="88" rx="28" ry="10" fill="${c.leaf}" transform="rotate(25 350 88)"/>
        <circle cx="305" cy="150" r="56" fill="${c.fruit}"/>
        <circle cx="305" cy="150" r="44" fill="${c.fruitHi}"/>
        <circle cx="305" cy="150" r="20" fill="${c.fruit}" opacity=".6"/>
        <g fill="#f7e3cf">${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<ellipse cx="${305 + Math.cos(a) * 30}" cy="${150 + Math.sin(a) * 30}" rx="2.6" ry="4" transform="rotate(${a * 57.3} ${305 + Math.cos(a) * 30} ${150 + Math.sin(a) * 30})"/>`; }).join('')}</g>
        <path d="M236 196 C280 182 330 196 382 236 C340 226 290 222 244 214 C230 210 228 200 236 196Z" fill="${c.accent}"/>
        <path d="M244 202 C280 196 320 204 356 224" stroke="#f2c0ac" stroke-width="2" fill="none" opacity=".6"/>
        <path d="M236 196 C226 190 222 180 226 170" stroke="${c.leaf}" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <text x="315" y="272" text-anchor="middle" font-family="Tiro Devanagari Hindi" font-size="27" fill="${c.accent}">अमरूद · मिर्च</text>`;
  }

  function strip(f, p) {
    const c = f.can;
    const claims = f.stamps.slice(0, 3);
    return `
      <rect width="${STRIP}" height="316" fill="${c.bg}"/>
      <rect width="${STRIP}" height="316" fill="url(#${p}lat)"/>
      <rect width="${STRIP}" height="20" fill="${c.a2}"/>
      <rect width="${STRIP}" height="20" fill="url(#${p}tri)"/>
      <rect y="296" width="${STRIP}" height="20" fill="${c.a2}"/>
      <rect y="296" width="${STRIP}" height="20" fill="url(#${p}tri)"/>
      <!-- panel 1: front -->
      <text x="105" y="58" text-anchor="middle" font-family="Martian Mono" font-size="7.5" letter-spacing="2" fill="${c.ink}">PREBIOTIC · FUNCTIONAL</text>
      <text x="105" y="116" text-anchor="middle" font-family="Rozha One" font-size="66" letter-spacing="1" fill="${c.accent}" stroke="#d8b679" stroke-width=".8">KYOR</text>
      <rect x="20" y="128" width="170" height="22" fill="${c.accent}"/>
      <text x="105" y="143" text-anchor="middle" font-family="Martian Mono" font-size="8.5" letter-spacing="3" fill="#efe5d1">FUNCTIONAL SODA</text>
      <text x="105" y="198" text-anchor="middle" font-family="Rozha One" font-size="44" fill="${c.ink}">${f.lines[0]}</text>
      <text x="105" y="242" text-anchor="middle" font-family="Rozha One" font-size="44" fill="${c.ink}">${f.lines[1]}</text>
      <text x="105" y="276" text-anchor="middle" font-family="Martian Mono" font-size="8" letter-spacing="2" fill="${c.ink}">NO. ${f.index} · 350 ML</text>
      <!-- panel 2: art -->
      ${fruitArt(f, c)}
      <line x1="210" y1="30" x2="210" y2="286" stroke="${c.ink}" stroke-opacity=".25" stroke-dasharray="2 4"/>
      <line x1="420" y1="30" x2="420" y2="286" stroke="${c.ink}" stroke-opacity=".25" stroke-dasharray="2 4"/>
      <!-- panel 3: claims -->
      ${arch(495, 38, 1, c.accent, 'none')}
      ${arch(503, 50, .74, c.a2, 'none')}
      <circle cx="525" cy="86" r="9" fill="${c.a2}"/>
      ${claims.map((s, i) => `<rect x="446" y="${140 + i * 30}" width="158" height="22" fill="none" stroke="${c.ink}" stroke-width="1"/><text x="525" y="${155 + i * 30}" text-anchor="middle" font-family="Martian Mono" font-size="8" letter-spacing="1.5" fill="${c.ink}">${s.toUpperCase()}</text>`).join('')}
      <text x="525" y="268" text-anchor="middle" font-family="Instrument Serif" font-style="italic" font-size="20" fill="${c.accent}">born in Bharat</text>
      <text x="525" y="284" text-anchor="middle" font-family="Martian Mono" font-size="6" letter-spacing="1.5" fill="${c.ink}">${f.origin.toUpperCase()}</text>`;
  }

  function canSVG(f, opts) {
    opts = opts || {};
    const p = 'k' + (uid++) + '_';
    const c = f.can;
    return `
<svg class="can" viewBox="0 0 220 392" role="img" aria-label="${f.name} can">
  <defs>
    <linearGradient id="${p}metal" x1="0" x2="1">
      <stop offset="0" stop-color="#5b5955"/><stop offset=".18" stop-color="#a7a49d"/><stop offset=".34" stop-color="#e2dfd8"/>
      <stop offset=".5" stop-color="#a9a69f"/><stop offset=".78" stop-color="#7d7a74"/><stop offset="1" stop-color="#4a4844"/>
    </linearGradient>
    <linearGradient id="${p}shade" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".1" stop-color="#000" stop-opacity=".2"/>
      <stop offset=".28" stop-color="#fff" stop-opacity=".26"/><stop offset=".36" stop-color="#fff" stop-opacity=".06"/>
      <stop offset=".62" stop-color="#000" stop-opacity=".06"/><stop offset=".86" stop-color="#000" stop-opacity=".34"/>
      <stop offset="1" stop-color="#000" stop-opacity=".66"/>
    </linearGradient>
    <pattern id="${p}lat" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M9 0 L18 9 L9 18 L0 9Z" fill="none" stroke="${c.ink}" stroke-opacity=".09" stroke-width="1"/>
      <circle cx="9" cy="9" r="1.2" fill="${c.ink}" fill-opacity=".1"/>
    </pattern>
    <pattern id="${p}tri" width="14" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 20 L7 6 L14 20Z" fill="#d8b679" fill-opacity=".55"/><circle cx="7" cy="3" r="1.4" fill="#d8b679" fill-opacity=".7"/>
    </pattern>
    <clipPath id="${p}clip"><rect x="10" y="40" width="200" height="324" rx="3"/></clipPath>
  </defs>
  <ellipse cx="110" cy="384" rx="98" ry="7" fill="#000" opacity=".28"/>
  <path d="M14 364 Q16 380 40 382 L180 382 Q204 380 206 364Z" fill="url(#${p}metal)"/>
  <path d="M22 22 L198 22 L210 40 L10 40Z" fill="url(#${p}metal)"/>
  <ellipse cx="110" cy="22" rx="88" ry="10" fill="#b9b6ae"/>
  <ellipse cx="110" cy="22" rx="80" ry="8" fill="#8f8c85"/>
  <ellipse cx="110" cy="21" rx="74" ry="6.5" fill="#c9c6bf"/>
  <path d="M96 16 Q110 11 124 16 L122 24 Q110 27 98 24Z" fill="#9c9992" stroke="#6c6963" stroke-width="1"/>
  <g clip-path="url(#${p}clip)">
    <g class="can__strip" transform="translate(${10 - (opts.offset || 5)} 44)">
      <g>${strip(f, p)}</g>
      <g transform="translate(${STRIP} 0)">${strip(f, p)}</g>
    </g>
    <rect x="10" y="40" width="200" height="6" fill="url(#${p}metal)"/>
    <rect x="10" y="358" width="200" height="6" fill="url(#${p}metal)"/>
    <rect x="10" y="40" width="200" height="324" fill="url(#${p}shade)"/>
  </g>
</svg>`;
  }

  function miniArt(art, flavours) {
    if (art.kind === 'cans') {
      const n = art.f.length;
      return `<div class="cans-row cans-row--${n}">${art.f.map((id, i) => `<div class="mini-can" style="--i:${i};--n:${n}">${canSVG(flavours[id], { offset: (i * 37) % 120 })}</div>`).join('')}</div>`;
    }
    const svgs = {
      tote: `<svg viewBox="0 0 200 200"><path d="M70 60 C70 20 130 20 130 60" fill="none" stroke="#3a2c20" stroke-width="6"/><rect x="40" y="58" width="120" height="122" fill="#e2d3b4"/><g fill="#a9553a">${Array.from({ length: 12 }, (_, i) => `<path transform="translate(${52 + (i % 4) * 28} ${72 + Math.floor(i / 4) * 34})" d="M10 0 C18 0 22 8 20 15 C18 22 8 28 2 30 C6 24 4 20 0 16 C-4 10 2 0 10 0 Z"/>`).join('')}</g><rect x="40" y="58" width="120" height="122" fill="none" stroke="#3a2c20" stroke-width="2"/></svg>`,
      tumbler: `<svg viewBox="0 0 200 200"><defs><linearGradient id="tm" x1="0" x2="1"><stop offset="0" stop-color="#4c4a45"/><stop offset=".35" stop-color="#bdb9b0"/><stop offset=".55" stop-color="#8d8a83"/><stop offset="1" stop-color="#3f3d39"/></linearGradient></defs><path d="M62 40 H138 L128 178 H72Z" fill="url(#tm)"/><rect x="58" y="30" width="84" height="14" rx="3" fill="#2d2a26"/><text x="100" y="118" text-anchor="middle" font-family="Rozha One" font-size="22" fill="#e8dfcc" opacity=".8">KYOR</text></svg>`,
      tee: `<svg viewBox="0 0 200 200"><path d="M70 30 L40 46 L20 84 L46 96 L54 80 L54 176 H146 L146 80 L154 96 L180 84 L160 46 L130 30 C124 44 76 44 70 30Z" fill="#2f2a25"/><text x="100" y="104" text-anchor="middle" font-family="Rozha One" font-size="26" fill="#c9963b">ADDA</text><text x="100" y="124" text-anchor="middle" font-family="Martian Mono" font-size="7" letter-spacing="2" fill="#e8dfcc">CLUB · क्योर</text></svg>`,
      pins: `<svg viewBox="0 0 200 200"><circle cx="64" cy="80" r="30" fill="#5f1f2e" stroke="#c9a35a" stroke-width="4"/><circle cx="56" cy="72" r="8" fill="#8e3a4f"/><path d="M108 120 C130 110 160 120 182 150 C160 140 136 138 112 134 C100 130 100 122 108 120Z" fill="#b9503a" stroke="#c9a35a" stroke-width="3"/><rect x="118" y="40" width="40" height="64" rx="6" fill="#98a287" stroke="#c9a35a" stroke-width="4"/><text x="138" y="78" text-anchor="middle" font-family="Rozha One" font-size="14" fill="#5f1f2e">K</text></svg>`
    };
    return `<div class="merch-art">${svgs[art.kind]}</div>`;
  }

  /* Drag-to-spin with inertia + gentle idle drift */
  function makeSpinnable(host, getFlavour) {
    let offset = 5, vel = 0, dragging = false, lastX = 0, idle = 0.12, raf;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function render() {
      host.innerHTML = canSVG(getFlavour(), { offset });
      tilt();
    }
    let tx = 0, ty = 0;
    function tilt() { const s = host.querySelector('.can'); if (s) s.style.transform = `rotateY(${tx}deg) rotateX(${ty}deg)`; }
    function apply() {
      const g = host.querySelector('.can__strip');
      if (!g) return;
      offset = ((offset % STRIP) + STRIP) % STRIP;
      g.setAttribute('transform', `translate(${10 - offset} 44)`);
    }
    function loop() {
      if (!dragging) {
        vel *= 0.94;
        offset += vel + (reduce || !host.isConnected || host.closest('.scene:not(.is-active)') ? 0 : idle);
        apply();
      }
      raf = requestAnimationFrame(loop);
    }
    const target = host.parentElement;
    target.addEventListener('pointerdown', e => {
      dragging = true; lastX = e.clientX; vel = 0;
      target.setPointerCapture(e.pointerId);
    });
    target.addEventListener('pointermove', e => {
      const r = target.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 8;
      tilt();
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      const scale = 200 / host.getBoundingClientRect().width;
      offset -= dx * scale; vel = -dx * scale; apply();
    });
    const end = () => { dragging = false; };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    target.addEventListener('pointerleave', () => { tx = ty = 0; tilt(); });
    render(); loop();
    return { render, nudge(v) { vel += v; } };
  }

  window.KyorCan = { canSVG, miniArt, makeSpinnable };
})();
