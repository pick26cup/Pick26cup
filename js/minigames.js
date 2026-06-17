'use strict';
/* SmartFin Mini-Games */

let activeGame = null, gameScore = 0, gameTimer = null, gameTimeLeft = 60;

// ── WORD MATCH ──────────────────────────────────────────────────────────────

const WORD_MATCH_PAIRS = [
  ['Accomplish','Achieve'],['Benevolent','Kind'],['Contemplate','Think'],['Diligent','Hardworking'],
  ['Eloquent','Articulate'],['Formidable','Impressive'],['Gregarious','Sociable'],['Hesitant','Uncertain'],
  ['Innovative','Creative'],['Jubilant','Joyful'],['Keen','Eager'],['Lucid','Clear']
];

let wmPairs = [], wmSelected = null, wmMatched = [];

function startWordMatch() {
  activeGame = 'word_match'; gameScore = 0; gameTimeLeft = 60; wmSelected = null; wmMatched = [];
  const pool = shuffle([...WORD_MATCH_PAIRS]).slice(0, 6);
  wmPairs = pool;
  const words = shuffle([...pool.map(p => p[0]), ...pool.map(p => p[1])]);
  renderWordMatchGame(words);
  startGameTimer();
}

function renderWordMatchGame(words) {
  const page = document.getElementById('page-minigames');
  if (!page) return;
  page.innerHTML = `
    <div class="game-header">
      <button class="btn-icon" onclick="exitGame()">✕</button>
      <h2 class="game-title">🃏 Word Match</h2>
      <div class="game-stats">
        <span class="game-score">Score: <b id="gScore">${gameScore}</b></span>
        <span class="game-timer" id="gTimer">${gameTimeLeft}s</span>
      </div>
    </div>
    <p class="game-instruction">Match synonyms by clicking pairs</p>
    <div class="word-match-grid" id="wmGrid">
      ${words.map((w, i) => `
        <div class="wm-card" id="wm-${i}" data-word="${w}" onclick="selectWMCard(this)">
          ${w}
        </div>`).join('')}
    </div>`;
}

function selectWMCard(card) {
  if (card.classList.contains('matched') || card.classList.contains('selected')) return;
  card.classList.add('selected');
  if (!wmSelected) { wmSelected = card; return; }
  const w1 = wmSelected.dataset.word, w2 = card.dataset.word;
  const pair = wmPairs.find(p => (p[0]===w1&&p[1]===w2)||(p[1]===w1&&p[0]===w2));
  if (pair) {
    wmSelected.classList.replace('selected','matched');
    card.classList.replace('selected','matched');
    wmMatched.push(pair);
    gameScore += 10;
    const el = document.getElementById('gScore'); if (el) el.textContent = gameScore;
    if (window.mascotReact) window.mascotReact('correct');
    if (wmMatched.length === wmPairs.length) endGame('word_match');
  } else {
    card.classList.add('wrong');
    wmSelected.classList.add('wrong');
    if (window.mascotReact) window.mascotReact('wrong');
    setTimeout(() => {
      card.classList.remove('selected','wrong');
      wmSelected.classList.remove('selected','wrong');
    }, 800);
  }
  wmSelected = null;
}

// ── SENTENCE SCRAMBLE ───────────────────────────────────────────────────────

const SCRAMBLE_SENTENCES = [
  'The quick brown fox jumps over the lazy dog',
  'She sells seashells by the seashore',
  'Practice makes perfect every single day',
  'Learning English opens doors worldwide',
  'Communication is the key to success',
  'Every expert was once a beginner'
];

let scrambleWords = [], scrambleAnswer = [], scrambleCurrent = '';

function startSentenceScramble() {
  activeGame = 'scramble'; gameScore = 0; gameTimeLeft = 90;
  scrambleCurrent = SCRAMBLE_SENTENCES[Math.floor(Math.random() * SCRAMBLE_SENTENCES.length)];
  scrambleWords = shuffle(scrambleCurrent.split(' '));
  scrambleAnswer = [];
  renderScrambleGame();
  startGameTimer();
}

