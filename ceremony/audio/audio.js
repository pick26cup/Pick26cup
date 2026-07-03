// ─── WEB AUDIO SYNTHESIS ENGINE ──────────────────────────────────────────────
let ctx, master, reverb;

function _ir(ctx, dur = 2.8, decay = 3.0) {
  // generate a simple impulse response for convolution reverb
  const sr = ctx.sampleRate;
  const len = sr * dur;
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function _pink(ctx, buf) {
  // 3-pole pink noise approximation written into a buffer
  const data = buf.getChannelData(0);
  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
  for (let i = 0; i < buf.length; i++) {
    const w = Math.random() * 2 - 1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
    b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
    data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
    b6 = w * 0.115926;
  }
}

export function initAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0.78;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master.connect(comp);
  comp.connect(ctx.destination);

  const convolver = ctx.createConvolver();
  convolver.buffer = _ir(ctx, 2.8, 2.8);
  reverb = ctx.createGain();
  reverb.gain.value = 0.28;
  convolver.connect(reverb);
  reverb.connect(master);
}

function _send(node) {
  node.connect(master);
  node.connect(reverb.context && reverb ? reverb : master);
}

// ─── CROWD ────────────────────────────────────────────────────────────────────
let crowdSource, crowdGain;
export function startCrowd(volume = 0.25) {
  if (!ctx) return;
  const sr  = ctx.sampleRate;
  const sec = 8;
  const buf = ctx.createBuffer(1, sr * sec, sr);
  _pink(ctx, buf);

  crowdSource = ctx.createBufferSource();
  crowdSource.buffer = buf;
  crowdSource.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1800;

  crowdGain = ctx.createGain();
  crowdGain.gain.setValueAtTime(0, ctx.currentTime);
  crowdGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3.0);

  crowdSource.connect(lp);
  lp.connect(crowdGain);
  crowdGain.connect(master);
  crowdSource.start();
}

export function swellCrowd(vol = 0.55, dur = 2.0) {
  if (!crowdGain) return;
  crowdGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + dur);
}

export function quietCrowd(vol = 0.08, dur = 3.5) {
  if (!crowdGain) return;
  crowdGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + dur);
}

export function stopCrowd() {
  if (!crowdGain) return;
  crowdGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
}

// ─── FANFARE ─────────────────────────────────────────────────────────────────
function _osc(freq, type, gain, dur, start) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(master);
  g.connect(reverb);
  o.start(start);
  o.stop(start + dur + 0.05);
}

export function playFanfare() {
  if (!ctx) return;
  const t = ctx.currentTime + 0.05;
  // Bb major chord + lead melody
  const chord = [233.08, 293.66, 349.23, 466.16, 587.33];
  chord.forEach(f => _osc(f, 'sawtooth', 0.06, 2.4, t));

  // Lead phrase G → Bb → D → F → Bb (ascending, majestic)
  const mel = [
    [392, 0.0],[466.16, 0.35],[587.33, 0.65],[698.46, 0.95],
    [880, 1.20],[880, 1.55],[880*1.5, 1.80],
  ];
  mel.forEach(([f, dt]) => _osc(f, 'sine', 0.12, 0.4, t + dt));
}

// ─── APPLAUSE / CHEER ─────────────────────────────────────────────────────────
export function playApplause(intensity = 0.6) {
  if (!ctx) return;
  const sr  = ctx.sampleRate;
  const buf = ctx.createBuffer(2, sr * 2, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let b0=0, b1=0;
    for (let i = 0; i < buf.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + 0.01 * w;
      b1 = 0.98 * b1 + 0.02 * w;
      d[i] = (b0 + b1) * 3.0;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 2400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(intensity, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
  src.connect(hp); hp.connect(g); g.connect(master); g.connect(reverb);
  src.start();
}

// ─── BOOM (firework launch / bass hit) ────────────────────────────────────────
export function playBoom() {
  if (!ctx) return;
  const t = ctx.currentTime;

  // sub-bass thud
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(28, t + 0.35);
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.6);

  // noise crack
  const sr  = ctx.sampleRate;
  const nb  = ctx.createBuffer(1, sr * 0.18, sr);
  const nd  = nb.getChannelData(0);
  for (let i = 0; i < nb.length; i++) nd[i] = Math.random() * 2 - 1;
  const ns  = ctx.createBufferSource();
  ns.buffer = nb;
  const ng  = ctx.createGain();
  ng.gain.setValueAtTime(0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  ns.connect(ng); ng.connect(master); ns.start(t);
}

// ─── MAGIC SHIMMER (gold dust / champion text reveal) ─────────────────────────
export function playShimmer() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const freqs = [1046.5, 1174.66, 1318.51, 1568, 2093];
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.06);
    g.gain.linearRampToValueAtTime(0.03, t + i * 0.06 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.9);
    o.connect(g); g.connect(master); g.connect(reverb);
    o.start(t + i * 0.06); o.stop(t + i * 0.06 + 1.0);
  });
}

// ─── DEEP SILENCE DROP (before champion reveal) ───────────────────────────────
export function playSilenceDrop() {
  if (!crowdGain) return;
  crowdGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 1.2);
}

// ─── ORCHESTRAL HIT ───────────────────────────────────────────────────────────
export function playOrchHit() {
  if (!ctx) return;
  const t = ctx.currentTime;
  // Full D major chord — triumphant
  [146.83, 184.99, 220.00, 293.66, 369.99, 440.00].forEach(f => {
    _osc(f, 'sawtooth', 0.08, 3.5, t);
    _osc(f * 2, 'sine', 0.04, 3.0, t);
  });
}
