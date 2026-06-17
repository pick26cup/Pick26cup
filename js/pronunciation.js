'use strict';
/* SmartFin Pronunciation Trainer */

const PHONEME_DATA = {
  vowels: [
    { symbol: '/iː/', example: 'see', word: 'sheep', desc: 'Long ee sound' },
    { symbol: '/ɪ/', example: 'sit', word: 'ship', desc: 'Short i sound' },
    { symbol: '/e/', example: 'bed', word: 'pen', desc: 'Short e sound' },
    { symbol: '/æ/', example: 'cat', word: 'man', desc: 'Flat a sound' },
    { symbol: '/ɑː/', example: 'car', word: 'father', desc: 'Long ah sound' },
    { symbol: '/ɒ/', example: 'hot', word: 'dog', desc: 'Short o sound' },
    { symbol: '/ɔː/', example: 'law', word: 'thought', desc: 'Long aw sound' },
    { symbol: '/ʊ/', example: 'book', word: 'foot', desc: 'Short oo sound' },
    { symbol: '/uː/', example: 'blue', word: 'moon', desc: 'Long oo sound' },
    { symbol: '/ʌ/', example: 'cut', word: 'sun', desc: 'Short u sound' },
    { symbol: '/ɜː/', example: 'bird', word: 'nurse', desc: 'ER sound' },
    { symbol: '/ə/', example: 'about', word: 'sofa', desc: 'Schwa (unstressed)' }
  ],
  consonants: [
    { symbol: '/θ/', example: 'think', word: 'bath', desc: 'Voiceless th' },
    { symbol: '/ð/', example: 'this', word: 'father', desc: 'Voiced th' },
    { symbol: '/ʃ/', example: 'shoe', word: 'ship', desc: 'sh sound' },
    { symbol: '/ʒ/', example: 'measure', word: 'vision', desc: 'zh sound' },
    { symbol: '/tʃ/', example: 'chair', word: 'church', desc: 'ch sound' },
    { symbol: '/dʒ/', example: 'job', word: 'judge', desc: 'j sound' },
    { symbol: '/ŋ/', example: 'ring', word: 'sing', desc: 'ng sound' },
    { symbol: '/r/', example: 'red', word: 'rock', desc: 'American r' }
  ]
};

