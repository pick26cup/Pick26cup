import { CHAMPION, TOP10, STATS, ROUNDS } from '../config/config.js';
import gsap from 'gsap';

// ─── INJECT CSS ONCE ─────────────────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('ceremony-ui-styles')) return;
  const s = document.createElement('style');
  s.id = 'ceremony-ui-styles';
  s.textContent = `
    #ceremony-overlay { position:fixed;inset:0;pointer-events:none;z-index:10;font-family:'Montserrat',sans-serif; }

    /* start screen */
    #start-screen {
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      background:radial-gradient(ellipse at center, #0a0d1a 0%, #000005 100%);
      pointer-events:all;cursor:pointer;
    }
    #start-screen .logo { width:72px;height:72px;margin-bottom:24px;opacity:0.9; }
    #start-screen h1 {
      font-size:clamp(1.4rem,4vw,2.8rem);font-weight:800;letter-spacing:.22em;
      color:#d4af37;text-transform:uppercase;text-align:center;margin:0 0 10px;
      text-shadow:0 0 40px rgba(212,175,55,.6);
    }
    #start-screen p { color:#8899cc;letter-spacing:.15em;font-size:.85rem;margin:0 0 48px; }
    #start-btn {
      border:2px solid #d4af37;color:#d4af37;background:transparent;
      padding:14px 52px;font-size:1.05rem;font-weight:700;letter-spacing:.2em;
      text-transform:uppercase;cursor:pointer;
      box-shadow:0 0 24px rgba(212,175,55,.25);
      transition:background .25s,box-shadow .25s;
    }
    #start-btn:hover { background:rgba(212,175,55,.1);box-shadow:0 0 40px rgba(212,175,55,.45); }

    /* generic full-screen card */
    .ui-card {
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      opacity:0;pointer-events:none;
    }

    /* round label */
    #round-label {
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      opacity:0;text-align:center;
    }
    #round-label .rl-text {
      font-size:clamp(2rem,7vw,5.5rem);font-weight:900;letter-spacing:.18em;
      color:#ffffff;text-shadow:0 0 60px rgba(255,255,255,.55),0 0 120px rgba(100,140,255,.4);
    }

    /* stat card */
    #stat-card {
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;opacity:0;
    }
    #stat-card .stat-label {
      font-size:clamp(.75rem,2vw,1.1rem);letter-spacing:.22em;
      color:#7788bb;text-transform:uppercase;margin-bottom:12px;
    }
    #stat-card .stat-value {
      font-size:clamp(3rem,9vw,7.5rem);font-weight:900;
      background:linear-gradient(135deg,#f5c518 0%,#d4af37 40%,#ffe066 75%,#b8860b 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      text-shadow:none;filter:drop-shadow(0 0 30px rgba(212,175,55,.65));
    }

    /* top10 */
    #top10-card {
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;opacity:0;
    }
    #top10-card .t10-entry {
      display:flex;align-items:center;gap:18px;margin:6px 0;opacity:0;
      transform:translateX(-40px);
    }
    #top10-card .t10-rank {
      font-size:clamp(.7rem,2vw,1.05rem);font-weight:700;letter-spacing:.1em;
      color:#d4af37;width:2.2em;text-align:right;flex-shrink:0;
    }
    #top10-card .t10-name {
      font-size:clamp(.85rem,2.4vw,1.35rem);font-weight:600;letter-spacing:.08em;
      color:#e8eaf6;white-space:nowrap;
    }
    #top10-card .t10-pts {
      font-size:clamp(.7rem,1.8vw,1rem);color:#5566aa;margin-left:auto;padding-left:24px;
      letter-spacing:.05em;
    }

    /* champion reveal */
    #champ-card {
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;opacity:0;gap:18px;
    }
    #champ-congrats {
      font-size:clamp(.65rem,2vw,1.1rem);letter-spacing:.45em;font-weight:700;
      color:#8899cc;text-transform:uppercase;opacity:0;transform:translateY(10px);
    }
    #champ-name-wrap {
      display:flex;gap:0;justify-content:center;align-items:center;flex-wrap:wrap;
      min-height:2em;
    }
    .champ-letter {
      display:inline-block;opacity:0;transform:translateY(20px) scale(.8);
      font-size:clamp(2.2rem,8vw,6.5rem);font-weight:900;letter-spacing:.04em;
      background:linear-gradient(160deg,#ffe066 0%,#f5c518 30%,#d4af37 55%,#b8860b 80%,#ffe066 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      filter:drop-shadow(0 0 18px rgba(245,197,24,.8));
    }
    .champ-letter-space { display:inline-block;width:.35em; }
    #champ-title {
      font-size:clamp(.7rem,2.2vw,1.25rem);letter-spacing:.35em;font-weight:700;
      color:#ffffff;text-shadow:0 0 30px rgba(255,255,255,.4);
      opacity:0;transform:translateY(8px);
    }
    #champ-country {
      font-size:clamp(1rem,3vw,2.4rem);font-weight:800;letter-spacing:.15em;
      color:#d4af37;text-shadow:0 0 40px rgba(212,175,55,.5);
      opacity:0;transform:translateY(8px);
    }
    #champ-flag {
      font-size:clamp(2rem,5vw,4rem);opacity:0;transform:scale(.6);
      filter:drop-shadow(0 0 20px rgba(255,255,255,.3));
    }

    /* vignette overlay */
    .vignette {
      position:absolute;inset:0;
      background:radial-gradient(ellipse at center, transparent 42%, rgba(0,0,8,.72) 100%);
      pointer-events:none;
    }

    /* skip button */
    #skip-btn {
      position:absolute;bottom:28px;right:32px;
      border:1px solid rgba(212,175,55,.35);color:rgba(212,175,55,.55);
      background:transparent;padding:8px 20px;font-size:.72rem;letter-spacing:.15em;
      text-transform:uppercase;cursor:pointer;pointer-events:all;
      transition:opacity .3s;
    }
    #skip-btn:hover { color:#d4af37;border-color:#d4af37; }
  `;
  document.head.appendChild(s);
}

