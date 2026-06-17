'use strict';
/* SmartFin Tournaments — Weekly competitive events */

const TOURNAMENT_OPPONENTS = [
  { name: 'Luna García', flag: '🇲🇽', level: 'B2', xp: 12400, avatar: '👩' },
  { name: 'James Chen', flag: '🇨🇳', level: 'C1', xp: 28900, avatar: '👨' },
  { name: 'Sofia Müller', flag: '🇩🇪', level: 'B1', xp: 6200, avatar: '👩‍🦰' },
  { name: 'Carlos Rivera', flag: '🇧🇷', level: 'A2', xp: 2100, avatar: '👦' },
  { name: 'Akira Tanaka', flag: '🇯🇵', level: 'C2', xp: 45000, avatar: '🧑' },
  { name: 'Priya Patel', flag: '🇮🇳', level: 'B2', xp: 15600, avatar: '👩‍🦱' },
  { name: 'Marco Rossi', flag: '🇮🇹', level: 'B1', xp: 7800, avatar: '👨‍🦲' },
  { name: 'Emma Wilson', flag: '🇬🇧', level: 'C1', xp: 32000, avatar: '👩‍🦳' },
  { name: 'Ahmed Hassan', flag: '🇪🇬', level: 'A2', xp: 3400, avatar: '🧔' },
  { name: 'Yuki Kim', flag: '🇰🇷', level: 'B2', xp: 18200, avatar: '👧' }
];

const TOURNAMENT_QUESTIONS = [
  { q: 'Choose the correct form: "If I ___ you, I would leave."', options: ['am','were','be','is'], answer: 1 },
  { q: 'The word "ubiquitous" means...', options: ['rare','everywhere','colorful','ancient'], answer: 1 },
  { q: '"She has been working here ___ 2019."', options: ['for','since','during','in'], answer: 1 },
  { q: 'Identify the subjunctive: ', options: ['I go to school','I suggest he go','He goes home','She went there'], answer: 1 },
  { q: '"Ephemeral" means...', options: ['eternal','short-lived','bright','strong'], answer: 1 },
  { q: 'Passive voice of "They built the bridge":',options: ['The bridge built them','The bridge was built','The bridge is building','Built was the bridge'], answer: 1 },
  { q: '"Albeit" is closest in meaning to...', options: ['although','because','unless','since'], answer: 0 },
  { q: 'The gerund in: "Swimming is healthy"', options: ['Swimming','is','healthy','none'], answer: 0 },
  { q: '"Superfluous" means...', options: ['necessary','excessive/unnecessary','powerful','slow'], answer: 1 },
  { q: 'Reported speech: He said "I am tired" →', options: ['He said he is tired','He said he was tired','He says he tired','He said I was tired'], answer: 1 }
];

let tournamentState = null, tournamentQIndex = 0, tournamentScore = 0, tournamentTimer = null, tournamentTimeLeft = 30;

function seededRandT(seed) { const x = Math.sin(seed+1)*10000; return x - Math.floor(x); }

function getWeekKey() {
  const d = new Date(); const day = d.getDay(), diff = d.getDate() - day + (day===0?-6:1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0,10);
}

function generateTournamentBracket() {
  const week = getWeekKey();
  const seed = parseInt(week.replace(/-/g,''));
  const shuffled = [...TOURNAMENT_OPPONENTS].sort((a,b) => seededRandT(seed + TOURNAMENT_OPPONENTS.indexOf(a)) - 0.5);
  return shuffled.slice(0, 4);
}

