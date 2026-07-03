/* ── audio.js ── Web Audio API synthesizer ── */
(function(g){
  g.WC = g.WC || {};

  const Audio = {
    ctx: null,
    master: null,
    comp: null,
    _crowdNode: null,
    _crowdGain: null,
    _boomCount: 0,

    init(){
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        /* Compressor prevents clipping when many booms overlap */
        this.comp = this.ctx.createDynamicsCompressor();
        this.comp.threshold.value = -16;
        this.comp.knee.value      = 8;
        this.comp.ratio.value     = 5;
        this.comp.attack.value    = 0.002;
        this.comp.release.value   = 0.18;

        this.master = this.ctx.createGain();
        this.master.gain.value = 0.78;
        this.master.connect(this.comp);
        this.comp.connect(this.ctx.destination);
        WC.Utils.log('Audio OK');
      } catch(e){ WC.Utils.log('Audio unavailable'); }
    },

    resume(){ if(this.ctx?.state==='suspended') this.ctx.resume(); },

    /* ── White noise buffer ── */
    _noise(dur=0.5){
      const SR=this.ctx.sampleRate, sz=~~(SR*dur);
      const b=this.ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
      for(let i=0;i<sz;i++) d[i]=Math.random()*2-1;
      return b;
    },

    /* ── Sparse crackle impulses (like embers popping) ── */
    _crackle(dur=1.2){
      const SR=this.ctx.sampleRate, sz=~~(SR*dur);
      const b=this.ctx.createBuffer(1,sz,SR), d=b.getChannelData(0);
      for(let i=0;i<sz;i++)
        d[i] = Math.random()>.93 ? (Math.random()*2-1)*3 : (Math.random()*2-1)*0.04;
      return b;
    },

    /* ── Pink-noise crowd ambience ── */
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
      const src=this.ctx.createBufferSource();
      src.buffer=buf; src.loop=true;
      const bp=this.ctx.createBiquadFilter();
      bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=0.4;
      this._crowdGain=this.ctx.createGain();
      this._crowdGain.gain.setValueAtTime(0,this.ctx.currentTime);
      this._crowdGain.gain.linearRampToValueAtTime(vol,this.ctx.currentTime+3);
      src.connect(bp); bp.connect(this._crowdGain); this._crowdGain.connect(this.master);
      src.start(); this._crowdNode=src;
    },

    setCrowdVol(v,ramp=1){
      if(!this._crowdGain) return;
      this._crowdGain.gain.linearRampToValueAtTime(v,this.ctx.currentTime+ramp);
    },

    /* ══════════════════════════════════════
       REALISTIC FIREWORK EXPLOSION
       5 layers: crack · bass · rumble · sizzle · crackle
    ═══════════════════════════════════════ */
    playBoom(vol=0.5){
      if(!this.ctx) return;
      /* throttle: cap 4 simultaneous booms */
      if(this._boomCount>=4) return;
      this._boomCount++;
      setTimeout(()=>this._boomCount--,900);

      const t=this.ctx.currentTime, v=vol*0.9;

      /* 1. Sharp crack — fast broadband noise transient */
      const crackSrc=this.ctx.createBufferSource();
      crackSrc.buffer=this._noise(0.07);
      const crackHp=this.ctx.createBiquadFilter();
      crackHp.type='highpass'; crackHp.frequency.value=1000;
      const crackG=this.ctx.createGain();
      crackG.gain.setValueAtTime(v*2.4,t);
      crackG.gain.exponentialRampToValueAtTime(0.001,t+0.09);
      crackSrc.connect(crackHp); crackHp.connect(crackG); crackG.connect(this.master);
      crackSrc.start(t);

      /* 2. Deep bass thump — sub-bass oscillator, drops 90→20 Hz */
      const bass=this.ctx.createOscillator();
      const bassG=this.ctx.createGain();
      bass.type='sine';
      bass.frequency.setValueAtTime(88,t);
      bass.frequency.exponentialRampToValueAtTime(20,t+0.55);
      bassG.gain.setValueAtTime(v*1.2,t);
      bassG.gain.exponentialRampToValueAtTime(0.001,t+0.6);
      bass.connect(bassG); bassG.connect(this.master);
      bass.start(t); bass.stop(t+0.65);

      /* 3. Mid rumble — bandpass noise 200–600 Hz, ~1.1 s decay */
      const rumbleSrc=this.ctx.createBufferSource();
      rumbleSrc.buffer=this._noise(1.2);
      const rumbleBp=this.ctx.createBiquadFilter();
      rumbleBp.type='bandpass'; rumbleBp.frequency.value=320; rumbleBp.Q.value=0.55;
      const rumbleG=this.ctx.createGain();
      rumbleG.gain.setValueAtTime(v*0.5,t+0.03);
      rumbleG.gain.exponentialRampToValueAtTime(0.001,t+1.2);
      rumbleSrc.connect(rumbleBp); rumbleBp.connect(rumbleG); rumbleG.connect(this.master);
      rumbleSrc.start(t);

      /* 4. High-freq sizzle — highpass noise 2.5 kHz+, fades ~0.9 s */
      const sizzSrc=this.ctx.createBufferSource();
      sizzSrc.buffer=this._noise(1.0);
      const sizzHp=this.ctx.createBiquadFilter();
      sizzHp.type='highpass'; sizzHp.frequency.value=2600;
      const sizzG=this.ctx.createGain();
      sizzG.gain.setValueAtTime(0,t);
      sizzG.gain.setValueAtTime(v*0.22,t+0.03);
      sizzG.gain.exponentialRampToValueAtTime(0.001,t+0.95);
      sizzSrc.connect(sizzHp); sizzHp.connect(sizzG); sizzG.connect(this.master);
      sizzSrc.start(t);

      /* 5. Ember crackle — sparse impulses, lingers 1.4 s */
      const crklSrc=this.ctx.createBufferSource();
      crklSrc.buffer=this._crackle(1.4);
      const crklG=this.ctx.createGain();
      crklG.gain.setValueAtTime(v*0.55,t+0.07);
      crklG.gain.exponentialRampToValueAtTime(0.001,t+1.4);
      crklSrc.connect(crklG); crklG.connect(this.master);
      crklSrc.start(t);
    },

    /* ══════════════════════════════════════
       ROCKET LAUNCH SOUND
       2 layers: whoosh (noise+rising LPF) · whistle (osc rising pitch)
    ═══════════════════════════════════════ */
    playFirework(){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;

      /* Whoosh — white noise through a rising LPF */
      const whooshSrc=this.ctx.createBufferSource();
      whooshSrc.buffer=this._noise(0.6);
      const whooshLp=this.ctx.createBiquadFilter();
      whooshLp.type='lowpass';
      whooshLp.frequency.setValueAtTime(180,t);
      whooshLp.frequency.exponentialRampToValueAtTime(4000,t+0.52);
      const whooshG=this.ctx.createGain();
      whooshG.gain.setValueAtTime(0.16,t);
      whooshG.gain.setValueAtTime(0.16,t+0.38);
      whooshG.gain.linearRampToValueAtTime(0,t+0.56);
      whooshSrc.connect(whooshLp); whooshLp.connect(whooshG); whooshG.connect(this.master);
      whooshSrc.start(t);

      /* Whistle — sine wave rising in pitch, slight random variation */
      const baseHz = 280 + Math.random()*180;
      const osc=this.ctx.createOscillator();
      const oscG=this.ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(baseHz,t);
      osc.frequency.exponentialRampToValueAtTime(baseHz*5,t+0.5);
      oscG.gain.setValueAtTime(0.07,t);
      oscG.gain.linearRampToValueAtTime(0,t+0.52);
      osc.connect(oscG); oscG.connect(this.master);
      osc.start(t); osc.stop(t+0.55);
    },

    /* ── Victory fanfare ── */
    playFanfare(){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;
      const seq=[[261.6,0,.18],[329.6,.18,.18],[392,.36,.18],[523.3,.54,.4],[493.9,.94,.18],[523.3,1.12,.9]];
      seq.forEach(([f,d,dur])=>{
        const o=this.ctx.createOscillator(), g=this.ctx.createGain();
        o.type='triangle'; o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(0.14,t+d+0.03);
        g.gain.setValueAtTime(0.14,t+d+dur-0.04); g.gain.linearRampToValueAtTime(0,t+d+dur);
        o.connect(g); g.connect(this.master); o.start(t+d); o.stop(t+d+dur+.1);
      });
    },

    /* ── Dramatic chord ── */
    playChord(vol=0.3){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;
      [130.8,164.8,196,261.6].forEach(f=>{
        const o=this.ctx.createOscillator(), g=this.ctx.createGain();
        const lp=this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1200;
        o.type='sawtooth'; o.frequency.value=f;
        g.gain.setValueAtTime(vol*.25,t); g.gain.exponentialRampToValueAtTime(0.001,t+2.5);
        o.connect(lp); lp.connect(g); g.connect(this.master); o.start(t); o.stop(t+2.6);
      });
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
