/* ── assets.js ── champion data ── */
const src = window.WC_CHAMPION || {};
const champion = {
  player:     src.player     || 'PLAYER NAME',
  country:    src.country    || 'COUNTRY',
  flag:       src.flag       || '🏆',
  year:       src.year       || 2026,
  lang:       src.lang       || 'en',
  onComplete: src.onComplete || null,
};