function renderScrambleGame() {
  const page = document.getElementById('page-minigames');
  if (!page) return;
  page.innerHTML = `
    <div class="game-header">
      <button class="btn-icon" onclick="exitGame()">✕</button>
      <h2 class="game-title">🔀 Sentence Scramble</h2>
      <div class="game-stats">
        <span class="game-score">Score: <b id="gScore">${gameScore}</b></span>
        <span class="game-timer" id="gTimer">${gameTimeLeft}s</span>
      </div>
    </div>
    <p class="game-instruction">Tap words to build the correct sentence</p>
    <div class="scramble-answer" id="scrambleAnswer">
      ${scrambleAnswer.map((w,i) => `<span class="answer-word" onclick="removeScrambleWord(${i})">${w}</span>`).join('')}
      <span class="answer-cursor">|</span>
    </div>
    <div class="scramble-bank" id="scrambleBank">
      ${scrambleWords.map((w,i) => `<button class="scramble-word-btn" id="sw-${i}" onclick="addScrambleWord('${w}',${i})">${w}</button>`).join('')}
    </div>
    <button class="btn btn-primary" onclick="checkScramble()" style="margin-top:16px">Check ✓</button>`;
}

function addScrambleWord(word, index) {
  const btn = document.getElementById('sw-'+index);
  if (btn) btn.style.visibility = 'hidden';
  scrambleAnswer.push(word);
  updateScrambleAnswer();
}

function removeScrambleWord(index) {
  const removed = scrambleAnswer.splice(index, 1)[0];
  const btn = document.querySelector(`.scramble-word-btn[onclick*="'${removed}'"]`);
  if (btn) btn.style.visibility = 'visible';
  updateScrambleAnswer();
}

function updateScrambleAnswer() {
  const el = document.getElementById('scrambleAnswer');
  if (!el) return;
  el.innerHTML = scrambleAnswer.map((w,i) => `<span class="answer-word" onclick="removeScrambleWord(${i})">${w}</span>`).join('') + '<span class="answer-cursor">|</span>';
}

function checkScramble() {
  const answer = scrambleAnswer.join(' ');
  if (answer === scrambleCurrent) {
    gameScore += 20;
    const el = document.getElementById('gScore'); if (el) el.textContent = gameScore;
    if (window.showToast) window.showToast('Correct! 🎉', 'success');
    if (window.mascotReact) window.mascotReact('correct');
    scrambleCurrent = SCRAMBLE_SENTENCES[Math.floor(Math.random() * SCRAMBLE_SENTENCES.length)];
    scrambleWords = shuffle(scrambleCurrent.split(' '));
    scrambleAnswer = [];
    setTimeout(renderScrambleGame, 600);
  } else {
    if (window.showToast) window.showToast('Not quite right. Try again!', 'warning');
    if (window.mascotReact) window.mascotReact('wrong');
  }
}

// ── SPEED QUIZ ──────────────────────────────────────────────────────────────

const SPEED_QUESTIONS = [
  { q: 'What is the past tense of "go"?', options: ['goed','gone','went','go'], answer: 2 },
  { q: 'Choose the correct: "She ___ to school yesterday."', options: ['go','goes','went','going'], answer: 2 },
  { q: '"Enormous" means...', options: ['tiny','very large','angry','beautiful'], answer: 1 },
  { q: 'Which is correct?', options: ['I am agree','I am agreeing','I agree','I agreeing'], answer: 2 },
  { q: '"Diligent" means...', options: ['lazy','careless','hardworking','confused'], answer: 2 },
  { q: 'Correct plural of "child":',options: ['childs','childen','children','child'], answer: 2 },
  { q: '"He ___ been working all day."', options: ['have','has','had','is'], answer: 1 },
  { q: 'Opposite of "ancient":',options: ['old','modern','historical','antique'], answer: 1 },
  { q: '"They ___ arrived yet."', options: ["haven't","didn't have","aren't","weren't"], answer: 0 },
  { q: '"Eloquent" describes someone who...', options: ['is angry','speaks well','is shy','is clumsy'], answer: 1 }
];

let sqIndex = 0;

function startSpeedQuiz() {
  activeGame = 'speed_quiz'; gameScore = 0; gameTimeLeft = 60; sqIndex = 0;
  renderSpeedQuizGame();
  startGameTimer();
}

