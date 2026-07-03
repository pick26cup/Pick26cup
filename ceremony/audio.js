/* ── audio.js ── Web Audio API synthesizer ── */
(function(g){
  g.WC = g.WC || {};

  const Audio = {
    ctx: null,
    master: null,
    _crowdNode: null,
    _crowdGain: null,

    init(){
      try {
        this.ctx    = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.75;
        this.master.connect(this.ctx.destination);
        WC.Utils.log('Audio OK');
      } catch(e){ WC.Utils.log('Audio unavailable'); }
    },

    resume(){ if(this.ctx?.state === 'suspended') this.ctx.resume(); },

    /* ── Pink noise crowd ambience ── */
    playCrowd(vol = 0.18){
      if(!this.ctx) return;
      const SR   = this.ctx.sampleRate;
      const len  = SR * 30;
      const buf  = this.ctx.createBuffer(2, len, SR);
      for(let c=0;c<2;c++){
        const d = buf.getChannelData(c);
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for(let i=0;i<len;i++){
          const w = Math.random()*2-1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
          b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
          b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
          d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
        }
      }
      const src  = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp   = this.ctx.createBiquadFilter();
      bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=0.4;
      this._crowdGain = this.ctx.createGain();
      this._crowdGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this._crowdGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime+3);
      src.connect(bp); bp.connect(this._crowdGain); this._crowdGain.connect(this.master);
      src.start(); this._crowdNode = src;
    },

    setCrowdVol(v, ramp=1){
      if(!this._crowdGain) return;
      this._crowdGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime+ramp);
    },

    /* ── Low boom ── */
    playBoom(vol=0.5){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(90,t);
      o.frequency.exponentialRampToValueAtTime(18,t+0.8);
      g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.9);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t+0.9);
    },

    /* ── Firework whistle + crackle ── */
    playFirework(){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;
      const o=this.ctx.createOscillator(), gw=this.ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(350,t);
      o.frequency.exponentialRampToValueAtTime(1400,t+0.35);
      gw.gain.setValueAtTime(0.08,t); gw.gain.linearRampToValueAtTime(0,t+0.35);
      o.connect(gw); gw.connect(this.master); o.start(t); o.stop(t+0.35);
      setTimeout(()=>{
        const nb=this._noise(0.12); const src=this.ctx.createBufferSource();
        src.buffer=nb; const gn=this.ctx.createGain();
        gn.gain.setValueAtTime(0.35,this.ctx.currentTime);
        gn.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.25);
        src.connect(gn); gn.connect(this.master); src.start();
      },350);
    },

    /* ── Victory fanfare ── */
    playFanfare(){
      if(!this.ctx) return;
      const t=this.ctx.currentTime;
      // C E G C B C  (heroic major feel)
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

    /* ── Narration (SpeechSynthesis) ── */
    speak(text, opts={}){
      if(!window.speechSynthesis) return Promise.resolve();
      return new Promise(res=>{
        speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance(text);
        u.rate=opts.rate||0.82; u.pitch=opts.pitch||0.96; u.volume=opts.vol||0.9;
        const voices=speechSynthesis.getVoices();
        const v=voices.find(x=>x.lang.startsWith('en')&&!x.localService) || voices.find(x=>x.lang.startsWith('en'));
        if(v) u.voice=v;
        u.onend=res; u.onerror=res;
        speechSynthesis.speak(u);
        setTimeout(res, (text.length/4)*1000+2000); // safety timeout
      });
    },

    _noise(dur=0.5){
      const sz=~~(this.ctx.sampleRate*dur);
      const b=this.ctx.createBuffer(1,sz,this.ctx.sampleRate);
      const d=b.getChannelData(0); for(let i=0;i<sz;i++) d[i]=Math.random()*2-1;
      return b;
    },
  };

  g.WC.Audio = Audio;
})(window);
