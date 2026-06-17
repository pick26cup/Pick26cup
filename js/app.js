/* SmartFin AI — Core Application Logic
   Complete engine: state, lessons, AI, gamification, speech */

'use strict';

// ============================================================
// STATE MANAGEMENT
// ============================================================
const DEFAULT_STATE = {
  user: null,
  xp: 0,
  level: 'A1',
  streak: 0,
  bestStreak: 0,
  lastStudiedDate: null,
  lessonsCompleted: [],
  vocabularyLearned: [],
  vocabularyMastery: {},
  achievements: [],
  weekActivity: [0, 0, 0, 0, 0, 0, 0],
  dailyLessonsToday: 0,
  dailyGoal: 3,
  skills: { speaking: 30, listening: 45, reading: 55, writing: 25, vocabulary: 40, grammar: 35 },
  settings: {
    apiKey: '',
    model: 'gpt-4o',
    nativeLang: 'es',
    learningGoal: 'general',
    soundEnabled: true,
    grammarCheck: true,
    autoSpeak: false,
    streakReminders: true
  },
  avatar: '👤',
  coins: 0,
  coinTransactions: [],
  dailyChallengeProgress: null,
  storiesCompleted: [],
  storyChoices: {},
  pronunciationScores: {},
  specializationProgress: {},
  gamesHistory: [],
  tournamentData: {},
  certificates: [],
  activityHeatmap: {},
  shopItems: [],
  streakFreezeActive: false,
  xpBoostUntil: 0,
  hearts: 5,
  activeTheme: 'default'
};

let state = loadState();
let curriculum = null;

// ============================================================
// LESSON SESSION STATE
// ============================================================
let lessonSession = {
  lesson: null,
  exercises: [],
  currentIndex: 0,
  hearts: 3,
  xpEarned: 0,
  correctCount: 0,
  startTime: null
};

// Active conversation
let chatState = {
  messages: [],
  tutor: 'nova',
  scenario: 'free',
  isTyping: false,
  grammarCheck: true,
  translation: true
};

// Speech
let recognition = null;
let synth = window.speechSynthesis;
let isRecording = false;
let voiceInputActive = false;

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  drawNeuralBackground();
  curriculum = await loadCurriculum();
  checkStreakOnLoad();

  if (state.user) {
    initApp();
  } else {
    showView('landing');
  }

  initSpeechRecognition();
  window.addEventListener('resize', () => {
    if (document.getElementById('view-app').classList.contains('active')) {
      document.getElementById('menuToggle').style.display =
        window.innerWidth < 768 ? 'flex' : 'none';
    }
  });
});

// ============================================================
// DATA
// ============================================================
async function loadCurriculum() {
  try {
    const r = await fetch('data/curriculum.json');
    return await r.json();
  } catch (e) {
    console.error('Curriculum load error', e);
    return { levels: {}, assessmentQuestions: [], achievements: [] };
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('smartfin_state');
    return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
  } catch { return { ...DEFAULT_STATE }; }
}

function saveState() {
  localStorage.setItem('smartfin_state', JSON.stringify(state));
}

// ============================================================
// VIEW ROUTING
// ============================================================
function showView(view, subMode) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  const map = {
    landing: 'view-landing',
    auth: 'view-auth',
    assessment: 'view-assessment',
    app: 'view-app',
    lesson: 'view-lesson-active',
    story: 'view-story'
  };

  const el = document.getElementById(map[view] || `view-${view}`);
  if (el) el.classList.add('active');

  if (view === 'auth') {
    if (subMode === 'register') switchAuthTab('register');
    else switchAuthTab('login');
  }

  if (view === 'assessment') startAssessment();
  if (view === 'app') renderApp();
}

// ============================================================
// AUTH
// ============================================================
function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginTab').classList.toggle('active', isLogin);
  document.getElementById('registerTab').classList.toggle('active', !isLogin);
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('registerForm').classList.toggle('hidden', isLogin);
  document.getElementById('authSubtitle').textContent = isLogin
    ? 'Welcome back! Continue your journey.'
    : 'Start your path to English fluency today.';
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email || !pass) { showToast('Please fill in all fields', 'error'); return; }

  const users = JSON.parse(localStorage.getItem('smartfin_users') || '[]');
  const user = users.find(u => u.email === email);

  if (!user || user.password !== btoa(pass)) {
    showToast('Invalid email or password', 'error'); return;
  }

  state = { ...DEFAULT_STATE, ...user.state, user: { email, name: user.name } };
  saveState();
  showToast(`Welcome back, ${user.name}! 🎉`, 'success');
  initApp();
}

function handleRegister() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const pass = document.getElementById('registerPassword').value;
  const lang = document.getElementById('registerLang').value;

  if (!name || !email || !pass) { showToast('Please fill all fields', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

  const users = JSON.parse(localStorage.getItem('smartfin_users') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('Email already registered. Please log in.', 'error'); return;
  }

  const newUser = { email, name, password: btoa(pass), state: {} };
  users.push(newUser);
  localStorage.setItem('smartfin_users', JSON.stringify(users));

  state = { ...DEFAULT_STATE, user: { email, name }, settings: { ...DEFAULT_STATE.settings, nativeLang: lang } };
  saveState();
  showToast(`Account created! Let's assess your level 🚀`, 'success');
  showView('assessment');
}

function handleGoogleAuth() {
  const name = 'Demo User';
  const email = 'demo@smartfinai.com';
  state = { ...DEFAULT_STATE, user: { email, name } };
  saveState();
  showToast('Signed in with Google! 🎉', 'success');
  showView('assessment');
}

function logout() {
  if (!confirm('Are you sure you want to log out?')) return;
  state.user = null;
  saveState();
  showView('landing');
  showToast('Logged out successfully', 'info');
}

// ============================================================
// LEVEL ASSESSMENT
// ============================================================
let assessState = { current: 0, answers: [], score: 0 };

function startAssessment() {
  assessState = { current: 0, answers: [], score: 0 };
  renderAssessmentQuestion();
}

function renderAssessmentQuestion() {
  const questions = curriculum?.assessmentQuestions || [];
  const total = questions.length;
  const idx = assessState.current;

  if (idx >= total) { finishAssessment(); return; }

  const q = questions[idx];
  const pct = ((idx / total) * 100).toFixed(0);

  document.getElementById('assessProgressBar').style.width = pct + '%';
  document.getElementById('assessProgressText').textContent = `${idx}/${total}`;

  const levelColors = { A1: '#10B981', A2: '#3B82F6', B1: '#8B5CF6', B2: '#F59E0B', C1: '#EF4444', C2: '#EC4899' };
  const tag = document.getElementById('assessmentLevelTag');
  tag.textContent = `📚 ${q.level} Question`;
  tag.style.background = hexToRgba(levelColors[q.level] || '#8B5CF6', 0.15);
  tag.style.borderColor = hexToRgba(levelColors[q.level] || '#8B5CF6', 0.4);
  tag.style.color = levelColors[q.level] || '#A78BFA';

  document.getElementById('assessmentQuestion').textContent = q.question;

  const opts = document.getElementById('assessmentOptions');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'assessment-option';
    btn.textContent = opt;
    btn.onclick = () => handleAssessAnswer(i, q.answer);
    opts.appendChild(btn);
  });
}

function handleAssessAnswer(selected, correct) {
  const opts = document.querySelectorAll('.assessment-option');
  opts.forEach(o => o.onclick = null);

  opts[selected].classList.add(selected === correct ? 'correct' : 'wrong');
  if (selected !== correct) opts[correct].classList.add('correct');

  if (selected === correct) assessState.score++;
  assessState.answers.push(selected);

  setTimeout(() => {
    assessState.current++;
    renderAssessmentQuestion();
  }, 900);
}

