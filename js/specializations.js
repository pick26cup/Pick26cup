'use strict';
/* SmartFin Specializations — Professional English tracks */

const SPECIALIZATION_TRACKS = {
  aviation: {
    id: 'aviation', name: 'Aviation English', icon: '✈️', color: '#3B82F6',
    description: 'ICAO-standard phraseology for pilots and ATC',
    lessons: [
      {
        id: 'av1', title: 'ICAO Phraseology Basics', xp: 60,
        vocabulary: [
          { term: 'Roger', def: 'I have received all of your last transmission', example: 'Tower: Wind calm, cleared to land. Pilot: Roger, cleared to land.' },
          { term: 'Wilco', def: 'I understand your message and will comply', example: 'Pilot: Wilco, climbing to flight level 350.' },
          { term: 'Affirm', def: 'Yes (used instead of "yes" in aviation)', example: 'ATC: Are you requesting IFR clearance? Pilot: Affirm.' },
          { term: 'Negative', def: 'No / permission not granted', example: 'ATC: Traffic in sight? Pilot: Negative, we have no joy.' },
          { term: 'Say again', def: 'Please repeat your last transmission', example: 'Tower, say again the runway in use.' },
          { term: 'Stand by', def: 'Wait and I will call you back', example: 'Approach: Stand by for ILS frequency.' }
        ],
        quiz: [
          { q: 'What does "Wilco" mean in aviation communications?', options: ['Will contact','I will comply','Wrong communication','Wireless contact'], answer: 1 },
          { q: '"Affirm" is used instead of...', options: ['Correct','Roger','Yes','Confirm'], answer: 2 },
          { q: 'To ask for repetition, you say...', options: ['Repeat please','Say again','Come again','Pardon'], answer: 1 }
        ]
      },
      {
        id: 'av2', title: 'Departure Clearances', xp: 70,
        vocabulary: [
          { term: 'Cleared for takeoff', def: 'Permission granted to begin the takeoff roll', example: 'Tower: N123AB, cleared for takeoff runway 28L.' },
          { term: 'Squawk', def: 'Set the transponder code', example: 'Radar: Squawk 2347.' },
          { term: 'Altimeter setting', def: 'Local barometric pressure for altitude', example: 'Altimeter 29.92, QNH 1013.' },
          { term: 'Departure frequency', def: 'Radio frequency to contact after takeoff', example: 'Contact departure on 119.5 after takeoff.' }
        ],
        quiz: [
          { q: '"Squawk 7700" indicates...', options: ['Normal operations','Radio failure','Emergency','VFR flight'], answer: 2 },
          { q: 'QNH refers to...', options: ['A frequency','Barometric pressure','A waypoint','Fuel level'], answer: 1 }
        ]
      }
    ]
  },
  medical: {
    id: 'medical', name: 'Medical English', icon: '🏥', color: '#10B981',
    description: 'Clinical language for healthcare professionals',
    lessons: [
      {
        id: 'med1', title: 'Taking Medical History', xp: 65,
        vocabulary: [
          { term: 'Chief complaint', def: 'The primary reason for the patient\'s visit', example: 'Patient\'s chief complaint is chest pain radiating to the left arm.' },
          { term: 'Onset', def: 'When symptoms began', example: 'Onset was sudden, approximately 2 hours ago.' },
          { term: 'Alleviating factors', def: 'Things that reduce symptoms', example: 'Alleviating factors include rest and aspirin.' },
          { term: 'Contraindicated', def: 'Should not be used (risks outweigh benefits)', example: 'NSAIDs are contraindicated in renal failure.' },
          { term: 'Prognosis', def: 'Expected outcome of a disease', example: 'Prognosis is favorable with early intervention.' }
        ],
        quiz: [
          { q: '"Prognosis" refers to...', options: ['The cause of disease','The expected outcome','The treatment plan','The symptoms'], answer: 1 },
          { q: '"Contraindicated" means...', options: ['Recommended','Not advisable to use','Confirmed diagnosis','Patient refused'], answer: 1 }
        ]
      }
    ]
  },
  business: {
    id: 'business', name: 'Business English', icon: '💼', color: '#F59E0B',
    description: 'Professional communication for the global workplace',
    lessons: [
      {
        id: 'biz1', title: 'Professional Email Writing', xp: 55,
        vocabulary: [
          { term: 'Per our conversation', def: 'As discussed previously', example: 'Per our conversation yesterday, I am attaching the report.' },
          { term: 'Action items', def: 'Tasks that need to be completed', example: 'Please review the action items from the meeting.' },
          { term: 'Deliverable', def: 'A specific output or result to be produced', example: 'The key deliverable is a 10-page market analysis.' },
          { term: 'Stakeholder', def: 'Person with interest in a project\'s outcome', example: 'We must align all stakeholders before the launch.' },
          { term: 'Bandwidth', def: 'Capacity to take on more work', example: 'I don\'t have the bandwidth to take this on right now.' }
        ],
        quiz: [
          { q: '"Deliverable" in business means...', options: ['A package to ship','A promised output','A team member','A deadline'], answer: 1 },
          { q: '"Bandwidth" (business context) refers to...', options: ['Internet speed','Work capacity','Project budget','Meeting time'], answer: 1 }
        ]
      },
      {
        id: 'biz2', title: 'Negotiation Language', xp: 70,
        vocabulary: [
          { term: 'Counter-offer', def: 'An offer made in response to a previous offer', example: 'Our counter-offer is $50,000 with a 30-day payment term.' },
          { term: 'Mutually beneficial', def: 'Advantageous for both parties', example: 'We seek a mutually beneficial agreement.' },
          { term: 'Walk away point', def: 'The limit beyond which you will not negotiate', example: 'That price is beyond our walk away point.' }
        ],
        quiz: [
          { q: '"Counter-offer" is...', options: ['A final refusal','A response offer','A hidden fee','A contract type'], answer: 1 }
        ]
      }
    ]
  },
  it: {
    id: 'it', name: 'IT & Engineering English', icon: '💻', color: '#8B5CF6',
    description: 'Technical English for software engineers and developers',
    lessons: [
      {
        id: 'it1', title: 'Code Review Communication', xp: 60,
        vocabulary: [
          { term: 'Refactor', def: 'Restructure existing code without changing behavior', example: 'We should refactor this function to improve readability.' },
          { term: 'Technical debt', def: 'Cost of future work caused by short-term shortcuts', example: 'Shipping this will increase our technical debt significantly.' },
          { term: 'Edge case', def: 'An unusual situation not covered by normal logic', example: 'This edge case causes a null pointer exception.' },
          { term: 'Pull request', def: 'A request to merge code changes into a codebase', example: 'Please review my pull request before merging.' },
          { term: 'Scope creep', def: 'Uncontrolled expansion of project requirements', example: 'We need to prevent scope creep from delaying the sprint.' }
        ],
        quiz: [
          { q: '"Technical debt" refers to...', options: ['Money owed for software','Future work from shortcuts','Bugs in production','Deprecated APIs'], answer: 1 },
          { q: '"Scope creep" means...', options: ['A debugging technique','Unplanned feature expansion','Code review comments','A security vulnerability'], answer: 1 }
        ]
      }
    ]
  },
  customer_service: {
    id: 'customer_service', name: 'Customer Service English', icon: '🎧', color: '#06B6D4',
    description: 'Professional communication for customer-facing roles',
    lessons: [
      {
        id: 'cs1', title: 'Handling Complaints', xp: 55,
        vocabulary: [
          { term: 'Empathize', def: 'Understand and share the feelings of another', example: 'I completely understand your frustration, and I\'m sorry for the inconvenience.' },
          { term: 'Escalate', def: 'Refer an issue to a higher authority', example: 'I\'ll escalate this to our technical team immediately.' },
          { term: 'Resolution', def: 'A solution to a problem', example: 'We\'ll provide a full resolution within 24 hours.' },
          { term: 'De-escalate', def: 'Reduce the intensity of a tense situation', example: 'Let me de-escalate this by offering a full refund.' }
        ],
        quiz: [
          { q: 'To "de-escalate" a situation means to...', options: ['Make it worse','Cancel the order','Calm it down','Transfer the call'], answer: 2 },
          { q: '"Empathize" means to...', options: ['Agree with everything','Understand feelings','Offer a discount','Hang up the call'], answer: 1 }
        ]
      }
    ]
  }
};

