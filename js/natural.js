'use strict';
/* SmartFin — Natural Learning Methods
   Childhood acquisition + Artist techniques:
   Shadowing · Songs · Visual TPR · Copy the Masters · Free Journal · Improv */

// ─── DATA ────────────────────────────────────────────────────────────────────

const SHADOW_SENTENCES = [
  { id: 'sh1', level: 'A1', text: 'Hello, my name is Alex. Nice to meet you!', phonetic: 'HEH-loh, my NAYM iz AL-ex. NAYS tuh MEET yoo', tip: 'Rise on "nice" and smile naturally.' },
  { id: 'sh2', level: 'A1', text: 'Excuse me, where is the nearest subway station?', phonetic: 'ex-KYOOZ mee, WAIR iz thuh NEAR-ist SUB-way STAY-shun', tip: 'Stress the question word "where".' },
  { id: 'sh3', level: 'A2', text: 'I have been studying English for two years and I really enjoy it.', phonetic: 'ay hav BIN STUD-ee-ing ING-glish for TOO YEERZ and ay REEL-ee en-JOY it', tip: 'Link "studying" with no pause — blend the words.' },
  { id: 'sh4', level: 'B1', text: 'Actually, I was wondering if you could give me some advice about this situation.', phonetic: 'AK-choo-uh-lee, ay wuz WUN-der-ing if yoo kood GIV mee sum ad-VYSE uh-BOWT this sit-yoo-AY-shun', tip: 'This is polite hedging — common in real conversation.' },
  { id: 'sh5', level: 'B2', text: 'The fact that language shapes our perception of reality is a fascinating area of research.', phonetic: 'thuh FAK thet LANG-gwij SHAYPS our per-SEP-shun of ree-AL-i-tee iz uh fas-in-AY-ting AIR-ee-uh ov REE-surch', tip: 'Academic tone: slow down on key nouns.' },
  { id: 'sh6', level: 'C1', text: 'Notwithstanding the challenges, she persevered with remarkable resilience and intellectual curiosity.', phonetic: 'not-with-STAND-ing thuh CHAL-en-jiz, shee per-suh-VEERD with re-MAR-kuh-bul re-ZIL-ee-ents and in-tel-EK-choo-ul kyoor-ee-OS-i-tee', tip: 'Let "notwithstanding" flow — don\'t chop it up.' }
];

const SONG_LESSONS = [
  {
    id: 'song1', title: 'Let Her Go', artist: 'Passenger', level: 'A2',
    theme: 'Regret & Conditionals',
    lyrics: [
      { line: 'Well, you only need the light when it\'s burning ___', blank: 'low', hint: 'opposite of high', options: ['low','fast','bright','long'] },
      { line: 'Only miss the ___ when it starts to snow', blank: 'sun', hint: 'star at the center of our solar system', options: ['sun','rain','wind','night'] },
      { line: 'Only know you love her when you ___ her go', blank: 'let', hint: 'to allow or permit', options: ['let','make','see','hear'] },
      { line: 'Staring at the bottom of your glass, hoping one day you\'ll make a ___', blank: 'dream', hint: 'a sleeping vision', options: ['dream','wish','plan','choice'] }
    ],
    grammar: 'Notice "only when" — this is a conditional pattern expressing regret.',
    vocab: ['regret', 'burning low', 'miss', 'staring']
  },
  {
    id: 'song2', title: 'Count on Me', artist: 'Bruno Mars', level: 'A1',
    theme: 'Friendship & Reliability',
    lyrics: [
      { line: 'If you ever find yourself ___ in the middle of the sea', blank: 'stuck', hint: 'unable to move', options: ['stuck','lost','found','sitting'] },
      { line: 'I\'ll ___ the waves to find you', blank: 'sail', hint: 'to travel by boat', options: ['sail','swim','cross','ride'] },
      { line: 'You can count on me like ___, two, three', blank: 'one', hint: 'first number', options: ['one','a','the','my'] },
      { line: 'I\'ll be there, and I know when I need it, I can count on you ___ three', blank: 'like', hint: 'used to make comparisons', options: ['like','as','with','for'] }
    ],
    grammar: '"Count on" is a phrasal verb meaning to depend on someone.',
    vocab: ['count on', 'sail', 'stuck', 'be there for']
  },
  {
    id: 'song3', title: 'Perfect', artist: 'Ed Sheeran', level: 'B1',
    theme: 'Romance & Past Simple',
    lyrics: [
      { line: 'I found a love for ___, darling just dive right in', blank: 'me', hint: 'first person object pronoun', options: ['me','you','us','her'] },
      { line: 'Follow my lead, I\'ll ___ you in the dark', blank: 'take', hint: 'to lead or guide', options: ['take','hold','keep','walk'] },
      { line: 'I never ___ you were the someone waiting for me', blank: 'knew', hint: 'past tense of "know"', options: ['knew','know','known','knowing'] },
      { line: 'We were just ___, you and me', blank: 'kids', hint: 'young people; children', options: ['kids','young','teens','friends'] }
    ],
    grammar: 'Past simple vs. past continuous: "was falling" vs "fell" — ongoing vs. completed.',
    vocab: ['dive right in', 'follow the lead', 'wait for', 'barefoot']
  }
];

