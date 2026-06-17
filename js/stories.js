'use strict';
/* SmartFin Stories — Interactive narrative learning */

const STORIES_DATA = [
  {
    id: 'airport_adventure',
    title: 'Airport Adventure',
    level: 'A2',
    emoji: '✈️',
    description: 'Navigate an international airport, check in, and handle unexpected delays.',
    xpReward: 80, coinsReward: 30,
    scenes: [
      {
        id: 's1', bg: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
        image: '🏢', location: 'Airport Check-In',
        dialogue: [
          { speaker: 'Agent', avatar: '👩‍💼', text: 'Good morning! May I see your passport and ticket, please?' },
          { speaker: 'You', avatar: '🧑‍💼', text: '...', isPlayer: true }
        ],
        choices: [
          { text: 'Here you go. I have both.', correct: true, feedback: 'Perfect! Natural and polite.' },
          { text: 'I forgot my passport.', correct: false, feedback: "That's a problem! Always carry your passport." },
          { text: 'Yes, here is it.', correct: false, feedback: '"Here it is" is the correct phrase.' }
        ],
        vocabulary: ['passport', 'ticket', 'check-in', 'boarding pass']
      },
      {
        id: 's2', bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
        image: '🛄', location: 'Baggage Check',
        dialogue: [
          { speaker: 'Agent', avatar: '👩‍💼', text: 'How many bags are you checking in today?' },
          { speaker: 'You', avatar: '🧑‍💼', text: '...', isPlayer: true }
        ],
        choices: [
          { text: 'I have one suitcase to check in.', correct: true, feedback: 'Excellent! Clear and precise.' },
          { text: 'Two bags luggage.', correct: false, feedback: 'Say "two pieces of luggage" or "two bags".' },
          { text: 'I want check one bag.', correct: false, feedback: 'Remember "I want to check in one bag."' }
        ],
        vocabulary: ['suitcase', 'luggage', 'baggage allowance', 'overweight']
      },
      {
        id: 's3', bg: 'linear-gradient(135deg,#0f172a,#1a1035)',
        image: '📺', location: 'Departure Board',
        dialogue: [
          { speaker: 'Narrator', avatar: '📢', text: 'Your flight shows a 2-hour delay. You approach the information desk.' },
          { speaker: 'Staff', avatar: '👨‍💼', text: 'How can I help you?' }
        ],
        choices: [
          { text: 'Excuse me, my flight is delayed. Can you tell me the new departure time?', correct: true, feedback: 'Perfect formal English!' },
          { text: 'My flight is late, when will it leave?', correct: true, feedback: 'Good — informal but clear.' },
          { text: 'The plane is not coming?', correct: false, feedback: 'Too vague. Be more specific about the delay.' }
        ],
        vocabulary: ['delayed', 'departure', 'gate', 'announcement']
      }
    ]
  },
  {
    id: 'job_interview',
    title: 'The Dream Job Interview',
    level: 'B1',
    emoji: '💼',
    description: 'Ace a job interview at an international company using professional English.',
    xpReward: 100, coinsReward: 40,
    scenes: [
      {
        id: 's1', bg: 'linear-gradient(135deg,#0f172a,#1c1f2e)',
        image: '🏢', location: 'Office Reception',
        dialogue: [
          { speaker: 'Receptionist', avatar: '👩', text: 'Good afternoon! Do you have an appointment?' }
        ],
        choices: [
          { text: 'Yes, I have an interview at 3 PM with Ms. Johnson.', correct: true, feedback: 'Professional and informative!' },
          { text: 'I come for a job.', correct: false, feedback: 'More formally: "I have a job interview scheduled."' },
          { text: 'I am here for interview at three.', correct: false, feedback: 'Better: "I am here for an interview at 3 PM."' }
        ],
        vocabulary: ['appointment', 'reception', 'schedule', 'interview']
      },
      {
        id: 's2', bg: 'linear-gradient(135deg,#0f172a,#0d1f3c)',
        image: '👩‍💼', location: 'Interview Room',
        dialogue: [
          { speaker: 'Interviewer', avatar: '👩‍💼', text: 'Tell me about yourself and why you want this position.' }
        ],
        choices: [
          { text: 'I have 3 years of experience in marketing and I\'m passionate about digital innovation.', correct: true, feedback: 'Strong answer with specific experience!' },
          { text: 'I like work and need money.', correct: false, feedback: 'Avoid this! Be professional and specific.' },
          { text: 'I am a hard worker and I want learn.', correct: false, feedback: '"I want to learn" — don\'t forget "to".' }
        ],
        vocabulary: ['experience', 'position', 'qualifications', 'skills']
      }
    ]
  },
  {
    id: 'medical_emergency',
    title: 'Medical Emergency',
    level: 'B2',
    emoji: '🏥',
    description: 'Handle a medical situation using professional healthcare English.',
    xpReward: 120, coinsReward: 50,
    scenes: [
      {
        id: 's1', bg: 'linear-gradient(135deg,#0f172a,#1a0a0a)',
        image: '🚑', location: 'Emergency Room',
        dialogue: [
          { speaker: 'Doctor', avatar: '👨‍⚕️', text: 'What seems to be the problem? When did the symptoms start?' }
        ],
        choices: [
          { text: 'The patient has been experiencing chest pain and shortness of breath for about two hours.', correct: true, feedback: 'Excellent medical English!' },
          { text: 'His chest hurts since two hours.', correct: false, feedback: 'Say "has been hurting for two hours."' },
          { text: 'He have pain in chest from morning.', correct: false, feedback: '"He has had chest pain since this morning."' }
        ],
        vocabulary: ['symptoms', 'chest pain', 'shortness of breath', 'diagnosis']
      }
    ]
  }
];