let currentSpecTrack = null, currentSpecLesson = null, specQuizIndex = 0, specQuizScore = 0;

function renderSpecializationPage(trackId) {
  const page = document.getElementById('page-specializations');
  if (!page) return;

  if (!trackId) {
    renderSpecializationMenu(page);
  } else {
    currentSpecTrack = SPECIALIZATION_TRACKS[trackId];
    if (!currentSpecTrack) return;
    renderTrackPage(page);
  }
}

function renderSpecializationMenu(page) {
  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🎓 Specializations</h1>
      <p class="page-subtitle">Master professional English for your industry</p>
    </div>
    <div class="spec-tracks-grid">
      ${Object.values(SPECIALIZATION_TRACKS).map(track => {
        const prog = window.state ? ((window.state.specializationProgress || {})[track.id] || {}) : {};
        const completed = Object.keys(prog).length;
        const total = track.lessons.length;
        return `
          <div class="spec-track-card" onclick="renderSpecializationPage('${track.id}')" style="border-color:${track.color}20">
            <div class="spec-track-icon" style="background:${track.color}20;color:${track.color}">${track.icon}</div>
            <h3 class="spec-track-name">${track.name}</h3>
            <p class="spec-track-desc">${track.description}</p>
            <div class="spec-track-progress">
              <div class="spec-progress-bar"><div style="width:${Math.round(completed/total*100)}%;background:${track.color};height:100%;border-radius:99px;transition:width 0.5s"></div></div>
              <span style="color:${track.color}">${completed}/${total}</span>
            </div>
            <button class="btn btn-primary" style="background:${track.color};border-color:${track.color}" onclick="renderSpecializationPage('${track.id}');event.stopPropagation()">
              ${completed > 0 ? 'Continue' : 'Start'} Track
            </button>
          </div>`;
      }).join('')}
    </div>`;
}

function renderTrackPage(page) {
  const track = currentSpecTrack;
  const prog = window.state ? ((window.state.specializationProgress || {})[track.id] || {}) : {};
  page.innerHTML = `
    <div class="page-header" style="display:flex;align-items:center;gap:12px">
      <button class="btn-icon" onclick="renderSpecializationPage(null)">←</button>
      <div>
        <h1 class="page-title">${track.icon} ${track.name}</h1>
        <p class="page-subtitle">${track.description}</p>
      </div>
    </div>
    <div class="spec-lessons-list">
      ${track.lessons.map((lesson, i) => {
        const done = prog[lesson.id];
        const locked = i > 0 && !prog[track.lessons[i-1].id];
        return `
          <div class="spec-lesson-row ${done ? 'done' : ''} ${locked ? 'locked' : ''}" onclick="${!locked ? `startSpecLesson('${track.id}','${lesson.id}')` : ''}">
            <div class="spec-lesson-number">${done ? '✅' : locked ? '🔒' : (i+1)}</div>
            <div class="spec-lesson-info">
              <div class="spec-lesson-title">${lesson.title}</div>
              <div class="spec-lesson-meta">📚 ${lesson.vocabulary.length} terms &nbsp; ⚡ +${lesson.xp} XP</div>
            </div>
            ${!locked ? `<button class="btn btn-sm ${done ? 'btn-secondary' : 'btn-primary'}">${done ? 'Review' : 'Start'}</button>` : ''}
          </div>`;
      }).join('')}
    </div>`;
}

function startSpecLesson(trackId, lessonId) {
  currentSpecTrack = SPECIALIZATION_TRACKS[trackId];
  currentSpecLesson = currentSpecTrack.lessons.find(l => l.id === lessonId);
  if (!currentSpecLesson) return;
  specQuizIndex = 0; specQuizScore = 0;
  renderSpecVocabulary();
}

function renderSpecVocabulary() {
  const page = document.getElementById('page-specializations');
  if (!page || !currentSpecLesson) return;
  const lesson = currentSpecLesson;
  const track = currentSpecTrack;
  page.innerHTML = `
    <div class="spec-lesson-header">
      <button class="btn-icon" onclick="renderSpecializationPage('${track.id}')">←</button>
      <h2 style="color:#e2e8f0">${lesson.title}</h2>
    </div>
    <div class="spec-vocab-section">
      <h3 style="color:#94a3b8;margin-bottom:16px">📚 Key Vocabulary</h3>
      ${lesson.vocabulary.map(v => `
        <div class="spec-vocab-card">
          <div class="spec-vocab-term" onclick="speakWord('${v.term}')">${v.term} 🔊</div>
          <div class="spec-vocab-def">${v.def}</div>
          <div class="spec-vocab-example"><i>"${v.example}"</i></div>
        </div>`).join('')}
    </div>
    <button class="btn btn-primary" style="margin-top:24px;width:100%" onclick="renderSpecQuiz()">
      Start Quiz →
    </button>`;
}

function renderSpecQuiz() {
  const page = document.getElementById('page-specializations');
  if (!page || !currentSpecLesson) return;
  const quiz = currentSpecLesson.quiz;
  if (specQuizIndex >= quiz.length) { finishSpecLesson(); return; }
  const q = quiz[specQuizIndex];
  page.innerHTML = `
    <div class="spec-quiz-container">
      <div class="spec-quiz-progress">${specQuizIndex+1} / ${quiz.length}</div>
      <p class="spec-quiz-question">${q.q}</p>
      <div class="spec-quiz-options">
        ${q.options.map((o,i) => `<button class="spec-quiz-option" onclick="answerSpecQuiz(${i})">${o}</button>`).join('')}
      </div>
    </div>`;
}

function answerSpecQuiz(index) {
  const q = currentSpecLesson.quiz[specQuizIndex];
  const btns = document.querySelectorAll('.spec-quiz-option');
  btns.forEach((b,i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === index) b.classList.add('incorrect');
  });
  if (index === q.answer) { specQuizScore++; if (window.mascotReact) window.mascotReact('correct'); }
  else { if (window.mascotReact) window.mascotReact('wrong'); }
  specQuizIndex++;
  setTimeout(renderSpecQuiz, 900);
}

function finishSpecLesson() {
  if (!window.state) return;
  const track = currentSpecTrack, lesson = currentSpecLesson;
  if (!window.state.specializationProgress) window.state.specializationProgress = {};
  if (!window.state.specializationProgress[track.id]) window.state.specializationProgress[track.id] = {};
  window.state.specializationProgress[track.id][lesson.id] = true;
  if (window.saveState) window.saveState();
  if (window.earnXP) window.earnXP(lesson.xp);
  if (window.mascotReact) window.mascotReact('lesson_complete');
  const page = document.getElementById('page-specializations');
  if (page) {
    page.innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:64px;margin-bottom:16px">🎓</div>
        <h2 style="color:#e2e8f0;margin-bottom:8px">Lesson Complete!</h2>
        <p style="color:#94a3b8">${lesson.title}</p>
        <p style="color:#8B5CF6;font-size:24px;font-weight:700;margin:16px 0">+${lesson.xp} XP</p>
        <p style="color:#94a3b8">${specQuizScore}/${currentSpecLesson.quiz.length} quiz answers correct</p>
        <button class="btn btn-primary" style="margin-top:24px" onclick="renderSpecializationPage('${track.id}')">
          Continue Track →
        </button>
      </div>`;
  }
}