// ─── STRUCTURE ────────────────────────────────────────────────────────────────
let _overlay, _startScreen;
export let champCard, champCongrats, champNameWrap, champTitle, champCountry, champFlag;
export let statCard, statLabel, statValue;
export let top10Card;
export let roundLabel, roundText;

export function initOverlay() {
  _injectStyles();

  _overlay = document.createElement('div');
  _overlay.id = 'ceremony-overlay';

  // vignette
  const vig = document.createElement('div');
  vig.className = 'vignette';
  _overlay.appendChild(vig);

  // start screen
  _startScreen = document.createElement('div');
  _startScreen.id = 'start-screen';
  _startScreen.innerHTML = `
    <img class="logo" src="logo.jpg" alt="logo" onerror="this.style.display='none'">
    <h1>Pick26Cup<br>World Cup 2026</h1>
    <p>Champion Ceremony</p>
    <button id="start-btn">▶ &nbsp; Begin</button>
  `;
  _overlay.appendChild(_startScreen);

  // round label
  roundLabel = document.createElement('div');
  roundLabel.id = 'round-label';
  roundText = document.createElement('div');
  roundText.className = 'rl-text';
  roundLabel.appendChild(roundText);
  _overlay.appendChild(roundLabel);

  // stat card
  statCard = document.createElement('div');
  statCard.id = 'stat-card';
  statLabel = document.createElement('div');
  statLabel.className = 'stat-label';
  statValue = document.createElement('div');
  statValue.className = 'stat-value';
  statCard.appendChild(statLabel);
  statCard.appendChild(statValue);
  _overlay.appendChild(statCard);

  // top10 card
  top10Card = document.createElement('div');
  top10Card.id = 'top10-card';
  _overlay.appendChild(top10Card);

  // champion card
  champCard    = document.createElement('div');
  champCard.id = 'champ-card';
  champCongrats  = document.createElement('div');
  champCongrats.id  = 'champ-congrats';
  champCongrats.textContent = 'CONGRATULATIONS';
  champNameWrap  = document.createElement('div');
  champNameWrap.id  = 'champ-name-wrap';
  champTitle     = document.createElement('div');
  champTitle.id     = 'champ-title';
  champTitle.textContent = 'WORLD CUP CHAMPION 2026';
  champCountry   = document.createElement('div');
  champCountry.id   = 'champ-country';
  champCountry.textContent = `${CHAMPION.country}`;
  champFlag      = document.createElement('div');
  champFlag.id      = 'champ-flag';
  champFlag.textContent = CHAMPION.flag;
  champCard.append(champCongrats, champNameWrap, champTitle, champCountry, champFlag);
  _overlay.appendChild(champCard);

  // skip btn
  const skip = document.createElement('button');
  skip.id = 'skip-btn';
  skip.textContent = 'Skip';
  skip.onclick = () => window.dispatchEvent(new CustomEvent('ceremony:skip'));
  _overlay.appendChild(skip);

  document.body.appendChild(_overlay);
}