const MASTERS_SPEECHES = [
  {
    id: 'm1', title: 'Martin Luther King Jr.', subtitle: '"I Have a Dream" — 1963',
    level: 'C1', duration: '25s', technique: 'Repetition & Rising Intonation',
    text: 'I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.',
    breakdown: [
      { phrase: 'I have a dream', note: 'The anchor phrase — pause after it, let it land.' },
      { phrase: 'will one day', note: 'Stress "one day" — it expresses hope and future certainty.' },
      { phrase: 'not be judged', note: 'Drop your voice slightly — this is the negative ideal.' },
      { phrase: 'content of their character', note: 'Alliteration — stress both "c" words equally.' }
    ],
    technique_tip: 'Artists study King\'s technique: he repeats a phrase to build emotional momentum. Try this in your own speaking.'
  },
  {
    id: 'm2', title: 'Steve Jobs', subtitle: 'Stanford Commencement — 2005',
    level: 'B2', duration: '20s', technique: 'Conversational Authority',
    text: 'You can\'t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future.',
    breakdown: [
      { phrase: 'You can\'t connect the dots', note: 'Conversational — speak to the audience directly, like a friend.' },
      { phrase: 'looking forward / looking backwards', note: 'These are contrasted — give each a different energy.' },
      { phrase: 'you have to trust', note: 'Slow down here. This is the lesson.' },
      { phrase: 'somehow connect', note: '"Somehow" signals uncertainty — it\'s human and honest.' }
    ],
    technique_tip: 'Jobs spoke at 150 words/minute — slower than average (180-200). Deliberate pace creates authority.'
  },
  {
    id: 'm3', title: 'Winston Churchill', subtitle: '"We Shall Fight" — 1940',
    level: 'C2', duration: '18s', technique: 'Anaphora & Resolve',
    text: 'We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall never surrender.',
    breakdown: [
      { phrase: 'We shall fight', note: 'Repeated 4 times — anaphora. Each repetition gets slightly louder.' },
      { phrase: 'on the beaches / landing grounds / fields / streets', note: 'Each location is a new battlefield — visualize each one.' },
      { phrase: 'we shall NEVER surrender', note: '"Never" is the emotional peak. Pause before it.' }
    ],
    technique_tip: 'Churchill used anaphora (repetition at the start of clauses) — a technique from ancient Greek rhetoric. Artists steal from everywhere.'
  }
];

const TPR_SETS = [
  {
    id: 'tpr1', title: 'Daily Routines', level: 'A1',
    items: [
      { word: 'wake up', emoji: '⏰', action: 'stretch your arms wide', category: 'morning' },
      { word: 'brush teeth', emoji: '🦷', action: 'mime brushing motion', category: 'morning' },
      { word: 'eat breakfast', emoji: '🍳', action: 'mime eating with a spoon', category: 'morning' },
      { word: 'walk to work', emoji: '🚶', action: 'march in place', category: 'commute' },
      { word: 'sit down', emoji: '🪑', action: 'act of sitting', category: 'office' },
      { word: 'type on keyboard', emoji: '⌨️', action: 'mime typing rapidly', category: 'office' },
      { word: 'shake hands', emoji: '🤝', action: 'extend hand forward', category: 'social' },
      { word: 'go to sleep', emoji: '😴', action: 'close eyes and tilt head', category: 'night' }
    ]
  },
  {
    id: 'tpr2', title: 'Emotions in Context', level: 'A2',
    items: [
      { word: 'frustrated', emoji: '😤', action: 'cross arms and look away', category: 'negative' },
      { word: 'curious', emoji: '🤔', action: 'tilt head and squint eyes', category: 'neutral' },
      { word: 'relieved', emoji: '😮‍💨', action: 'exhale slowly, drop shoulders', category: 'positive' },
      { word: 'embarrassed', emoji: '😳', action: 'cover cheeks with hands', category: 'negative' },
      { word: 'proud', emoji: '😤', action: 'chest out, chin up', category: 'positive' },
      { word: 'anxious', emoji: '😰', action: 'fidget hands together', category: 'negative' }
    ]
  }
];

const JOURNAL_PROMPTS = [
  'Describe your perfect day using only the words you know in English.',
  'Write about someone who changed your life. Use 3 new vocabulary words.',
  'Imagine you are an actor preparing for a role as an English speaker. What is your character\'s life like?',
  'Write the beginning of a story: "The moment I stepped off the plane in New York..."',
  'Describe your hometown to a foreigner who has never heard of it.',
  'Write a letter to your future self in 5 years — in English.',
  'What would you do if you woke up speaking perfect English tomorrow?',
  'Describe the last film you watched as if you were a movie critic.',
  'Write a recipe for your favorite dish — in precise English instructions.',
  'Imagine you are giving a TED Talk. What is your topic? Write the opening 3 sentences.'
];

