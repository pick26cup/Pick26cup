/* ── utils.js ── shared helpers ── */
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp  = (a,b,t) => a+(b-a)*t;
const rand  = (a,b)   => Math.random()*(b-a)+a;
const randI = (a,b)   => Math.floor(rand(a,b));
const pick  = (arr)   => arr[~~(Math.random()*arr.length)];
const wait  = (ms)    => new Promise(r=>setTimeout(r,ms));
const isMobile = ()   => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
