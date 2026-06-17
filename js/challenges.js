'use strict';
/* SmartFin Daily Challenges */

const CHALLENGE_TYPES = [
  { id: 'vocab_sprint', title: 'Vocabulary Sprint', description: 'Learn 10 new words today', icon: '📚', type: 'vocab', target: 10, reward: { xp: 50, coins: 40 } },
  { id: 'perfect_lesson', title: 'Perfect Lesson', description: 'Complete a lesson with 100% score', icon: '💯', type: 'perfect', target: 1, reward: { xp: 60, coins: 50 } },
  { id: 'speaking_trio', title: 'Speaking Trio', description: 'Complete 3 speaking exercises', icon: '🎙️', type: 'speaking', target: 3, reward: { xp: 45, coins: 35 } },
  { id: 'grammar_master', title: 'Grammar Master', description: 'Answer 8+ grammar questions correctly', icon: '✏️', type: 'grammar', target: 8, reward: { xp: 55, coins: 45 } },
  { id: 'listening_pro', title: 'Listening Pro', description: 'Complete 2 listening lessons', icon: '👂', type: 'listening', target: 2, reward: { xp: 50, coins: 40 } },
  { id: 'ai_conversation', title: 'AI Conversation', description: 'Send 10 messages to your AI tutor', icon: '🤖', type: 'ai_chat', target: 10, reward: { xp: 70, coins: 60 } }
];

const BONUS_CHALLENGES = [
  { id: 'bonus_1', title: 'Early Bird', description: 'Study before 9 AM', icon: '🌅', reward: { xp: 20, coins: 15 } },
  { id: 'bonus_2', title: 'Night Owl', description: 'Study after 9 PM', icon: '🦉', reward: { xp: 20, coins: 15 } },
  { id: 'bonus_3', title: 'Explorer', description: 'Visit 3 different sections', icon: '🗺️', reward: { xp: 15, coins: 10 } }
];

let challengeTimerInterval = null;

function seededRandom(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateDailyChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = Math.floor(seededRandom(seed) * CHALLENGE_TYPES.length);
  return CHALLENGE_TYPES[idx];
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function initDailyChallengeState() {
  if (!window.state) return;
  const today = getTodayKey();
  const prog = window.state.dailyChallengeProgress;
  if (!prog || prog.date !== today) {
    const challenge = generateDailyChallenge();
    window.state.dailyChallengeProgress = {
      date: today, challengeId: challenge.id,
      progress: 0, completed: false
    };
    if (window.saveState) window.saveState();
  }
}

function updateChallengeProgress(type, amount) {
  if (!window.state) return;
  initDailyChallengeState();
  const prog = window.state.dailyChallengeProgress;
  if (!prog || prog.completed) return;

  const challenge = CHALLENGE_TYPES.find(c => c.id === prog.challengeId);
  if (!challenge) return;
  if (challenge.type !== type) return;

  prog.progress = Math.min((prog.progress || 0) + (amount || 1), challenge.target);
  if (window.saveState) window.saveState();
  updateChallengeUI();

  if (prog.progress >= challenge.target && !prog.completed) {
    completeDailyChallenge();
  }
}

function completeDailyChallenge() {
  if (!window.state) return;
  const prog = window.state.dailyChallengeProgress;
  if (!prog || prog.completed) return;

  const challenge = CHALLENGE_TYPES.find(c => c.id === prog.challengeId);
  if (!challenge) return;

  prog.completed = true;
  if (window.saveState) window.saveState();

  if (window.earnXP) window.earnXP(challenge.reward.xp);
  if (window.earnCoins) window.earnCoins(challenge.reward.coins, 'daily_challenge');
  if (window.mascotReact) window.mascotReact('lesson_complete');

  showChallengeCompleteModal(challenge);
}

function showChallengeCompleteModal(challenge) {
  const modal = document.getElementById('modal-challenge-reward');
  if (!modal) {
    if (window.showToast) window.showToast(`Daily Challenge complete! +${challenge.reward.xp} XP +${challenge.reward.coins} 🪙`, 'success');
    return;
  }
  const title = modal.querySelector('#challenge-reward-title');
  const body = modal.querySelector('#challenge-reward-body');
  if (title) title.textContent = `${challenge.icon} Challenge Complete!`;
  if (body) body.innerHTML = `
    <p style="color:#94a3b8;margin-bottom:16px">${challenge.title}</p>
    <div style="display:flex;gap:16px;justify-content:center">
      <div class="reward-badge">⚡ +${challenge.reward.xp} XP</div>
      <div class="reward-badge">🪙 +${challenge.reward.coins}</div>
    </div>`;
  modal.style.display = 'flex';
}

function getMsToMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

function initChallengeTimer() {
  if (challengeTimerInterval) clearInterval(challengeTimerInterval);
  updateCountdown();
  challengeTimerInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const el = document.getElementById('challengeCountdown');
  if (!el) return;
  const ms = getMsToMidnight();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateChallengeUI() {
  const ring = document.getElementById('challenge-progress-ring');
  const txt = document.getElementById('challenge-progress-text');
  if (!ring || !txt || !window.state) return;
  const prog = window.state.dailyChallengeProgress;
  if (!prog) return;
  const challenge = CHALLENGE_TYPES.find(c => c.id === prog.challengeId);
  if (!challenge) return;
  const pct = Math.min(prog.progress / challenge.target, 1);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - pct);
  ring.style.strokeDashoffset = offset;
  txt.textContent = `${prog.progress}/${challenge.target}`;
}

function getChallengeHistory() {
  const history = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const idx = Math.floor(seededRandom(seed) * CHALLENGE_TYPES.length);
    history.push({ date: key, challenge: CHALLENGE_TYPES[idx], completed: Math.random() > 0.4 });
  }
  return history;
}

