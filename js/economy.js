'use strict';
/* SmartFin Economy — coin system and shop */

const COIN_REWARDS = {
  lesson_complete: 10, perfect_score: 25, streak_3: 50, streak_7: 150,
  daily_challenge: 40, story_complete: 30, game_win: 20, first_login: 100
};

const SHOP_ITEMS = [
  { id: 'streak_freeze', name: 'Streak Freeze', emoji: '🛡️', desc: 'Protect your streak for 1 day', price: 50, type: 'consumable' },
  { id: 'heart_refill', name: 'Heart Refill', emoji: '❤️', desc: 'Restore all hearts instantly', price: 30, type: 'consumable' },
  { id: 'xp_boost', name: 'XP Boost 2×', emoji: '⚡', desc: 'Double XP for 1 hour', price: 100, type: 'consumable' },
  { id: 'theme_ocean', name: 'Dark Ocean Theme', emoji: '🌊', desc: 'Deep-sea blue color scheme', price: 150, type: 'theme' },
  { id: 'theme_neon', name: 'Neon Night Theme', emoji: '🌆', desc: 'Electric neon color scheme', price: 150, type: 'theme' },
  { id: 'avatar_smartfin', name: 'SmartFin Avatar', emoji: '🐬', desc: 'Exclusive SmartFin mascot avatar', price: 200, type: 'avatar' }
];

function earnCoins(amount, reason) {
  if (!window.state) return;
  if (!window.state.coins) window.state.coins = 0;
  if (!window.state.coinTransactions) window.state.coinTransactions = [];
  window.state.coins += amount;
  window.state.coinTransactions.unshift({ amount, reason, date: new Date().toISOString() });
  if (window.state.coinTransactions.length > 100) window.state.coinTransactions.pop();
  if (window.saveState) window.saveState();
  updateCoinDisplay();
  animateCoinFloat(amount);
}

function spendCoins(amount) {
  if (!window.state) return false;
  if ((window.state.coins || 0) < amount) return false;
  window.state.coins -= amount;
  if (window.saveState) window.saveState();
  updateCoinDisplay();
  return true;
}

function animateCoinFloat(amount) {
  const el = document.createElement('div');
  el.textContent = '+' + amount + ' 🪙';
  el.style.cssText = `position:fixed;right:80px;top:70px;color:#F59E0B;font-weight:700;
    font-size:18px;pointer-events:none;z-index:9999;
    animation:coinFloat 1.8s ease-out forwards;font-family:Inter,sans-serif;
    text-shadow:0 2px 8px rgba(245,158,11,0.6);`;
  document.body.appendChild(el);
  if (!document.getElementById('coin-float-kf')) {
    const s = document.createElement('style');
    s.id = 'coin-float-kf';
    s.textContent = '@keyframes coinFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(1.2)}}';
    document.head.appendChild(s);
  }
  setTimeout(() => el.remove(), 1900);
}

function updateCoinDisplay() {
  const el = document.getElementById('topCoins');
  if (el) el.textContent = '🪙 ' + (window.state ? (window.state.coins || 0) : 0);
}

function getCoins() {
  return '🪙 ' + (window.state ? (window.state.coins || 0) : 0);
}

function buyItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  if (!window.state) return;
  if (!window.state.shopItems) window.state.shopItems = [];

  const owned = window.state.shopItems.includes(itemId);
  if (owned && item.type !== 'consumable') {
    if (window.showToast) window.showToast('You already own this item!', 'warning');
    return;
  }

  if (!spendCoins(item.price)) {
    if (window.showToast) window.showToast('Not enough coins! Earn more by completing lessons.', 'error');
    return;
  }

  if (item.type !== 'consumable' && !owned) {
    window.state.shopItems.push(itemId);
  }

  switch (itemId) {
    case 'streak_freeze':
      window.state.streakFreezeActive = true;
      if (window.showToast) window.showToast('Streak Freeze activated! Your streak is protected.', 'success');
      break;
    case 'heart_refill':
      window.state.hearts = 5;
      if (window.showToast) window.showToast('Hearts refilled! You have 5 hearts.', 'success');
      break;
    case 'xp_boost':
      window.state.xpBoostUntil = Date.now() + 3600000;
      if (window.showToast) window.showToast('XP Boost 2× active for 1 hour!', 'success');
      break;
    case 'theme_ocean':
      applyTheme('ocean');
      if (window.showToast) window.showToast('Dark Ocean theme applied!', 'success');
      break;
    case 'theme_neon':
      applyTheme('neon');
      if (window.showToast) window.showToast('Neon Night theme applied!', 'success');
      break;
    case 'avatar_smartfin':
      window.state.avatar = '🐬';
      if (window.showToast) window.showToast('SmartFin avatar equipped!', 'success');
      break;
  }

  if (window.saveState) window.saveState();
  renderShopPage();
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'ocean') {
    root.style.setProperty('--bg-primary', '#020B14');
    root.style.setProperty('--accent-purple', '#06B6D4');
    root.style.setProperty('--accent-blue', '#0284C7');
  } else if (theme === 'neon') {
    root.style.setProperty('--bg-primary', '#050508');
    root.style.setProperty('--accent-purple', '#A855F7');
    root.style.setProperty('--accent-blue', '#EC4899');
  }
  if (window.state) window.state.activeTheme = theme;
}

function renderShopPage() {
  const page = document.getElementById('page-shop');
  if (!page) return;
  const coins = window.state ? (window.state.coins || 0) : 0;
  const owned = window.state ? (window.state.shopItems || []) : [];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🏪 Coin Shop</h1>
      <p class="page-subtitle">Spend your coins on power-ups and cosmetics</p>
    </div>
    <div class="shop-balance">
      <span class="shop-balance-label">Your balance:</span>
      <span class="shop-balance-amount">🪙 ${coins}</span>
    </div>
    <div class="shop-grid">
      ${SHOP_ITEMS.map(item => {
        const isOwned = owned.includes(item.id) && item.type !== 'consumable';
        const canAfford = coins >= item.price;
        return `
          <div class="shop-item-card ${isOwned ? 'owned' : ''}">
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-price">🪙 ${item.price}</div>
            <button class="btn ${isOwned ? 'btn-secondary' : (canAfford ? 'btn-primary' : 'btn-secondary')}"
              onclick="buyItem('${item.id}')" ${isOwned ? 'disabled' : ''}>
              ${isOwned ? 'Owned' : 'Buy'}
            </button>
          </div>`;
      }).join('')}
    </div>`;
}
