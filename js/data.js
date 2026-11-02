/* KYOR content. Copy, prices and products live here. Sample details are marked in README. */
window.KYOR = {
  flavours: {
    kokum: {
      id: 'kokum',
      name: 'Kokum Cola',
      lines: ['Kokum', 'Cola'],
      can: 'assets/cans/can-kokum.webp',
      line: 'Prebiotic soda from India. Konkan kokum, kola nut and black salt, with 3 g of fibre and no added sugar.',
      field: 'kokum'
    },
    guava: {
      id: 'guava',
      name: 'Chili Guava',
      lines: ['Chili', 'Guava'],
      can: 'assets/cans/can-guava.webp',
      line: 'Prebiotic soda from India. Pink guava, a slow burn of Guntur chilli, lime and rock salt, with 3 g of fibre.',
      field: 'guava'
    }
  },

  crate: {
    sizes: { 6: 540, 12: 1020, 24: 1920 },
    subscribeOff: 0.15
  },

  products: [
    { id: 'kk6', name: 'Kokum Cola', detail: '6 cans', price: 540, kind: 'kokum' },
    { id: 'cg6', name: 'Chili Guava', detail: '6 cans', price: 540, kind: 'guava' },
    { id: 'try4', name: 'First sip kit', detail: '2 Kokum Cola and 2 Chili Guava', price: 349, kind: 'mixed' },
    { id: 'tote', name: 'Block-print tote', detail: 'Hand-printed cotton from Bagru, fits a 6-pack', price: 699, kind: 'goods' },
    { id: 'tumbler', name: 'Steel tumbler', detail: '450 ml, double-walled, keeps a can cold for 6 hours', price: 899, kind: 'goods' },
    { id: 'tee', name: 'Sessions tee', detail: 'Heavy cotton, sizes S to XXL', price: 1199, kind: 'goods' }
  ],

  freeShippingFrom: 999
};
