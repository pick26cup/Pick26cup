/* ── camera.js ── Three.js camera controller ── */
(function(g){
  g.WC = g.WC || {};

  const Camera = {
    cam: null, scene: null,
    _look: {x:0,y:0,z:0},
    _shake: {i:0, d:0.88},
    _orbitTimer: null,

    init(cam, scene){
      this.cam   = cam;
      this.scene = scene;
    },

    update(){
      if(this._shake.i > 0.001){
        const s = this._shake.i;
        this.cam.position.x += (Math.random()-.5)*s;
        this.cam.position.y += (Math.random()-.5)*s;
        this._shake.i *= this._shake.d;
      }
      this.cam.lookAt(this._look.x, this._look.y, this._look.z);
    },

    shake(intensity=0.4, decay=0.87){
      this._shake.i = intensity;
      this._shake.d = decay;
    },

    moveTo(x,y,z, dur=1.5, ease='power2.inOut'){
      return new Promise(r=>gsap.to(this.cam.position,{x,y,z,duration:dur,ease,onComplete:r}));
    },

    lookAt(x,y,z, dur=1.5, ease='power2.inOut'){
      return new Promise(r=>gsap.to(this._look,{x,y,z,duration:dur,ease,onComplete:r}));
    },

    /* aerial overview */
    async goAerial(){
      await Promise.all([
        this.moveTo(0,40,8,2.5),
        this.lookAt(0,0,0,2.5),
      ]);
    },

    /* tunnel approach */
    async goTunnel(){
      this._look={x:0,y:2,z:0};
      this.cam.position.set(0,2,50);
      return new Promise(r=>gsap.to(this.cam.position,{z:3,duration:3.5,ease:'power3.in',onComplete:r}));
    },

    /* trophy reveal */
    async goTrophy(){
      await Promise.all([
        this.moveTo(0,6,18,2,'power2.out'),
        this.lookAt(0,3,0,2),
      ]);
    },

    /* slow orbit around trophy */
    startOrbit(radius=9, height=5){
      let angle=0;
      const step=()=>{
        angle+=0.006;
        this.cam.position.x=Math.sin(angle)*radius;
        this.cam.position.y=height + Math.sin(angle*.4)*.6;
        this.cam.position.z=Math.cos(angle)*radius;
        this._look={x:0,y:3,z:0};
        this._orbitTimer=requestAnimationFrame(step);
      };
      step();
    },

    stopOrbit(){
      if(this._orbitTimer){ cancelAnimationFrame(this._orbitTimer); this._orbitTimer=null; }
    },

    /* champion reveal — face camera flat */
    async goChampion(){
      this.stopOrbit();
      await Promise.all([
        this.moveTo(0,3,20,2,'power2.inOut'),
        this.lookAt(0,3,0,2),
      ]);
    },
  };

  g.WC.Camera = Camera;
})(window);
