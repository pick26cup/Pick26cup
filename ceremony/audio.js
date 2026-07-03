/* ── audio.js ── Web Audio synthesizer — orchestral + realistic FX ── */
(function(g){
  g.WC = g.WC || {};

  const Audio = {
    ctx: null,
    master: null,
    comp: null,
    reverb: null,
    _crowdGain: null,
    _boomCount: 0,

    init(){
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        /* Compressor prevents clipping when many sounds overlap */
        this.comp = this.ctx.createDynamicsCompressor();
        this.comp.threshold.value = -14;
        this.comp.knee.value      = 8;
        this.comp.ratio.value     = 6;
        this.comp.attack.value    = 0.002;
        this.comp.release.value   = 0.15;

        this.master = this.ctx.createGain();
        this.master.gain.value = 0.72;
        this.master.connect(this.comp);
        this.comp.connect(this.ctx.destination);

        /* Build a simple plate-reverb from 4 comb delays */
        this.reverb = this._buildReverb();

        WC.Utils.log('Audio OK');
      } catch(e){ WC.Utils.log('Audio unavailable'); }
    },

    resume(){ if(this.ctx?.state==='suspended') this.ctx.resume(); },

    /* ── White-noise buffer ── */
    _noise(dur=0.5){
      const SR=this.ctx.sampleRate, sz=~~(SR*dur);
      const b=this.ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
      for(let i=0;i<sz;i++) d[i]=Math.random()*2-1;
      return b;
    },

    /* ── Sparse crackle (embers popping) ── */
    _crackle(dur=1.0){
      const SR=this.ctx.sampleRate, sz=~~(SR*dur);
      const b=this.ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
      for(let i=0;i<sz;i++)
        d[i] = Math.random()>.93 ? (Math.random()*2-1)*2.8 : (Math.random()*2-1)*0.03;
      return b;
    },

    /* ── Schroeder-style plate reverb (4 comb filters + wet gain) ── */
    _buildReverb(){
      const AC=this.ctx;
      const wet=AC.createGain(); wet.gain.value=0.28;
      wet.connect(this.comp);
      const times=[0.037,0.043,0.053,0.061];
      times.forEach(dt=>{
        const delay=AC.createDelay(0.1); delay.delayTime.value=dt;
        const fb=AC.createGain();        fb.gain.value=0.48;
        const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3200;
        delay.connect(lp); lp.connect(fb); fb.connect(delay); delay.connect(wet);
      });
      return wet; /* send dry audio → this node to add reverb */
    },

    /* ── Play a brass-like chord note (sawtooth + LPF + chorus + reverb) ── */
    _brass(freq, startDelay, duration, vol=0.18){
      const AC=this.ctx, t=AC.currentTime+startDelay;

      /* Two sawtooth oscillators slightly detuned → chorus / ensemble effect */
      [0, 4].forEach(detuneCents=>{
        const osc=AC.createOscillator();
        osc.type='sawtooth';
        osc.frequency.value=freq;
        osc.detune.value=detuneCents;

        const lp=AC.createBiquadFilter();
        lp.type='lowpass'; lp.frequency.value=2200; lp.Q.value=0.5;

        const env=AC.createGain();
        env.gain.setValueAtTime(0,t);
        env.gain.linearRampToValueAtTime(vol,t+0.06);       /* attack */
        env.gain.setValueAtTime(vol*0.75,t+0.12);           /* decay to sustain */
        env.gain.setValueAtTime(vol*0.75,t+duration-0.08);  /* hold */
        env.gain.linearRampToValueAtTime(0,t+duration);     /* release */

        osc.connect(lp); lp.connect(env);
        env.connect(this.master);
        env.connect(this.reverb);
        osc.start(t); osc.stop(t+duration+0.05);
      });
    },

    /* ── Timpani / kettle drum ── */
    _timpani(startDelay, pitch=110, vol=0.7){
      const AC=this.ctx, t=AC.currentTime+startDelay;

      const osc=AC.createOscillator();
      osc.type='sine';
      osc.frequency.setValueAtTime(pitch*1.6, t);
      osc.frequency.exponentialRampToValueAtTime(pitch, t+0.04);
      osc.frequency.exponentialRampToValueAtTime(pitch*0.55, t+0.38);

      const env=AC.createGain();
      env.gain.setValueAtTime(vol,t);
      env.gain.exponentialRampToValueAtTime(0.001,t+0.5);

      osc.connect(env); env.connect(this.master);
      env.connect(this.reverb);
      osc.start(t); osc.stop(t+0.55);

      /* Attack transient — short noise thud */
      const src=AC.createBufferSource(); src.buffer=this._noise(0.04);
      const ng=AC.createGain(); ng.gain.setValueAtTime(vol*0.5,t);
      ng.gain.exponentialRampToValueAtTime(0.001,t+0.04);
      const nhp=AC.createBiquadFilter(); nhp.type='highpass'; nhp.frequency.value=200;
      src.connect(nhp); nhp.connect(ng); ng.connect(this.master);
      src.start(t);
    },

    /* ══════════════════════════════════════
       CROWD AMBIENCE  (pink noise)
    ═══════════════════════════════════════ */
    playCrowd(vol=0.18){
      if(!this.ctx) return;
      const SR=this.ctx.sampleRate, len=SR*30;
      const buf=this.ctx.createBuffer(2,len,SR);
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
      const src=this.ctx.createBufferSource(); src.buffer=buf; src.loop=true;
      const bp=this.ctx.createBiquadFilter();
      bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=0.4;
      this._crowdGain=this.ctx.createGain();
      this._crowdGain.gain.setValueAtTime(0,this.ctx.currentTime);
      this._crowdGain.gain.linearRampToValueAtTime(vol,this.ctx.currentTime+3);
      src.connect(bp); bp.connect(this._crowdGain); this._crowdGain.connect(this.master);
      src.start();
    },

    setCrowdVol(v,ramp=1){
      if(!this._crowdGain) return;
      this._crowdGain.gain.linearRampToValueAtTime(v,this.ctx.currentTime+ramp);
    },

    /* ══════════════════════════════════════
       FIREWORK EXPLOSION  (5 layers)
       crack · bass · rumble · sizzle · crackle
    ═══════════════════════════════════════ */
    playBoom(vol=0.5){
      if(!this.ctx) return;
      if(this._boomCount>=4) return;
      this._boomCount++; setTimeout(()=>this._boomCount--,900);
      const t=this.ctx.currentTime, v=vol*0.9;

      /* 1. Sharp crack */
      const crackSrc=this.ctx.createBufferSource(); crackSrc.buffer=this._noise(0.07);
      const crackHp=this.ctx.createBiquadFilter(); crackHp.type='highpass'; crackHp.frequency.value=900;
      const crackG=this.ctx.createGain();
      crackG.gain.setValueAtTime(v*2.2,t); crackG.gain.exponentialRampToValueAtTime(0.001,t+0.09);
      crackSrc.connect(crackHp); crackHp.connect(crackG); crackG.connect(this.master);
      crackSrc.start(t);

      /* 2. Deep bass thump */
      const bass=this.ctx.createOscillator(); bass.type='sine';
      bass.frequency.setValueAtTime(90,t);
      bass.frequency.exponentialRampToValueAtTime(22,t+0.5);
      const bassG=this.ctx.createGain();
      bassG.gain.setValueAtTime(v*1.2,t); bassG.gain.exponentialRampToValueAtTime(0.001,t+0.55);
      bass.connect(bassG); bassG.connect(this.master);
      bass.start(t); bass.stop(t+0.6);

      /* 3. Mid rumble */
      const rumbleSrc=this.ctx.createBufferSource(); rumbleSrc.buffer=this._noise(1.2);
      const rumbleBp=this.ctx.createBiquadFilter();
      rumbleBp.type='bandpass'; rumbleBp.frequency.value=310; rumbleBp.Q.value=0.55;
      const rumbleG=this.ctx.createGain();
      rumbleG.gain.setValueAtTime(v*0.48,t+0.03); rumbleG.gain.exponentialRampToValueAtTime(0.001,t+1.2);
      rumbleSrc.connect(rumbleBp); rumbleBp.connect(rumbleG); rumbleG.connect(this.master);
      rumbleSrc.start(t);

      /* 4. High sizzle */
      const sizzSrc=this.ctx.createBufferSource(); sizzSrc.buffer=this._noise(0.9);
      const sizzHp=this.ctx.createBiquadFilter(); sizzHp.type='highpass'; sizzHp.frequency.value=2600;
      const sizzG=this.ctx.createGain();
      sizzG.gain.setValueAtTime(0,t); sizzG.gain.setValueAtTime(v*0.22,t+0.03);
      sizzG.gain.exponentialRampToValueAtTime(0.001,t+0.9);
      sizzSrc.connect(sizzHp); sizzHp.connect(sizzG); sizzG.connect(this.master);
      sizzSrc.start(t);

      /* 5. Ember crackle */
      const crklSrc=this.ctx.createBufferSource(); crklSrc.buffer=this._crackle(1.3);
      const crklG=this.ctx.createGain();
      crklG.gain.setValueAtTime(v*0.5,t+0.07); crklG.gain.exponentialRampToValueAtTime(0.001,t+1.3);
      crklSrc.connect(crklG); crklG.connect(this.master);
      crklSrc.start(t);
    },

    /* ══════════════════════════════════════
       ROCKET LAUNCH  — pure noise hiss, NO oscillator tone
       (oscillator = arcade/Tetris sound)
    ═══════════════════════════════════════ */
    playFirework(){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;

      /* Pressure hiss: bandpass noise sweeping 300 → 6000 Hz */
      const src=this.ctx.createBufferSource(); src.buffer=this._noise(0.32);
      const bp=this.ctx.createBiquadFilter();
      bp.type='bandpass'; bp.Q.value=1.4;
      bp.frequency.setValueAtTime(300,t);
      bp.frequency.exponentialRampToValueAtTime(6000,t+0.28);
      const gain=this.ctx.createGain();
      gain.gain.setValueAtTime(0.18,t);
      gain.gain.setValueAtTime(0.18,t+0.22);
      gain.gain.linearRampToValueAtTime(0,t+0.32);
      src.connect(bp); bp.connect(gain); gain.connect(this.master);
      src.start(t);
    },

    /* ══════════════════════════════════════
       ORCHESTRAL FANFARE — brass + timpani + reverb
       Sounds like a real stadium ceremony, NOT circus
    ═══════════════════════════════════════ */
    playFanfare(){
      if(!this.ctx) return;

      /* ── Timpani hits ── */
      this._timpani(0.0,  108, 0.75);   /* downbeat */
      this._timpani(0.35, 96,  0.50);
      this._timpani(1.15, 108, 0.65);
      this._timpani(1.85, 72,  0.85);   /* big hit */

      /* ── Brass chords — G major → C major progression ── */
      /* Beat 1: G major stab (G3 B3 D4 G4) */
      const gMaj=[196, 246.9, 293.7, 392];
      gMaj.forEach(f=>this._brass(f, 0.0, 0.28, 0.15));

      /* Beat 2: same chord echo */
      gMaj.forEach(f=>this._brass(f, 0.35, 0.28, 0.13));

      /* Beat 3: Am (A3 C4 E4 A4) — tension */
      [220, 261.6, 329.6, 440].forEach(f=>this._brass(f, 0.72, 0.35, 0.14));

      /* Beat 4: D major (D3 F#3 A3 D4) — leading tone */
      [146.8, 185, 220, 293.7].forEach(f=>this._brass(f, 1.12, 0.42, 0.14));

      /* Climax: C major full chord (C3 E3 G3 C4 E4 G4 C5) */
      [130.8, 164.8, 196, 261.6, 329.6, 392, 523.3]
        .forEach(f=>this._brass(f, 1.85, 1.2, 0.14));

      /* High melody on top — triumphant rise G4→A4→B4→D5→G5 */
      [[392,1.85,0.22],[440,2.1,0.22],[493.9,2.35,0.22],[587.3,2.6,0.38],[784,3.0,0.9]]
        .forEach(([f,d,dur])=>this._brass(f,d,dur,0.16));
    },

    /* ══════════════════════════════════════
       DRAMATIC CHORD HIT — full orchestral stab
    ═══════════════════════════════════════ */
    playChord(vol=0.28){
      if(!this.ctx) return;

      this._timpani(0, 92, vol*1.1);

      /* C major chord across 3 octaves */
      [130.8, 164.8, 196, 261.6, 329.6, 392, 523.3]
        .forEach(f=>this._brass(f, 0, 2.0, vol*0.6));
    },

    /* ── Narration ── */
    speak(text,opts={}){
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

  g.WC.Audio = Audio;
})(window);