function finishAssessment() {
  const total = curriculum.assessmentQuestions.length;
  const score = assessState.score;
  const pct = score / total;

  let level = 'A1';
  if (pct >= 0.9) level = 'C2';
  else if (pct >= 0.75) level = 'C1';
  else if (pct >= 0.6) level = 'B2';
  else if (pct >= 0.45) level = 'B1';
  else if (pct >= 0.25) level = 'A2';
  else level = 'A1';

  state.level = level;
  saveState();

  document.getElementById('assessmentQuestion').innerHTML =
    `<div style="text-align:center;padding:20px 0">
      <div style="font-size:60px;margin-bottom:16px">🎯</div>
      <div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px">Your English Level</div>
      <div style="font-size:56px;font-weight:900;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${level}</div>
      <div style="font-size:18px;margin:8px 0">${getLevelName(level)}</div>
      <div style="font-size:14px;color:var(--text-secondary)">Score: ${score}/${total} correct</div>
    </div>`;

  document.getElementById('assessmentOptions').innerHTML =
    `<button class="btn btn-primary btn-lg btn-full" onclick="initApp()" style="margin-top:12px">
      Start Your Journey at ${level} →
    </button>`;
  document.getElementById('assessProgressBar').style.width = '100%';
  document.getElementById('assessProgressText').textContent = `${total}/${total}`;
}

