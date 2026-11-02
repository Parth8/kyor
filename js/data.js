/* KYOR — content & catalogue. Edit copy, prices and products here. */
window.KYOR = {
  chapters: [
    { hi: 'घर', en: 'Ghar · Home', short: 'Ghar' },
    { hi: 'मिट्टी', en: 'Farm → stomach', short: 'Mitti' },
    { hi: 'दिन', en: 'A day with Kyor', short: 'Din' },
    { hi: 'अंदर', en: 'Inside the can', short: 'Andar' },
    { hi: 'अड्डा', en: 'The Adda', short: 'Adda' },
    { hi: 'दुकान', en: 'The Dukaan', short: 'Dukaan' }
  ],

  flavours: {
    kokum: {
      id: 'kokum',
      name: 'Kokum Cola',
      lines: ['KOKUM', 'COLA'],
      hi: 'कोकम',
      index: '01',
      notes: 'Sour-sweet Konkan kokum meets kola nut, a lick of jaggery and black salt. Tastes like a coastal summer, drinks like a cola that grew up.',
      stamps: ['No added sugar', '3g prebiotic fibre', '38 kcal', 'Born in Bharat'],
      ticker: ['Digestive flow', 'Traditional fusion', 'Energy boost', 'Sol kadhi, but make it fizz', 'Konkan coast'],
      can: { bg: '#98a287', accent: '#5f1f2e', a2: '#a9553a', ink: '#2f1519', fruit: '#5f1f2e', fruitHi: '#8e3a4f', leaf: '#56653f' },
      origin: 'Sindhudurg, Konkan coast',
      farm: [
        { hi: 'मिट्टी', t: 'Soil', d: 'Red laterite soil on the Sindhudurg coast. 140 smallholder families tend kokum trees — some older than your grandparents. Zero spray, all rain.', stat: '140', statL: 'farming families' },
        { hi: 'तोड़ना', t: 'Harvest', d: 'Picked by hand in April–May, when the fruit turns deep purple and properly sour. We pay 30% above mandi rates, upfront.', stat: '+30%', statL: 'over mandi price' },
        { hi: 'धूप', t: 'Sun', d: 'Rinds are sun-dried for seven days on woven mats, the way every Konkani aaji has done it. Slow, free, solar-powered.', stat: '7', statL: 'days in the sun' },
        { hi: 'ख़मीर', t: 'Fizz', d: 'Steeped cold with kola nut and spice, then blended with chicory-root inulin for prebiotic fibre. Naturally carbonated in Pune.', stat: '3g', statL: 'prebiotic fibre' },
        { hi: 'डब्बा', t: 'Can', d: 'Sealed in matte, infinitely recyclable aluminium. No plastic rings, no shrink wrap, no plastic anywhere in the box.', stat: '0g', statL: 'plastic per crate' },
        { hi: 'पेट', t: 'Stomach', d: 'Kokum has been a post-meal digestive along the coast for centuries. The fibre feeds the good bacteria. Your gut says thanks.', stat: '38', statL: 'kcal per can' }
      ],
      ingredients: [
        { n: 'Kokum', hi: 'कोकम', o: 'Sindhudurg, MH', w: 'Tart, cooling, the soul of sol kadhi.' },
        { n: 'Kola nut', hi: 'कोला', o: 'Fair-trade', w: 'Natural, gentle caffeine — 18mg.' },
        { n: 'Chicory inulin', hi: 'कासनी', o: 'Gujarat', w: 'Prebiotic fibre for your gut flora.' },
        { n: 'Jaggery', hi: 'गुड़', o: 'Kolhapur, MH', w: 'A whisper. 4.2g total sugars.' },
        { n: 'Black salt', hi: 'काला नमक', o: 'Himalayan', w: 'The chaat-masala hit.' },
        { n: 'Roasted cumin', hi: 'जीरा', o: 'Unjha, GJ', w: 'Warm, earthy, digestive.' }
      ],
      nutrition: [['Energy', '38 kcal'], ['Total sugars', '4.2 g'], ['Added sugar', '0 g'], ['Dietary fibre', '3 g'], ['Sodium', '62 mg'], ['Caffeine', '18 mg']]
    },
    guava: {
      id: 'guava',
      name: 'Chili Guava',
      lines: ['CHILI', 'GUAVA'],
      hi: 'अमरूद',
      index: '02',
      notes: 'Pink Allahabadi guava, a slow-burn of Guntur chilli, lime and rock salt. The thela-wala guava slice, carbonated. Wakes you up without the crash.',
      stamps: ['No added sugar', 'Vitamin C rich', '34 kcal', 'Born in Bharat'],
      ticker: ['Gut friendly', 'Wake-up heat', 'Vitamin C', 'Thela-wala classic', 'Pink guava'],
      can: { bg: '#a3a98b', accent: '#b9503a', a2: '#55703a', ink: '#33231a', fruit: '#e09a83', fruitHi: '#f2c0ac', leaf: '#55703a' },
      origin: 'Prayagraj & Guntur',
      farm: [
        { hi: 'मिट्टी', t: 'Soil', d: 'Alluvial Gangetic soil in Prayagraj grows the pinkest guavas in India. The chillies come from sun-baked Guntur fields.', stat: '2', statL: 'states, one can' },
        { hi: 'तोड़ना', t: 'Harvest', d: 'Winter guavas, picked Nov–Feb at peak perfume. Chillies hand-picked and graded by a women-led farmer collective.', stat: '62%', statL: 'women-led sourcing' },
        { hi: 'धूप', t: 'Fire', d: 'Guavas cold-pressed within 24 hours of picking. Chillies fire-roasted over wood for that smoky, slow heat.', stat: '24h', statL: 'tree to press' },
        { hi: 'ख़मीर', t: 'Fizz', d: 'Blended with lime, rock salt and chicory inulin. Gently carbonated — bright, not aggressive.', stat: '3g', statL: 'prebiotic fibre' },
        { hi: 'डब्बा', t: 'Can', d: 'Matte aluminium, recycled and recyclable forever. Printed with low-VOC inks inspired by Bagru block prints.', stat: '∞', statL: 'times recyclable' },
        { hi: 'पेट', t: 'Stomach', d: 'Guava packs serious vitamin C. Chilli warms you up. The fibre keeps things moving. Afternoon slump: handled.', stat: '34', statL: 'kcal per can' }
      ],
      ingredients: [
        { n: 'Pink guava', hi: 'अमरूद', o: 'Prayagraj, UP', w: 'Perfumed, pulpy, loaded with vitamin C.' },
        { n: 'Guntur chilli', hi: 'मिर्च', o: 'Guntur, AP', w: 'Slow-burn heat, fire-roasted.' },
        { n: 'Chicory inulin', hi: 'कासनी', o: 'Gujarat', w: 'Prebiotic fibre for your gut flora.' },
        { n: 'Lime', hi: 'नींबू', o: 'Nagpur, MH', w: 'The squeeze that lifts it all.' },
        { n: 'Rock salt', hi: 'सेंधा नमक', o: 'Himalayan', w: 'Electrolytes, and that thela tang.' },
        { n: 'Stevia leaf', hi: 'मीठी तुलसी', o: 'Punjab', w: 'Rounded sweetness, zero sugar.' }
      ],
      nutrition: [['Energy', '34 kcal'], ['Total sugars', '3.8 g'], ['Added sugar', '0 g'], ['Dietary fibre', '3 g'], ['Vitamin C', '45% RDA'], ['Caffeine', '0 mg']]
    }
  },

  moments: [
    { h: 6.67, label: 'first light', t: 'The 5k before 7', d: 'Cold can, post-run, on the building steps. Chilli wakes you up, rock salt tops up what you sweated out.', f: 'guava', who: 'Ananya, 24 · product designer' },
    { h: 9.25, label: 'the commute', t: 'Metro, mails, mild chaos', d: 'One-handed, matte can, no sticky fingers. Skip the third cutting chai and land at your desk sharp.', f: 'kokum', who: 'Rehaan, 29 · founder, pre-seed' },
    { h: 13.75, label: 'post-thali', t: 'The post-lunch slump', d: 'Kokum is the coast\'s original after-meal digestive. Fibre and fizz instead of a nap under the desk.', f: 'kokum', who: 'Meera, 33 · lawyer' },
    { h: 16.5, label: 'the 4 o\'clock', t: 'Not-chai o\'clock', d: 'Stand-up, deadline, someone says "quick call". Bright, tart, 34 kcal. No sugar crash at 6.', f: 'guava', who: 'Kabir, 21 · CS undergrad' },
    { h: 19.5, label: 'move', t: 'Climb, court, band practice', d: 'Pickleball at 7:30, bouldering at 8. A can in the tote between sets — no electric-blue sports drink required.', f: 'guava', who: 'Zoya, 27 · data analyst' },
    { h: 22.5, label: 'terrace', t: 'Terrace, playlist, no hangover', d: 'Kokum Cola + lime + mint over ice = the Konkan Spritz. Zero-proof, all-in. Work tomorrow? Easy.', f: 'kokum', who: 'Dev, 36 · architect' }
  ],

  deck: [
    { type: 'img', src: 'assets/kokum-paisley.webp', k: 'Lookbook', t: 'Paisley, matte, metal.', d: 'Our first can. Shot on a Jaipur block-print we found in a Crawford Market lane.' },
    { type: 'text', tone: 'plum', k: 'Manifesto', t: 'Your nani was right. We just added fizz.', d: 'Kokum after lunch. Guava with chilli and salt. India figured out functional food centuries ago — we put it in a can you can take to the gym.' },
    { type: 'list', tone: 'sage', k: 'Kyor FM · Vol. 3', t: 'Terrace Tapes', items: ['01  Monsoon on Mute', '02  Konkan Drift', '03  Chai Break Interlude', '04  Bagru Bass', '05  Last Local Home', '06  Kokum Skies'], d: 'Commissioned from indie producers across Pune, Shillong & Kochi.' },
    { type: 'img', src: 'assets/kokum-plinth.webp', k: 'Kokum Cola', t: 'The cola that grew up.', d: 'Tart. Spiced. Coastal. 18mg of kola-nut caffeine.' },
    { type: 'text', tone: 'terra', k: 'Terrace Sessions', t: 'Every 2nd Saturday.', d: 'Live sets, zine swaps, a Konkan Spritz bar. Bandra · Indiranagar · Hauz Khas. Free with any can — RSVP on WhatsApp.' },
    { type: 'list', tone: 'paper', k: 'Recipe card', t: 'Zero-proof Guava Paloma', items: ['1 can Chili Guava', '½ lime, squeezed', 'Rock salt + chilli rim', 'Lots of ice', 'Grapefruit peel'], d: 'Shake nothing. Pour everything. Serve on a Tuesday.' },
    { type: 'img', src: 'assets/guava-plinth.webp', k: 'Chili Guava', t: 'Thela-wala, carbonated.', d: 'Pink guava, Guntur chilli, lime and rock salt.' },
    { type: 'text', tone: 'ink', k: 'Kyor Goods', t: 'Things to carry it in.', d: 'Hand block-printed totes from Bagru. Matte steel tumblers. Enamel pins. Made in small batches, sold in the Dukaan.' }
  ],

  products: [
    { id: 'kk6', cat: 'kokum', name: 'Kokum Cola', pack: '6 cans', price: 540, art: { kind: 'cans', f: ['kokum', 'kokum', 'kokum'] }, tag: 'Bestseller' },
    { id: 'kk12', cat: 'kokum', name: 'Kokum Cola', pack: '12 cans', price: 1020, art: { kind: 'cans', f: ['kokum', 'kokum', 'kokum', 'kokum'] } },
    { id: 'cg6', cat: 'guava', name: 'Chili Guava', pack: '6 cans', price: 540, art: { kind: 'cans', f: ['guava', 'guava', 'guava'] }, tag: 'New' },
    { id: 'cg12', cat: 'guava', name: 'Chili Guava', pack: '12 cans', price: 1020, art: { kind: 'cans', f: ['guava', 'guava', 'guava', 'guava'] } },
    { id: 'disc4', cat: 'mixed', name: 'Pehla Sip Kit', pack: '2 + 2 cans', price: 349, art: { kind: 'cans', f: ['kokum', 'guava'] }, tag: 'Try first' },
    { id: 'duo24', cat: 'mixed', name: 'The Adda Crate', pack: '12 + 12 cans', price: 1920, art: { kind: 'cans', f: ['kokum', 'guava', 'kokum', 'guava'] }, tag: 'Save 11%' },
    { id: 'tote', cat: 'merch', name: 'Bagru Block-print Tote', pack: 'Hand-printed cotton', price: 699, art: { kind: 'tote' } },
    { id: 'tumbler', cat: 'merch', name: 'Matte Steel Tumbler', pack: '450 ml · double-walled', price: 899, art: { kind: 'tumbler' } },
    { id: 'tee', cat: 'merch', name: 'Adda Club Tee', pack: 'Heavy cotton · S–XXL', price: 1199, art: { kind: 'tee' } },
    { id: 'pins', cat: 'merch', name: 'Enamel Pin Set', pack: 'Kokum · Chilli · Can', price: 299, art: { kind: 'pins' } }
  ],

  banks: ['State Bank', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Bank of Baroda', 'Yes Bank', 'Other']
};
