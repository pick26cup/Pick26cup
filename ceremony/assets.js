/* ── assets.js ── asset / config loader ── */
(function(g){
  g.WC = g.WC || {};

  /* Champion data — override from main app before load */
  g.WC.Champion = Object.assign({
    player:  'JOHN ALVARADO',
    country: 'COLOMBIA',
    flag:    '🇨🇴',
    year:    2026,
    lang:    'es',
    onComplete: null,
  }, window.WC_CHAMPION || {});

  g.WC.Assets = {
    ready: false,
    async init(){
      /* In production: preload audio/texture files here */
      this.ready = true;
      WC.Utils.log('Assets ready. Champion:', WC.Champion.player);
    }
  };
})(window);