export function getStartScreen()  { return _startScreen; }

// ─── ROUND LABEL ─────────────────────────────────────────────────────────────
export function showRound(text, cb) {
  roundText.textContent = text;
  const tl = gsap.timeline({ onComplete: cb });
  tl.to(roundLabel, { opacity:1, duration:.6, ease:'power2.out' })
    .to(roundLabel, { opacity:0, duration:.6, ease:'power2.in', delay: 1.6 });
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
export function showStat(label, value, cb) {
  statLabel.textContent = label;
  statValue.textContent = value;
  const tl = gsap.timeline({ onComplete: cb });
  tl.to(statCard, { opacity:1, duration:.8, ease:'power2.out' })
    .to(statCard, { opacity:0, duration:.6, ease:'power2.in', delay: 2.5 });
}

// ─── TOP 10 ───────────────────────────────────────────────────────────────────
export function showTop10(entries, cb) {
  top10Card.innerHTML = '';
  entries.forEach(e => {
    const row = document.createElement('div');
    row.className = 't10-entry';
    row.innerHTML = `
      <span class="t10-rank">#${e.rank}</span>
      <span class="t10-name">${e.name}</span>
      <span class="t10-pts">${e.pts.toLocaleString()}</span>
    `;
    top10Card.appendChild(row);
  });

  const rows = top10Card.querySelectorAll('.t10-entry');
  const tl = gsap.timeline({ onComplete: cb });
  tl.to(top10Card, { opacity:1, duration:.5 })
    .to(rows, { opacity:1, x:0, duration:.45, stagger:.08, ease:'power2.out' }, '-=.1')
    .to(top10Card, { opacity:0, duration:.8, ease:'power2.in', delay: 2.8 });
}

// ─── CHAMPION REVEAL ─────────────────────────────────────────────────────────
export function buildChampionLetters() {
  champNameWrap.innerHTML = '';
  const name = CHAMPION.player;
  for (const ch of name) {
    if (ch === ' ') {
      const sp = document.createElement('span');
      sp.className = 'champ-letter-space';
      champNameWrap.appendChild(sp);
    } else {
      const span = document.createElement('span');
      span.className = 'champ-letter';
      span.textContent = ch;
      champNameWrap.appendChild(span);
    }
  }
}

export function revealChampion(onNameDone, onComplete) {
  const letters = champNameWrap.querySelectorAll('.champ-letter');
  const tl = gsap.timeline({ onComplete });

  tl.to(champCard, { opacity:1, duration:.01 })
    .to(champCongrats, { opacity:1, y:0, duration:1.0, ease:'power2.out' })
    .to(letters, {
      opacity:1, y:0, scale:1, duration:.38, stagger:.065,
      ease:'back.out(1.4)',
      onComplete: onNameDone,
    }, '+=0.6')
    .to(champTitle, { opacity:1, y:0, duration:.8, ease:'power2.out' }, '+=0.4')
    .to(champCountry, { opacity:1, y:0, duration:.7, ease:'power2.out' }, '+=0.2')
    .to(champFlag, { opacity:1, scale:1, duration:.6, ease:'back.out(2)' }, '+=0.15');
}

export function hideChampion(cb) {
  gsap.to(champCard, { opacity:0, duration:1.2, ease:'power2.in', onComplete: cb });
}