// ============================================================
// APP INITIALIZATION
// ============================================================
function initApp() {
  showView('app');
  updateTopBar();
  showAppPage('dashboard');

  const hour = new Date().getHours();
  document.getElementById('timeGreeting').textContent =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  if (window.innerWidth < 768) {
    document.getElementById('menuToggle').style.display = 'flex';
  }

  if (window.SmartFinMascot) {
    SmartFinMascot.init();
    setTimeout(() => mascotGreet(), 1200);
  }

  if (!state.firstLoginDone) {
    state.firstLoginDone = true;
    if (window.earnCoins) earnCoins(100, 'first_login');
    saveState();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function renderApp() {
  updateTopBar();
  updateSidebar();
  renderDashboard();
}

function showAppPage(page) {
  document.querySelectorAll('.app-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', lessons: 'Lessons', conversation: 'AI Conversation',
    vocabulary: 'Vocabulary', progress: 'Analytics', achievements: 'Achievements',
    leaderboard: 'Leaderboard', settings: 'Settings',
    challenges: 'Daily Challenges', stories: 'Story Mode', pronunciation: 'Pronunciation Trainer',
    minigames: 'Mini-Games', specializations: 'Specializations', tournaments: 'Tournaments',
    analytics: 'Analytics', certificates: 'Certificates', shop: 'Coin Shop'
  };
  document.getElementById('topbarTitle').textContent = titles[page] || page;

  const renderers = {
    dashboard: renderDashboard,
    lessons: renderLessons,
    conversation: renderConversation,
    vocabulary: renderVocabulary,
    progress: renderProgress,
    achievements: renderAchievements,
    leaderboard: renderLeaderboard,
    settings: renderSettings,
    challenges: () => { if (window.renderChallengesPage) renderChallengesPage(); },
    stories: () => { if (window.renderStoriesPage) renderStoriesPage(); },
    pronunciation: () => { if (window.renderPronunciationPage) renderPronunciationPage(); },
    minigames: () => { if (window.renderMinigamesMenu) renderMinigamesMenu(); },
    specializations: () => { if (window.renderSpecializationPage) renderSpecializationPage(null); },
    tournaments: () => { if (window.renderTournamentsPage) renderTournamentsPage(); },
    analytics: () => { if (window.renderAnalyticsPage) renderAnalyticsPage(); },
    certificates: () => { if (window.renderCertificatesPage) renderCertificatesPage(); },
    shop: () => { if (window.renderShopPage) renderShopPage(); }
  };
  if (renderers[page]) renderers[page]();

  if (window.innerWidth < 768) {
    document.getElementById('appSidebar').classList.remove('open');
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  updateTopBar();
  updateSidebar();

  const name = state.user?.name?.split(' ')[0] || 'Learner';
  document.getElementById('welcomeName').textContent = name;
  document.getElementById('welcomeStreak').textContent = `${state.streak}-day streak`;

  document.getElementById('statStreak').textContent = state.streak;
  document.getElementById('statXP').textContent = formatNumber(state.xp);
  document.getElementById('statLessons').textContent = state.lessonsCompleted.length;
  document.getElementById('statVocab').textContent = state.vocabularyLearned.length;
  document.getElementById('bestStreak').textContent = state.bestStreak;

  const levelData = getLevelData(state.level);
  const nextLevel = getNextLevel(state.level);
  const xpForLevel = nextLevel ? nextLevel.xpRequired : levelData.xpRequired;
  const xpProgress = nextLevel
    ? Math.min(((state.xp - levelData.xpRequired) / (xpForLevel - levelData.xpRequired)) * 100, 100)
    : 100;

  document.getElementById('dashLevelCircle').textContent = state.level;
  document.getElementById('dashLevelName').textContent = levelData.name || state.level;
  document.getElementById('dashLevelDesc').textContent = levelData.description || '';
  document.getElementById('dashLevelChip').textContent = `${state.level} Level`;
  document.getElementById('xpBarFill').style.width = xpProgress + '%';
  document.getElementById('xpProgressText').textContent =
    `${state.xp} / ${nextLevel ? nextLevel.xpRequired : '∞'} XP`;
  document.getElementById('nextLevelXP').textContent =
    nextLevel ? formatNumber(nextLevel.xpRequired) : '∞';
  document.getElementById('weekLessons').textContent =
    state.weekActivity.reduce((a, b) => a + b, 0);
  document.getElementById('masteredVocab').textContent =
    Object.values(state.vocabularyMastery).filter(m => m >= 5).length;
  document.getElementById('currentLevelLabel').textContent = state.level;

  renderRecommendedLessons();
  renderGoalProgress();
  renderActivityChart('activityChart', 'activityDays');
}

function renderRecommendedLessons() {
  const container = document.getElementById('recommendedLessons');
  if (!container) return;
  container.innerHTML = '';

  const typeIcons = { vocabulary: '📝', grammar: '✏️', speaking: '🎤', listening: '🎧', reading: '📖' };
  const typeColors = {
    vocabulary: 'rgba(139,92,246,0.15)', grammar: 'rgba(59,130,246,0.15)',
    speaking: 'rgba(239,68,68,0.15)', listening: 'rgba(6,182,212,0.15)', reading: 'rgba(16,185,129,0.15)'
  };

  let lessons = [];
  const levelData = curriculum?.levels?.[state.level];
  if (levelData) {
    levelData.units.forEach(u => {
      u.lessons.forEach(l => {
        if (!state.lessonsCompleted.includes(l.id)) lessons.push(l);
      });
    });
  }
  lessons = lessons.slice(0, 3);
  if (!lessons.length) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:14px;text-align:center;padding:16px">All lessons at this level completed! 🎉</div>';
    return;
  }

  lessons.forEach(l => {
    const div = document.createElement('div');
    div.className = 'lesson-item';
    div.onclick = () => startLesson(l);
    div.innerHTML = `
      <div class="lesson-item-icon" style="background:${typeColors[l.type] || 'rgba(139,92,246,0.15)'}">
        ${typeIcons[l.type] || '📚'}
      </div>
      <div class="lesson-item-info">
        <div class="lesson-item-title">${l.title}</div>
        <div class="lesson-item-meta">
          <span class="chip chip-purple" style="font-size:11px;padding:2px 8px">${l.type}</span>
          <span>~5 min</span>
        </div>
      </div>
      <div class="lesson-item-xp">+${l.xpReward} XP</div>
    `;
    container.appendChild(div);
  });
}

function renderGoalProgress() {
  const done = Math.min(state.dailyLessonsToday, state.dailyGoal);
  const pct = Math.round((done / state.dailyGoal) * 100);
  const circle = document.getElementById('goalProgress');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;
  if (circle) {
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
  }
  const pctEl = document.getElementById('goalPercent');
  if (pctEl) pctEl.textContent = pct + '%';
  const chip = document.getElementById('goalChip');
  if (chip) chip.textContent = `${done} / ${state.dailyGoal}`;
  const rem = document.getElementById('goalRemaining');
  if (rem) rem.textContent = Math.max(0, state.dailyGoal - done);
}

function renderActivityChart(chartId, daysId) {
  const chart = document.getElementById(chartId);
  const daysEl = document.getElementById(daysId);
  if (!chart) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const maxVal = Math.max(...state.weekActivity, 1);

  chart.innerHTML = '';
  if (daysEl) daysEl.innerHTML = '';

  state.weekActivity.forEach((v, i) => {
    const bar = document.createElement('div');
    bar.className = 'activity-bar';
    const h = Math.max(8, (v / maxVal) * 80);
    bar.style.height = h + 'px';
    if (i === todayIdx) bar.style.background = 'var(--accent-purple)';
    bar.title = `${days[i]}: ${v} lessons`;
    chart.appendChild(bar);

    if (daysEl) {
      const d = document.createElement('div');
      d.className = 'activity-day';
      d.textContent = days[i].substring(0, 1);
      daysEl.appendChild(d);
    }
  });
}

// ============================================================
// LESSONS
// ============================================================
function renderLessons() {
  const container = document.getElementById('unitsList');
  if (!container || !curriculum) return;
  container.innerHTML = '';

  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelColors = { A1: '#10B981', A2: '#3B82F6', B1: '#8B5CF6', B2: '#F59E0B', C1: '#EF4444', C2: '#EC4899' };
  const typeIcons = { vocabulary: '📝', grammar: '✏️', speaking: '🎤', listening: '🎧', reading: '📖' };

  levelOrder.forEach(lvl => {
    const lvlData = curriculum.levels[lvl];
    if (!lvlData) return;

    const isUnlocked = isLevelUnlocked(lvl);

    lvlData.units.forEach((unit, ui) => {
      const unitEl = document.createElement('div');
      unitEl.className = 'unit-card';
      if (!isUnlocked) unitEl.style.opacity = '0.5';

      const doneCount = unit.lessons.filter(l => state.lessonsCompleted.includes(l.id)).length;

      unitEl.innerHTML = `
        <div class="unit-header" onclick="toggleUnit(this)">
          <div class="unit-title-group">
            <div class="unit-number" style="background:${levelColors[lvl]}">${lvl}</div>
            <div>
              <div class="unit-title">${unit.title}</div>
              <div class="unit-progress-text">${doneCount}/${unit.lessons.length} lessons complete</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            ${!isUnlocked ? '<span style="font-size:20px">🔒</span>' : ''}
            <span style="font-size:20px;transition:transform 0.3s" class="chevron">▼</span>
          </div>
        </div>
        <div class="unit-lessons">
          ${unit.lessons.map(l => {
            const done = state.lessonsCompleted.includes(l.id);
            return `
              <div class="lesson-row" onclick="${isUnlocked ? `startLesson(${JSON.stringify(l).replace(/"/g, '&quot;')})` : "showToast('Complete previous levels first!','error')"}">
                <div class="lesson-row-icon">${typeIcons[l.type] || '📚'}</div>
                <div class="lesson-row-info">
                  <div class="lesson-row-title">${l.title}</div>
                  <div class="lesson-row-type">${l.type}</div>
                </div>
                <div class="lesson-row-xp">+${l.xpReward} XP</div>
                <div class="lesson-row-status">${done ? '✅' : '⭕'}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      container.appendChild(unitEl);
    });
  });
}

function toggleUnit(header) {
  const lessons = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  const isOpen = lessons.classList.contains('open');
  lessons.classList.toggle('open', !isOpen);
  if (chevron) chevron.style.transform = isOpen ? 'rotate(0)' : 'rotate(180deg)';
}

function filterLessons(type, chip) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  document.querySelectorAll('.lesson-row').forEach(row => {
    if (type === 'all') { row.style.display = ''; return; }
    const rowType = row.querySelector('.lesson-row-type')?.textContent;
    row.style.display = rowType === type ? '' : 'none';
  });
}

function isLevelUnlocked(level) {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const userIdx = order.indexOf(state.level);
  const lvlIdx = order.indexOf(level);
  return lvlIdx <= userIdx;
}

// ============================================================
// LESSON ENGINE
// ============================================================
function startLesson(lesson) {
  lessonSession = {
    lesson,
    exercises: buildExercises(lesson),
    currentIndex: 0,
    hearts: 3,
    xpEarned: 0,
    correctCount: 0,
    startTime: Date.now()
  };
  showView('lesson');
  renderExercise();
}

function startNextLesson() {
  const levelData = curriculum?.levels?.[state.level];
  if (!levelData) return;
  let next = null;
  for (const unit of levelData.units) {
    for (const lesson of unit.lessons) {
      if (!state.lessonsCompleted.includes(lesson.id)) { next = lesson; break; }
    }
    if (next) break;
  }
  if (next) startLesson(next);
  else { showToast('All lessons complete! Try the next level 🎉', 'success'); showAppPage('lessons'); }
}

function startQuickPractice(type) {
  const allLessons = [];
  if (!curriculum) return;
  Object.values(curriculum.levels).forEach(lvl => {
    lvl.units.forEach(u => u.lessons.forEach(l => { if (l.type === type) allLessons.push(l); }));
  });
  if (!allLessons.length) { showToast('No lessons of this type available', 'info'); return; }
  const lesson = allLessons[Math.floor(Math.random() * allLessons.length)];
  startLesson(lesson);
}

function buildExercises(lesson) {
  const exs = [];
  switch (lesson.type) {
    case 'vocabulary':
      (lesson.vocabulary || []).forEach(v => {
        exs.push({ type: 'vocab_flash', data: v });
        if (Math.random() > 0.5) {
          const distractors = (lesson.vocabulary || [])
            .filter(x => x.word !== v.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(x => x.translation);
          exs.push({
            type: 'vocab_mcq',
            data: v,
            options: shuffle([v.translation, ...distractors]),
            correct: v.translation
          });
        }
      });
      break;
    case 'grammar':
      (lesson.exercises || []).forEach(e => exs.push({ type: e.type === 'mcq' ? 'grammar_mcq' : 'grammar_fill', data: e }));
      break;
    case 'speaking':
      (lesson.prompts || []).forEach(p => exs.push({ type: 'speaking', data: { prompt: p } }));
      break;
    case 'listening':
      exs.push({ type: 'listening_audio', data: { text: lesson.text, questions: [] } });
      (lesson.questions || []).forEach(q => exs.push({ type: 'listening_mcq', data: q }));
      break;
    case 'reading':
      exs.push({ type: 'reading_text', data: { text: lesson.text } });
      (lesson.questions || []).forEach(q => exs.push({ type: 'reading_mcq', data: q }));
      break;
  }
  return exs.length ? exs : [{ type: 'placeholder', data: {} }];
}

function renderExercise() {
  const total = lessonSession.exercises.length;
  const idx = lessonSession.currentIndex;

  if (idx >= total) { showLessonComplete(); return; }

  const pct = (idx / total) * 100;
  document.getElementById('lessonProgressFill').style.width = pct + '%';
  document.getElementById('heartsDisplay').innerHTML =
    '❤️'.repeat(lessonSession.hearts) + '🖤'.repeat(3 - lessonSession.hearts);

  const ex = lessonSession.exercises[idx];
  const body = document.getElementById('lessonBody');
  document.getElementById('lessonFeedback').style.display = 'none';

  const renderers = {
    vocab_flash: renderVocabFlash,
    vocab_mcq: renderVocabMCQ,
    grammar_mcq: renderGrammarMCQ,
    grammar_fill: renderGrammarFill,
    speaking: renderSpeakingEx,
    listening_audio: renderListeningEx,
    listening_mcq: renderMCQ,
    reading_text: renderReadingText,
    reading_mcq: renderMCQ,
    placeholder: () => { body.innerHTML = '<div style="text-align:center;padding:60px">Loading exercise...</div>'; }
  };

  (renderers[ex.type] || renderers.placeholder)(ex, body);
}

function renderVocabFlash(ex, body) {
  const v = ex.data;
  body.innerHTML = `
    <div class="vocab-exercise">
      <div style="text-align:center;color:var(--text-muted);font-size:14px">Tap the card to reveal the translation</div>
      <div class="vocab-card" id="vocabCard" onclick="flipVocabCard()">
        <div class="vocab-card-inner">
          <div class="vocab-card-front">
            <div class="vocab-word">${v.word}</div>
            ${v.pronunciation ? `<div class="vocab-pronunciation">/${v.pronunciation}/</div>` : ''}
            <div class="vocab-tap-hint">👆 Tap to see translation</div>
          </div>
          <div class="vocab-card-back">
            <div class="vocab-translation">${v.translation}</div>
            ${v.example ? `<div class="vocab-example">"${v.example}"</div>` : ''}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:center">
        <button class="btn btn-secondary" onclick="speakWord('${v.word.replace(/'/g, "\\'")}')">🔊 Listen</button>
        <span style="font-size:13px;color:var(--text-muted)">Click card, then rate yourself</span>
      </div>
      <div class="vocab-controls">
        <button class="btn btn-danger" style="flex:1" onclick="rateVocab('hard')">😓 Hard</button>
        <button class="btn btn-secondary" style="flex:1" onclick="rateVocab('ok')">😐 OK</button>
        <button class="btn btn-success" style="flex:1" onclick="rateVocab('easy')">😊 Easy</button>
      </div>
    </div>
  `;
  setTimeout(() => speakWord(v.word), 600);
}

function flipVocabCard() {
  document.getElementById('vocabCard')?.classList.toggle('flipped');
}

function rateVocab(rating) {
  const v = lessonSession.exercises[lessonSession.currentIndex].data;
  if (!state.vocabularyLearned.includes(v.word)) {
    state.vocabularyLearned.push(v.word);
    earnXP(5);
  }
  const masteryDelta = { easy: 2, ok: 1, hard: 0 };
  state.vocabularyMastery[v.word] = Math.min(5, (state.vocabularyMastery[v.word] || 0) + (masteryDelta[rating] || 0));
  lessonSession.correctCount++;
  lessonSession.currentIndex++;
  renderExercise();
}

function renderVocabMCQ(ex, body) {
  const v = ex.data;
  const letters = ['A', 'B', 'C', 'D'];
  body.innerHTML = `
    <div class="mcq-exercise">
      <div style="text-align:center;color:var(--text-muted);font-size:14px">What is the Spanish translation of:</div>
      <div class="exercise-question">"${v.word}"</div>
      ${v.pronunciation ? `<div class="exercise-context">/${v.pronunciation}/</div>` : ''}
      <div class="mcq-options">
        ${ex.options.map((opt, i) => `
          <button class="mcq-option" onclick="checkVocabAnswer('${opt.replace(/'/g, "\\'")}', '${ex.correct.replace(/'/g, "\\'")}', this)">
            <span class="mcq-option-letter">${letters[i]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  speakWord(v.word);
}

function checkVocabAnswer(selected, correct, btn) {
  const allOpts = document.querySelectorAll('.mcq-option');
  allOpts.forEach(o => o.onclick = null);
  const isCorrect = selected === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    allOpts.forEach(o => { if (o.textContent.includes(correct)) o.classList.add('correct'); });
    loseHeart();
    showFeedback(false, `Correct answer: "${correct}"`);
  } else {
    lessonSession.correctCount++;
    earnXP(10);
    showFeedback(true, 'Perfect! +10 XP');
  }
}

function renderGrammarMCQ(ex, body) {
  const d = ex.data;
  const letters = ['A', 'B', 'C', 'D'];
  body.innerHTML = `
    <div class="mcq-exercise">
      <div class="exercise-question">${d.question}</div>
      <div class="mcq-options">
        ${d.options.map((opt, i) => `
          <button class="mcq-option" onclick="checkGrammarMCQ(${i}, ${d.answer}, this)">
            <span class="mcq-option-letter">${letters[i]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkGrammarMCQ(selected, correct, btn) {
  const allOpts = document.querySelectorAll('.mcq-option');
  allOpts.forEach(o => o.onclick = null);
  const isCorrect = selected === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    allOpts[correct].classList.add('correct');
    loseHeart();
    showFeedback(false, `Correct: "${allOpts[correct].textContent.trim()}"`);
  } else {
    lessonSession.correctCount++;
    earnXP(15);
    showFeedback(true, 'Excellent! +15 XP');
  }
}

function renderGrammarFill(ex, body) {
  const d = ex.data;
  const displayed = d.sentence.replace('___', '<span class="fill-blank" id="fillBlank">___</span>');
  const distractors = (d.options || []).filter(o => o !== d.answer).slice(0, 3);
  const allOpts = shuffle([d.answer, ...distractors]);
  body.innerHTML = `
    <div class="fill-exercise">
      <div style="text-align:center;color:var(--text-muted);font-size:14px">Choose the correct word to complete the sentence:</div>
      <div class="fill-sentence">${displayed}</div>
      <div class="fill-options">
        ${allOpts.map(opt => `
          <button class="fill-option" onclick="checkFillAnswer('${opt.replace(/'/g, "\\'")}', '${d.answer.replace(/'/g, "\\'")}', this)">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkFillAnswer(selected, correct, btn) {
  document.querySelectorAll('.fill-option').forEach(o => o.onclick = null);
  const isCorrect = selected === correct;
  const blank = document.getElementById('fillBlank');
  if (blank) { blank.textContent = selected; blank.style.color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'; }
  btn.classList.add(isCorrect ? 'selected' : '');
  btn.style.background = isCorrect ? 'var(--accent-green)' : 'rgba(239,68,68,0.3)';
  if (!isCorrect) {
    loseHeart();
    document.querySelectorAll('.fill-option').forEach(o => { if (o.textContent.trim() === correct) o.style.background = 'var(--accent-green)'; });
    showFeedback(false, `The correct answer is: "${correct}"`);
  } else {
    lessonSession.correctCount++;
    earnXP(15);
    showFeedback(true, 'Great job! +15 XP');
  }
}

function renderSpeakingEx(ex, body) {
  const p = ex.data.prompt;
  body.innerHTML = `
    <div class="speaking-exercise">
      <div style="font-size:14px;color:var(--text-muted)">Speak this phrase out loud:</div>
      <div class="speaking-prompt">"${p}"</div>
      <div class="voice-wave" id="voiceWave" style="display:none">
        ${Array(9).fill('<div class="wave-bar" style="height:8px"></div>').join('')}
      </div>
      <button class="microphone-btn" id="speakMicBtn" onclick="toggleSpeakingRecord('${p.replace(/'/g, "\\'")}')">🎤</button>
      <div class="speech-transcript" id="speakTranscript">Press the microphone and speak...</div>
      <div style="display:flex;gap:16px">
        <button class="btn btn-secondary btn-sm" onclick="speakWord('${p.replace(/'/g, "\\'")}')">🔊 Hear it</button>
        <button class="btn btn-primary btn-sm" onclick="skipSpeaking()">Skip →</button>
      </div>
    </div>
  `;
}

function toggleSpeakingRecord(prompt) {
  const btn = document.getElementById('speakMicBtn');
  const wave = document.getElementById('voiceWave');
  const transcript = document.getElementById('speakTranscript');

  if (!recognition) {
    showToast('Voice recognition not available in this browser', 'error');
    skipSpeaking();
    return;
  }

  if (isRecording) {
    recognition.stop();
    btn.classList.remove('recording');
    wave.style.display = 'none';
    isRecording = false;
    return;
  }

  isRecording = true;
  btn.classList.add('recording');
  wave.style.display = 'flex';
  transcript.textContent = 'Listening...';
  transcript.style.color = 'var(--accent-purple-light)';

  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript;
    const conf = e.results[0][0].confidence;
    transcript.textContent = `"${spoken}"`;
    transcript.style.color = 'var(--text-primary)';
    btn.classList.remove('recording');
    wave.style.display = 'none';
    isRecording = false;

    const similarity = stringSimilarity(spoken.toLowerCase(), prompt.toLowerCase());
    const score = Math.round(Math.max(conf, similarity) * 100);
    const passed = score >= 50;

    transcript.innerHTML += `<br><span style="font-size:13px;color:${passed ? 'var(--accent-green)' : 'var(--accent-amber)'}">Score: ${score}% ${passed ? '✅' : '⚠️'}</span>`;

    if (passed) { lessonSession.correctCount++; earnXP(20); showFeedback(true, `Pronunciation score: ${score}%! +20 XP`); }
    else showFeedback(false, `Score: ${score}%. Try again or skip.`);
  };

  recognition.onerror = () => {
    btn.classList.remove('recording');
    wave.style.display = 'none';
    isRecording = false;
    transcript.textContent = 'Could not hear you. Try again.';
    transcript.style.color = 'var(--accent-red)';
  };

  try { recognition.start(); } catch (e) { isRecording = false; }
}

function skipSpeaking() {
  lessonSession.currentIndex++;
  renderExercise();
}

function renderListeningEx(ex, body) {
  const text = ex.data.text;
  body.innerHTML = `
    <div class="listening-exercise">
      <div style="text-align:center;color:var(--text-muted);font-size:14px;margin-bottom:20px">Listen to the audio, then answer questions</div>
      <div class="audio-player">
        <div class="audio-waveform" id="audioWave">
          ${Array(20).fill(0).map((_, i) => `<div class="audio-bar" style="height:${Math.random()*50+10}px" id="ab${i}"></div>`).join('')}
        </div>
        <div class="audio-controls">
          <button class="play-btn" id="playBtn" onclick="playListeningAudio('${text.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">▶</button>
          <button class="audio-speed" onclick="cycleSpeed(this)">1x</button>
          <button class="btn btn-secondary btn-sm" onclick="playListeningAudio('${text.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">🔊 Replay</button>
        </div>
      </div>
      <button class="btn btn-primary btn-full" onclick="nextExercise()">I'm ready → Answer Questions</button>
    </div>
  `;
  setTimeout(() => playListeningAudio(text), 800);
}

function playListeningAudio(text) {
  if (!synth) { showToast('Text-to-speech not supported', 'error'); return; }
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = window._listenSpeed || 0.85;
  utt.pitch = 1;

  const bars = document.querySelectorAll('.audio-bar');
  let i = 0;
  const interval = setInterval(() => {
    bars.forEach((b, j) => b.classList.toggle('active', j === i % bars.length));
    i++;
  }, 100);

  utt.onend = () => { clearInterval(interval); bars.forEach(b => b.classList.remove('active')); };
  synth.speak(utt);
}

function cycleSpeed(btn) {
  const speeds = [1, 0.75, 0.5];
  const labels = ['1x', '0.75x', '0.5x'];
  let idx = speeds.indexOf(window._listenSpeed || 1) + 1;
  if (idx >= speeds.length) idx = 0;
  window._listenSpeed = speeds[idx];
  btn.textContent = labels[idx];
}

function renderMCQ(ex, body) {
  const d = ex.data;
  const letters = ['A', 'B', 'C', 'D'];
  body.innerHTML = `
    <div class="mcq-exercise">
      <div class="exercise-question">${d.question}</div>
      <div class="mcq-options">
        ${d.options.map((opt, i) => `
          <button class="mcq-option" onclick="checkMCQ(${i}, ${d.answer}, this)">
            <span class="mcq-option-letter">${letters[i]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkMCQ(selected, correct, btn) {
  const allOpts = document.querySelectorAll('.mcq-option');
  allOpts.forEach(o => o.onclick = null);
  const isCorrect = selected === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    allOpts[correct].classList.add('correct');
    loseHeart();
    showFeedback(false, `Correct answer was option ${['A','B','C','D'][correct]}`);
  } else {
    lessonSession.correctCount++;
    earnXP(15);
    showFeedback(true, 'Correct! +15 XP');
  }
}

function renderReadingText(ex, body) {
  body.innerHTML = `
    <div class="reading-exercise">
      <div style="text-align:center;color:var(--text-muted);font-size:14px;margin-bottom:12px">Read carefully, then answer questions</div>
      <div class="reading-text">${ex.data.text}</div>
      <button class="btn btn-primary btn-full" onclick="nextExercise()">I've read it → Answer Questions</button>
    </div>
  `;
}

function showFeedback(correct, msg) {
  const fb = document.getElementById('lessonFeedback');
  const msgEl = document.getElementById('feedbackMessage');
  fb.style.display = 'flex';
  fb.style.background = correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)';
  fb.style.borderTop = `1px solid ${correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`;
  msgEl.innerHTML = correct
    ? `<div class="feedback-correct">✅ ${msg}</div>`
    : `<div class="feedback-wrong">❌ ${msg}</div>`;
  if (correct && state.settings.soundEnabled) playSound('correct');
  else if (!correct && state.settings.soundEnabled) playSound('wrong');
}

function nextExercise() {
  lessonSession.currentIndex++;
  renderExercise();
}

function loseHeart() {
  lessonSession.hearts = Math.max(0, lessonSession.hearts - 1);
  if (lessonSession.hearts === 0) {
    setTimeout(() => {
      if (confirm('No more hearts! 💔 Continue anyway?')) {
        lessonSession.hearts = 3;
        nextExercise();
      } else exitLesson();
    }, 500);
  }
}

function exitLesson() {
  showView('app');
  showAppPage('dashboard');
}

function showLessonComplete() {
  const lesson = lessonSession.lesson;
  const total = lessonSession.exercises.length;
  const correct = lessonSession.correctCount;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpEarned = lesson.xpReward + (accuracy === 100 ? 10 : 0);
  const timeMin = Math.round((Date.now() - lessonSession.startTime) / 60000);

  document.getElementById('lessonBody').innerHTML = `
    <div class="lesson-complete">
      <div class="complete-trophy">🏆</div>
      <div class="complete-title">Lesson Complete!</div>
      <div class="complete-stats">
        <div class="complete-stat">
          <div class="complete-stat-value text-gradient">${accuracy}%</div>
          <div class="complete-stat-label">Accuracy</div>
        </div>
        <div class="complete-stat">
          <div class="complete-stat-value text-gradient">${correct}/${total}</div>
          <div class="complete-stat-label">Correct</div>
        </div>
        <div class="complete-stat">
          <div class="complete-stat-value text-gradient">${Math.max(1, timeMin)}</div>
          <div class="complete-stat-label">Minutes</div>
        </div>
      </div>
      <div class="xp-earned">⚡ +${xpEarned} XP</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary btn-lg" onclick="finishLesson()">Continue →</button>
        <button class="btn btn-secondary" onclick="startLesson(lessonSession.lesson)">🔄 Retry</button>
      </div>
    </div>
  `;
  document.getElementById('lessonFeedback').style.display = 'none';
  document.getElementById('lessonProgressFill').style.width = '100%';
  lessonSession.xpEarned = xpEarned;
}

function finishLesson() {
  const lesson = lessonSession.lesson;
  if (!state.lessonsCompleted.includes(lesson.id)) {
    state.lessonsCompleted.push(lesson.id);
  }
  earnXP(lessonSession.xpEarned, true);
  state.dailyLessonsToday++;
  state.weekActivity[(new Date().getDay() + 6) % 7]++;

  if (window.earnCoins) earnCoins(COIN_REWARDS ? COIN_REWARDS.lesson_complete : 10, 'lesson_complete');
  if (window.updateActivityHeatmap) updateActivityHeatmap();
  if (window.updateChallengeProgress) {
    updateChallengeProgress('vocab', lessonSession.lesson.type === 'vocabulary' ? 1 : 0);
    updateChallengeProgress('perfect', lessonSession.correctCount === lessonSession.exercises.length ? 1 : 0);
    updateChallengeProgress('listening', lessonSession.lesson.type === 'listening' ? 1 : 0);
    updateChallengeProgress('speaking', lessonSession.lesson.type === 'speaking' ? 1 : 0);
  }
  if (window.mascotReact) mascotReact('lesson_complete');
  if (window.checkCertificateEligibility) checkCertificateEligibility();

  updateStreak();
  checkAchievements();
  saveState();
  checkLevelUp();

  showView('app');
  showAppPage('dashboard');
  showXPPopup(lessonSession.xpEarned);
}

// ============================================================
// GAMIFICATION
// ============================================================
function earnXP(amount, save = false) {
  let actual = amount;
  if (state.xpBoostUntil && Date.now() < state.xpBoostUntil) actual *= 2;
  state.xp += actual;
  lessonSession.xpEarned += actual;
  if (save) saveState();
  updateTopBar();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (state.lastStudiedDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastStudiedDate === yesterday) {
    state.streak++;
  } else if (state.lastStudiedDate !== today) {
    state.streak = 1;
  }
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.lastStudiedDate = today;
}

function checkStreakOnLoad() {
  const today = new Date().toDateString();
  if (state.lastStudiedDate && state.lastStudiedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastStudiedDate !== yesterday) {
      state.streak = 0;
      saveState();
    }
  }
  state.dailyLessonsToday = state.lastStudiedDate === today ? (state.dailyLessonsToday || 0) : 0;
}

function checkLevelUp() {
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIdx = levelOrder.indexOf(state.level);
  for (let i = currentIdx + 1; i < levelOrder.length; i++) {
    const lvlData = curriculum?.levels?.[levelOrder[i]];
    if (lvlData && state.xp >= lvlData.xpRequired) {
      state.level = levelOrder[i];
      saveState();
      triggerLevelUp(levelOrder[i]);
      break;
    }
  }
}

function triggerLevelUp(newLevel) {
  document.getElementById('newLevelDisplay').textContent = newLevel;
  document.getElementById('levelUpModal').classList.add('open');
}

function closeLevelUpModal() {
  document.getElementById('levelUpModal').classList.remove('open');
  renderDashboard();
}

function checkAchievements() {
  if (!curriculum) return;
  curriculum.achievements.forEach(ach => {
    if (state.achievements.includes(ach.id)) return;
    let unlock = false;
    switch (ach.id) {
      case 'first_lesson': unlock = state.lessonsCompleted.length >= 1; break;
      case 'streak_3': unlock = state.streak >= 3; break;
      case 'streak_7': unlock = state.streak >= 7; break;
      case 'streak_30': unlock = state.streak >= 30; break;
      case 'vocab_50': unlock = state.vocabularyLearned.length >= 50; break;
      case 'vocab_200': unlock = state.vocabularyLearned.length >= 200; break;
      case 'perfect_lesson': unlock = lessonSession.hearts === 3; break;
      case 'level_a2': unlock = ['A2','B1','B2','C1','C2'].includes(state.level); break;
      case 'level_b1': unlock = ['B1','B2','C1','C2'].includes(state.level); break;
    }
    if (unlock) {
      state.achievements.push(ach.id);
      earnXP(ach.xp, true);
      showAchievement(ach);
    }
  });
}

function showAchievement(ach) {
  document.getElementById('achievementIcon').textContent = ach.icon;
  document.getElementById('achievementTitle').textContent = ach.title;
  document.getElementById('achievementDesc').textContent = ach.description;
  document.getElementById('achievementXP').textContent = `+${ach.xp} XP`;
  document.getElementById('achievementModal').classList.add('open');
}

function showXPPopup(amount) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.textContent = `+${amount} XP`;
  el.style.left = Math.random() * 60 + 20 + '%';
  el.style.top = '50%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

function updateTopBar() {
  document.getElementById('topStreak').textContent = `🔥 ${state.streak} days`;
  document.getElementById('topXP').textContent = `⚡ ${formatNumber(state.xp)} XP`;
  const coinsEl = document.getElementById('topCoins');
  if (coinsEl) coinsEl.textContent = `🪙 ${state.coins || 0}`;
}

function updateSidebar() {
  const name = state.user?.name || 'Learner';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarLevel').textContent = `${state.level} · ${formatNumber(state.xp)} XP`;
  document.getElementById('sidebarAvatar').textContent = state.avatar || '👤';
}

// ============================================================
// AI CONVERSATION
// ============================================================
const TUTOR_CONFIGS = {
  nova: { name: 'Nova', emoji: '🤖', style: 'friendly and encouraging', bg: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' },
  alex: { name: 'Alex', emoji: '👔', style: 'professional and business-focused', bg: 'linear-gradient(135deg,#10B981,#06B6D4)' },
  sophia: { name: 'Sophia', emoji: '👩‍🏫', style: 'academic and precise', bg: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
  jake: { name: 'Jake', emoji: '🎙️', style: 'casual and fun with slang', bg: 'linear-gradient(135deg,#F59E0B,#EF4444)' }
};

const SCENARIO_PROMPTS = {
  free: 'general English conversation',
  interview: 'a job interview simulation',
  travel: 'a travel situation (airport, hotel, sightseeing)',
  business: 'a business meeting or negotiation',
  medical: 'a medical appointment',
  academic: 'an academic discussion or essay help'
};

function renderConversation() {
  const area = document.getElementById('chatMessagesArea');
  if (!area) return;

  if (!state.settings.apiKey) {
    area.innerHTML = `
      <div class="api-key-prompt">
        <div class="api-key-icon">🔑</div>
        <h2>Connect Your AI Tutor</h2>
        <p style="color:var(--text-secondary);max-width:400px">Enter your OpenAI API key to enable intelligent AI conversations with your personal English tutor.</p>
        <div class="api-key-form">
          <input type="password" class="api-key-input" id="quickApiKey" placeholder="sk-proj-...">
          <button class="btn btn-primary" onclick="saveQuickApiKey()">Connect</button>
        </div>
        <p style="font-size:12px;color:var(--text-muted)">
          Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--accent-purple-light)">platform.openai.com</a>
        </p>
        <div class="separator"></div>
        <button class="btn btn-secondary btn-sm" onclick="startDemoConversation()">Try Demo Mode (no API key)</button>
      </div>
    `;
    return;
  }

  if (!chatState.messages.length) {
    const tutor = TUTOR_CONFIGS[chatState.tutor];
    const scenario = SCENARIO_PROMPTS[chatState.scenario];
    chatState.messages = [{
      role: 'assistant',
      content: `Hi! I'm ${tutor.name} ${tutor.emoji}, your English tutor. Let's practice ${scenario}. I'll correct your grammar gently and help you improve. What would you like to talk about?`
    }];
  }
  renderChatMessages();
}

function saveQuickApiKey() {
  const key = document.getElementById('quickApiKey')?.value.trim();
  if (!key) { showToast('Please enter a valid API key', 'error'); return; }
  state.settings.apiKey = key;
  saveState();
  chatState.messages = [];
  renderConversation();
  showToast('API key saved! 🔑', 'success');
}

function startDemoConversation() {
  state.settings.apiKey = 'DEMO';
  saveState();
  chatState.messages = [];
  renderConversation();
}

function selectTutor(id, el) {
  document.querySelectorAll('.tutor-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  chatState.tutor = id;
  chatState.messages = [];
  renderConversation();
}

function selectScenario(id, el) {
  document.querySelectorAll('.scenario-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  chatState.scenario = id;
  chatState.messages = [];
  renderConversation();
}

function renderChatMessages() {
  const area = document.getElementById('chatMessagesArea');
  if (!area) return;
  const tutor = TUTOR_CONFIGS[chatState.tutor];

  area.innerHTML = chatState.messages.map(m => `
    <div class="chat-message ${m.role === 'user' ? 'user' : 'ai'}">
      ${m.role === 'assistant' ? `<div class="message-avatar" style="background:${tutor.bg}">${tutor.emoji}</div>` : ''}
      <div>
        <div class="message-bubble">${m.content}${m.correction ? `<div class="message-correction">💡 Correction: ${m.correction}</div>` : ''}</div>
        <div class="message-time">${m.time || ''}</div>
      </div>
      ${m.role === 'user' ? `<div class="message-avatar user-avatar">${state.avatar || '👤'}</div>` : ''}
    </div>
  `).join('');

  if (chatState.isTyping) {
    area.innerHTML += `
      <div class="chat-typing">
        <div class="message-avatar" style="background:${tutor.bg}">${tutor.emoji}</div>
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
  }
  area.scrollTop = area.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text || chatState.isTyping) return;

  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  chatState.messages.push({ role: 'user', content: text, time: now });
  input.value = '';
  input.style.height = 'auto';
  chatState.isTyping = true;
  renderChatMessages();

  try {
    const reply = await getAIReply(text);
    chatState.messages.push({ role: 'assistant', content: reply.message, correction: reply.correction, time: now });
    if (state.settings.autoSpeak) speakWord(reply.message);
  } catch (e) {
    chatState.messages.push({ role: 'assistant', content: 'Sorry, I had trouble connecting. Please check your API key in Settings.', time: now });
  }

  chatState.isTyping = false;
  renderChatMessages();
  earnXP(5);
}

async function getAIReply(userMessage) {
  const apiKey = state.settings.apiKey;

  if (apiKey === 'DEMO') return getDemoReply(userMessage);

  const tutor = TUTOR_CONFIGS[chatState.tutor];
  const scenario = SCENARIO_PROMPTS[chatState.scenario];
  const userLevel = state.level;
  const nativeLang = state.settings.nativeLang === 'es' ? 'Spanish' : state.settings.nativeLang;

  const systemPrompt = `You are ${tutor.name}, a ${tutor.style} English language tutor.
The student's level is ${userLevel} (CEFR scale), native language is ${nativeLang}.
You are simulating: ${scenario}.
Keep responses concise (2-4 sentences max). Use vocabulary appropriate for ${userLevel} level.
${state.settings.grammarCheck ? 'If the student makes a grammar mistake, gently note the correction in a JSON field called "correction". Otherwise, "correction": null.' : ''}
Respond in JSON: {"message": "your response", "correction": "correction note or null"}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatState.messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: state.settings.model || 'gpt-4o', messages, temperature: 0.8, max_tokens: 300 })
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  try { return JSON.parse(data.choices[0].message.content); }
  catch { return { message: data.choices[0].message.content, correction: null }; }
}

function getDemoReply(msg) {
  const replies = [
    { message: "That's a great point! In English, we often use the present perfect for experiences. For example: 'I have visited Paris.' Could you try rephrasing with that structure?", correction: null },
    { message: "Excellent! You're making good progress. Let me ask you: what do you usually do in your free time? Try to use time expressions like 'usually', 'often', or 'sometimes'.", correction: null },
    { message: "Very good! One small tip: instead of 'I am agree', we say 'I agree' — the verb 'agree' doesn't need 'am'. Keep it up!", correction: "Use 'I agree' not 'I am agree'" },
    { message: "Interesting! Can you elaborate on that? Try using connectors like 'Furthermore', 'However', or 'In addition' to make your response more sophisticated.", correction: null },
    { message: "Perfect sentence! Now let's practice a harder challenge — can you describe your ideal job in 3 sentences using future tense?", correction: null }
  ];
  return new Promise(resolve => setTimeout(() => resolve(replies[Math.floor(Math.random() * replies.length)]), 1000 + Math.random() * 1000));
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function clearChat() {
  chatState.messages = [];
  renderConversation();
}

function toggleGrammarCheck() {
  state.settings.grammarCheck = !state.settings.grammarCheck;
  saveState();
  showToast(`Grammar check ${state.settings.grammarCheck ? 'enabled' : 'disabled'}`, 'info');
}

function toggleTranslation() {
  chatState.translation = !chatState.translation;
  showToast(`Translation hints ${chatState.translation ? 'enabled' : 'disabled'}`, 'info');
}

function requestHint() {
  if (!chatState.messages.length) return;
  const hints = [
    "💡 Try using a phrasal verb in your next sentence (e.g., 'look forward to', 'bring up', 'carry out')",
    "💡 Use a conditional sentence: 'If I were you, I would...'",
    "💡 Connect your ideas with 'However, Moreover, Nevertheless, or On the other hand'",
    "💡 Add an idiom to sound more natural: 'hit the nail on the head', 'under the weather'"
  ];
  const hint = hints[Math.floor(Math.random() * hints.length)];
  chatState.messages.push({ role: 'assistant', content: hint, time: new Date().toLocaleTimeString() });
  renderChatMessages();
}

function toggleVoiceInput() {
  if (!recognition) { showToast('Voice not supported in this browser', 'error'); return; }
  const btn = document.getElementById('voiceInputBtn');
  const input = document.getElementById('chatInput');

  if (voiceInputActive) {
    recognition.stop();
    voiceInputActive = false;
    btn.classList.remove('active');
    return;
  }

  voiceInputActive = true;
  btn.classList.add('active');

  recognition.onresult = (e) => {
    input.value = e.results[0][0].transcript;
    autoResizeTextarea(input);
    voiceInputActive = false;
    btn.classList.remove('active');
  };

  recognition.onerror = () => { voiceInputActive = false; btn.classList.remove('active'); };
  recognition.onend = () => { voiceInputActive = false; btn.classList.remove('active'); };

  try { recognition.start(); } catch (e) { voiceInputActive = false; }
}

// ============================================================
// VOCABULARY PAGE
// ============================================================
function renderVocabulary() {
  const grid = document.getElementById('vocabGrid');
  if (!grid || !curriculum) return;

  const allVocab = [];
  Object.entries(curriculum.levels).forEach(([lvl, lvlData]) => {
    lvlData.units.forEach(u => {
      u.lessons.forEach(l => {
        (l.vocabulary || []).forEach(v => allVocab.push({ ...v, level: lvl }));
      });
    });
  });

  const known = state.vocabularyLearned;
  const toShow = allVocab.filter(v => known.includes(v.word));

  if (!toShow.length) {
    grid.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-secondary)"><div style="font-size:48px;margin-bottom:16px">📝</div><h3>No vocabulary yet</h3><p>Complete vocabulary lessons to build your word bank!</p><button class="btn btn-primary" style="margin-top:16px" onclick="showAppPage(\'lessons\')">Start Learning →</button></div>';
    return;
  }

  grid.innerHTML = toShow.map(v => {
    const mastery = state.vocabularyMastery[v.word] || 0;
    const masteryPct = (mastery / 5) * 100;
    const levelColors = { A1: '#10B981', A2: '#3B82F6', B1: '#8B5CF6', B2: '#F59E0B', C1: '#EF4444', C2: '#EC4899' };
    return `
      <div class="vocab-word-card" onclick="speakWord('${v.word.replace(/'/g, "\\'")}')">
        <div class="vocab-word-text">${v.word}</div>
        <div class="vocab-word-trans">${v.translation}</div>
        ${v.example ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;margin-bottom:10px">"${v.example}"</div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="vocab-word-level" style="background:${hexToRgba(levelColors[v.level]||'#8B5CF6',0.15)};color:${levelColors[v.level]||'#A78BFA'}">${v.level}</div>
          <div style="font-size:12px;color:var(--text-muted)">🔊</div>
        </div>
        <div class="mastery-bar"><div class="mastery-fill" style="width:${masteryPct}%"></div></div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Mastery: ${masteryPct.toFixed(0)}%</div>
      </div>
    `;
  }).join('');
}

function startFlashcards() {
  const known = state.vocabularyLearned;
  if (!known.length) { showToast('Learn some vocabulary first!', 'info'); return; }
  const allVocab = [];
  if (!curriculum) return;
  Object.values(curriculum.levels).forEach(lvlData => {
    lvlData.units.forEach(u => u.lessons.forEach(l => {
      (l.vocabulary || []).forEach(v => { if (known.includes(v.word)) allVocab.push(v); });
    }));
  });
  const lesson = { id: 'flashcard_review', title: 'Vocabulary Review', type: 'vocabulary', xpReward: 20, vocabulary: shuffle(allVocab).slice(0, 10) };
  startLesson(lesson);
}

function startVocabReview() { startFlashcards(); }

// ============================================================
// PROGRESS PAGE
// ============================================================
function renderProgress() {
  const levelData = getLevelData(state.level);
  const nextLevel = getNextLevel(state.level);
  const xpNeeded = nextLevel ? nextLevel.xpRequired : levelData.xpRequired;
  const xpProgress = nextLevel ? Math.min(((state.xp - levelData.xpRequired) / (xpNeeded - levelData.xpRequired)) * 100, 100) : 100;

  document.getElementById('progressLevelBig').textContent = state.level;
  document.getElementById('progressLevelName').textContent = `${levelData.name} Level`;
  document.getElementById('progressLevelDesc').textContent = nextLevel
    ? `${xpNeeded - state.xp} XP to reach ${nextLevel.code}`
    : 'Maximum level achieved! 🏆';
  document.getElementById('progressXPBar').style.width = xpProgress + '%';
  document.getElementById('progressXPText').textContent = `${state.xp} / ${xpNeeded} XP`;
  document.getElementById('progressStreakStat').textContent = state.streak;
  document.getElementById('progressLessonsStat').textContent = state.lessonsCompleted.length;

  const skills = state.skills;
  Object.entries(skills).forEach(([skill, value]) => {
    const bar = document.getElementById(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
    const pct = document.getElementById(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}Pct`);
    if (bar) bar.style.width = value + '%';
    if (pct) pct.textContent = value + '%';
  });

  renderActivityChart('progressActivityChart', 'progressActivityDays');
}

// ============================================================
// ACHIEVEMENTS PAGE
// ============================================================
function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid || !curriculum) return;
  grid.innerHTML = curriculum.achievements.map(ach => {
    const unlocked = state.achievements.includes(ach.id);
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        <span class="achievement-icon">${ach.icon}</span>
        <div class="achievement-title">${ach.title}</div>
        <div class="achievement-desc">${ach.description}</div>
        <div class="achievement-xp">+${ach.xp} XP ${unlocked ? '✅' : '🔒'}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// LEADERBOARD PAGE
// ============================================================
function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;

  const fakeUsers = [
    { name: 'María González', emoji: '👩', level: 'B2', xp: 4250, country: '🇲🇽' },
    { name: 'Carlos Rodríguez', emoji: '👨', level: 'C1', xp: 7890, country: '🇨🇴' },
    { name: 'Ana Lima', emoji: '👩‍💼', level: 'B1', xp: 2180, country: '🇧🇷' },
    { name: 'Pedro Martínez', emoji: '🧑‍💻', level: 'A2', xp: 890, country: '🇪🇸' },
    { name: 'Sofía Hernández', emoji: '👩‍🎓', level: 'C2', xp: 15200, country: '🇦🇷' },
  ];

  const myEntry = {
    name: state.user?.name || 'You',
    emoji: state.avatar || '👤',
    level: state.level,
    xp: state.xp,
    country: '🌍',
    isMe: true
  };

  const all = [...fakeUsers, myEntry].sort((a, b) => b.xp - a.xp);

  list.innerHTML = all.map((u, i) => `
    <div class="leaderboard-item ${u.isMe ? 'current-user' : ''}">
      <div class="leaderboard-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}">${i + 1}</div>
      <div class="leaderboard-avatar" style="background:var(--bg-card-hover)">${u.emoji}</div>
      <div>
        <div class="leaderboard-name">${u.name} ${u.country} ${u.isMe ? '<span class="chip chip-purple" style="font-size:10px;padding:2px 6px">You</span>' : ''}</div>
        <div class="leaderboard-level">${u.level} Level</div>
      </div>
      <div class="leaderboard-xp">⚡ ${formatNumber(u.xp)} XP</div>
    </div>
  `).join('');
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  const s = state.settings;
  const apiEl = document.getElementById('apiKeyInput');
  if (apiEl && s.apiKey && s.apiKey !== 'DEMO') apiEl.value = s.apiKey;
  const modelEl = document.getElementById('modelSelect');
  if (modelEl) modelEl.value = s.model || 'gpt-4o';
  const goalEl = document.getElementById('dailyGoalSelect');
  if (goalEl) goalEl.value = state.dailyGoal || 3;
  const langEl = document.getElementById('nativeLangSelect');
  if (langEl) langEl.value = s.nativeLang || 'es';
  const goalSel = document.getElementById('learningGoalSelect');
  if (goalSel) goalSel.value = s.learningGoal || 'general';
  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.value = state.user?.name || '';
  toggleSettingDisplay('toggleStreak', s.streakReminders !== false);
  toggleSettingDisplay('toggleSound', s.soundEnabled !== false);
  toggleSettingDisplay('toggleGrammar', s.grammarCheck !== false);
  toggleSettingDisplay('toggleAutoSpeak', !!s.autoSpeak);
}

function saveApiSettings() {
  state.settings.apiKey = document.getElementById('apiKeyInput').value.trim();
  state.settings.model = document.getElementById('modelSelect').value;
  saveState();
  showToast('AI settings saved!', 'success');
}

function saveLearningSettings() {
  state.dailyGoal = parseInt(document.getElementById('dailyGoalSelect').value);
  state.settings.nativeLang = document.getElementById('nativeLangSelect').value;
  state.settings.learningGoal = document.getElementById('learningGoalSelect').value;
  saveState();
  showToast('Learning preferences saved!', 'success');
}

function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  if (!name) { showToast('Please enter a name', 'error'); return; }
  if (state.user) state.user.name = name;
  saveState();
  updateSidebar();
  showToast('Profile updated!', 'success');
}

function selectAvatar(el, emoji) {
  document.querySelectorAll('.avatar-option, [onclick^="selectAvatar"]').forEach(e => e.style.borderColor = 'transparent');
  el.style.borderColor = 'var(--accent-purple)';
  state.avatar = emoji;
  saveState();
  updateSidebar();
}

function toggleSetting(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOn = el.classList.toggle('on');
  const settingMap = {
    toggleStreak: 'streakReminders',
    toggleSound: 'soundEnabled',
    toggleGrammar: 'grammarCheck',
    toggleAutoSpeak: 'autoSpeak'
  };
  if (settingMap[id]) state.settings[settingMap[id]] = isOn;
  saveState();
}

function toggleSettingDisplay(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('on', !!value);
}

function resetProgress() {
  if (!confirm('This will delete ALL your progress. Are you sure?')) return;
  const user = state.user;
  state = { ...DEFAULT_STATE, user };
  saveState();
  renderDashboard();
  showToast('Progress reset. Fresh start!', 'info');
}

// ============================================================
// SPEECH
// ============================================================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

function speakWord(text) {
  if (!synth || !text) return;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.9;
  utt.pitch = 1;
  const voices = synth.getVoices();
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Natural'))
    || voices.find(v => v.lang === 'en-US')
    || voices[0];
  if (preferred) utt.voice = preferred;
  synth.speak(utt);
}

// ============================================================
// NEURAL BACKGROUND CANVAS
// ============================================================
function drawNeuralBackground() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const nodes = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,92,246,0.4)';
      ctx.fill();
    });
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// HELPERS
// ============================================================
function getLevelData(level) {
  return curriculum?.levels?.[level] || { name: level, description: '', xpRequired: 0 };
}

function getNextLevel(level) {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = order.indexOf(level);
  if (idx < 0 || idx >= order.length - 1) return null;
  const next = order[idx + 1];
  const data = curriculum?.levels?.[next];
  return data ? { code: next, ...data } : null;
}

function getLevelName(level) {
  const names = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery' };
  return names[level] || level;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(139,92,246,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function stringSimilarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (!longer.length) return 1.0;
  const editDist = levenshtein(longer, shorter);
  return (longer.length - editDist) / longer.length;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function playSound(type) {
  if (!state.settings.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') { osc.frequency.setValueAtTime(523, ctx.currentTime); osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); }
    else { osc.frequency.setValueAtTime(220, ctx.currentTime); osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1); }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function toggleSidebar() {
  document.getElementById('appSidebar').classList.toggle('open');
}

function quickDemo() {
  showToast('Demo mode: Loading SmartFin AI experience...', 'info');
  setTimeout(() => {
    state = { ...DEFAULT_STATE, user: { name: 'Demo User', email: 'demo@smartfinai.com' }, xp: 320, streak: 5, bestStreak: 12, level: 'A2', lessonsCompleted: ['a1-u1-l1','a1-u1-l2','a1-u2-l1'], vocabularyLearned: ['Hello','Goodbye','Thank you','Please','Mother','Father'], weekActivity: [2,1,3,0,2,1,3], dailyLessonsToday: 1, dailyGoal: 3, skills: { speaking: 45, listening: 60, reading: 70, writing: 35, vocabulary: 55, grammar: 50 } };
    saveState();
    initApp();
  }, 800);
}

function filterLessons(type, chip) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
}