function renderTournamentsPage() {
  const page = document.getElementById('page-tournaments');
  if (!page) return;
  const s = window.state || {};
  const td = s.tournamentData || {};
  const bracket = generateTournamentBracket();
  const weekKey = getWeekKey();
  const weekResult = td[weekKey];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🏆 Weekly Tournament</h1>
      <p class="page-subtitle">Compete against learners worldwide. Tournament resets every Monday.</p>
    </div>

    <div class="tournament-banner">
      <div class="tournament-week">📅 Week of ${weekKey}</div>
      <div class="tournament-prize">🥇 1st Place: 500 🪙 + 300 XP</div>
    </div>

    <div class="tournament-bracket">
      <h3 class="bracket-title">Your Opponents</h3>
      <div class="bracket-grid">
        ${bracket.map((opp, i) => {
          const result = weekResult && weekResult[i];
          return `
            <div class="bracket-card ${result ? (result.won ? 'won' : 'lost') : ''}">
              <div class="bracket-opponent">
                <span class="opp-avatar">${opp.avatar}</span>
                <div class="opp-info">
                  <div class="opp-name">${opp.flag} ${opp.name}</div>
                  <div class="opp-level">${opp.level} · ⚡ ${opp.xp.toLocaleString()} XP</div>
                </div>
              </div>
              ${result
                ? `<div class="bracket-result ${result.won ? 'won' : 'lost'}">${result.won ? '🏆 Won' : '❌ Lost'} (${result.score}/${TOURNAMENT_QUESTIONS.length})</div>`
                : `<button class="btn btn-primary btn-sm" onclick="startTournamentMatch(${i})">⚔️ Challenge</button>`
              }
            </div>`;
        }).join('')}
      </div>
    </div>

    ${buildLeaderboard(bracket, weekResult)}

    <div class="tournament-rewards">
      <h3 class="section-title">Weekly Rewards</h3>
      <div class="rewards-grid">
        <div class="reward-tier gold"><div class="tier-badge">🥇</div><div>1st Place</div><div class="tier-prize">500 🪙 + 300 XP</div></div>
        <div class="reward-tier silver"><div class="tier-badge">🥈</div><div>2nd Place</div><div class="tier-prize">300 🪙 + 200 XP</div></div>
        <div class="reward-tier bronze"><div class="tier-badge">🥉</div><div>3rd Place</div><div class="tier-prize">150 🪙 + 100 XP</div></div>
        <div class="reward-tier"><div class="tier-badge">🎖️</div><div>Participant</div><div class="tier-prize">50 🪙 + 30 XP</div></div>
      </div>
    </div>`;
}

function buildLeaderboard(bracket, weekResult) {
  const s = window.state || {};
  const userXP = s.xp || 0;
  const userName = (s.user && s.user.name) || 'You';
  const entries = [
    { name: `🐬 ${userName}`, xp: userXP, score: weekResult ? Object.values(weekResult).reduce((a,r) => a + (r.won ? 1 : 0), 0) : 0, isUser: true },
    ...bracket.map((opp, i) => ({
      name: `${opp.flag} ${opp.name}`, xp: opp.xp,
      score: weekResult && weekResult[i] ? (weekResult[i].won ? 0 : 1) : Math.floor(seededRandT(i + 17) * 3),
      isUser: false
    }))
  ].sort((a,b) => b.score - a.score || b.xp - a.xp);

  return `
    <div class="tournament-leaderboard">
      <h3 class="section-title">📊 Current Standings</h3>
      ${entries.map((e, i) => `
        <div class="tour-lb-row ${e.isUser ? 'user-row' : ''}">
          <span class="tour-lb-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
          <span class="tour-lb-name">${e.name}</span>
          <span class="tour-lb-wins">${e.score} wins</span>
          <span class="tour-lb-xp">⚡ ${e.xp.toLocaleString()}</span>
        </div>`).join('')}
    </div>`;
}

function startTournamentMatch(opponentIndex) {
  const bracket = generateTournamentBracket();
  tournamentState = { opponent: bracket[opponentIndex], opponentIndex };
  tournamentQIndex = 0; tournamentScore = 0;
  renderTournamentMatch();
}

function renderTournamentMatch() {
  const page = document.getElementById('page-tournaments');
  if (!page || !tournamentState) return;
  const opp = tournamentState.opponent;
  const oppScore = Math.floor(seededRandT(tournamentQIndex + 42) * 0.7 + 0.3) > 0.5 ? tournamentScore : Math.max(0, tournamentScore - 1);

  if (tournamentQIndex >= TOURNAMENT_QUESTIONS.length) { endTournamentMatch(); return; }
  const q = TOURNAMENT_QUESTIONS[tournamentQIndex];
  tournamentTimeLeft = 30;

  page.innerHTML = `
    <div class="tournament-match-header">
      <div class="match-player">🐬 You<br><span class="match-score">${tournamentScore}</span></div>
      <div class="match-vs">VS</div>
      <div class="match-opponent">${opp.avatar} ${opp.name}<br><span class="match-score">${oppScore}</span></div>
    </div>
    <div class="tournament-question-card">
      <div class="t-q-progress">${tournamentQIndex+1}/${TOURNAMENT_QUESTIONS.length}</div>
      <div class="t-q-timer" id="tTimer">${tournamentTimeLeft}s</div>
      <p class="t-q-text">${q.q}</p>
      <div class="t-q-options">
        ${q.options.map((o,i) => `<button class="t-q-option" onclick="answerTournamentQ(${i})">${o}</button>`).join('')}
      </div>
    </div>`;

  if (tournamentTimer) clearInterval(tournamentTimer);
  tournamentTimer = setInterval(() => {
    tournamentTimeLeft--;
    const el = document.getElementById('tTimer');
    if (el) { el.textContent = tournamentTimeLeft + 's'; if (tournamentTimeLeft <= 10) el.style.color = '#ef4444'; }
    if (tournamentTimeLeft <= 0) { answerTournamentQ(-1); }
  }, 1000);
}

function answerTournamentQ(index) {
  if (tournamentTimer) { clearInterval(tournamentTimer); tournamentTimer = null; }
  const q = TOURNAMENT_QUESTIONS[tournamentQIndex];
  const btns = document.querySelectorAll('.t-q-option');
  btns.forEach((b,i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === index) b.classList.add('incorrect');
  });
  if (index === q.answer) { tournamentScore++; if (window.mascotReact) window.mascotReact('correct'); }
  tournamentQIndex++;
  setTimeout(renderTournamentMatch, 800);
}

function endTournamentMatch() {
  if (tournamentTimer) clearInterval(tournamentTimer);
  const opp = tournamentState.opponent;
  const oppScore = Math.floor(seededRandT(TOURNAMENT_QUESTIONS.length + 9) * (TOURNAMENT_QUESTIONS.length * 0.6));
  const won = tournamentScore > oppScore;

  if (!window.state) window.state = {};
  if (!window.state.tournamentData) window.state.tournamentData = {};
  const weekKey = getWeekKey();
  if (!window.state.tournamentData[weekKey]) window.state.tournamentData[weekKey] = {};
  window.state.tournamentData[weekKey][tournamentState.opponentIndex] = { won, score: tournamentScore };
  if (window.saveState) window.saveState();

  const xpReward = won ? 50 : 15, coinReward = won ? 80 : 20;
  if (window.earnXP) window.earnXP(xpReward);
  if (window.earnCoins) window.earnCoins(coinReward, 'tournament');
  if (window.mascotReact) window.mascotReact(won ? 'lesson_complete' : 'wrong');

  const page = document.getElementById('page-tournaments');
  if (page) {
    page.innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:72px;margin-bottom:16px">${won ? '🏆' : '💪'}</div>
        <h2 style="color:#e2e8f0">${won ? 'Victory!' : 'Good effort!'}</h2>
        <p style="color:#94a3b8;margin-bottom:24px">vs ${opp.avatar} ${opp.name}</p>
        <div class="match-final-scores">
          <div class="final-score-box ${won ? 'winner' : ''}">You<br><b>${tournamentScore}</b></div>
          <div>vs</div>
          <div class="final-score-box ${!won ? 'winner' : ''}">${opp.name}<br><b>${oppScore}</b></div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;margin:24px 0">
          <div class="reward-badge">⚡ +${xpReward} XP</div>
          <div class="reward-badge">🪙 +${coinReward}</div>
        </div>
        <button class="btn btn-primary" onclick="renderTournamentsPage()">Back to Tournament</button>
      </div>`;
  }
}
