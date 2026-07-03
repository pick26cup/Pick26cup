/* ── app.js ── main orchestrator ── */
(function(g){
  g.WC = g.WC || {};

  const App = {
    renderer: null, scene: null, camera: null,
    _raf: null,

    async init(){
      WC.Utils.log('Initializing ceremony…');
      await WC.Assets.init();
      this._setupThree();
      WC.Audio.init();
      WC.Confetti.init();
      WC.Fireworks.init();
      WC.Camera.init(this.camera, this.scene);
      WC.Anim.init(this.scene);
      WC.UI.init();
      this._bindSkip();
      this._loop();

      /* hide loading screen */
      const ls = WC.Utils.el('loadScreen');
      if(ls) gsap.to(ls,{opacity:0,duration:.8,delay:.5,onComplete:()=>ls.remove()});

      /* start sequence */
      WC.Anim.runSequence();
    },

    _setupThree(){
      if(!window.THREE){ WC.Utils.log('Three.js not loaded'); return; }

      const canvas = WC.Utils.el('glCanvas');
      const mobile = WC.Utils.isMobile();

      this.renderer = new THREE.WebGLRenderer({canvas, antialias:!mobile, alpha:false, powerPreference:'high-performance'});
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile?1.5:2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000);
      this.renderer.toneMapping      = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;

      this.scene  = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

      this.camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.1, 500);
      this.camera.position.set(0,5,25);
      this.camera.lookAt(0,0,0);

      window.addEventListener('resize', ()=>{
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
        WC.Confetti._resize?.();
        WC.Fireworks._resize?.();
      });
    },

    _loop(){
      this._raf = requestAnimationFrame(()=>this._loop());
      const dt = WC.Utils.getDelta();

      WC.Camera.update();
      WC.Anim.update(dt);
      WC.Confetti.update();
      WC.Fireworks.update();

      if(this.renderer && this.scene && this.camera){
        this.renderer.render(this.scene, this.camera);
      }
    },

    _bindSkip(){
      /* S key or double-tap to skip to champion screen */
      let taps=0;
      window.addEventListener('keydown',e=>{
        if(e.key==='s'||e.key==='S') this._skipToChampion();
        if(e.key==='Escape') this.finish();
      });
      /* passive:true prevents touch from blocking the animation frame */
      window.addEventListener('pointerdown',()=>{
        taps++; setTimeout(()=>taps=0,400);
        if(taps>=3) this._skipToChampion();
      }, { passive: true });
    },

    _skipToChampion(){
      if(WC.Utils.el('championPhase').style.display==='flex') return;
      WC.Anim.cleanup();
      WC.Anim.trophy && (WC.Anim.trophy.visible=true, WC.Anim.trophy.scale.setScalar(.55));
      WC.Anim.spot   && (WC.Anim.spot.intensity=7);
      WC.UI.showChampion();
    },

    finish(){
      (window._ceremonyLoops||[]).forEach(clearInterval);
      if(WC.Champion.onComplete) WC.Champion.onComplete();
      gsap.to('body',{opacity:0,duration:.8,onComplete:()=>{ if(window.history.length>1) history.back(); }});
    },
  };

  g.WC.App = App;

  /* Auto-start */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>App.init());
  } else {
    App.init();
  }
})(window);