const IMPROV_SCENARIOS = [
  { id: 'imp1', title: 'Yes, And...', level: 'B1', description: 'The core jazz rule: accept the premise and add to it. Respond to each sentence with "Yes, and..." + something new.', starter: 'I just found a suitcase full of money on the street.', technique: 'This is the #1 improv rule in theater and jazz — build on what exists, don\'t block.' },
  { id: 'imp2', title: 'One-Word Story', level: 'A2', description: 'Tell a story one word at a time. Type your word and see the story grow.', starter: 'Once', technique: 'Forces you to think fast — like how children internalize language through play.' },
  { id: 'imp3', title: 'Status Shift', level: 'B2', description: 'Rewrite the same sentence as 3 different people: a child, a professor, a street vendor.', starter: 'Tell me how to get to the station.', technique: 'Actors call this "register shifting" — mastering tone is true fluency.' },
  { id: 'imp4', title: 'Emotional Reread', level: 'B1', description: 'Say the same sentence expressing 5 different emotions. Notice how meaning shifts with tone.', starter: 'I can\'t believe you said that.', technique: 'What we say matters less than HOW we say it — 38% of communication is tone.' }
];

// ─── STATE ────────────────────────────────────────────────────────────────────
let shadowIndex = 0, shadowRecognition = null, shadowRecording = false;
let songIndex = 0, currentSong = null, songAnswers = [];
let masterIndex = 0, masterRecognition = null;
let tprSet = 0, tprCurrentIndex = 0, tprFlipped = [];
let journalPromptIndex = 0;
let improvIndex = 0, improvStory = [];

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
function renderNaturalPage() {
  const page = document.getElementById('page-natural');
  if (!page) return;

  const methods = [
    { id: 'shadowing', icon: '🎭', title: 'Shadowing', subtitle: 'Imitate like a child', desc: 'Listen → repeat → match native rhythm exactly. How every child learns.', color: '#8B5CF6', level: 'All levels' },
    { id: 'songs', icon: '🎵', title: 'Songs & Lyrics', subtitle: 'Learn through music', desc: 'Fill in the blanks to real songs. Music activates emotional memory.', color: '#EC4899', level: 'A1–B2' },
    { id: 'masters', icon: '🏛️', title: 'Copy the Masters', subtitle: 'Artist technique', desc: 'Shadow legendary speeches. Painters copy Rembrandt — you copy King, Jobs, Churchill.', color: '#F59E0B', level: 'B2–C2' },
    { id: 'tpr', icon: '🤸', title: 'TPR — Total Physical Response', subtitle: 'Childhood body learning', desc: 'Connect words to physical actions. Dr. Asher\'s method — proven with children worldwide.', color: '#10B981', level: 'A1–A2' },
    { id: 'journal', icon: '✍️', title: 'Artist\'s Journal', subtitle: 'Daily creative writing', desc: 'Like an artist\'s sketchbook — write freely every day without fear of mistakes.', color: '#06B6D4', level: 'All levels' },
    { id: 'improv', icon: '🎪', title: 'Improv & Jazz Mind', subtitle: 'Musician\'s spontaneity', desc: 'Say "Yes, and..." — theater/jazz improv techniques to speak without overthinking.', color: '#3B82F6', level: 'B1–C1' }
  ];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🧬 Natural Learning</h1>
      <p class="page-subtitle">How children acquire language naturally + how artists master their craft</p>
    </div>

    <div class="natural-intro-banner">
      <div class="natural-intro-left">
        <div class="natural-intro-icon">👶🎨</div>
        <div>
          <h3>Two Powerful Models</h3>
          <p>Children don't study grammar — they <b>absorb</b> through imitation, music, play, and emotion. Artists don't memorize — they <b>copy masters</b>, improvise, and practice daily. Both methods bypass the analytical mind and build true fluency.</p>
        </div>
      </div>
    </div>

    <div class="natural-methods-grid">
      ${methods.map(m => `
        <div class="natural-method-card" onclick="openNaturalMethod('${m.id}')" style="--method-color:${m.color}">
          <div class="natural-method-icon">${m.icon}</div>
          <div class="natural-method-content">
            <div class="natural-method-title">${m.title}</div>
            <div class="natural-method-subtitle">${m.subtitle}</div>
            <div class="natural-method-desc">${m.desc}</div>
            <div class="natural-method-level">${m.level}</div>
          </div>
          <div class="natural-method-arrow">→</div>
        </div>`).join('')}
    </div>`;
}

function openNaturalMethod(id) {
  const page = document.getElementById('page-natural');
  if (!page) return;
  switch(id) {
    case 'shadowing': renderShadowing(page); break;
    case 'songs': renderSongs(page); break;
    case 'masters': renderMasters(page); break;
    case 'tpr': renderTPR(page); break;
    case 'journal': renderJournal(page); break;
    case 'improv': renderImprov(page); break;
  }
}

function naturalBack() { renderNaturalPage(); }

// ─── 1. SHADOWING ─────────────────────────────────────────────────────────────
function renderShadowing(page) {
  const sentence = SHADOW_SENTENCES[shadowIndex];
  const total = SHADOW_SENTENCES.length;
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">🎭 Shadowing — Imitate Like a Child</h2>
        <p class="natural-sub-desc">The #1 method polyglots use. Hear → understand → imitate exactly — rhythm, tone, speed.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>Why it works:</b> Children don't translate — they map sound directly to meaning. Shadowing bypasses your native language entirely and builds new neural pathways.
    </div>
    <div class="shadow-card">
      <div class="shadow-level-badge">${sentence.level}</div>
      <div class="shadow-progress">${shadowIndex + 1} / ${total}</div>
      <div class="shadow-text">"${sentence.text}"</div>
      <div class="shadow-phonetic">${sentence.phonetic}</div>
      <div class="shadow-tip">💡 ${sentence.tip}</div>
      <div class="shadow-steps">
        <div class="shadow-step" id="shadowStep1">
          <span class="step-num">1</span>
          <div class="step-content">
            <b>Listen first</b> — don't read, just listen and absorb the rhythm
            <button class="btn btn-secondary btn-sm" onclick="shadowListen()" style="margin-top:8px">🔊 Listen</button>
          </div>
        </div>
        <div class="shadow-step" id="shadowStep2">
          <span class="step-num">2</span>
          <div class="step-content">
            <b>Listen + read</b> — follow the text while hearing it
            <button class="btn btn-secondary btn-sm" onclick="shadowListenSlow()" style="margin-top:8px">🐢 Slow version</button>
          </div>
        </div>
        <div class="shadow-step" id="shadowStep3">
          <span class="step-num">3</span>
          <div class="step-content">
            <b>Shadow it</b> — speak at the same time as the audio
            <button class="btn ${shadowRecording ? 'btn-danger' : 'btn-primary'} btn-sm" id="shadowRecordBtn" onclick="toggleShadowRecord()" style="margin-top:8px">
              ${shadowRecording ? '⏹️ Stop' : '🎙️ Record & Compare'}
            </button>
          </div>
        </div>
      </div>
      <div id="shadowFeedback" class="shadow-feedback"></div>
    </div>
    <div class="shadow-nav">
      <button class="btn btn-secondary" onclick="prevShadow()" ${shadowIndex===0?'disabled':''}>← Previous</button>
      <button class="btn btn-primary" onclick="nextShadow()" ${shadowIndex===total-1?'disabled':''}>Next →</button>
    </div>
    <div class="shadow-all">
      ${SHADOW_SENTENCES.map((s,i) => `
        <div class="shadow-mini ${i===shadowIndex?'active':''}" onclick="shadowIndex=${i};renderShadowing(document.getElementById('page-natural'))">
          <span class="shadow-mini-level">${s.level}</span>
          <span class="shadow-mini-text">"${s.text.slice(0,40)}..."</span>
        </div>`).join('')}
    </div>`;
}

