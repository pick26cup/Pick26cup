// ─── CHAMPION ─────────────────────────────────────────────────────────────────
export const CHAMPION = {
  player:  'JOHN ALVARADO',
  country: 'COLOMBIA',
  flag:    '🇨🇴',
  year:    2026,
};

// ─── TOP 10 (replace with real data from Firebase) ────────────────────────────
export const TOP10 = [
  { rank:10, name:'CARLOS MÉNDEZ',   pts:2840 },
  { rank: 9, name:'LAURA JIMÉNEZ',   pts:2910 },
  { rank: 8, name:'ANDRÉS TORRES',   pts:2975 },
  { rank: 7, name:'SOFÍA RAMOS',     pts:3040 },
  { rank: 6, name:'DIEGO HERRERA',   pts:3120 },
  { rank: 5, name:'VALENTINA CRUZ',  pts:3210 },
  { rank: 4, name:'MIGUEL SANTOS',   pts:3290 },
  { rank: 3, name:'ISABELLA MORA',   pts:3380 },
  { rank: 2, name:'SEBASTIÁN RUIZ',  pts:3460 },
  { rank: 1, name:'JOHN ALVARADO',   pts:3590 },
];

export const STATS = [
  { label: 'TOTAL JUGADORES',  value: '12,542' },
  { label: 'PICKS REALIZADOS', value: '93,412' },
  { label: 'RONDAS PERFECTAS', value: '847'    },
];

export const ROUNDS = ['ROUND 1','ROUND 2','ROUND 3','ROUND 4','ROUND 5','ROUND 6','FINAL'];

// ─── PALETTE (never saturated, always elegant) ────────────────────────────────
export const C = {
  gold:       0xd4af37,
  goldBright: 0xf5c518,
  goldDark:   0x8b6914,
  blue:       0x060d1a,
  blueDeep:   0x020509,
  white:      0xffffff,
  black:      0x000000,
};

// ─── ADAPTIVE QUALITY ─────────────────────────────────────────────────────────
const _mem   = navigator.deviceMemory    || 4;
const _cores = navigator.hardwareConcurrency || 4;
const _px    = devicePixelRatio          || 1;

export const QUALITY =
  (_mem >= 6 && _cores >= 6) ? 'HIGH' :
  (_mem >= 3 && _cores >= 4) ? 'MED'  : 'LOW';

export const Q = {
  HIGH: { crowd:9000, fireworkParts:100, bloom:true,  px: Math.min(_px,2),   fog:0.007 },
  MED:  { crowd:5000, fireworkParts: 60, bloom:true,  px: Math.min(_px,1.5), fog:0.009 },
  LOW:  { crowd:2500, fireworkParts: 30, bloom:false, px: 1,                  fog:0.013 },
}[QUALITY];
