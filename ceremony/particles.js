/* ── particles.js ── THREE.js-based 3D particles ── */

class Particles {
  constructor(scene){
    this.scene = scene;
    this._fw   = [];   /* active firework bursts */
    this._tex  = this._makeSpriteTex();
    this._initConfetti();
    this._initStadiumLights();
  }

  /* Soft round glow sprite texture */
  _makeSpriteTex(){
    const sz=64, cv=document.createElement('canvas');
    cv.width=cv.height=sz;
    const ctx=cv.getContext('2d');
    const g=ctx.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.35,'rgba(255,255,255,0.7)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,sz,sz);
    return new THREE.CanvasTexture(cv);
  }

  /* ── Falling confetti (BufferGeometry Points — no individual meshes) ── */
  _initConfetti(){
    const mobile = isMobile();
    const N = mobile ? 600 : 1400;
    this._confN   = N;
    this._confPos = new Float32Array(N*3);
    this._confVel = new Float32Array(N*3);
    this._confCol = new Float32Array(N*3);

    const COLORS=[
      [1,.84,0],[1,.95,.4],[1,.27,.27],[.27,.55,1],
      [.2,1,.45],[1,.5,0],[.75,.3,1],[.9,.9,.9],
    ];
    for(let i=0;i<N;i++){
      this._confPos[i*3]   = rand(-18,18);
      this._confPos[i*3+1] = rand(-4,24);
      this._confPos[i*3+2] = rand(-10,10);
      this._confVel[i*3]   = rand(-0.015,0.015);
      this._confVel[i*3+1] = rand(-0.055,-0.012);
      this._confVel[i*3+2] = rand(-0.015,0.015);
      const c=pick(COLORS);
      this._confCol[i*3]=c[0]; this._confCol[i*3+1]=c[1]; this._confCol[i*3+2]=c[2];
    }

    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(this._confPos,3));
    geo.setAttribute('color',   new THREE.BufferAttribute(this._confCol,3));
    const mat=new THREE.PointsMaterial({
      size:isMobile()?.18:.22, vertexColors:true,
      transparent:true, opacity:0,
      sizeAttenuation:true,
      map:this._tex, depthWrite:false,
      blending:THREE.AdditiveBlending,
    });
    this._confPts = new THREE.Points(geo,mat);
    this.scene.add(this._confPts);
  }

  showConfetti(){ gsap.to(this._confPts.material,{opacity:1,duration:1.5}); }
  hideConfetti(){ gsap.to(this._confPts.material,{opacity:0,duration:1.5}); }

  /* ── Stadium audience lights ring ── */
  _initStadiumLights(){
    const mobile=isMobile(), N=mobile?4000:12000;
    const pos=new Float32Array(N*3), col=new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const t=Math.random()*Math.PI*2;
      const r=18+Math.random()*28, h=Math.random()*18-4;
      pos[i*3]=Math.cos(t)*r; pos[i*3+1]=h; pos[i*3+2]=Math.sin(t)*r;
      const hot=Math.random()>.6;
      col[i*3]=hot?1:.25; col[i*3+1]=hot?.85:.55; col[i*3+2]=hot?.2:1;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',   new THREE.BufferAttribute(col,3));
    this._stadiumPts=new THREE.Points(geo,new THREE.PointsMaterial({
      size:.32,vertexColors:true,transparent:true,opacity:0,sizeAttenuation:true,
    }));
    this.scene.add(this._stadiumPts);
    this._stadiumPts.geometry.setAttribute('position',geo.attributes.position);
  }

  showStadium(){ gsap.to(this._stadiumPts.material,{opacity:.85,duration:2.5}); }
  spinStadium(){ gsap.to(this._stadiumPts.rotation,{y:Math.PI*2,duration:12,ease:'none',repeat:-1}); }

  /* ── 3D firework burst ── */
  explode(x=0,y=5,z=0){
    const mobile=isMobile(), N=mobile?80:150;
    const pos=new Float32Array(N*3), vel=new Float32Array(N*3), col=new Float32Array(N*3);
    const COLS=[[1,.84,0],[1,.96,.4],[1,.2,.4],[.2,.8,1],[.4,1,.3],[1,.5,.1],[.9,.9,1]];

    for(let i=0;i<N;i++){
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
      const theta=Math.random()*Math.PI*2, phi=Math.random()*Math.PI;
      const sp=rand(0.06,0.24);
      vel[i*3]=Math.sin(phi)*Math.cos(theta)*sp;
      vel[i*3+1]=Math.sin(phi)*Math.sin(theta)*sp;
      vel[i*3+2]=Math.cos(phi)*sp;
      const c=pick(COLS);
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
    }

    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',   new THREE.BufferAttribute(col,3));
    const mat=new THREE.PointsMaterial({
      size:.28, vertexColors:true, transparent:true, opacity:1,
      sizeAttenuation:true, map:this._tex, depthWrite:false,
      blending:THREE.AdditiveBlending,
    });
    const pts=new THREE.Points(geo,mat);
    this.scene.add(pts);

    this._fw.push({ pts, vel, pos: geo.attributes.position.array, N });

    gsap.to(mat,{opacity:0,duration:2.2,delay:.5,
      onComplete:()=>{ this.scene.remove(pts); this._fw=this._fw.filter(f=>f.pts!==pts); }
    });

    Audio.playBoom(0.45);
  }

  /* ── Per-frame update ── */
  update(){
    /* Confetti */
    const p=this._confPos, v=this._confVel, N=this._confN;
    for(let i=0;i<N;i++){
      p[i*3]+=v[i*3]; p[i*3+1]+=v[i*3+1]; p[i*3+2]+=v[i*3+2];
      if(p[i*3+1]<-6){ p[i*3+1]=22; p[i*3]=rand(-18,18); p[i*3+2]=rand(-10,10); }
    }
    this._confPts.geometry.attributes.position.needsUpdate=true;

    /* Fireworks */
    this._fw.forEach(fw=>{
      const pos=fw.pos, vel=fw.vel;
      for(let i=0;i<fw.N;i++){
        vel[i*3+1]-=0.004; /* gravity */
        pos[i*3]+=vel[i*3]; pos[i*3+1]+=vel[i*3+1]; pos[i*3+2]+=vel[i*3+2];
        vel[i*3]*=0.968; vel[i*3+2]*=0.968;
      }
      fw.pts.geometry.attributes.position.needsUpdate=true;
    });
  }

  /* Auto-launch burst from random screen-edge positions */
  launchRandom(){
    const spread=10;
    this.explode(rand(-spread,spread), rand(3,10), rand(-spread,spread));
  }
}
