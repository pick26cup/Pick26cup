'use strict';
/* SmartFin Virtual Classroom — Live sessions, exercises, whiteboard, chat */

// ─── CLASSROOM DATA ───────────────────────────────────────────────────────────
const LIVE_SESSIONS = [
  {
    id: 'sess_conversation_a1',
    title: 'Beginner Conversation Practice',
    teacher: '👩‍🏫 Ms. Patricia',
    level: 'A1',
    topic: 'Daily Routines & Greetings',
    duration: '45 min',
    participants: 8,
    maxParticipants: 12,
    startTime: '10:00 AM',
    live: true,
    emoji: '💬',
    exercises: ['Introduce yourself', 'Daily schedule vocabulary', 'Simple Q&A pairs'],
    whiteboard: { term: 'I wake up at...', examples: ['I wake up at 7 AM.', 'She goes to work at 8 AM.'], note: '⭐ Use simple present for routines' }
  },
  {
    id: 'sess_grammar_b1',
    title: 'Grammar Deep Dive: Past Perfect',
    teacher: '👨‍🏫 Mr. Jonathan',
    level: 'B1',
    topic: 'Past Perfect Tense',
    duration: '60 min',
    participants: 5,
    maxParticipants: 10,
    startTime: '11:30 AM',
    live: true,
    emoji: '📐',
    exercises: ['Form sentences', 'Timeline ordering', 'Error correction'],
    whiteboard: { term: 'Past Perfect: had + V3', examples: ['By 9 PM, she had finished dinner.', 'He had never seen snow before.'], note: '🔑 Use for actions before another past event' }
  },
  {
    id: 'sess_business_b2',
    title: 'Business English: Presentations',
    teacher: '👩‍🏫 Dr. Sandra Chen',
    level: 'B2',
    topic: 'Presenting Data & Charts',
    duration: '90 min',
    participants: 11,
    maxParticipants: 15,
    startTime: '2:00 PM',
    live: false,
    emoji: '📊',
    exercises: ['Signposting language', 'Describing trends', 'Q&A handling'],
    whiteboard: { term: 'Signposting phrases', examples: ['"As you can see in this graph..."', '"Moving on to the next point..."'], note: '💼 Always introduce visuals before explaining them' }
  },
  {
    id: 'sess_pronunciation_a2',
    title: 'Pronunciation Workshop',
    teacher: '👨‍🏫 Coach Mike',
    level: 'A2',
    topic: 'TH sounds & Word Stress',
    duration: '45 min',
    participants: 6,
    maxParticipants: 8,
    startTime: '3:30 PM',
    live: false,
    emoji: '🎙️',
    exercises: ['Minimal pairs drill', 'Stress pattern practice', 'Recording & playback'],
    whiteboard: { term: '/θ/ vs /ð/ sounds', examples: ['think, thing, three (/θ/)', 'this, that, the (/ð/)'], note: '👅 Tongue between teeth for both — voice ON for /ð/' }
  },
  {
    id: 'sess_story_c1',
    title: 'Advanced Storytelling',
    teacher: '👩‍🏫 Prof. Elena Vasquez',
    level: 'C1',
    topic: 'Narrative Techniques',
    duration: '60 min',
    participants: 4,
    maxParticipants: 8,
    startTime: '5:00 PM',
    live: false,
    emoji: '📚',
    exercises: ['Descriptive writing', 'Dialogue crafting', 'Peer review'],
    whiteboard: { term: 'Show, don\'t tell', examples: ['"Her hands shook as she opened the letter." (show)', '"She was nervous." (tell)'], note: '✍️ Sensory details make stories come alive' }
  },
  {
    id: 'sess_ielts_b2',
    title: 'IELTS Exam Preparation',
    teacher: '👨‍🏫 Mr. David Park',
    level: 'B2',
    topic: 'Writing Task 2 — Essays',
    duration: '90 min',
    participants: 9,
    maxParticipants: 12,
    startTime: '7:00 PM',
    live: false,
    emoji: '🎓',
    exercises: ['Essay structure', 'Thesis statements', 'Timed writing practice'],
    whiteboard: { term: 'IELTS Essay Structure', examples: ['Introduction (2-3 sentences)', 'Body ×2 (each 100+ words)', 'Conclusion (2-3 sentences)'], note: '⏱️ Aim for 250+ words in 40 minutes' }
  }
];