let currentStory = null, currentSceneIndex = 0, storyScore = 0;

function renderStoriesPage() {
  const page = document.getElementById('page-stories');
  if (!page) return;
  const completed = window.state ? (window.state.storiesCompleted || []) : [];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">📖 Story Mode</h1>
      <p class="page-subtitle">Learn English through immersive interactive narratives</p>
    </div>
    <div class="stories-grid">
      ${STORIES_DATA.map(story => {
        const isDone = completed.includes(story.id);
        return `
          <div class="story-card ${isDone ? 'completed' : ''}" onclick="startStory('${story.id}')">
            <div class="story-emoji">${story.emoji}</div>
            <div class="story-level-badge">${story.level}</div>
            <h3 class="story-title">${story.title}</h3>
            <p class="story-desc">${story.description}</p>
            <div class="story-meta">
              <span>📖 ${story.scenes.length} scenes</span>
              <span>⚡ +${story.xpReward} XP</span>
              <span>🪙 +${story.coinsReward}</span>
            </div>
            <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'}" onclick="startStory('${story.id}');event.stopPropagation()">
              ${isDone ? '🔄 Replay' : '▶️ Start Story'}
            </button>
          </div>`;
      }).join('')}
    </div>`;
}

function startStory(storyId) {
  currentStory = STORIES_DATA.find(s => s.id === storyId);
  if (!currentStory) return;
  currentSceneIndex = 0;
  storyScore = 0;
  showView('story');
  renderStoryScene();
}

function renderStoryScene() {
  if (!currentStory) return;
  const scene = currentStory.scenes[currentSceneIndex];
  if (!scene) { finishStory(); return; }

  const view = document.getElementById('view-story');
  if (!view) return;

  const totalScenes = currentStory.scenes.length;
  const progress = ((currentSceneIndex) / totalScenes) * 100;

  view.innerHTML = `
    <div class="story-view-container" style="background:${scene.bg};min-height:100vh;display:flex;flex-direction:column;">
      <div class="story-topbar">
        <button class="btn-icon" onclick="exitStory()">✕</button>
        <div class="story-progress-bar"><div class="story-progress-fill" style="width:${progress}%"></div></div>
        <div class="story-scene-count">${currentSceneIndex+1}/${totalScenes}</div>
      </div>
      <div class="story-content">
        <div class="story-location-badge">📍 ${scene.location}</div>
        <div class="story-scene-image">${scene.image}</div>
        <div class="story-dialogue">
          ${scene.dialogue.map(d => `
            <div class="dialogue-line ${d.isPlayer ? 'player' : ''}">
              <span class="dialogue-avatar">${d.avatar}</span>
              <div class="dialogue-bubble">
                <span class="dialogue-speaker">${d.speaker}</span>
                <p class="dialogue-text">${d.text}</p>
              </div>
            </div>`).join('')}
        </div>
        <div class="story-choices">
          <p class="choices-label">Choose your response:</p>
          ${scene.choices.map((c, i) => `
            <button class="story-choice-btn" onclick="selectStoryChoice(${i})">${c.text}</button>`).join('')}
        </div>
        ${scene.vocabulary ? `
          <div class="story-vocab">
            <div class="vocab-label">📚 Key Vocabulary</div>
            <div class="vocab-chips">
              ${scene.vocabulary.map(w => `<span class="vocab-chip">${w}</span>`).join('')}
            </div>
          </div>` : ''}
      </div>
    </div>`;
}

function selectStoryChoice(choiceIndex) {
  if (!currentStory) return;
  const scene = currentStory.scenes[currentSceneIndex];
  const choice = scene.choices[choiceIndex];
  if (!choice) return;

  const btns = document.querySelectorAll('.story-choice-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === choiceIndex) {
      btn.classList.add(choice.correct ? 'correct' : 'incorrect');
    }
  });

  if (choice.correct) storyScore++;
  if (window.mascotReact) window.mascotReact(choice.correct ? 'correct' : 'wrong');

  const feedback = document.createElement('div');
  feedback.className = `story-feedback ${choice.correct ? 'correct' : 'incorrect'}`;
  feedback.innerHTML = `${choice.correct ? '✅' : '❌'} ${choice.feedback}`;
  document.querySelector('.story-choices').appendChild(feedback);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-primary story-next-btn';
  nextBtn.textContent = currentSceneIndex + 1 < currentStory.scenes.length ? 'Continue →' : 'Finish Story';
  nextBtn.onclick = nextStoryScene;
  document.querySelector('.story-choices').appendChild(nextBtn);
}

function nextStoryScene() {
  currentSceneIndex++;
  if (currentSceneIndex >= currentStory.scenes.length) {
    finishStory();
  } else {
    renderStoryScene();
  }
}

function finishStory() {
  if (!currentStory) return;
  if (!window.state) return;
  if (!window.state.storiesCompleted) window.state.storiesCompleted = [];
  if (!window.state.storiesCompleted.includes(currentStory.id)) {
    window.state.storiesCompleted.push(currentStory.id);
  }
  if (window.saveState) window.saveState();
  if (window.earnXP) window.earnXP(currentStory.xpReward);
  if (window.earnCoins) window.earnCoins(currentStory.coinsReward, 'story_complete');
  if (window.mascotReact) window.mascotReact('lesson_complete');

  const total = currentStory.scenes.length;
  const pct = Math.round((storyScore / total) * 100);

  const view = document.getElementById('view-story');
  if (view) {
    view.innerHTML = `
      <div class="story-complete-screen">
        <div class="story-complete-emoji">${currentStory.emoji}</div>
        <h2 class="story-complete-title">Story Complete!</h2>
        <h3 style="color:#94a3b8;margin-bottom:24px">${currentStory.title}</h3>
        <div class="story-score">
          <div class="score-circle">${pct}%</div>
          <p>${storyScore}/${total} correct choices</p>
        </div>
        <div class="story-rewards">
          <div class="reward-badge">⚡ +${currentStory.xpReward} XP</div>
          <div class="reward-badge">🪙 +${currentStory.coinsReward}</div>
        </div>
        <button class="btn btn-primary" style="margin-top:32px" onclick="showView('app');showAppPage('stories')">
          Back to Stories
        </button>
      </div>`;
  }
}

function exitStory() {
  if (window.showView) window.showView('app');
  if (window.showAppPage) window.showAppPage('stories');
  currentStory = null;
}