function renderSpeedQuizGame() {
  const page = document.getElementById('page-minigames');
  if (!page) return;
  if (sqIndex >= SPEED_QUESTIONS.length) { endGame('speed_quiz'); return; }
  const q = SPEED_QUESTIONS[sqIndex];
  page.innerHTML = `
    <div class="game-header">
      <button class="btn-icon" onclick="exitGame()">✕</button>
      <h2 class="game-title">⚡ Speed Quiz</h2>
      <div class="game-stats">
        <span class="game-score">Score: <b id="gScore">${gameScore}</b></span>
        <span class="game-timer" id="gTimer">${gameTimeLeft}s</span>
      </div>
    </div>
    <div class="speed-quiz-question">
      <div class="sq-number">${sqIndex+1}/${SPEED_QUESTIONS.length}</div>
      <p class="sq-question">${q.q}</p>
      <div class="sq-options">
        ${q.options.map((o,i) => `<button class="sq-option" onclick="answerSpeedQuiz(${i})">${o}</button>`).join('')}
      </div>
    </div>`;
}

function answerSpeedQuiz(index) {
  const q = SPEED_QUESTIONS[sqIndex];
  const btns = document.querySelectorAll('.sq-option');
  btns.forEach((b,i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === index && index !== q.answer) b.classList.add('incorrect');
  });
  if (index === q.answer) {
    gameScore += 10;
    if (window.mascotReact) window.mascotReact('correct');
  } else {
    if (window.mascotReact) window.mascotReact('wrong');
  }
  sqIndex++;
  setTimeout(renderSpeedQuizGame, 700);
}

// ── LISTEN & SPELL ──────────────────────────────────────────────────────────

const SPELL_WORDS = ['pronunciation','necessary','accommodation','independent','environment','approximately','opportunity','achievement','immediately','vocabulary'];
let spellIndex = 0, spellWord = '';

function startListenSpell() {
  activeGame = 'listen_spell'; gameScore = 0; gameTimeLeft = 120; spellIndex = 0;
  spellWord = SPELL_WORDS[spellIndex];
  renderListenSpellGame();
  startGameTimer();
  setTimeout(() => speakSpellWord(), 600);
}

function renderListenSpellGame() {
  const page = document.getElementById('page-minigames');
  if (!page) return;
  page.innerHTML = `
    <div class="game-header">
      <button class="btn-icon" onclick="exitGame()">✕</button>
      <h2 class="game-title">👂 Listen & Spell</h2>
      <div class="game-stats">
        <span class="game-score">Score: <b id="gScore">${gameScore}</b></span>
        <span class="game-timer" id="gTimer">${gameTimeLeft}s</span>
      </div>
    </div>
    <div class="listen-spell-container">
      <p class="game-instruction">Listen to the word and spell it correctly</p>
      <button class="btn btn-secondary listen-play-btn" onclick="speakSpellWord()">🔊 Play Word</button>
      <div class="spell-word-display">
        ${spellWord.split('').map(() => '<span class="spell-blank">_</span>').join('')}
      </div>
      <input type="text" id="spellInput" class="spell-input" placeholder="Type the word..." autocomplete="off"/>
      <button class="btn btn-primary" onclick="checkSpelling()">Check ✓</button>
      <div class="spell-progress">${spellIndex+1}/${SPELL_WORDS.length}</div>
    </div>`;
  setTimeout(() => { const el = document.getElementById('spellInput'); if (el) el.focus(); }, 100);
}

function speakSpellWord() {
  if (!spellWord) return;
  const utter = new SpeechSynthesisUtterance(spellWord);
  utter.rate = 0.8; utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

function checkSpelling() {
  const input = document.getElementById('spellInput');
  if (!input) return;
  const answer = input.value.trim().toLowerCase();
  if (answer === spellWord) {
    gameScore += 15;
    const el = document.getElementById('gScore'); if (el) el.textContent = gameScore;
    if (window.showToast) window.showToast('Correct spelling! ✅', 'success');
    if (window.mascotReact) window.mascotReact('correct');
    spellIndex++;
    if (spellIndex >= SPELL_WORDS.length) { endGame('listen_spell'); return; }
    spellWord = SPELL_WORDS[spellIndex];
    renderListenSpellGame();
    setTimeout(() => speakSpellWord(), 400);
  } else {
    if (window.showToast) window.showToast(`Not quite! The word was: "${spellWord}"`, 'error');
    if (window.mascotReact) window.mascotReact('wrong');
    input.value = ''; input.focus();
  }
}

// ── SHARED ──────────────────────────────────────────────────────────────────

function startGameTimer() {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    gameTimeLeft--;
    const el = document.getElementById('gTimer');
    if (el) el.textContent = gameTimeLeft + 's';
    if (el && gameTimeLeft <= 10) el.style.color = '#ef4444';
    if (gameTimeLeft <= 0) endGame(activeGame);
  }, 1000);
}