const SCHEDULED_SESSIONS = [
  { time: 'Mon 9:00 AM', title: 'A1 Morning Conversation', teacher: '👩‍🏫 Ms. Patricia', level: 'A1', spots: 4 },
  { time: 'Mon 2:00 PM', title: 'B1 Verb Tenses Bootcamp', teacher: '👨‍🏫 Mr. Jonathan', level: 'B1', spots: 7 },
  { time: 'Tue 10:00 AM', title: 'Business Email Writing', teacher: '👩‍🏫 Dr. Sandra Chen', level: 'B2', spots: 2 },
  { time: 'Tue 4:00 PM', title: 'IELTS Speaking Mock Test', teacher: '👨‍🏫 Mr. David Park', level: 'B2', spots: 3 },
  { time: 'Wed 11:00 AM', title: 'C1 Academic Writing', teacher: '👩‍🏫 Prof. Elena Vasquez', level: 'C1', spots: 5 },
  { time: 'Wed 6:00 PM', title: 'Pronunciation Lab', teacher: '👨‍🏫 Coach Mike', level: 'A2', spots: 2 },
  { time: 'Thu 9:00 AM', title: 'Aviation English ICAO 4', teacher: '👨‍🏫 Capt. Torres', level: 'B2', spots: 6 },
  { time: 'Fri 3:00 PM', title: 'Medical English Essentials', teacher: '👩‍🏫 Dr. Kim Lee', level: 'B1', spots: 8 }
];

const CHAT_MESSAGES = [
  { name: 'System', text: 'Session started. Welcome everyone!', system: true },
  { name: 'Ms. Patricia', text: 'Hello everyone! Let\'s warm up — tell me your name and one thing you did this morning.' },
  { name: 'Carlos', text: 'I am Carlos from Brazil. I drank coffee this morning!' },
  { name: 'Yuki', text: 'Hi! I am Yuki. I listened to English podcast today!' },
  { name: 'Ana', text: 'Hello, I am Ana. I studied vocabulary for 20 minutes.' },
  { name: 'Ms. Patricia', text: 'Wonderful! Great responses. Now let\'s practice the structure: "Every morning, I ___"' }
];

let _classroomTab = 'live';
let _activeSession = null;
let _classroomChat = [];
let _classroomExercises = {};

