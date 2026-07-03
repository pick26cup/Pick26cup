/* ── audio.js ── Howler + Web Audio hybrid ──
   Howler handles crowd/atmosphere files.
   Web Audio API handles synthesized FX and music.
────────────────────────────────────────────── */
const Audio = {
  _ctx:   null,
  _master: null,
  _comp:  null,
  _crowd: null,
  _boomCount: 0,

  init(){
    /* Web Audio context */
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._comp = this._ctx.createDynamicsCompressor();
      this._comp.threshold.value = -14;
      this._comp.knee.value      = 8;
      this._comp.ratio.value     = 6;
      this._comp.attack.value    = 0.002;
      this._comp.release.value   = 0.15;
      this._master = this._ctx.createGain();
      this._master.gain.value = 0.75;
      this._master.connect(this._comp);
      this._comp.connect(this._ctx.destination);
      this._reverb = this._buildReverb();
    } catch(e){ console.warn('[Audio] Web Audio unavailable', e); }

    /* Howler crowd (optional — silent if CDN fails) */
    try {
      this._howlCrowd = new Howl({
        src: [
          'https://cdn.pixabay.com/audio/2022/10/10/audio_8cb6dc5047.mp3',
          'https://cdn.pixabay.com/audio/2021/09/13/audio_d7e0e7e8f3.mp3',
        ],
        loop: true, volume: 0, html5: true,
        onloaderror: () => {},
      });
      this._howlStadium = new Howl({
        src: ['https://cdn.pixabay.com/audio/2022/07/24/audio_2cffba9a15.mp3'],
        loop: true, volume: 0, html5: true,
      });
    } catch(_) { this._howlCrowd = null; this._howlStadium = null; }
  },

  resume(){
    if(this._ctx?.state==='suspended') this._ctx.resume();
  },

  /* Start crowd noise */
  playCrowd(vol=0.4){
    try { this._howlCrowd.play(); this._howlCrowd.fade(0, vol, 3000); } catch(_){}
    this._synthCrowd(vol*0.3); /* layered synth underneath */
  },

  setCrowdVol(v, ms=1000){
    try { this._howlCrowd.fade(this._howlCrowd.volume(), v, ms); } catch(_){}
    if(this._crowdGain) {
      this._crowdGain.gain.linearRampToValueAtTime(v*0.25, this._ctx.currentTime+ms/1000);
    }
  },

  play(){ this.playCrowd(0.4); },
  playFanfare(){ this._orchestralFanfare(); },
  playChord(vol=0.28){ this._orchestralChord(vol); },
  playBoom(vol=0.5){ this._boom(vol); },
  playFirework(){ this._rocketHiss(); },

  /* ──────────────────────────────────────
     SYNTHESIZED CROWD AMBIENCE (pink noise)
  ────────────────────────────────────── */
  _synthCrowd(vol=0.12){
    if(!this._ctx) return;
    const SR=this._ctx.sampleRate, len=SR*25;
    const buf=this._ctx.createBuffer(2,len,SR);
    for(let c=0;c<2;c++){
      const d=buf.getChannelData(c);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0;i<len;i++){
        const w=Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
    }
    const src=this._ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const bp=this._ctx.createBiquadFilter();
    bp.type='bandpass'; bp.frequency.value=1100; bp.Q.value=0.4;
    this._crowdGain=this._ctx.createGain();
    this._crowdGain.gain.setValueAtTime(0,this._ctx.currentTime);
    this._crowdGain.gain.linearRampToValueAtTime(vol,this._ctx.currentTime+3);
    src.connect(bp); bp.connect(this._crowdGain); this._crowdGain.connect(this._master);
    src.start();
  },

  /* ──────────────────────────────────────
     ROCKET LAUNCH — pure noise hiss, no tone
  ────────────────────────────────────── */
  _rocketHiss(){
    if(!this._ctx) return;
    const t=this._ctx.currentTime;
    const src=this._ctx.createBufferSource();
    src.buffer=this._noise(0.32);
    const bp=this._ctx.createBiquadFilter();
    bp.type='bandpass'; bp.Q.value=1.5;
    bp.frequency.setValueAtTime(250,t);
    bp.frequency.exponentialRampToValueAtTime(7000,t+0.28);
    const g=this._ctx.createGain();
    g.gain.setValueAtTime(0.2,t);
    g.gain.setValueAtTime(0.2,t+0.22);
    g.gain.linearRampToValueAtTime(0,t+0.32);
    src.connect(bp); bp.connect(g); g.connect(this._master);
    src.start(t);
  },

  /* ──────────────────────────────────────
     FIREWORK EXPLOSION — 5 layers
  ────────────────────────────────────── */
  _boom(vol=0.5){
    if(!this._ctx) return;
    if(this._boomCount>=4) return;
    this._boomCount++; setTimeout(()=>this._boomCount--,900);
    const t=this._ctx.currentTime, v=vol*0.88;

    /* 1. Sharp crack */
    const c1=this._ctx.createBufferSource(); c1.buffer=this._noise(0.07);
    const chp=this._ctx.createBiquadFilter(); chp.type='highpass'; chp.frequency.value=900;
    const cg=this._ctx.createGain(); cg.gain.setValueAtTime(v*2.2,t); cg.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    c1.connect(chp); chp.connect(cg); cg.connect(this._master); c1.start(t);

    /* 2. Bass thump 90→22 Hz */
    const bass=this._ctx.createOscillator(); bass.type='sine';
    bass.frequency.setValueAtTime(90,t); bass.frequency.exponentialRampToValueAtTime(22,t+0.5);
    const bg=this._ctx.createGain(); bg.gain.setValueAtTime(v*1.2,t); bg.gain.exponentialRampToValueAtTime(0.001,t+0.55);
    bass.connect(bg); bg.connect(this._master); bass.start(t); bass.stop(t+0.6);

    /* 3. Mid rumble */
    const r1=this._ctx.createBufferSource(); r1.buffer=this._noise(1.2);
    const rbp=this._ctx.createBiquadFilter(); rbp.type='bandpass'; rbp.frequency.value=320; rbp.Q.value=0.55;
    const rg=this._ctx.createGain(); rg.gain.setValueAtTime(v*0.48,t+0.03); rg.gain.exponentialRampToValueAtTime(0.001,t+1.2);
    r1.connect(rbp); rbp.connect(rg); rg.connect(this._master); r1.start(t);

    /* 4. Sizzle (highpass 2.6kHz) */
    const s1=this._ctx.createBufferSource(); s1.buffer=this._noise(0.9);
    const shp=this._ctx.createBiquadFilter(); shp.type='highpass'; shp.frequency.value=2600;
    const sg=this._ctx.createGain(); sg.gain.setValueAtTime(0,t); sg.gain.setValueAtTime(v*0.22,t+0.03); sg.gain.exponentialRampToValueAtTime(0.001,t+0.9);
    s1.connect(shp); shp.connect(sg); sg.connect(this._master); s1.start(t);

    /* 5. Ember crackle */
    const k1=this._ctx.createBufferSource(); k1.buffer=this._crackle(1.3);
    const kg=this._ctx.createGain(); kg.gain.setValueAtTime(v*0.5,t+0.07); kg.gain.exponentialRampToValueAtTime(0.001,t+1.3);
    k1.connect(kg); kg.connect(this._master); k1.start(t);
  },

  /* ──────────────────────────────────────
     ORCHESTRAL FANFARE — brass + timpani
  ────────────────────────────────────── */
  _orchestralFanfare(){
    if(!this._ctx) return;
    /* Timpani downbeats */
    this._timp(0.0,  108, 0.75);
    this._timp(0.35, 96,  0.48);
    this._timp(1.15, 108, 0.62);
    this._timp(1.85, 72,  0.88);

    /* G major → Am → D → C major climax */
    [196,246.9,293.7,392].forEach(f=>this._brass(f,0.0,0.28,0.15));
    [196,246.9,293.7,392].forEach(f=>this._brass(f,0.35,0.28,0.13));
    [220,261.6,329.6,440].forEach(f=>this._brass(f,0.72,0.35,0.14));
    [146.8,185,220,293.7].forEach(f=>this._brass(f,1.12,0.42,0.13));
    [130.8,164.8,196,261.6,329.6,392,523.3].forEach(f=>this._brass(f,1.85,1.2,0.13));

    /* Rising melody on top */
    [[392,1.85,.22],[440,2.1,.22],[493.9,2.35,.22],[587.3,2.6,.38],[784,3.0,.9]]
      .forEach(([f,d,dur])=>this._brass(f,d,dur,0.15));
  },

  _orchestralChord(vol=0.28){
    if(!this._ctx) return;
    this._timp(0, 92, vol*1.1);
    [130.8,164.8,196,261.6,329.6,392,523.3].forEach(f=>this._brass(f,0,2.0,vol*0.55));
  },

  /* ── Brass note: dual-detuned sawtooth + LPF + ADSR + reverb ── */
  _brass(freq, startDelay, duration, vol=0.15){
    if(!this._ctx) return;
    const t=this._ctx.currentTime+startDelay;
    [0,5].forEach(dc=>{
      const osc=this._ctx.createOscillator(); osc.type='sawtooth';
      osc.frequency.value=freq; osc.detune.value=dc;
      const lp=this._ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2100; lp.Q.value=0.5;
      const env=this._ctx.createGain();
      env.gain.setValueAtTime(0,t);
      env.gain.linearRampToValueAtTime(vol,t+0.07);
      env.gain.setValueAtTime(vol*0.72,t+0.14);
      env.gain.setValueAtTime(vol*0.72,t+duration-0.08);
      env.gain.linearRampToValueAtTime(0,t+duration);
      osc.connect(lp); lp.connect(env); env.connect(this._master); env.connect(this._reverb);
      osc.start(t); osc.stop(t+duration+0.05);
    });
  },

  /* ── Timpani ── */
  _timp(startDelay, pitch=110, vol=0.7){
    if(!this._ctx) return;
    const t=this._ctx.currentTime+startDelay;
    const osc=this._ctx.createOscillator(); osc.type='sine';
    osc.frequency.setValueAtTime(pitch*1.6,t);
    osc.frequency.exponentialRampToValueAtTime(pitch,t+0.04);
    osc.frequency.exponentialRampToValueAtTime(pitch*0.55,t+0.4);
    const env=this._ctx.createGain();
    env.gain.setValueAtTime(vol,t); env.gain.exponentialRampToValueAtTime(0.001,t+0.52);
    osc.connect(env); env.connect(this._master); env.connect(this._reverb);
    osc.start(t); osc.stop(t+0.55);
    /* Attack transient */
    const ns=this._ctx.createBufferSource(); ns.buffer=this._noise(0.04);
    const ng=this._ctx.createGain(); ng.gain.setValueAtTime(vol*0.45,t); ng.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    ns.connect(ng); ng.connect(this._master); ns.start(t);
  },

  /* ── Plate reverb (4-comb Schroeder) ── */
  _buildReverb(){
    const wet=this._ctx.createGain(); wet.gain.value=0.26; wet.connect(this._comp);
    [0.037,0.043,0.053,0.061].forEach(dt=>{
      const delay=this._ctx.createDelay(0.1); delay.delayTime.value=dt;
      const fb=this._ctx.createGain(); fb.gain.value=0.46;
      const lp=this._ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3200;
      delay.connect(lp); lp.connect(fb); fb.connect(delay); delay.connect(wet);
    });
    return wet;
  },

  /* ── White noise buffer ── */
  _noise(dur=0.5){
    const SR=this._ctx.sampleRate, sz=~~(SR*dur);
    const b=this._ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
    for(let i=0;i<sz;i++) d[i]=Math.random()*2-1;
    return b;
  },

  /* ── Sparse crackle (ember pops) ── */
  _crackle(dur=1.0){
    const SR=this._ctx.sampleRate, sz=~~(SR*dur);
    const b=this._ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
    for(let i=0;i<sz;i++)
      d[i]=Math.random()>.93?(Math.random()*2-1)*3:(Math.random()*2-1)*0.03;
    return b;
  },

  /* Narration */
  speak(text, opts={}){
    if(!window.speechSynthesis) return Promise.resolve();
    return new Promise(res=>{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.rate=opts.rate||0.82; u.pitch=opts.pitch||0.96; u.volume=opts.vol||0.9;
      const voices=speechSynthesis.getVoices();
      const v=voices.find(x=>x.lang.startsWith('en')&&!x.localService)||voices.find(x=>x.lang.startsWith('en'));
      if(v) u.voice=v;
      u.onend=res; u.onerror=res;
      speechSynthesis.speak(u);
      setTimeout(res,(text.length/4)*1000+2000);
    });
  },
};