function shadowListen() {
  const sentence = SHADOW_SENTENCES[shadowIndex];
  const utter = new SpeechSynthesisUtterance(sentence.text);
  utter.lang = 'en-US'; utter.rate = 1.0; utter.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function shadowListenSlow() {
  const sentence = SHADOW_SENTENCES[shadowIndex];
  const utter = new SpeechSynthesisUtterance(sentence.text);
  utter.lang = 'en-US'; utter.rate = 0.6; utter.pitch = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function toggleShadowRecord() {
  const btn = document.getElementById('shadowRecordBtn');
  if (shadowRecording) {
    if (shadowRecognition) shadowRecognition.stop();
    shadowRecording = false;
    if (btn) { btn.textContent = '🎙️ Record & Compare'; btn.classList.replace('btn-danger','btn-primary'); }
    return;
  }
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if (window.showToast) showToast('Speech recognition not supported in this browser', 'warning');
    return;
  }
  shadowRecording = true;
  if (btn) { btn.textContent = '⏹️ Stop'; btn.classList.replace('btn-primary','btn-danger'); }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  shadowRecognition = new SR();
  shadowRecognition.lang = 'en-US'; shadowRecognition.continuous = false;
  shadowRecognition.onresult = (event) => {
    const said = event.results[0][0].transcript;
    const conf = event.results[0][0].confidence;
    showShadowFeedback(said, conf);
  };
  shadowRecognition.onerror = () => {
    if (window.showToast) showToast('Could not capture voice. Try again.', 'warning');
    shadowRecording = false;
    if (btn) { btn.textContent = '🎙️ Record & Compare'; btn.classList.replace('btn-danger','btn-primary'); }
  };
  shadowRecognition.onend = () => {
    shadowRecording = false;
    if (btn) { btn.textContent = '🎙️ Record & Compare'; btn.classList.replace('btn-danger','btn-primary'); }
  };
  shadowRecognition.start();
}

function showShadowFeedback(said, confidence) {
  const target = SHADOW_SENTENCES[shadowIndex].text.toLowerCase().replace(/[^a-z\s]/g,'');
  const spoke = said.toLowerCase().replace(/[^a-z\s]/g,'');
  const targetWords = target.split(' '), spokeWords = spoke.split(' ');
  let matches = 0;
  targetWords.forEach(w => { if (spokeWords.includes(w)) matches++; });
  const accuracy = Math.round((matches / targetWords.length) * 100);
  const fb = document.getElementById('shadowFeedback');
  if (!fb) return;
  const emoji = accuracy >= 85 ? '🌟' : accuracy >= 65 ? '✅' : accuracy >= 45 ? '⚠️' : '🔄';
  const msg = accuracy >= 85 ? 'Excellent shadowing! Native-level rhythm.' : accuracy >= 65 ? 'Good! Keep practicing the rhythm.' : accuracy >= 45 ? 'Getting there — focus on the stressed syllables.' : 'Listen again carefully, then try once more.';
  fb.innerHTML = `
    <div class="shadow-result">
      <div class="shadow-accuracy ${accuracy >= 70 ? 'good' : 'retry'}">${accuracy}%</div>
      <div class="shadow-result-text">
        <div>${emoji} ${msg}</div>
        <div class="shadow-said">You: "${said}"</div>
        <div class="shadow-target">Target: "${SHADOW_SENTENCES[shadowIndex].text}"</div>
      </div>
    </div>`;
  if (accuracy >= 70 && window.earnXP) { earnXP(15); if (window.earnCoins) earnCoins(8, 'shadowing'); }
  if (window.updateChallengeProgress) updateChallengeProgress('speaking', 1);
}

function prevShadow() { if (shadowIndex > 0) { shadowIndex--; renderShadowing(document.getElementById('page-natural')); } }
function nextShadow() { if (shadowIndex < SHADOW_SENTENCES.length-1) { shadowIndex++; renderShadowing(document.getElementById('page-natural')); } }

// ─── 2. SONGS ────────────────────────────────────────────────────────────────
function renderSongs(page) {
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">🎵 Songs & Lyrics</h2>
        <p class="natural-sub-desc">Music activates emotional memory — words learned through songs are remembered 2× longer.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>The science:</b> When we attach language to music and emotion, the hippocampus and amygdala both activate. This is why you remember every word of a childhood song.
    </div>
    <div class="songs-grid">
      ${SONG_LESSONS.map((s,i) => `
        <div class="song-card" onclick="startSongLesson(${i})">
          <div class="song-icon">🎵</div>
          <div class="song-info">
            <div class="song-title">"${s.title}"</div>
            <div class="song-artist">— ${s.artist}</div>
            <div class="song-theme">${s.theme}</div>
            <span class="song-level-badge">${s.level}</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="startSongLesson(${i});event.stopPropagation()">Start →</button>
        </div>`).join('')}
    </div>`;
}

function startSongLesson(index) {
  currentSong = SONG_LESSONS[index];
  songAnswers = new Array(currentSong.lyrics.length).fill(null);
  songIndex = index;
  renderSongExercise(document.getElementById('page-natural'));
}

function renderSongExercise(page) {
  if (!currentSong) return;
  const song = currentSong;
  const allAnswered = songAnswers.every(a => a !== null);
  const score = songAnswers.filter((a,i) => a === song.lyrics[i].blank).length;
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="renderSongs(document.getElementById('page-natural'))">←</button>
      <div>
        <h2 class="natural-sub-title">🎵 "${song.title}" — ${song.artist}</h2>
        <p class="natural-sub-desc">${song.theme} · Level ${song.level}</p>
      </div>
    </div>
    <div class="song-exercise">
      <button class="btn btn-secondary" onclick="speakSongLine(-1)">🔊 Listen to full lyrics</button>
      <div class="song-lyrics">
        ${song.lyrics.map((l,i) => {
          const parts = l.line.split(l.blank);
          const answered = songAnswers[i];
          const isCorrect = answered === l.blank;
          return `
            <div class="lyric-line ${answered ? (isCorrect ? 'correct' : 'incorrect') : ''}">
              <div class="lyric-text">
                ${parts[0]}<span class="lyric-blank ${answered ? (isCorrect ? 'filled-correct' : 'filled-wrong') : ''}">${answered || '___'}</span>${parts[1]}
              </div>
              ${answered && !isCorrect ? `<div class="lyric-answer">✓ "${l.blank}"</div>` : ''}
              <button class="btn-icon lyric-listen-btn" onclick="speakSongLine(${i})" title="Listen to this line">🔊</button>
              ${!answered ? `
                <div class="lyric-options">
                  ${l.options.map(o => `<button class="lyric-option" onclick="answerLyric(${i},'${o}')">${o}</button>`).join('')}
                </div>` : ''}
              <div class="lyric-hint">💡 ${l.hint}</div>
            </div>`;
        }).join('')}
      </div>
      ${allAnswered ? `
        <div class="song-result-card">
          <div class="song-score">${score}/${song.lyrics.length} correct</div>
          <div class="song-grammar-note"><b>📚 Grammar note:</b> ${song.grammar}</div>
          <div class="song-vocab"><b>🔑 Key phrases:</b> ${song.vocab.map(v => `<span class="vocab-chip">${v}</span>`).join('')}</div>
          <button class="btn btn-primary" onclick="renderSongs(document.getElementById('page-natural'))" style="margin-top:16px">More Songs →</button>
        </div>` : ''}
    </div>`;
}

function answerLyric(index, choice) {
  if (songAnswers[index] !== null) return;
  songAnswers[index] = choice;
  const correct = choice === currentSong.lyrics[index].blank;
  if (correct && window.mascotReact) mascotReact('correct');
  else if (window.mascotReact) mascotReact('wrong');
  if (songAnswers.every(a => a !== null)) {
    const score = songAnswers.filter((a,i) => a === currentSong.lyrics[i].blank).length;
    if (window.earnXP) earnXP(score * 10);
    if (window.earnCoins) earnCoins(score * 5, 'song_lesson');
    if (window.saveState) saveState();
  }
  renderSongExercise(document.getElementById('page-natural'));
}

function speakSongLine(lineIndex) {
  const song = currentSong;
  if (!song) return;
  let text;
  if (lineIndex === -1) { text = song.lyrics.map(l => l.line.replace(l.blank, l.blank)).join('. '); }
  else { text = song.lyrics[lineIndex].line; }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US'; utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ─── 3. COPY THE MASTERS ─────────────────────────────────────────────────────
function renderMasters(page) {
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">🏛️ Copy the Masters</h2>
        <p class="natural-sub-desc">Every great painter copied Rembrandt. Every great musician transcribed Bach. Now you copy the greatest English speakers.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>The artist's method:</b> Copying masters is how Van Gogh learned painting, how Miles Davis learned jazz, how Shakespeare learned writing. You internalize structure before creating your own voice.
    </div>
    <div class="masters-grid">
      ${MASTERS_SPEECHES.map((m,i) => `
        <div class="master-card" onclick="startMasterLesson(${i})">
          <div class="master-icon">🏛️</div>
          <div class="master-info">
            <div class="master-name">${m.title}</div>
            <div class="master-subtitle">${m.subtitle}</div>
            <div class="master-technique">${m.technique}</div>
            <span class="master-level">${m.level}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

function startMasterLesson(index) {
  masterIndex = index;
  renderMasterExercise(document.getElementById('page-natural'));
}

function renderMasterExercise(page) {
  const master = MASTERS_SPEECHES[masterIndex];
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="renderMasters(document.getElementById('page-natural'))">←</button>
      <div><h2 class="natural-sub-title">🏛️ ${master.title}</h2>
        <p class="natural-sub-desc">${master.subtitle}</p>
      </div>
    </div>
    <div class="master-exercise">
      <div class="master-speech-card">
        <div class="master-speech-text">"${master.text}"</div>
        <div class="master-speech-controls">
          <button class="btn btn-secondary" onclick="listenMaster(${masterIndex}, 1.0)">🔊 Normal speed</button>
          <button class="btn btn-secondary" onclick="listenMaster(${masterIndex}, 0.65)">🐢 Slow (65%)</button>
          <button class="btn btn-primary" id="masterRecordBtn" onclick="toggleMasterRecord()">🎙️ Shadow it</button>
        </div>
      </div>
      <div class="master-breakdown">
        <h3>🔬 Phrase Breakdown</h3>
        ${master.breakdown.map(b => `
          <div class="breakdown-item">
            <div class="breakdown-phrase">"${b.phrase}"</div>
            <div class="breakdown-note">${b.note}</div>
          </div>`).join('')}
      </div>
      <div class="master-technique-box">
        <b>🎨 Artist Technique:</b> ${master.technique_tip}
      </div>
      <div id="masterFeedback" class="shadow-feedback"></div>
    </div>`;
}

function listenMaster(index, rate) {
  const utter = new SpeechSynthesisUtterance(MASTERS_SPEECHES[index].text);
  utter.lang = 'en-GB'; utter.rate = rate; utter.pitch = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function toggleMasterRecord() {
  const btn = document.getElementById('masterRecordBtn');
  if (masterRecognition) {
    masterRecognition.stop(); masterRecognition = null;
    if (btn) { btn.textContent = '🎙️ Shadow it'; }
    return;
  }
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if (window.showToast) showToast('Speech recognition not supported', 'warning');
    return;
  }
  if (btn) btn.textContent = '⏹️ Stop';
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  masterRecognition = new SR();
  masterRecognition.lang = 'en-US'; masterRecognition.continuous = false;
  masterRecognition.onresult = (e) => {
    const said = e.results[0][0].transcript;
    const fb = document.getElementById('masterFeedback');
    if (fb) { fb.innerHTML = `<div class="shadow-result"><div class="shadow-accuracy good">✅</div><div class="shadow-result-text"><div>Excellent practice!</div><div class="shadow-said">You said: "${said}"</div></div></div>`; }
    if (window.earnXP) earnXP(25);
    if (window.earnCoins) earnCoins(15, 'master_shadow');
  };
  masterRecognition.onend = () => { masterRecognition = null; if (btn) btn.textContent = '🎙️ Shadow it'; };
  masterRecognition.start();
}

// ─── 4. TPR ──────────────────────────────────────────────────────────────────
function renderTPR(page) {
  const set = TPR_SETS[tprSet];
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">🤸 TPR — Total Physical Response</h2>
        <p class="natural-sub-desc">Dr. James Asher's method — proven for 50+ years. Move your body to lock words into muscle memory.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>The science:</b> Physical movement during learning activates the motor cortex alongside language centers. This is how toddlers learn "stand up", "clap your hands", "point to the door" — they do it, not just hear it.
    </div>
    <div class="tpr-set-selector">
      ${TPR_SETS.map((s,i) => `<button class="filter-chip ${i===tprSet?'active':''}" onclick="tprSet=${i};renderTPR(document.getElementById('page-natural'))">${s.title}</button>`).join('')}
    </div>
    <div class="tpr-level-badge">${set.level}</div>
    <div class="tpr-grid">
      ${set.items.map((item, i) => `
        <div class="tpr-card ${tprFlipped.includes(tprSet+'-'+i) ? 'flipped' : ''}" onclick="flipTPR(${i})">
          <div class="tpr-card-front">
            <div class="tpr-emoji">${item.emoji}</div>
            <div class="tpr-word">${item.word}</div>
            <div class="tpr-tap-hint">Tap to see action</div>
          </div>
          <div class="tpr-card-back">
            <div class="tpr-action-label">Do this:</div>
            <div class="tpr-action">${item.action}</div>
            <button class="btn btn-secondary btn-sm tpr-listen-btn" onclick="event.stopPropagation();speakTPR('${item.word}')">🔊 Hear it</button>
            <div class="tpr-category">${item.category}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="tpr-instructions">
      <h4>How to practice:</h4>
      <ol>
        <li>Listen to the word (tap 🔊)</li>
        <li>Flip the card to see the action</li>
        <li>Do the action while saying the word</li>
        <li>Repeat 5× until it feels natural</li>
      </ol>
    </div>`;
}

function flipTPR(index) {
  const key = tprSet + '-' + index;
  if (tprFlipped.includes(key)) {
    tprFlipped = tprFlipped.filter(k => k !== key);
  } else {
    tprFlipped.push(key);
    const word = TPR_SETS[tprSet].items[index].word;
    speakTPR(word);
    if (window.earnXP) earnXP(2);
  }
  renderTPR(document.getElementById('page-natural'));
}

function speakTPR(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US'; utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ─── 5. JOURNAL ──────────────────────────────────────────────────────────────
function renderJournal(page) {
  if (!window.state) return;
  if (!window.state.journalEntries) window.state.journalEntries = [];
  const today = new Date().toISOString().slice(0,10);
  const todayEntry = window.state.journalEntries.find(e => e.date === today);

  const promptIdx = parseInt(today.replace(/-/g,'')) % JOURNAL_PROMPTS.length;
  const todayPrompt = JOURNAL_PROMPTS[promptIdx];
  const entries = window.state.journalEntries.slice(0, 5);

  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">✍️ Artist's Journal — Daily Writing</h2>
        <p class="natural-sub-desc">Every day, artists fill their sketchbook. Every day, you fill yours — in English.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>The artist's rule:</b> Da Vinci filled 7,000 pages of journals. Frida Kahlo wrote every day. Morning pages, travel journals, dream diaries — all writing is language learning. The rule: <b>no corrections while writing</b>. Flow first.
    </div>
    <div class="journal-today-card">
      <div class="journal-date-badge">📅 ${today}</div>
      <div class="journal-prompt">✨ Today's prompt:</div>
      <div class="journal-prompt-text">"${todayPrompt}"</div>
      <textarea id="journalTextarea" class="journal-textarea" placeholder="Start writing freely... no fear, no corrections. Let the words flow." rows="8">${todayEntry ? todayEntry.text : ''}</textarea>
      <div class="journal-word-count">
        <span id="journalWordCount">0</span> words
        <span class="journal-goal ${todayEntry && todayEntry.wordCount >= 50 ? 'reached' : ''}">Goal: 50 words</span>
      </div>
      <div style="display:flex;gap:12px;margin-top:12px">
        <button class="btn btn-primary" onclick="saveJournalEntry()">💾 Save Entry</button>
        <button class="btn btn-secondary" onclick="speakJournalEntry()">🔊 Read Aloud</button>
      </div>
    </div>
    <script>
      (function() {
        const ta = document.getElementById('journalTextarea');
        const wc = document.getElementById('journalWordCount');
        if (ta && wc) {
          ta.addEventListener('input', () => {
            const words = ta.value.trim().split(/\\s+/).filter(w => w.length > 0);
            wc.textContent = words.length;
          });
          const words = ta.value.trim().split(/\\s+/).filter(w => w.length > 0);
          wc.textContent = words.length;
        }
      })();
    <\/script>
    ${entries.length > 0 ? `
      <div class="journal-history">
        <h3 class="section-title">Previous Entries</h3>
        ${entries.map(e => `
          <div class="journal-entry-card" onclick="expandJournalEntry(this)">
            <div class="journal-entry-header">
              <span class="journal-entry-date">${e.date}</span>
              <span class="journal-entry-wc">${e.wordCount} words</span>
            </div>
            <div class="journal-entry-preview">${e.text.slice(0,120)}${e.text.length > 120 ? '...' : ''}</div>
            <div class="journal-entry-full" style="display:none">${e.text}</div>
          </div>`).join('')}
      </div>` : ''}`;
}

function saveJournalEntry() {
  const ta = document.getElementById('journalTextarea');
  if (!ta || !ta.value.trim()) return;
  const text = ta.value.trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const today = new Date().toISOString().slice(0,10);
  if (!window.state.journalEntries) window.state.journalEntries = [];
  const existing = window.state.journalEntries.findIndex(e => e.date === today);
  const entry = { date: today, text, wordCount: words.length };
  if (existing >= 0) window.state.journalEntries[existing] = entry;
  else window.state.journalEntries.unshift(entry);
  if (window.saveState) saveState();
  if (words.length >= 50 && window.earnXP) { earnXP(30); if (window.earnCoins) earnCoins(20, 'journal'); }
  if (window.showToast) showToast(`Journal saved! ${words.length} words written. ${words.length >= 50 ? '🌟 Daily goal reached!' : ''}`, 'success');
  if (window.mascotReact) mascotReact('lesson_complete');
}

function speakJournalEntry() {
  const ta = document.getElementById('journalTextarea');
  if (!ta || !ta.value.trim()) return;
  const utter = new SpeechSynthesisUtterance(ta.value);
  utter.lang = 'en-US'; utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function expandJournalEntry(card) {
  const full = card.querySelector('.journal-entry-full');
  const preview = card.querySelector('.journal-entry-preview');
  if (!full) return;
  const isExpanded = full.style.display !== 'none';
  full.style.display = isExpanded ? 'none' : 'block';
  if (preview) preview.style.display = isExpanded ? 'block' : 'none';
}

// ─── 6. IMPROV ───────────────────────────────────────────────────────────────
function renderImprov(page) {
  const scenario = IMPROV_SCENARIOS[improvIndex];
  page.innerHTML = `
    <div class="natural-sub-header">
      <button class="btn-icon" onclick="naturalBack()">←</button>
      <div><h2 class="natural-sub-title">🎪 Improv & Jazz Mind</h2>
        <p class="natural-sub-desc">Theater and jazz musicians speak without preparation. You can too.</p>
      </div>
    </div>
    <div class="shadow-theory-box">
      <b>The jazz principle:</b> Miles Davis said "Don't play what's there, play what's not there." Language fluency is the same — stop translating from your native language and start <b>improvising</b> in English.
    </div>
    <div class="improv-scenario-tabs">
      ${IMPROV_SCENARIOS.map((s,i) => `<button class="filter-chip ${i===improvIndex?'active':''}" onclick="improvIndex=${i};renderImprov(document.getElementById('page-natural'))">${s.title}</button>`).join('')}
    </div>
    <div class="improv-card">
      <div class="improv-type-badge">${scenario.level}</div>
      <h3 class="improv-title">${scenario.title}</h3>
      <p class="improv-desc">${scenario.description}</p>
      <div class="improv-starter">
        <div class="improv-starter-label">Starter line:</div>
        <div class="improv-starter-text">"${scenario.starter}"</div>
        <button class="btn btn-secondary btn-sm" onclick="speakImprov('${scenario.starter.replace(/'/g,"\\'")}')">🔊 Hear it</button>
      </div>
      <textarea id="improvTextarea" class="improv-textarea" placeholder="Respond in English — spontaneously, without thinking too much. Go!" rows="5"></textarea>
      <div style="display:flex;gap:12px;margin-top:12px">
        <button class="btn btn-primary" onclick="submitImprov()">Submit Response ✓</button>
        <button class="btn btn-secondary" onclick="speakImprovResponse()">🔊 Hear your response</button>
      </div>
      <div id="improvFeedback"></div>
    </div>
    <div class="improv-technique-box">
      <b>🎨 Technique note:</b> ${scenario.technique}
    </div>
    <div class="improv-story-display" id="improvStoryDisplay" style="${improvStory.length ? '' : 'display:none'}">
      <h4>The story so far...</h4>
      <p>${improvStory.join(' ')}</p>
    </div>`;
}

function speakImprov(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US'; utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function speakImprovResponse() {
  const ta = document.getElementById('improvTextarea');
  if (!ta || !ta.value.trim()) return;
  speakImprov(ta.value);
}

function submitImprov() {
  const ta = document.getElementById('improvTextarea');
  if (!ta || !ta.value.trim()) { if (window.showToast) showToast('Write something first!', 'warning'); return; }
  const text = ta.value.trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const fb = document.getElementById('improvFeedback');
  const scenario = IMPROV_SCENARIOS[improvIndex];
  if (scenario.id === 'imp2') { improvStory.push(text); }
  const xp = Math.min(words.length * 2, 40);
  if (window.earnXP) earnXP(xp);
  if (window.earnCoins) earnCoins(Math.floor(xp/4), 'improv');
  if (window.saveState) saveState();
  if (fb) {
    fb.innerHTML = `
      <div class="improv-result">
        <div>✅ Submitted! <b>+${xp} XP</b></div>
        <div class="improv-word-count">${words.length} words</div>
        <div class="improv-tip">💡 Now listen back — speak it aloud with confidence!</div>
      </div>`;
  }
  ta.value = '';
  if (window.mascotReact) mascotReact('correct');
}
