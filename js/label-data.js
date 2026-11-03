/* KYOR label layouts, taken from the Photoshop live-type kits (2032 × 2260 px incl. 3 mm bleed).
   `base` is what stays printed on the can when the label is peeled.
   `tiles` lift off the can; tiles with a `room` open that room when clicked. */
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

export const LABEL = { w: 2032, h: 2260 };

export const LABELS = {
  kokum: {
    dir: 'assets/kit/kokum/',
    images: ['bg', 'grid', 'wordmark', 'pattern-left', 'fruit', 'monk', 'pattern-rt', 'pattern-rb', 'runner', 'arch', 'paisley', 'e-sign'],
    base: [
      { img: 'bg', x: 0, y: 0 },
      { img: 'grid', x: 138, y: 286 },
      { fill: rgb([113, 63, 45]), rect: [150, 298, 450, 690] },
      { fill: rgb([177, 88, 45]), rect: [1562, 298, 1882, 690] },
      { fill: rgb([241, 226, 197]), rect: [150, 702, 450, 946] },
      { fill: rgb([174, 89, 45]), rect: [150, 1742, 1882, 2026] },
      { text: 'KOKUM COLA', font: '700 {s}px Montserrat', size: 154.79, tr: -33, color: rgb([247, 219, 182]), align: 'center', x: 1018.8, y: 1896 },
      { text: 'DIGESTIVE FLOW | NATURAL ELECTROLYTES | BHARATIYA TASTE', font: '700 {s}px Roboto', size: 57.65, tr: -14, color: rgb([252, 208, 162]), align: 'center', x: 1017.7, y: 1982 },
      { text: 'PREBIOTIC & FUNCTIONAL SODA', font: '600 {s}px Barlow', size: 88.73, tr: 2, color: rgb([244, 239, 204]), align: 'center', x: 1018.2, y: 243 },
      { text: '355ml', font: '400 {s}px Roboto', size: 94.74, tr: -68, color: rgb([31, 17, 4]), align: 'left', x: 175, y: 2144 },
      { img: 'e-sign', x: 437, y: 2073 },
      { fill: rgb([85, 87, 56]), rect: [552, 2065, 559, 2155] },
      { text: 'NO ADDED SUGAR', font: '500 {s}px "Roboto Condensed"', size: 47.95, tr: 23, color: rgb([35, 30, 10]), align: 'center', x: 776.5, y: 2104 },
      { text: 'LOW CALORIE', font: '500 {s}px "Roboto Condensed"', size: 47.95, tr: 13, color: rgb([30, 25, 10]), align: 'center', x: 776.3, y: 2152 },
      { fill: rgb([85, 87, 56]), rect: [993, 2065, 998, 2154] },
      { text: 'TRADITIONAL', font: '500 {s}px "Roboto Condensed"', size: 49.32, tr: 2, color: rgb([38, 32, 11]), align: 'center', x: 1170.8, y: 2105 },
      { text: 'INGREDIENTS', font: '500 {s}px "Roboto Condensed"', size: 47.95, tr: 18, color: rgb([33, 27, 12]), align: 'center', x: 1173.2, y: 2152 },
      { fill: rgb([85, 87, 56]), rect: [1346, 2066, 1351, 2154] },
      { text: 'BORN IN BHARAT', font: '500 {s}px "Roboto Condensed"', size: 75.56, tr: -22, color: rgb([29, 18, 4]), align: 'left', x: 1389, y: 2137 }
    ],
    tiles: [
      { id: 'band', room: 'shop', name: 'The shop', hint: 'Crates, subscriptions and goods', rect: [462, 298, 1554, 690], fill: rgb([113, 63, 43]), img: 'wordmark', ix: 466, iy: 302 },
      { id: 'pl', rect: [150, 958, 450, 1210], img: 'pattern-left', ix: 150, iy: 958 },
      { id: 'fruit', room: 'origins', name: 'The fruit', hint: 'Where kokum comes from', rect: [462, 702, 1002, 1210], fill: rgb([176, 88, 46]), img: 'fruit', ix: 466, iy: 706 },
      { id: 'monk', room: 'inside', name: 'The calm', hint: 'What it does for your gut', rect: [1010, 702, 1554, 1210], fill: rgb([241, 226, 194]), img: 'monk', ix: 1014, iy: 706 },
      { id: 'prt', rect: [1562, 702, 1882, 946], img: 'pattern-rt', ix: 1562, iy: 702 },
      { id: 'prb', rect: [1562, 958, 1882, 1210], img: 'pattern-rb', ix: 1562, iy: 958 },
      { id: 'runner', room: 'day', name: 'The runner', hint: 'Where it fits in your day', rect: [150, 1218, 722, 1734], fill: rgb([83, 100, 69]), img: 'runner', ix: 154, iy: 1222 },
      { id: 'arch', room: 'sessions', name: 'The arch', hint: 'Kyor sessions, offline', rect: [734, 1218, 1282, 1734], img: 'arch', ix: 734, iy: 1218 },
      { id: 'paisley', rect: [1290, 1218, 1882, 1734], img: 'paisley', ix: 1290, iy: 1218 }
    ]
  },

  guava: {
    dir: 'assets/kit/guava/',
    images: ['bg', 'border', 'arch', 'eye', 'runner-l', 'runner-r', 'fruit', 'wordmark', 'e-sign'],
    base: [
      { img: 'bg', x: 0, y: 0 },
      { img: 'border', x: 0, y: 0 },
      { text: 'CHILI GUAVA', font: '700 {s}px Montserrat', size: 141.1, tr: -21, color: rgb([233, 217, 182]), align: 'center', x: 1053.1, y: 1889 },
      { text: 'DIGESTIVE FLOW | ENERGY BOOST | BHARATIYA TASTE', font: '700 {s}px Roboto', size: 52.94, tr: -9, color: rgb([221, 220, 190]), align: 'center', x: 1053.9, y: 1961 },
      { text: 'PREBIOTIC & FUNCTIONAL SODA', font: '600 {s}px Barlow', size: 63.38, tr: -16, color: rgb([224, 221, 191]), align: 'center', x: 1053, y: 2042 },
      { text: 'GUT VITALITY • SPICED FIZZ', font: '600 {s}px Barlow', size: 88.73, tr: 9, color: rgb([243, 238, 205]), align: 'center', x: 1045.1, y: 246 },
      { text: '355ml', font: '400 {s}px Roboto', size: 80.26, tr: -52, color: rgb([25, 19, 5]), align: 'left', x: 324, y: 2157 },
      { img: 'e-sign', x: 550, y: 2096 },
      { fill: rgb([98, 100, 68]), rect: [650, 2090, 658, 2166] },
      { text: 'NO ADDED SUGAR', font: '500 {s}px "Roboto Condensed"', size: 45.21, tr: -21, color: rgb([37, 34, 13]), align: 'center', x: 845.3, y: 2123 },
      { text: 'LOW CALORIE', font: '500 {s}px "Roboto Condensed"', size: 43.84, tr: -13, color: rgb([38, 35, 15]), align: 'center', x: 844.8, y: 2163 },
      { fill: rgb([98, 100, 68]), rect: [1030, 2088, 1035, 2166] },
      { text: 'TRADITIONAL', font: '500 {s}px "Roboto Condensed"', size: 42.47, tr: 7, color: rgb([36, 33, 13]), align: 'center', x: 1186.6, y: 2122 },
      { text: 'INGREDIENTS', font: '500 {s}px "Roboto Condensed"', size: 43.84, tr: -11, color: rgb([38, 35, 13]), align: 'center', x: 1188.1, y: 2163 },
      { fill: rgb([98, 100, 68]), rect: [1339, 2089, 1342, 2165] },
      { text: 'BORN IN BHARAT', font: '500 {s}px "Roboto Condensed"', size: 68.49, tr: -39, color: rgb([25, 19, 6]), align: 'left', x: 1373, y: 2154 }
    ],
    tiles: [
      { id: 'arch', room: 'sessions', name: 'The arch', hint: 'Kyor sessions, offline', rect: [288, 282, 1812, 2066], img: 'arch', ix: 288, iy: 282 },
      { id: 'eye', room: 'inside', name: 'The eye', hint: 'What it does for your gut', rect: [867, 443, 1222, 794], img: 'eye', ix: 867, iy: 443 },
      { id: 'runner', room: 'day', name: 'The runner', hint: 'Where it fits in your day', rect: [302, 1038, 562, 1402], img: 'runner-l', ix: 302, iy: 1038 },
      { id: 'runner-r', rect: [1558, 1038, 1810, 1402], img: 'runner-r', ix: 1558, iy: 1038 },
      { id: 'fruit', room: 'origins', name: 'The fruit', hint: 'Where guava and chilli come from', rect: [631, 893, 1498, 1536], img: 'fruit', ix: 631, iy: 893 },
      { id: 'band', room: 'shop', name: 'The shop', hint: 'Crates, subscriptions and goods', rect: [734, 1550, 1364, 1763], img: 'wordmark', ix: 734, iy: 1550 }
    ]
  }
};
