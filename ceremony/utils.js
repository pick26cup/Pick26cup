/* ── utils.js ── shared helpers ── */
(function(g){
  g.WC = g.WC || {};

  let _last = performance.now();

  g.WC.Utils = {
    rand:   (a, b) => Math.random() * (b - a) + a,
    randI:  (a, b) => Math.floor(Math.random() * (b - a)) + a,
    pick:   (arr)  => arr[~~(Math.random() * arr.length)],
    clamp:  (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
    lerp:   (a, b, t)   => a + (b - a) * t,

    getDelta() {
      const now = performance.now();
      const dt  = Math.min((now - _last) / 1000, 0.05);
      _last = now;
      return dt;
    },

    el:   id  => document.getElementById(id),
    wait: ms  => new Promise(r => setTimeout(r, ms)),
    log:  (...a) => console.log('[WC]', ...a),

    isMobile: () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),

    /* Gold colors for particles */
    GOLDS: ['#FFD700','#FFF176','#D4AF37','#F5C518','#FFEC6E','#E8B923'],
    CONFETTI: ['#FFD700','#FF4136','#2ECC40','#0074D9','#FF69B4','#FF8C00','#FFFFFF','#7FDBFF'],

    /* Ease functions */
    easeOutBack(t){ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); },
    easeInOut(t)  { return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; },
    easeOutExpo(t){ return t===1?1:1-Math.pow(2,-10*t); },
  };
})(window);
