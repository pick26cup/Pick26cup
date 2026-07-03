/* ── camera.js ── GSAP-based camera controller ── */

class Camera {
  constructor(cam){
    this.cam = cam;
    this._shakeX = 0;
    this._shakeY = 0;
    this._orbitId = null;
  }

  intro(){
    gsap.to(this.cam.position,{x:0,y:5,z:25,duration:3.5,ease:'power4.out'});
  }

  aerial(){
    gsap.to(this.cam.position,{x:0,y:28,z:22,duration:5,ease:'power2.inOut'});
  }

  tunnel(){
    gsap.to(this.cam.position,{x:0,y:1.5,z:14,duration:3,ease:'power3.inOut'});
  }

  trophy(){
    gsap.to(this.cam.position,{x:0,y:3.5,z:9,duration:4,ease:'power3.inOut'});
  }

  orbit(radius=10,height=5){
    let angle=0;
    this._orbitId=setInterval(()=>{
      angle+=0.004;
      this.cam.position.x=Math.sin(angle)*radius;
      this.cam.position.z=Math.cos(angle)*radius;
      this.cam.position.y=height;
      this.cam.lookAt(0,3,0);
    },16);
  }

  stopOrbit(){ clearInterval(this._orbitId); this._orbitId=null; }

  shake(intensity=0.35,duration=0.6){
    const start=performance.now();
    const go=()=>{
      const e=(performance.now()-start)/1000;
      if(e>duration){ this._shakeX=this._shakeY=0; return; }
      const d=1-e/duration;
      this._shakeX=(Math.random()-.5)*intensity*d;
      this._shakeY=(Math.random()-.5)*intensity*d*0.5;
      requestAnimationFrame(go);
    };
    go();
  }

  /* Called every frame */
  update(){
    if(this._shakeX || this._shakeY){
      this.cam.position.x += this._shakeX;
      this.cam.position.y += this._shakeY;
    }
    if(!this._orbitId) this.cam.lookAt(0,3,0);
  }
}
