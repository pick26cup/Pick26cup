/* ── ui.js ── champion reveal UI ── */

const UI = {
  t(es,en){ return champion.lang==='es' ? es : en; },

  /* Letter-by-letter reveal of any element */
  async revealLetters(elId, text, colorClass='gold', delayMs=90){
    const el=document.getElementById(elId);
    if(!el) return;
    el.innerHTML='';
    [...text].forEach(ch=>{
      const s=document.createElement('span');
      s.className='rl';
      s.textContent = ch===' ' ? ' ' : ch;
      if(colorClass==='gold'){
        s.style.cssText='background:linear-gradient(180deg,#FFF176 0%,#FFD700 30%,#D4AF37 65%,#8B6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 7px rgba(212,175,55,.8))';
      } else {
        s.style.cssText='color:rgba(244,240,232,.93);text-shadow:0 0 18px rgba(255,255,255,.4)';
      }
      el.appendChild(s);
    });

    const spans=el.querySelectorAll('.rl');
    let d=0;
    spans.forEach((s,i)=>{
      const ch=text[i]||' ';
      gsap.to(s,{opacity:1,y:0,scale:1,rotation:0,duration:.5,delay:d/1000,ease:'back.out(2)'});
      d += ch===' ' ? 25 : rand(delayMs*.5,delayMs*1.4);
    });
    await wait(d+600);
  },

  async showChampion(){
    /* Dim the 3D scene */
    const dimmer=document.createElement('div');
    dimmer.style.cssText='position:fixed;inset:0;background:#000;z-index:9;pointer-events:none;opacity:0';
    document.body.appendChild(dimmer);
    await new Promise(r=>gsap.to(dimmer,{opacity:.88,duration:2.2,ease:'power2.inOut',onComplete:r}));

    const ph=document.getElementById('champPhase');
    ph.style.display='flex';
    gsap.from('#spotlight',{opacity:0,scaleX:0,duration:1.8,ease:'power2.out'});
    await wait(700);

    /* Player name */
    await this.revealLetters('name', champion.player, 'gold', 95);
    Audio.playChord(.18);
    particles.launchRandom(); particles.launchRandom();
    await wait(1200);

    /* Champion title */
    const sub=document.getElementById('subtitle');
    sub.style.opacity=1;
    await this.revealLetters('subtitle',
      this.t('CAMPEÓN DEL MUNDO','CHAMPION OF THE WORLD'), 'white', 50);
    await wait(900);

    /* Country */
    const cw=document.getElementById('country'); cw.style.opacity=1;
    document.getElementById('flag').textContent=champion.flag;
    gsap.from('#flag',{scale:0,rotation:-30,duration:.9,ease:'back.out(2)'});
    await wait(250);
    await this.revealLetters('countryName', champion.country, 'gold', 65);
    await wait(800);

    /* Cup line */
    const cl=document.getElementById('cupLine'); cl.style.opacity=1;
    gsap.from('#cupLine',{opacity:0,y:18,duration:1,ease:'power2.out'});
    await wait(900);

    /* Stars + Legendary Manager */
    const sw=document.getElementById('starsWrap'); sw.style.opacity=1;
    gsap.from('#starsWrap',{opacity:0,scale:.4,duration:1.1,ease:'back.out(2.2)'});
    Audio.playFanfare();
    particles.launchRandom(); particles.launchRandom(); particles.launchRandom();
    setTimeout(()=>{particles.launchRandom();particles.launchRandom();},800);

    const fwLoop=setInterval(()=>particles.launchRandom(), 2200);
    window._ceremonyLoops=[fwLoop];

    await wait(1400);

    /* Continue button */
    const btn=document.getElementById('btn');
    btn.style.display='inline-block';
    gsap.to(btn,{opacity:1,y:0,duration:.9,ease:'back.out(1.7)'});
    btn.onclick=()=>{
      clearInterval(fwLoop);
      if(champion.onComplete) champion.onComplete();
      gsap.to('body',{opacity:0,duration:.8,onComplete:()=>{ if(history.length>1) history.back(); }});
    };
  },
};
