/* ── animation.js ── 3D scene + cinematic sequence ── */
(function(g){
  g.WC = g.WC || {};

  const Anim = {
    scene: null,
    stadium: null, trophy: null,
    spot: null, glowLight: null,
    _trophySpinTween: null,
    _rainLoop: null, _fwLoop: null,

    init(scene){
      this.scene = scene;
      this._buildLights();
      this._buildStadium();
      this._buildTrophy();
    },

    /* ── Lights ── */
    _buildLights(){
      const s = this.scene;

      s.add(new THREE.AmbientLight(0x0a0a18, 0.6));

      this.spot = new THREE.SpotLight(0xFFE0A0, 0, 40, Math.PI/5, 0.4, 1.5);
      this.spot.position.set(0,22,6);
      this.spot.target.position.set(0,3,0);
      this.spot.castShadow = false;
      s.add(this.spot); s.add(this.spot.target);

      this.glowLight = new THREE.PointLight(0xFFD700, 0, 12);
      this.glowLight.position.set(0,5,0);
      s.add(this.glowLight);

      const fill1 = new THREE.PointLight(0x3355FF,1.2,25);
      fill1.position.set(-10,6,8); s.add(fill1);
      const fill2 = new THREE.PointLight(0xFF3366,1.0,25);
      fill2.position.set(10,6,8); s.add(fill2);
    },

    /* ── Stadium particle bowl ── */
    _buildStadium(){
      const mobile = WC.Utils.isMobile();
      const N = mobile ? 6000 : 18000;
      const pos=new Float32Array(N*3), col=new Float32Array(N*3);

      for(let i=0;i<N;i++){
        const t  = Math.random()*Math.PI*2;
        const r  = 18 + Math.random()*28;
        const h  = Math.random()*18 - 4;
        pos[i*3]  = Math.cos(t)*r;
        pos[i*3+1]= h;
        pos[i*3+2]= Math.sin(t)*r;

        const hot = Math.random()>.6;
        col[i*3]   = hot ? 1    : 0.25;
        col[i*3+1] = hot ? 0.85 : 0.55;
        col[i*3+2] = hot ? 0.2  : 1;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geo.setAttribute('color',    new THREE.BufferAttribute(col,3));

      const mat = new THREE.PointsMaterial({
        size:0.35, vertexColors:true,
        transparent:true, opacity:0, sizeAttenuation:true
      });

      this.stadium = new THREE.Points(geo, mat);
      this.scene.add(this.stadium);
    },

    /* ── Trophy model ── */
    _buildTrophy(){
      const gold = new THREE.MeshStandardMaterial({
        color:0xD4AF37, metalness:0.96, roughness:0.06,
        emissive:0x3A2900, emissiveIntensity:0.3,
      });

      const G = new THREE.Group();
      G.visible = false;

      const add = (geo, y) => { const m=new THREE.Mesh(geo,gold); m.position.y=y; G.add(m); };

      // base layers
      add(new THREE.CylinderGeometry(1.6,2.0,0.22,8),0);
      add(new THREE.CylinderGeometry(1.2,1.6,0.18,8),0.2);

      // main stem
      add(new THREE.CylinderGeometry(0.28,0.5,1.8,12),1.2);

      // centre knob
      add(new THREE.SphereGeometry(0.38,16,10),2.28);

      // upper stem
      add(new THREE.CylinderGeometry(0.22,0.28,0.9,12),2.87);

      // cup bowl (lathe)
      const pts=[];
      for(let i=0;i<=24;i++){
        const t=i/24;
        pts.push(new THREE.Vector2(
          0.18 + Math.pow(t,.65)*1.28 + Math.sin(t*Math.PI)*0.12,
          t*2.8
        ));
      }
      add(new THREE.LatheGeometry(pts,28), 3.3);

      // rim ring
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.46,0.09,10,28), gold);
      rim.position.y = 6.18; G.add(rim);

      // handles
      [-1,1].forEach(side=>{
        const h=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.07,10,18,Math.PI),gold);
        h.position.set(side*1.55,5.1,0);
        h.rotation.z=side*Math.PI/2; G.add(h);
      });

      // inner glow sphere
      this._glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55,12,12),
        new THREE.MeshBasicMaterial({color:0xFFD700,transparent:true,opacity:0})
      );
      this._glowMesh.position.y=5.5; G.add(this._glowMesh);

      G.scale.setScalar(0.55);
      G.position.set(0,0,0);

      this.scene.add(G);
      this.trophy = G;
    },

    /* ══════════════════════════════════════════
       THE CINEMATIC SEQUENCE
    ═══════════════════════════════════════════*/
    async runSequence(){
      const U = WC.Utils, W = window.innerWidth, H = window.innerHeight;

      /* ── 0s: Black, crowd fades in ── */
      await U.wait(600);
      WC.Audio.resume();
      WC.Audio.playCrowd(0.12);

      await U.wait(1200);

      /* Narration */
      WC.Audio.speak(
        'Ladies and gentlemen… welcome. Tonight, history is made.',
        {rate:0.80, pitch:0.94}
      );
      await U.wait(4000);

      /* ── 3s: FIFA logo appears ── */
      await this._showLogo();
      await U.wait(2200);

      /* ── 5s: Aerial stadium ── */
      await this._showStadium();
      await U.wait(4200);

      /* ── 10s: Tunnel ── */
      await this._showTunnel();
      await U.wait(3200);

      /* ── 15s: Explosion ── */
      await this._showExplosion();
      await U.wait(4500);

      /* ── 20s: Crowd surge ── */
      await this._showCrowdSurge();
      await U.wait(6500);

      /* ── 28s: Trophy reveal ── */
      await this._showTrophy();
      await U.wait(6200);

      /* ── 35s: Orbit ── */
      await this._showOrbit();
      await U.wait(4500);

      /* ── 40s: Champion reveal ── */
      await WC.UI.showChampion();
    },

    /* ── Logo ── */
    async _showLogo(){
      const ph = WC.Utils.el('logoPhase');
      ph.style.display='flex'; ph.style.opacity=0;
      gsap.to(ph,{opacity:1,duration:2,ease:'power2.out'});
      await WC.Utils.wait(400);
      gsap.from('#logoFifa',    {y:-50,opacity:0,duration:1,ease:'back.out(1.7)'});
      await WC.Utils.wait(180);
      gsap.from('#logoWorldCup',{y:-50,opacity:0,duration:1,ease:'back.out(1.7)'});
      await WC.Utils.wait(180);
      gsap.from('#logoYear',    {scale:0.3,opacity:0,duration:1.2,ease:'back.out(1.4)'});
      await WC.Utils.wait(800);
      WC.Confetti.burst(W*.5, H*.45, 60);
      WC.Audio.playChord(0.15);
    },

    /* ── Aerial stadium ── */
    async _showStadium(){
      gsap.to('#logoPhase',{opacity:0,duration:1.2});
      gsap.to(this.stadium.material,{opacity:0.85,duration:2.5});
      await WC.Camera.goAerial();
      this.scene.fog.density = 0.008;
      gsap.to(this.stadium.rotation,{y:Math.PI*2,duration:10,ease:'none',repeat:-1});
      this._fwLoop = setInterval(()=>WC.Fireworks.launch(), 1600);
    },

    /* ── Tunnel ── */
    async _showTunnel(){
      clearInterval(this._fwLoop);
      this.scene.fog.density = 0.045;
      gsap.to(this.stadium.material,{opacity:0.4,duration:1.2});
      await WC.Camera.goTunnel();
      WC.Audio.playBoom(0.25);
      this.scene.fog.density = 0.002;
    },

    /* ── Explosion ── */
    async _showExplosion(){
      // White flash overlay
      const fl=document.createElement('div');
      fl.style.cssText='position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;pointer-events:none';
      document.body.appendChild(fl);
      await new Promise(r=>gsap.to(fl,{opacity:1,duration:.12,onComplete:r}));
      WC.Audio.playBoom(0.6);
      WC.Camera.shake(0.6,0.84);
      WC.Confetti.burst(W*.5,H*.4,200);
      WC.Fireworks.burst(8);
      gsap.to(fl,{opacity:0,duration:.55,delay:.06,onComplete:()=>fl.remove()});
      gsap.to(this.stadium.material,{opacity:1,duration:.4});
      this.scene.fog.density = 0.004;
      this._rainLoop = setInterval(()=>WC.Confetti.rain(10), 90);
      WC.Camera.cam.position.set(0,6,20);
      WC.Camera.lookAt(0,3,0,0.5);
    },

    /* ── Crowd surge + music ── */
    async _showCrowdSurge(){
      WC.Audio.setCrowdVol(0.35, 1.5);
      WC.Audio.playFanfare();
      WC.Audio.playChord(0.25);
      WC.Fireworks.burst(6);
      clearInterval(this._fwLoop);
      this._fwLoop = setInterval(()=>WC.Fireworks.launch(), 900);
      const lf=WC.Utils.el('lensFlare');
      gsap.to(lf,{opacity:1,duration:.4,yoyo:true,repeat:7,ease:'power1.inOut'});
      await WC.Camera.moveTo(0,8,18,3,'power2.inOut');
    },

    /* ── Trophy reveal ── */
    async _showTrophy(){
      clearInterval(this._fwLoop);
      this._fwLoop = setInterval(()=>WC.Fireworks.launch(), 2800);

      WC.Audio.playChord(0.45);
      WC.Audio.playFanfare();
      WC.Camera.shake(0.35);

      await WC.Camera.goTrophy();

      this.trophy.visible = true;
      this.trophy.scale.setScalar(0);
      this.trophy.position.y = -3;

      gsap.to(this.trophy.scale,{x:.55,y:.55,z:.55,duration:2.2,ease:'back.out(1.5)'});
      gsap.to(this.trophy.position,{y:.3,duration:2.2,ease:'back.out(1.4)'});
      gsap.to(this.spot,{intensity:8,duration:1.8});
      gsap.to(this.glowLight,{intensity:4,duration:2});

      if(this._glowMesh){
        gsap.to(this._glowMesh.material,{opacity:.55,duration:1,yoyo:true,repeat:-1});
      }

      this._trophySpinTween = gsap.to(this.trophy.rotation,{
        y:Math.PI*2, duration:9, ease:'none', repeat:-1
      });

      WC.Confetti.burst(W*.5,H*.35,160);
      WC.Confetti.burst(W*.2,H*.5,80);
      WC.Confetti.burst(W*.8,H*.5,80);
      WC.Fireworks.burst(10);

      setTimeout(()=>WC.Audio.playFanfare(),700);
    },

    /* ── Orbit ── */
    async _showOrbit(){
      WC.Camera.startOrbit(9,5);
      clearInterval(this._rainLoop);
      this._rainLoop = setInterval(()=>WC.Confetti.rain(5), 80);
    },

    /* ── Per-frame update ── */
    update(){
      if(this.trophy?.visible){
        // gentle float
        this.trophy.position.y = 0.3 + Math.sin(performance.now()*.0009)*.12;
      }
    },

    cleanup(){
      clearInterval(this._rainLoop);
      clearInterval(this._fwLoop);
      WC.Camera.stopOrbit();
    },
  };

  g.WC.Anim = Anim;
})(window);
