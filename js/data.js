/* KYOR content: flavours, prices, products, the day and what's in the can. Sample details are listed in README. */
window.KYOR = {
  flavours: {
    kokum: {
      id: 'kokum', name: 'Kokum Cola', product: 'kk6',
      can: 'assets/cans/can-kokum.webp',
      line: 'Prebiotic soda from India. Konkan kokum, kola nut and black salt. 3 g fibre, no added sugar.',
      mega: 'KOKUM COLA',
      art: { fruit: 'assets/kit/kokum/fruit.webp', calm: 'assets/kit/kokum/monk.webp', arch: 'assets/kit/kokum/arch.webp' },
      origins: { title: 'Konkan<br>to can', lead: 'Kokum from the red laterite coast, chilli from Guntur, guava from Prayagraj, all canned in Pune. Drag the strip.' },
      counters: [[38, 'kcal', 'per can'], [0, 'g', 'added sugar'], [3, 'g', 'prebiotic fibre'], [18, 'mg', 'caffeine, from kola nut']],
      ingredients: [
        ['Kokum rind', 'Sindhudurg, Maharashtra', 'Tart, cooling, the colour of the drink.'],
        ['Kola nut', 'Fair-trade', 'Gentle caffeine, 18 mg a can.'],
        ['Chicory inulin', 'Gujarat', 'Prebiotic fibre for your gut flora.'],
        ['Jaggery', 'Kolhapur, Maharashtra', 'A whisper. 4.2 g total sugars.'],
        ['Black salt', 'Himalayan', 'The chaat-masala hit.'],
        ['Roasted cumin', 'Unjha, Gujarat', 'Warm, earthy, after-meal.']
      ]
    },
    guava: {
      id: 'guava', name: 'Chili Guava', product: 'cg6',
      can: 'assets/cans/can-guava.webp',
      line: 'Prebiotic soda from India. Pink guava, a slow burn of Guntur chilli, lime and rock salt. 3 g fibre.',
      mega: 'CHILI GUAVA',
      art: { fruit: 'assets/kit/guava/fruit.webp', calm: 'assets/kit/guava/eye.webp', arch: 'assets/kit/guava/arch.webp' },
      origins: { title: 'Orchard<br>to can', lead: 'Guava from Prayagraj, chilli from Guntur, kokum from the Konkan coast, all canned in Pune. Drag the strip.' },
      counters: [[34, 'kcal', 'per can'], [0, 'g', 'added sugar'], [3, 'g', 'prebiotic fibre'], [45, '%', 'of your vitamin C']],
      ingredients: [
        ['Pink guava', 'Prayagraj, Uttar Pradesh', 'Perfumed, pulpy, loaded with vitamin C.'],
        ['Guntur chilli', 'Guntur, Andhra Pradesh', 'Fire-roasted, a slow-building heat.'],
        ['Chicory inulin', 'Gujarat', 'Prebiotic fibre for your gut flora.'],
        ['Lime', 'Nagpur, Maharashtra', 'The squeeze that lifts it.'],
        ['Rock salt', 'Himalayan', 'Electrolytes, and that cart-side tang.'],
        ['Stevia leaf', 'Punjab', 'Rounded sweetness, no sugar.']
      ]
    }
  },

  moments: [
    { at: 400, title: 'After a 5k in the rain', body: 'Cold, salty, a little hot. Tops up what you sweated out without a sports drink’s sugar.', img: 'assets/photos/run-monsoon.jpg', alt: 'A man running across a wet street', can: 'guava' },
    { at: 550, title: 'The 9:04 fast from Dadar', body: '18 mg of caffeine from kola nut. Enough to arrive awake, not enough to shake.', img: 'assets/photos/station-cst.jpg', alt: 'Commuters walking beside a local train in a Mumbai station', can: 'kokum' },
    { at: 825, title: 'After a heavy lunch', body: 'What the coast has always done after a big meal, with fibre and fizz instead of a nap at your desk.', img: 'assets/photos/friends-phone.jpg', alt: 'Two friends laughing at a phone outdoors', can: 'kokum' },
    { at: 990, title: 'Instead of a third chai', body: 'Tart, bright and 34 kcal. No sugar crash at six.', img: 'assets/photos/chai-stall.jpg', alt: 'A tea seller pouring chai at a street stall', can: 'guava' },
    { at: 1170, title: 'Sea face with friends', body: 'Bring a 6-pack in the tote. Nobody has to be the designated driver of fun.', img: 'assets/photos/friends-beach.jpg', alt: 'A group of young women sitting together on a beach', can: 'guava' },
    { at: 1335, title: 'Terrace, early start tomorrow', body: 'Kokum Cola over ice with lime and mint is a zero-proof spritz. You’ll still make the 7 am stand-up.', img: 'assets/photos/terrace-sunset.jpg', alt: 'Sunset over rooftops and a phone tower', can: 'kokum' }
  ],

  crate: { sizes: { 6: 540, 12: 1020, 24: 1920 }, subscribeOff: 0.15 },

  products: [
    { id: 'kk6', name: 'Kokum Cola', detail: '6 cans', price: 540, kind: 'kokum' },
    { id: 'cg6', name: 'Chili Guava', detail: '6 cans', price: 540, kind: 'guava' },
    { id: 'try4', name: 'First sip kit', detail: '2 Kokum Cola and 2 Chili Guava', price: 349, kind: 'mixed' },
    { id: 'tote', name: 'Block-print tote', detail: 'Hand-printed cotton from Bagru, fits a 6-pack', price: 699, kind: 'goods', art: 'assets/kit/kokum/paisley.webp' },
    { id: 'tumbler', name: 'Steel tumbler', detail: '450 ml, double-walled, keeps a can cold for 6 hours', price: 899, kind: 'goods', art: 'assets/kit/guava/eye.webp' },
    { id: 'tee', name: 'Sessions tee', detail: 'Heavy cotton, sizes S to XXL', price: 1199, kind: 'goods', art: 'assets/kit/kokum/runner.webp' }
  ],

  freeShippingFrom: 999
};