const PRONUNCIATION_EXERCISES = [
  { word: 'world', phonetic: '/wɜːrld/', difficulty: 'hard', tips: 'The "or" makes an "er" sound in British English' },
  { word: 'thought', phonetic: '/θɔːt/', difficulty: 'hard', tips: 'The "th" is voiceless, like in "thin"' },
  { word: 'comfortable', phonetic: '/ˈkʌmftəbl/', difficulty: 'medium', tips: 'Often reduced to 3 syllables: COMF-tuh-bul' },
  { word: 'february', phonetic: '/ˈfebjueri/', difficulty: 'medium', tips: 'The first "r" is often silent in casual speech' },
  { word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', difficulty: 'hard', tips: 'Note: pro-NUN-ci-A-tion, not pro-NOUN-ci-A-tion' },
  { word: 'particularly', phonetic: '/pəˈtɪkjələrli/', difficulty: 'hard', tips: 'Reduce unstressed syllables: par-TIC-u-lar-ly' },
  { word: 'schedule', phonetic: '/ˈʃedjuːl/', difficulty: 'medium', tips: 'British: SHED-yool | American: SKED-yool' },
  { word: 'colonel', phonetic: '/ˈkɜːrnl/', difficulty: 'hard', tips: 'Spelled colonel but pronounced like "kernel"' }
];

let pronRecognition = null, pronAnalyser = null, pronAudioCtx = null, pronAnimFrame = null;
let currentPronExercise = 0, pronScores = [];

function renderPronunciationPage() {
  const page = document.getElementById('page-pronunciation');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🎙️ Pronunciation Trainer</h1>
      <p class="page-subtitle">Perfect your English accent with AI-powered feedback</p>
    </div>

    <div class="pron-tabs">
      <button class="pron-tab active" onclick="switchPronTab('exercises', this)">Exercises</button>
      <button class="pron-tab" onclick="switchPronTab('phonemes', this)">Phoneme Chart</button>
      <button class="pron-tab" onclick="switchPronTab('waveform', this)">Waveform</button>
    </div>

    <div id="pron-tab-exercises" class="pron-tab-content active">
      ${renderPronExercisesTab()}
    </div>
    <div id="pron-tab-phonemes" class="pron-tab-content">
      ${renderPhonemesTab()}
    </div>
    <div id="pron-tab-waveform" class="pron-tab-content">
      ${renderWaveformTab()}
    </div>`;
}

function switchPronTab(tab, btn) {
  document.querySelectorAll('.pron-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pron-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById('pron-tab-' + tab);
  if (content) content.classList.add('active');
}

function renderPronExercisesTab() {
  const ex = PRONUNCIATION_EXERCISES[currentPronExercise];
  const scores = window.state ? (window.state.pronunciationScores || {}) : {};
  return `
    <div class="pron-exercise-card">
      <div class="pron-exercise-number">${currentPronExercise + 1} / ${PRONUNCIATION_EXERCISES.length}</div>
      <div class="pron-word">${ex.word}</div>
      <div class="pron-phonetic">${ex.phonetic}</div>
      <div class="pron-difficulty difficulty-${ex.difficulty}">${ex.difficulty}</div>
      <div class="pron-tip">💡 ${ex.tips}</div>
      <div class="pron-controls">
        <button class="btn btn-secondary pron-listen-btn" onclick="listenPronExample('${ex.word}')">
          🔊 Listen
        </button>
        <button class="btn btn-primary pron-record-btn" id="pronRecordBtn" onclick="togglePronRecord()">
          🎙️ Record
        </button>
        <button class="btn btn-secondary" onclick="listenPronExample('${ex.word}', 0.6)">
          🐢 Slow
        </button>
      </div>
      <div class="pron-waveform-mini">
        <canvas id="pronMiniCanvas" width="300" height="60"></canvas>
      </div>
      <div id="pronFeedback" class="pron-feedback"></div>
      ${scores[ex.word] ? `<div class="pron-best">Best: ${scores[ex.word]}%</div>` : ''}
    </div>
    <div class="pron-nav">
      <button class="btn btn-secondary" onclick="prevPronExercise()">← Previous</button>
      <button class="btn btn-secondary" onclick="nextPronExercise()">Next →</button>
    </div>
    <div class="pron-exercises-list">
      ${PRONUNCIATION_EXERCISES.map((e, i) => `
        <div class="pron-list-item ${i === currentPronExercise ? 'active' : ''} difficulty-${e.difficulty}"
          onclick="currentPronExercise=${i};renderPronunciationPage()">
          <span class="pron-list-word">${e.word}</span>
          <span class="pron-list-phonetic">${e.phonetic}</span>
          <span class="pron-list-score">${(scores[e.word] || '--')}${scores[e.word] ? '%' : ''}</span>
        </div>`).join('')}
    </div>`;
}

function renderPhonemesTab() {
  return `
    <div class="phoneme-section">
      <h3 class="phoneme-section-title">Vowel Sounds</h3>
      <div class="phoneme-grid">
        ${PHONEME_DATA.vowels.map(p => `
          <div class="phoneme-card" onclick="speakPhoneme('${p.word}')">
            <div class="phoneme-symbol">${p.symbol}</div>
            <div class="phoneme-example">${p.example}</div>
            <div class="phoneme-word">${p.word}</div>
            <div class="phoneme-desc">${p.desc}</div>
            <button class="phoneme-play">🔊</button>
          </div>`).join('')}
      </div>
    </div>
    <div class="phoneme-section">
      <h3 class="phoneme-section-title">Challenging Consonants</h3>
      <div class="phoneme-grid">
        ${PHONEME_DATA.consonants.map(p => `
          <div class="phoneme-card" onclick="speakPhoneme('${p.word}')">
            <div class="phoneme-symbol">${p.symbol}</div>
            <div class="phoneme-example">${p.example}</div>
            <div class="phoneme-word">${p.word}</div>
            <div class="phoneme-desc">${p.desc}</div>
            <button class="phoneme-play">🔊</button>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderWaveformTab() {
  return `
    <div class="waveform-section">
      <h3 class="waveform-title">Voice Waveform Analyzer</h3>
      <p class="waveform-desc">Record your voice and see the waveform in real-time</p>
      <canvas id="waveformCanvas" width="600" height="120" class="waveform-canvas"></canvas>
      <div class="waveform-controls">
        <button class="btn btn-primary" id="waveRecordBtn" onclick="toggleWaveformRecord()">🎙️ Start Recording</button>
        <button class="btn btn-secondary" onclick="clearWaveform()">🗑️ Clear</button>
      </div>
      <div id="waveformStatus" class="waveform-status">Click Start Recording to begin</div>
    </div>`;
}

function listenPronExample(word, rate) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US'; utter.rate = rate || 1.0; utter.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function speakPhoneme(word) { listenPronExample(word, 0.8); }

function togglePronRecord() {
  const btn = document.getElementById('pronRecordBtn');
  if (!btn) return;
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if (window.showToast) window.showToast('Speech recognition not supported in this browser', 'warning');
    return;
  }
  if (pronRecognition) {
    pronRecognition.stop(); pronRecognition = null;
    btn.textContent = '🎙️ Record'; btn.classList.remove('recording');
    return;
  }
  const ex = PRONUNCIATION_EXERCISES[currentPronExercise];
  btn.textContent = '⏹️ Stop'; btn.classList.add('recording');
  startMiniWaveform();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  pronRecognition = new SR();
  pronRecognition.lang = 'en-US'; pronRecognition.continuous = false;
  pronRecognition.onresult = (event) => {
    const said = event.results[0][0].transcript.trim().toLowerCase();
    const conf = event.results[0][0].confidence;
    const score = scorePronunciation(said, ex.word, conf);
    showPronFeedback(said, ex.word, score);
  };
  pronRecognition.onerror = () => {
    if (window.showToast) window.showToast('Could not detect speech. Please try again.', 'warning');
    btn.textContent = '🎙️ Record'; btn.classList.remove('recording');
    stopMiniWaveform();
  };
  pronRecognition.onend = () => {
    btn.textContent = '🎙️ Record'; btn.classList.remove('recording');
    pronRecognition = null; stopMiniWaveform();
  };
  pronRecognition.start();
}

function scorePronunciation(said, target, confidence) {
  const s = said.replace(/[^a-z]/g,''), t = target.toLowerCase().replace(/[^a-z]/g,'');
  if (s === t) return Math.round(Math.min(100, 85 + confidence * 15));
  let matches = 0;
  const minLen = Math.min(s.length, t.length);
  for (let i = 0; i < minLen; i++) if (s[i] === t[i]) matches++;
  const similarity = matches / Math.max(s.length, t.length);
  return Math.round(similarity * 100 * (0.7 + confidence * 0.3));
}

function showPronFeedback(said, target, score) {
  const fb = document.getElementById('pronFeedback');
  if (!fb) return;
  const emoji = score >= 90 ? '🌟' : score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌';
  const msg = score >= 90 ? 'Excellent pronunciation!' : score >= 70 ? 'Good job! Keep practicing.' : score >= 50 ? 'Getting there! Listen and try again.' : 'Keep practicing — you\'ll improve!';
  fb.innerHTML = `
    <div class="pron-result">
      <div class="pron-score-circle ${score >= 70 ? 'good' : 'needs-work'}">${score}%</div>
      <div class="pron-result-info">
        <div>${emoji} ${msg}</div>
        <div class="pron-said">You said: "<i>${said}</i>"</div>
        <div class="pron-target">Target: "<b>${target}</b>"</div>
      </div>
    </div>`;
  if (!window.state.pronunciationScores) window.state.pronunciationScores = {};
  const prev = window.state.pronunciationScores[target] || 0;
  if (score > prev) { window.state.pronunciationScores[target] = score; if (window.saveState) window.saveState(); }
}

function startMiniWaveform() {
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    pronAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    pronAnalyser = pronAudioCtx.createAnalyser();
    pronAudioCtx.createMediaStreamSource(stream).connect(pronAnalyser);
    pronAnalyser.fftSize = 256;
    drawMiniWaveform();
  }).catch(() => {});
}

function drawMiniWaveform() {
  const canvas = document.getElementById('pronMiniCanvas');
  if (!canvas || !pronAnalyser) return;
  const ctx = canvas.getContext('2d');
  const data = new Uint8Array(pronAnalyser.frequencyBinCount);
  pronAnalyser.getByteTimeDomainData(data);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 2;
  ctx.beginPath();
  const sliceW = canvas.width / data.length;
  let x = 0;
  data.forEach((v, i) => {
    const y = (v / 128) * (canvas.height / 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    x += sliceW;
  });
  ctx.stroke();
  pronAnimFrame = requestAnimationFrame(drawMiniWaveform);
}

function stopMiniWaveform() {
  if (pronAnimFrame) { cancelAnimationFrame(pronAnimFrame); pronAnimFrame = null; }
  if (pronAudioCtx) { pronAudioCtx.close().catch(() => {}); pronAudioCtx = null; pronAnalyser = null; }
}

let waveRecording = false, waveAudioCtx = null, waveAnalyser = null, waveAnimFrame = null;

function toggleWaveformRecord() {
  const btn = document.getElementById('waveRecordBtn');
  const status = document.getElementById('waveformStatus');
  if (!waveRecording) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      waveAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      waveAnalyser = waveAudioCtx.createAnalyser();
      waveAudioCtx.createMediaStreamSource(stream).connect(waveAnalyser);
      waveAnalyser.fftSize = 512;
      waveRecording = true;
      if (btn) { btn.textContent = '⏹️ Stop'; btn.classList.add('recording'); }
      if (status) status.textContent = '🔴 Recording...';
      drawWaveform();
    }).catch(() => { if (window.showToast) window.showToast('Microphone access denied', 'error'); });
  } else {
    waveRecording = false;
    if (waveAnimFrame) cancelAnimationFrame(waveAnimFrame);
    if (waveAudioCtx) waveAudioCtx.close().catch(() => {});
    if (btn) { btn.textContent = '🎙️ Start Recording'; btn.classList.remove('recording'); }
    if (status) status.textContent = 'Recording stopped. Press Start to record again.';
  }
}

function drawWaveform() {
  if (!waveRecording || !waveAnalyser) return;
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = new Uint8Array(waveAnalyser.frequencyBinCount);
  waveAnalyser.getByteTimeDomainData(data);
  ctx.fillStyle = 'rgba(5,5,16,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 2;
  ctx.beginPath();
  const sliceW = canvas.width / data.length;
  let x = 0;
  data.forEach((v, i) => {
    const y = (v / 128.0) * (canvas.height / 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    x += sliceW;
  });
  ctx.stroke();
  waveAnimFrame = requestAnimationFrame(drawWaveform);
}

function clearWaveform() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function prevPronExercise() {
  if (currentPronExercise > 0) { currentPronExercise--; renderPronunciationPage(); }
}
function nextPronExercise() {
  if (currentPronExercise < PRONUNCIATION_EXERCISES.length - 1) { currentPronExercise++; renderPronunciationPage(); }
}