// ─── RENDER MAIN PAGE ─────────────────────────────────────────────────────────
function renderClassroomPage() {
  const page = document.getElementById('page-classroom');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🖥️ Virtual Classroom</h1>
      <p class="page-subtitle">Live sessions with expert teachers & AI tutors</p>
    </div>

    <div class="classroom-hero">
      <h2>Learn with Real People</h2>
      <p>Join live group sessions, practice with native speakers, and get real-time feedback from expert teachers.</p>
      <div class="classroom-status-row">
        <div class="classroom-live-badge"><div class="live-dot"></div> ${LIVE_SESSIONS.filter(s=>s.live).length} Sessions Live Now</div>
        <span style="color:var(--text-muted);font-size:13px">👥 ${_fmtNum(2847)} students online</span>
        <span style="color:var(--text-muted);font-size:13px">🌍 48 countries</span>
      </div>
    </div>

    <div class="classroom-tabs">
      ${['live','schedule','my-classes','teachers'].map(t => `
        <button class="classroom-tab ${_classroomTab===t?'active':''}" onclick="switchClassroomTab('${t}')">
          ${{live:'🔴 Live Now', schedule:'📅 Schedule', 'my-classes':'📋 My Classes', teachers:'👨‍🏫 Teachers'}[t]}
        </button>
      `).join('')}
    </div>

    <div id="classroom-tab-content"></div>
  `;

  _renderClassroomTab(_classroomTab);
}

function switchClassroomTab(tab) {
  _classroomTab = tab;
  document.querySelectorAll('.classroom-tab').forEach(b => b.classList.toggle('active', b.textContent.includes({live:'Live Now',schedule:'Schedule','my-classes':'My Classes',teachers:'Teachers'}[tab])));
  _renderClassroomTab(tab);
}

function _renderClassroomTab(tab) {
  const cont = document.getElementById('classroom-tab-content');
  if (!cont) return;
  if (tab === 'live') cont.innerHTML = _renderLiveSessions();
  else if (tab === 'schedule') cont.innerHTML = _renderSchedule();
  else if (tab === 'my-classes') cont.innerHTML = _renderMyClasses();
  else if (tab === 'teachers') cont.innerHTML = _renderTeachers();
}

// ─── LIVE SESSIONS ─────────────────────────────────────────────────────────────
function _renderLiveSessions() {
  const live = LIVE_SESSIONS.filter(s => s.live);
  const upcoming = LIVE_SESSIONS.filter(s => !s.live);

  return `
    <h3 style="margin-bottom:16px;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px">
      <div class="live-dot" style="width:10px;height:10px;flex-shrink:0"></div> Happening Now
    </h3>
    <div class="classroom-sessions-grid" style="margin-bottom:32px">
      ${live.map(s => _sessionCard(s)).join('')}
    </div>
    <h3 style="margin-bottom:16px;font-size:15px;font-weight:700">🕐 Starting Soon</h3>
    <div class="classroom-sessions-grid">
      ${upcoming.map(s => _sessionCard(s)).join('')}
    </div>
  `;
}

function _sessionCard(s) {
  const pct = Math.round((s.participants / s.maxParticipants) * 100);
  return `
    <div class="classroom-session-card ${s.live ? 'live' : ''}" onclick="joinSession('${s.id}')">
      ${s.live ? '<div class="classroom-live-badge" style="position:absolute;top:14px;right:14px;font-size:10px"><div class="live-dot"></div>LIVE</div>' : ''}
      <div class="session-level-chip ${s.level}">${s.level}</div>
      <div style="font-size:28px;margin-bottom:8px">${s.emoji}</div>
      <div class="session-title">${s.title}</div>
      <div class="session-teacher">${s.teacher}</div>
      <div class="session-meta">
        <span>📖 ${s.topic}</span>
        <span>⏱ ${s.duration}</span>
        <span>👥 ${s.participants}/${s.maxParticipants}</span>
        ${!s.live ? `<span>🕐 ${s.startTime}</span>` : ''}
      </div>
      <div class="session-participants-bar" style="margin-top:14px">
        <div class="session-participants-fill" style="width:${pct}%"></div>
      </div>
      <button class="btn ${s.live ? 'btn-primary' : 'btn-secondary'} btn-sm session-join-btn" onclick="event.stopPropagation();joinSession('${s.id}')">
        ${s.live ? '▶ Join Now' : '📌 Reserve'}
      </button>
    </div>
  `;
}

// ─── JOIN SESSION ─────────────────────────────────────────────────────────────
function joinSession(id) {
  const session = LIVE_SESSIONS.find(s => s.id === id);
  if (!session) return;
  _activeSession = session;
  _classroomChat = [...CHAT_MESSAGES];
  _classroomExercises = {};
  session.exercises.forEach((ex, i) => { _classroomExercises[i] = false; });

  const page = document.getElementById('page-classroom');
  if (!page) return;

  page.innerHTML = `
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="leaveSession()">← Back to Classroom</button>
      <span class="session-level-chip ${session.level}">${session.level}</span>
      ${session.live ? '<div class="classroom-live-badge"><div class="live-dot"></div>LIVE</div>' : '<span style="color:var(--text-muted);font-size:13px">🕐 Starting ' + session.startTime + '</span>'}
    </div>

    <div class="classroom-room">
      <div class="classroom-room-header">
        <div>
          <div class="classroom-room-title">${session.emoji} ${session.title}</div>
          <div style="font-size:13px;color:var(--text-secondary)">${session.teacher} · ${session.topic}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="toggleRaiseHand()" id="handBtn">✋ Raise Hand</button>
          <button class="btn btn-secondary btn-sm" onclick="toggleMic()" id="micBtn">🎙️ Mic Off</button>
          <button class="btn btn-danger btn-sm" onclick="leaveSession()">Leave</button>
        </div>
      </div>

      <div class="classroom-room-body">
        <div class="classroom-video-area">
          <!-- Teacher video -->
          <div class="teacher-video">
            <div style="font-size:64px">${session.teacher.split(' ')[0]}</div>
            <div style="font-size:13px;color:var(--text-muted)">${session.teacher.replace(/[^a-zA-Z. ]/g,'').trim()}</div>
            <div class="teacher-video-name">${session.teacher.replace(/[^a-zA-Z. ]/g,'').trim()}</div>
          </div>

          <!-- Students -->
          <div class="students-video-row" id="studentsRow">
            ${_renderStudentTiles(session)}
          </div>

          <!-- Whiteboard -->
          <div style="margin-top:20px">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">📋 Whiteboard</div>
            <div class="classroom-whiteboard">
              <div class="whiteboard-text">${session.whiteboard.term}</div>
              ${session.whiteboard.examples.map(e => `<div class="whiteboard-example">• ${e}</div>`).join('')}
              <div class="whiteboard-note" style="margin-top:10px">${session.whiteboard.note}</div>
            </div>
          </div>

          <!-- Exercises -->
          <div style="margin-top:20px">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">✅ Session Exercises</div>
            <div class="classroom-exercises-list" id="exercisesList">
              ${_renderExerciseItems(session)}
            </div>
          </div>
        </div>

        <!-- Chat sidebar -->
        <div class="classroom-sidebar">
          <div class="classroom-chat">
            <div class="classroom-chat-title">💬 Live Chat</div>
            <div class="classroom-chat-messages" id="classroomMessages">
              ${_classroomChat.map(m => `
                <div class="chat-msg ${m.system?'system':''}">
                  <span class="chat-msg-name">${m.name}${m.name==='System'?'':':'}</span>
                  <span class="chat-msg-text">${m.text}</span>
                </div>
              `).join('')}
            </div>
            <div class="classroom-chat-input-row">
              <input class="classroom-chat-input" id="chatInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendChatMessage()">
              <button class="btn btn-primary btn-sm" onclick="sendChatMessage()">Send</button>
            </div>
          </div>

          <!-- Participants -->
          <div style="border-top:1px solid var(--border-subtle);padding:16px">
            <div class="classroom-chat-title" style="margin-bottom:10px">👥 Participants (${session.participants + 1})</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:20px">${session.teacher.split(' ')[0]}</span>
                <span>${session.teacher.replace(/[^a-zA-Z. ]/g,'').trim()}</span>
                <span style="margin-left:auto;font-size:11px;color:#fbbf24;font-weight:700">TEACHER</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:20px">👤</span>
                <span>You</span>
                <span style="margin-left:auto;font-size:11px;color:#4ade80;font-weight:700">● ONLINE</span>
              </div>
              ${['Carlos 🇧🇷','Yuki 🇯🇵','Ana 🇲🇽','David 🇺🇸','Sofia 🇨🇴'].slice(0, Math.min(session.participants-1, 5)).map(name => `
                <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary)">
                  <span style="font-size:16px">👤</span>
                  <span>${name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Scroll chat to bottom
  setTimeout(() => {
    const msgs = document.getElementById('classroomMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 100);

  // Simulate live chat activity
  if (session.live) _startChatSimulation();
}

function _renderStudentTiles(session) {
  const names = ['Carlos', 'Yuki', 'Ana', 'David', 'Sofia', 'Maria', 'Juan', 'Kim'];
  const emojis = ['👨🏽','👩🏻','👩🏽','👨🏼','👩🏽','👩🏾','👨🏽','👩🏻'];
  const count = Math.min(session.participants - 1, 5);
  let html = `<div class="student-video-tile" style="border-color:#a78bfa">
    <span style="font-size:28px">👤</span>
    <div class="student-video-name">You</div>
  </div>`;
  for (let i = 0; i < count; i++) {
    const speaking = i === 1;
    html += `<div class="student-video-tile ${speaking ? 'speaking' : ''}">
      <span style="font-size:28px">${emojis[i]}</span>
      <div class="student-video-name">${names[i]}</div>
    </div>`;
  }
  return html;
}

function _renderExerciseItems(session) {
  return session.exercises.map((ex, i) => `
    <div class="classroom-exercise-item ${_classroomExercises[i] ? 'done' : ''}" onclick="completeExercise(${i})" id="exercise-${i}">
      <div class="classroom-exercise-icon">${['📝','🗣️','✏️','🎧','🎯'][i % 5]}</div>
      <div>
        <div class="classroom-exercise-title">${ex}</div>
        <div class="classroom-exercise-meta">${_classroomExercises[i] ? 'Completed' : 'Tap to practice'}</div>
      </div>
      <div class="classroom-exercise-check">${_classroomExercises[i] ? '✅' : '○'}</div>
    </div>
  `).join('');
}

function completeExercise(idx) {
  if (!_activeSession || _classroomExercises[idx]) return;
  _classroomExercises[idx] = true;

  const item = document.getElementById(`exercise-${idx}`);
  if (item) {
    item.classList.add('done');
    item.querySelector('.classroom-exercise-check').textContent = '✅';
    item.querySelector('.classroom-exercise-meta').textContent = 'Completed';
  }

  // Award XP
  if (window.earnXP) earnXP(15, 'classroom_exercise');
  if (window.earnCoins) earnCoins(5, 'classroom_exercise');
  if (window.mascotReact) mascotReact('lesson_complete');

  // Check if all done
  const allDone = Object.values(_classroomExercises).every(v => v);
  if (allDone) {
    setTimeout(() => {
      if (window.earnXP) earnXP(50, 'classroom_session');
      if (window.earnCoins) earnCoins(20, 'classroom_session');
      _addChatMessage('System', 'You completed all exercises! Great work! 🎉', true);
    }, 500);
  }
}

let _chatTimer = null;
const _AUTO_MESSAGES = [
  { name: 'Carlos', text: 'This is very helpful, thank you!' },
  { name: 'Yuki', text: 'Can you explain the pronunciation again?' },
  { name: 'Ms. Patricia', text: 'Great question, Yuki! Let\'s repeat it together.' },
  { name: 'Ana', text: 'I understand now 😊' },
  { name: 'David', text: 'What about exceptions to this rule?' },
  { name: 'Sofia', text: 'Me too! This grammar is tricky.' },
  { name: 'Ms. Patricia', text: 'Practice makes perfect — keep trying!' },
  { name: 'Carlos', text: '👍 Got it!' },
];
let _autoMsgIdx = 0;

function _startChatSimulation() {
  if (_chatTimer) clearInterval(_chatTimer);
  _chatTimer = setInterval(() => {
    if (!document.getElementById('classroomMessages')) { clearInterval(_chatTimer); return; }
    const msg = _AUTO_MESSAGES[_autoMsgIdx % _AUTO_MESSAGES.length];
    _addChatMessage(msg.name, msg.text);
    _autoMsgIdx++;
  }, 5000);
}

function _addChatMessage(name, text, isSystem) {
  const msgs = document.getElementById('classroomMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `chat-msg${isSystem ? ' system' : ''}`;
  div.innerHTML = `<span class="chat-msg-name">${name}${isSystem ? '' : ':'}</span> <span class="chat-msg-text">${text}</span>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim()) return;
  _addChatMessage('You', input.value.trim());
  input.value = '';

  // AI-like response
  setTimeout(() => {
    const teacher = _activeSession ? _activeSession.teacher.replace(/[^a-zA-Z. ]/g,'').trim() : 'Teacher';
    const responses = [
      'Great point! Keep practicing.',
      'Excellent! That\'s exactly right.',
      'Good attempt! Try to add more details.',
      'Perfect sentence! 🌟',
      'Almost there — check your verb tense.',
    ];
    _addChatMessage(teacher, responses[Math.floor(Math.random() * responses.length)]);
  }, 1500);
}

function toggleRaiseHand() {
  const btn = document.getElementById('handBtn');
  if (!btn) return;
  const raised = btn.textContent.includes('Lower');
  btn.textContent = raised ? '✋ Raise Hand' : '✋ Lower Hand';
  btn.classList.toggle('btn-primary', !raised);
  btn.classList.toggle('btn-secondary', raised);
  if (!raised) _addChatMessage('System', 'You raised your hand.', true);
}

function toggleMic() {
  const btn = document.getElementById('micBtn');
  if (!btn) return;
  const on = btn.textContent.includes('Off');
  btn.textContent = on ? '🎙️ Mic On' : '🎙️ Mic Off';
}

function leaveSession() {
  if (_chatTimer) { clearInterval(_chatTimer); _chatTimer = null; }
  _activeSession = null;
  renderClassroomPage();
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
function _renderSchedule() {
  return `
    <div class="classroom-schedule-list">
      ${SCHEDULED_SESSIONS.map(s => `
        <div class="classroom-schedule-item">
          <div class="classroom-schedule-time">🕐 ${s.time}</div>
          <div style="flex:1">
            <div class="classroom-schedule-title">${s.title}</div>
            <div class="classroom-schedule-meta">${s.teacher} · <span class="session-level-chip ${s.level}" style="font-size:10px">${s.level}</span></div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">${s.spots} spots left</div>
            <button class="btn btn-primary btn-sm" onclick="reserveSession('${s.title}')">Reserve</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function reserveSession(title) {
  if (window.mascotReact) mascotReact('achievement');
  alert(`📅 Reserved: "${title}"\n\nYou'll receive a reminder 15 minutes before the session starts!`);
}

// ─── MY CLASSES ────────────────────────────────────────────────────────────────
function _renderMyClasses() {
  const completed = LIVE_SESSIONS.slice(0, 2);
  const upcoming = SCHEDULED_SESSIONS.slice(0, 3);

  return `
    <div style="margin-bottom:28px">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:16px">📊 My Progress</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px">
        ${[
          { icon: '🖥️', label: 'Sessions Joined', value: '12' },
          { icon: '⏱️', label: 'Hours Learned', value: '8.5' },
          { icon: '⭐', label: 'Avg. Rating', value: '4.8' },
          { icon: '🏆', label: 'Certificates', value: '2' }
        ].map(s => `
          <div class="admin-kpi">
            <div class="admin-kpi-label">${s.icon} ${s.label}</div>
            <div class="admin-kpi-value" style="font-size:22px">${s.value}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="margin-bottom:28px">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:16px">🔜 Upcoming Sessions</h3>
      <div class="classroom-sessions-grid">
        ${upcoming.slice(0,3).map(s => `
          <div class="classroom-session-card" onclick="alert('📅 Redirecting to session...')">
            <div class="session-level-chip ${s.level}">${s.level}</div>
            <div class="session-title">${s.title}</div>
            <div class="session-teacher">${s.teacher}</div>
            <div class="session-meta"><span>🕐 ${s.time}</span></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div>
      <h3 style="font-size:15px;font-weight:700;margin-bottom:16px">✅ Completed Sessions</h3>
      <div class="classroom-sessions-grid">
        ${completed.map(s => `
          <div class="classroom-session-card" style="opacity:0.75">
            <div class="session-level-chip ${s.level}">${s.level}</div>
            <div style="font-size:24px;margin-bottom:6px">${s.emoji}</div>
            <div class="session-title">${s.title}</div>
            <div class="session-teacher">${s.teacher}</div>
            <div class="session-meta"><span>✅ Completed</span><span>⭐ 4.9</span></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
const TEACHERS = [
  { emoji: '👩‍🏫', name: 'Ms. Patricia Williams', title: 'General English Specialist', sessions: 847, rating: 4.9, students: 3241, bio: 'Native American English speaker with 12 years ESL experience. Specializes in beginner conversation and listening.', tags: ['A1','A2','Conversation','IELTS'] },
  { emoji: '👨‍🏫', name: 'Mr. Jonathan Kim', title: 'Grammar & Writing Expert', sessions: 612, rating: 4.8, students: 2087, bio: 'Linguistics PhD from Cambridge. Expert in grammar instruction, academic writing, and B1-C1 levels.', tags: ['B1','B2','Grammar','Academic'] },
  { emoji: '👩‍🏫', name: 'Dr. Sandra Chen', title: 'Business English Coach', sessions: 429, rating: 5.0, students: 1654, bio: 'Former corporate trainer for Fortune 500 companies. Specializes in presentations, emails, and negotiation.', tags: ['B2','C1','Business','IELTS'] },
  { emoji: '👨‍🏫', name: 'Coach Mike Johnson', title: 'Pronunciation & Phonics', sessions: 531, rating: 4.7, students: 1893, bio: 'American accent coach working with film and media professionals. Expert in IPA and accent reduction.', tags: ['A1-C2','Pronunciation','Phonics'] },
  { emoji: '👩‍🏫', name: 'Prof. Elena Vasquez', title: 'Advanced & Academic English', sessions: 318, rating: 4.9, students: 987, bio: 'Oxford-certified EFL teacher. Specializes in advanced writing, literary analysis, and C1-C2 fluency.', tags: ['C1','C2','Academic','IELTS 8+'] },
  { emoji: '👨‍🏫', name: 'Mr. David Park', title: 'IELTS & TOEFL Specialist', sessions: 723, rating: 4.9, students: 2841, bio: 'Helped 1,000+ students achieve IELTS 7+. Expert in all four skills with structured exam strategies.', tags: ['B1-C2','IELTS','TOEFL','Exams'] }
];

function _renderTeachers() {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px">
      ${TEACHERS.map(t => `
        <div class="classroom-session-card" style="cursor:default" onclick="">
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px">
            <div style="font-size:48px;flex-shrink:0">${t.emoji}</div>
            <div>
              <div style="font-size:16px;font-weight:700">${t.name}</div>
              <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">${t.title}</div>
              <div style="font-size:13px;color:#fbbf24">⭐ ${t.rating}</div>
            </div>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">${t.bio}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">
            📚 ${t.sessions} sessions · 👥 ${_fmtNum(t.students)} students
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
            ${t.tags.map(tag => `<span style="background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.25);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600">${tag}</span>`).join('')}
          </div>
          <button class="btn btn-primary btn-sm btn-full" onclick="bookTeacher('${t.name}')">📅 Book 1-on-1 Session</button>
        </div>
      `).join('')}
    </div>
  `;
}

function bookTeacher(name) {
  alert(`📅 Booking session with ${name}\n\nOne-on-one sessions are 45 minutes. You'll receive a confirmation with the Zoom link!`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function _fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

window.renderClassroomPage = renderClassroomPage;
window.switchClassroomTab = switchClassroomTab;
window.joinSession = joinSession;
window.leaveSession = leaveSession;
window.completeExercise = completeExercise;
window.sendChatMessage = sendChatMessage;
window.toggleRaiseHand = toggleRaiseHand;
window.toggleMic = toggleMic;
window.reserveSession = reserveSession;
window.bookTeacher = bookTeacher;
