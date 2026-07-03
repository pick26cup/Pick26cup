/* ── ui.js ── Champion reveal UI ── */
(function(g){
  g.WC = g.WC || {};

  const UI = {
    _lang: null,

    init(){
      this._lang = WC.Champion.lang || 'es';
    },

    t(es, en){ return this._lang==='es' ? es : en; },

    async showChampion(){
      WC.Anim.cleanup();
      WC.Fireworks.clear();
      WC.Confetti.clear();

      /* dim 3D scene */
      const dimmer = WC.Utils.el('dimmer');
      dimmer.style.display='block';
      await new Promise(r=>gsap.to(dimmer,{opacity:.88,duration:2.2,ease:'power2.inOut',onComplete:r}));

      /* show phase */
      const ph = WC.Utils.el('championPhase');
      ph.style.display='flex';

      /* spotlight sweep in */
      gsap.from('#spotlight',{opacity:0,scaleX:0,duration:1.8,ease:'power2.out'});
      await WC.Utils.wait(800);

      /* ── Player name ── */
      await this._revealLetters('playerName', WC.Champion.player, 'gold', 100);
      WC.Audio.playChord(0.18);
      WC.Fireworks.burst(4);
      await WC.Utils.wait(1400);

      /* ── CHAMPION OF THE WORLD / CAMPEÓN DEL MUNDO ── */
      const champEl = WC.Utils.el('champTitle');
      champEl.style.display='block';
      await this._revealLetters('champTitle',
        this.t('CAMPEÓN DEL MUNDO','CHAMPION OF THE WORLD'), 'white', 55);
      await WC.Utils.wait(1100);

      /* ── Country ── */
      const cWrap = WC.Utils.el('countryWrap');
      cWrap.style.display='flex';
      WC.Utils.el('countryFlag').textContent = WC.Champion.flag;
      gsap.from('#countryFlag',{scale:0,rotation:-30,duration:.9,ease:'back.out(2)'});
      await WC.Utils.wait(300);
      await this._revealLetters('countryName', WC.Champion.country, 'gold', 70);
      await WC.Utils.wait(900);

      /* ── FIFA WORLD CUP 2026 ── */
      const cupEl = WC.Utils.el('cupLine');
      cupEl.style.display='block';
      gsap.from(cupEl,{opacity:0,y:18,duration:1,ease:'power2.out'});
      await WC.Utils.wait(1000);

      /* ── Stars + Legendary Manager ── */
      const sw = WC.Utils.el('starsWrap');
      sw.style.display='block';
      gsap.from(sw,{opacity:0,scale:.4,duration:1.1,ease:'back.out(2.2)'});
      WC.Audio.playFanfare();

      WC.Confetti.burst(window.innerWidth*.5,window.innerHeight*.5,180);
      WC.Fireworks.burst(7);
      setTimeout(()=>WC.Fireworks.burst(6), 900);

      const rainFw = setInterval(()=>WC.Fireworks.launch(), 2500);
      const rainCo = setInterval(()=>WC.Confetti.rain(8), 80);
      window._ceremonyLoops = [rainFw, rainCo];

      await WC.Utils.wait(1600);

      /* ── Continue button ── */
      const btn = WC.Utils.el('continueBtn');
      btn.style.display='inline-block';
      gsap.from(btn,{opacity:0,y:28,duration:.9,ease:'back.out(1.7)'});
    },

    async _revealLetters(elId, text, colorClass, delayMs){
      const el = WC.Utils.el(elId);
      el.innerHTML='';
      const letters=[...text];
      letters.forEach((ch)=>{
        const s=document.createElement('span');
        s.className='rl' + (colorClass==='gold'?' rl-gold':colorClass==='white'?' rl-white':'');
        s.textContent = ch===' ' ? ' ' : ch;
        el.appendChild(s);
      });

      const spans = el.querySelectorAll('.rl');
      let d=0;
      spans.forEach((s,i)=>{
        const ch = letters[i];
        gsap.from(s,{opacity:0,y:35,scale:.5,rotation:WC.Utils.rand(-15,15),
          duration:.55, delay:d/1000, ease:'back.out(2.2)'});
        d += ch===' ' ? 30 : WC.Utils.rand(delayMs*.5, delayMs*1.5);
      });

      await WC.Utils.wait(d + 650);
    },
  };

  g.WC.UI = UI;
})(window);