function renderChallengesPage() {
  const page = document.getElementById('page-challenges');
  if (!page) return;
  initDailyChallengeState();
  const prog = window.state ? window.state.dailyChallengeProgress : null;
  const challenge = prog ? CHALLENGE_TYPES.find(c => c.id === prog.challengeId) : CHALLENGE_TYPES[0];
  const progress = prog ? (prog.progress || 0) : 0;
  const completed = prog ? prog.completed : false;
  const pct = challenge ? Math.min(progress / challenge.target, 1) : 0;
  const circumference = 2 * Math.PI * 36;
  const history = getChallengeHistory();

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date().getDay();

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">⚡ Daily Challenges</h1>
      <p class="page-subtitle">Complete challenges to earn bonus coins and XP</p>
    </div>

    <div class="challenge-main-card ${completed ? 'completed' : ''}">
      <div class="challenge-card-header">
        <div class="challenge-icon">${challenge ? challenge.icon : '⚡'}</div>
        <div class="challenge-info">
          <div class="challenge-title">${challenge ? challenge.title : 'Daily Challenge'}</div>
          <div class="challenge-desc">${challenge ? challenge.description : ''}</div>
          <div class="challenge-rewards">
            <span class="reward-pill">⚡ +${challenge ? challenge.reward.xp : 0} XP</span>
            <span class="reward-pill">🪙 +${challenge ? challenge.reward.coins : 0}</span>
          </div>
        </div>
        <div class="challenge-timer-box">
          <div class="challenge-timer-label">Resets in</div>
          <div class="challenge-timer" id="challengeCountdown">00:00:00</div>
        </div>
      </div>
      <div class="challenge-progress-section">
        <svg class="challenge-ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
          <circle id="challenge-progress-ring" cx="45" cy="45" r="36" fill="none"
            stroke="${completed ? '#10B981' : '#8B5CF6'}" stroke-width="8"
            stroke-linecap="round" stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference * (1 - pct)}"
            transform="rotate(-90 45 45)" style="transition:stroke-dashoffset 0.5s ease"/>
          <text id="challenge-progress-text" x="45" y="50" text-anchor="middle"
            fill="white" font-size="14" font-weight="700">${progress}/${challenge ? challenge.target : 0}</text>
        </svg>
        <div class="challenge-status">${completed ? '✅ Completed!' : `${Math.round(pct*100)}% done`}</div>
      </div>
    </div>

    <div class="challenges-section">
      <h3 class="section-title">Recent Challenges</h3>
      <div class="challenge-history">
        ${history.map(h => `
          <div class="challenge-history-item ${h.completed ? 'done' : 'missed'}">
            <span class="history-icon">${h.challenge.icon}</span>
            <span class="history-name">${h.challenge.title}</span>
            <span class="history-date">${h.date}</span>
            <span class="history-badge">${h.completed ? '✅' : '❌'}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="challenges-section">
      <h3 class="section-title">This Week</h3>
      <div class="week-grid">
        ${weekDays.map((day, i) => {
          const isToday = (i + 1) % 7 === today % 7;
          return `<div class="week-day ${isToday ? 'today' : ''} ${i < today ? 'done' : ''}">
            <div class="week-day-name">${day}</div>
            <div class="week-day-dot">${i < today ? '✅' : (isToday ? '⚡' : '○')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="challenges-section">
      <h3 class="section-title">Bonus Challenges</h3>
      <div class="bonus-challenges">
        ${BONUS_CHALLENGES.map(b => `
          <div class="bonus-card">
            <span class="bonus-icon">${b.icon}</span>
            <div class="bonus-info">
              <div class="bonus-title">${b.title}</div>
              <div class="bonus-desc">${b.description}</div>
            </div>
            <div class="bonus-rewards">
              <span class="reward-pill small">⚡ +${b.reward.xp}</span>
              <span class="reward-pill small">🪙 +${b.reward.coins}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  initChallengeTimer();
}