function endGame(gameType) {
  if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
  if (window.earnXP) window.earnXP(Math.floor(gameScore / 2));
  if (window.earnCoins) window.earnCoins(Math.floor(gameScore / 5), 'game_win');
  if (!window.state.gamesHistory) window.state.gamesHistory = [];
  window.state.gamesHistory.unshift({ game: gameType, score: gameScore, date: new Date().toISOString() });
  if (window.saveState) window.saveState();

  const page = document.getElementById('page-minigames');
  if (page) {
    page.innerHTML = `
      <div class="game-over-screen">
        <div style="font-size:64px;margin-bottom:16px">🏆</div>
        <h2 class="game-over-title">Game Over!</h2>
        <div class="game-over-score">${gameScore} pts</div>
        <div class="game-over-rewards">
          <div class="reward-badge">⚡ +${Math.floor(gameScore/2)} XP</div>
          <div class="reward-badge">🪙 +${Math.floor(gameScore/5)}</div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:24px">
          <button class="btn btn-primary" onclick="renderMinigamesMenu()">Play Again</button>
          <button class="btn btn-secondary" onclick="showAppPage('lessons')">Back to Lessons</button>
        </div>
      </div>`;
  }
}

function exitGame() {
  if (gameTimer) clearInterval(gameTimer);
  renderMinigamesMenu();
}

function renderMinigamesMenu() {
  const page = document.getElementById('page-minigames');
  if (!page) return;
  activeGame = null;
  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🎮 Mini-Games</h1>
      <p class="page-subtitle">Fun games to reinforce your English skills</p>
    </div>
    <div class="games-grid">
      <div class="game-card" onclick="startWordMatch()">
        <div class="game-card-emoji">🃏</div>
        <h3 class="game-card-title">Word Match</h3>
        <p class="game-card-desc">Match synonyms before time runs out</p>
        <div class="game-card-meta">⏱️ 60s &nbsp; ⚡ Up to 30 XP</div>
        <button class="btn btn-primary" onclick="startWordMatch();event.stopPropagation()">Play</button>
      </div>
      <div class="game-card" onclick="startSentenceScramble()">
        <div class="game-card-emoji">🔀</div>
        <h3 class="game-card-title">Sentence Scramble</h3>
        <p class="game-card-desc">Arrange words into correct sentences</p>
        <div class="game-card-meta">⏱️ 90s &nbsp; ⚡ Up to 40 XP</div>
        <button class="btn btn-primary" onclick="startSentenceScramble();event.stopPropagation()">Play</button>
      </div>
      <div class="game-card" onclick="startSpeedQuiz()">
        <div class="game-card-emoji">⚡</div>
        <h3 class="game-card-title">Speed Quiz</h3>
        <p class="game-card-desc">Answer grammar questions rapidly</p>
        <div class="game-card-meta">⏱️ 60s &nbsp; ⚡ Up to 50 XP</div>
        <button class="btn btn-primary" onclick="startSpeedQuiz();event.stopPropagation()">Play</button>
      </div>
      <div class="game-card" onclick="startListenSpell()">
        <div class="game-card-emoji">👂</div>
        <h3 class="game-card-title">Listen & Spell</h3>
        <p class="game-card-desc">Listen and spell the word correctly</p>
        <div class="game-card-meta">⏱️ 120s &nbsp; ⚡ Up to 75 XP</div>
        <button class="btn btn-primary" onclick="startListenSpell();event.stopPropagation()">Play</button>
      </div>
    </div>`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
